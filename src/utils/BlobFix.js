/*
 * Fix WebM duration metadata for MediaRecorder output.
 * Adapted from https://stackoverflow.com/a/75218309/13989043 and
 * https://github.com/mat-sz/webm-fix-duration
 */

// Mapping of EBML section IDs to names and types
const sections = {
    0xa45dfa3: { name: 'EBML', type: 'Container' },
    0x286:    { name: 'EBMLVersion', type: 'Uint' },
    0x2f7:    { name: 'EBMLReadVersion', type: 'Uint' },
    0x2f2:    { name: 'EBMLMaxIDLength', type: 'Uint' },
    0x2f3:    { name: 'EBMLMaxSizeLength', type: 'Uint' },
    0x282:    { name: 'DocType', type: 'String' },
    // ... (rest of mapping; keep full mapping from TS version) ...
    0x489:    { name: 'Duration', type: 'Float' },
    0xad7b1:  { name: 'TimecodeScale', type: 'Uint' },
    0x8538067:{ name: 'Segment', type: 'Container' },
    0x549a966:{ name: 'Info', type: 'Container' },
    // ...etc...
  };
  
  function padHex(hex) {
    return hex.length % 2 === 1 ? '0' + hex : hex;
  }
  
  class WebmBase {
    constructor(name = 'Unknown', type = 'Unknown') {
      this.name = name;
      this.type = type;
      this.source = null;
      this.data = null;
    }
  
    updateBySource() {
      // override in subclasses
    }
  
    setSource(source) {
      this.source = source;
      this.updateBySource();
    }
  
    updateByData() {
      // override in subclasses
    }
  
    setData(data) {
      this.data = data;
      this.updateByData();
    }
  }
  
  class WebmUint extends WebmBase {
    constructor(name, type) {
      super(name, type || 'Uint');
    }
  
    updateBySource() {
      let hexStr = '';
      for (let i = 0; i < this.source.length; i++) {
        hexStr += padHex(this.source[i].toString(16));
      }
      this.data = hexStr;
    }
  
    updateByData() {
      const len = this.data.length / 2;
      this.source = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        this.source[i] = parseInt(this.data.substr(i*2,2), 16);
      }
    }
  
    getValue() {
      return parseInt(this.data, 16);
    }
  
    setValue(val) {
      this.setData(padHex(val.toString(16)));
    }
  }
  
  class WebmFloat extends WebmBase {
    constructor(name, type) {
      super(name, type || 'Float');
    }
  
    getFloatArrayType() {
      return (this.source.length === 4) ? Float32Array : Float64Array;
    }
  
    updateBySource() {
      const reversed = Array.from(this.source).reverse();
      const FloatType = this.getFloatArrayType();
      const arr = new FloatType(new Uint8Array(reversed).buffer);
      this.data = arr[0];
    }
  
    updateByData() {
      const FloatType = this.getFloatArrayType();
      const arr = new FloatType([this.data]);
      const bytes = new Uint8Array(arr.buffer);
      this.source = new Uint8Array(Array.from(bytes).reverse());
    }
  
    getValue() {
      return this.data;
    }
  
    setValue(val) {
      this.setData(val);
    }
  }
  
  class WebmContainer extends WebmBase {
    constructor(name, type) {
      super(name, type || 'Container');
      this.offset = 0;
      this.data = [];
    }
  
    readByte() {
      return this.source[this.offset++];
    }
  
    readUint() {
      const first = this.readByte();
      const size = 8 - first.toString(2).length;
      let val = first - (1 << (7 - size));
      for (let i = 0; i < size; i++) {
        val = (val * 256) + this.readByte();
      }
      return val;
    }
  
    updateBySource() {
      this.data = [];
      while (this.offset < this.source.length) {
        const id = this.readUint();
        const length = this.readUint();
        const end = Math.min(this.offset + length, this.source.length);
        const chunk = this.source.slice(this.offset, end);
  
        const info = sections[id] || { name: 'Unknown', type: 'Unknown' };
        let Ctor = WebmBase;
        if (info.type === 'Container') Ctor = WebmContainer;
        else if (info.type === 'Uint') Ctor = WebmUint;
        else if (info.type === 'Float') Ctor = WebmFloat;
  
        const section = new Ctor(info.name, info.type);
        section.setSource(chunk);
        this.data.push({ id, idHex: id.toString(16), data: section });
        this.offset = end;
      }
    }
  
    writeUint(x, draft = false) {
      let bytes = 1, flag = 0x80;
      while (x >= flag && bytes < 8) { bytes++; flag <<= 1; }
      if (!draft) {
        let v = flag + x;
        for (let i = bytes - 1; i >= 0; i--) {
          const c = v % 256;
          this.source[this.offset + i] = c;
          v = (v - c) / 256;
        }
      }
      this.offset += bytes;
    }
  
    writeSections(draft = false) {
      this.offset = 0;
      for (const sec of this.data) {
        const content = sec.data.source;
        this.writeUint(sec.id, draft);
        this.writeUint(content.length, draft);
        if (!draft) this.source.set(content, this.offset);
        this.offset += content.length;
      }
      return this.offset;
    }
  
    updateByData() {
      const size = this.writeSections(true);
      this.source = new Uint8Array(size);
      this.writeSections();
    }
  
    getSectionById(id) {
      const found = this.data.find(s => s.id === id);
      return found ? found.data : null;
    }
  }
  
  class WebmFile extends WebmContainer {
    constructor(source) {
      super('File','File');
      this.setSource(source);
    }
  
    fixDuration(duration) {
      const segment = this.getSectionById(0x8538067);
      if (!segment) return false;
      const info = segment.getSectionById(0x549a966);
      if (!info) return false;
      let timeScale = info.getSectionById(0xad7b1);
      if (!timeScale) return false;
  
      let dur = info.getSectionById(0x489);
      if (dur) {
        if (dur.getValue() <= 0) dur.setValue(duration);
        else return false;
      } else {
        dur = new WebmFloat('Duration','Float');
        dur.setValue(duration);
        info.data.push({ id:0x489, data:dur });
      }
      timeScale.setValue(1000000);
      info.updateByData();
      segment.updateByData();
      this.updateByData();
      return true;
    }
  
    toBlob(type='video/webm') {
      return new Blob([this.source.buffer], { type });
    }
  }
  
  /**
   * Reads a WebM Blob, fixes its duration metadata, and returns a new Blob.
   * @param {Blob} blob - Original WebM blob
   * @param {number} duration - Correct duration in milliseconds
   * @param {string} [type] - MIME type of output (video/webm)
   * @returns {Promise<Blob>}
   */
  function webmFixDuration(blob, duration, type='video/webm') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener('loadend', () => {
        try {
          const arr = new Uint8Array(reader.result);
          const file = new WebmFile(arr);
          resolve(file.fixDuration(duration) ? file.toBlob(type) : blob);
        } catch (err) {
          reject(err);
        }
      });
      reader.addEventListener('error', () => reject(reader.error));
      reader.readAsArrayBuffer(blob);
    });
  }
  
  // Expose
  window.webmFixDuration = webmFixDuration;
  export { webmFixDuration };
  