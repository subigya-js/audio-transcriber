# Audio Transcriber

Audio Transcriber is a web application built with Next.js that allows users to transcribe audio files directly in the browser. It leverages the power of Transformers.js and Hugging Face models to perform client-side speech-to-text conversion, providing a fast, accurate, and privacy-focused solution for audio transcription.

## Features

- Client-side audio transcription using Transformers.js
- Utilizes Hugging Face's pre-trained speech recognition models
- Support for various audio file formats
- Real-time audio recording and transcription
- Export transcriptions as TXT or JSON

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework for building the web application
- [React](https://reactjs.org/) - JavaScript library for building user interfaces
- [TypeScript](https://www.typescriptlang.org/) - Typed superset of JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Transformers.js](https://huggingface.co/docs/transformers.js) - JavaScript library for state-of-the-art Machine Learning
- [Hugging Face Models](https://huggingface.co/models) - Pre-trained models for various AI tasks, including speech recognition
- [Web Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) - For running transcription in background threads
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) - For audio processing and recording

## Getting Started

### Prerequisites

- Node.js (version 14 or later)
- npm

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/subigya-js/audio-transcriber.git
   ```

   ```
   cd audio-transcriber
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the development server:
   ```
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Usage

1. Upload an audio file or record audio directly in the browser.
2. Click the "Transcribe" button to start the transcription process.
3. The application will use Transformers.js to load the appropriate Hugging Face model for speech recognition.
4. View the transcription results in real-time as they are processed.
5. Once transcription is complete, you can export the results as TXT or JSON.

## Project Structure

- `src/app/` - Next.js app router and page components
- `src/components/` - React components used throughout the application
- `src/hooks/` - Custom React hooks, including the transcription logic
- `src/utils/` - Utility functions and helpers
- `public/` - Static assets and files

## How It Works

The Audio Transcriber uses Transformers.js to load and run Hugging Face's speech recognition models directly in the browser. This approach allows for:

1. Privacy: All processing happens on the client-side, so audio data never leaves the user's device.
2. Speed: No need to upload audio files to a server, resulting in faster transcription times.
3. Offline Capability: Once the model is loaded, the app can work without an internet connection.

The transcription process is handled by a Web Worker, ensuring that the main thread remains responsive during computationally intensive tasks.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- [Hugging Face](https://huggingface.co/) for providing state-of-the-art NLP models and tools
- [Transformers.js](https://huggingface.co/docs/transformers.js) for enabling client-side machine learning in JavaScript
- [Next.js](https://nextjs.org/) for the amazing React framework

## Contact

If you have any questions or feedback, please open an issue in the GitHub repository.
