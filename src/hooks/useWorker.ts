import { useState } from "react";

export interface MessageEventHandler {
    (event: MessageEvent): void;
}

type WorkerConstructor = {
    new (stringUrl: string | URL, options?: WorkerOptions): Worker;
};

export function useWorker(messageEventHandler: MessageEventHandler): Worker | null {
    // Create new worker once and never again
    const [worker] = useState(() => createWorker(messageEventHandler));
    return worker;
}

function createWorker(messageEventHandler: MessageEventHandler): Worker | null {
    if (typeof Worker === "undefined") {
        console.error("Web Workers are not supported in this environment");
        return null;
    }

    const worker = new (Worker as WorkerConstructor)(new URL("../worker.js", import.meta.url), {
        type: "module",
    });
    // Listen for messages from the Web Worker
    worker.addEventListener("message", messageEventHandler);
    return worker;
}
