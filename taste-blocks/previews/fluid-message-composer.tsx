"use client";

import { useState } from "react";
import {
  InputMessage,
  type QueuedMessage,
} from "@/registry/sources/fluid-functionalism/components/message-composer";

export default function FluidMessageComposerPreview() {
  const [value, setValue] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [queue, setQueue] = useState<QueuedMessage[]>([]);
  const [status, setStatus] = useState<"idle" | "streaming">("idle");
  const [message, setMessage] = useState("No message sent yet.");

  return (
    <div className="flex w-full max-w-2xl flex-col gap-3">
      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>{status === "streaming" ? "Response in progress" : "Ready"}</span>
        <button
          type="button"
          className="rounded-md border px-2 py-1 text-foreground"
          onClick={() => setStatus((current) => current === "idle" ? "streaming" : "idle")}
        >
          {status === "idle" ? "Simulate response" : "Finish response"}
        </button>
      </div>
      <InputMessage
        value={value}
        onValueChange={setValue}
        files={files}
        onFilesChange={setFiles}
        queue={queue}
        onQueueChange={setQueue}
        status={status}
        onStop={() => setStatus("idle")}
        onSend={(text, sentFiles) => {
          setMessage(text || `${sentFiles.length} file${sentFiles.length === 1 ? "" : "s"} sent.`);
          setValue("");
          setFiles([]);
        }}
        placeholder="Write a message"
        leftSlot={({ openFilePicker }) => (
          <button
            type="button"
            className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground focus-visible:outline focus-visible:outline-2"
            onClick={() => openFilePicker()}
          >
            Attach
          </button>
        )}
      />
      <p aria-live="polite" className="min-h-5 text-xs text-muted-foreground">
        {message}
      </p>
    </div>
  );
}
