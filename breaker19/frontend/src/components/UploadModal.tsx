"use client";
import { useState, useRef } from "react";
import { uploadAudio } from "@/lib/api";

export function UploadModal({ onClose, onUploaded }: { onClose: () => void; onUploaded: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [agentName, setAgentName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      await uploadAudio(file, agentName || undefined);
      onUploaded();
      onClose();
    } catch (err) {
      setError(String(err));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-lg font-bold mb-4 text-white">Upload Call Recording</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Audio File</label>
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition" onClick={() => inputRef.current?.click()}>
              {file ? <p className="text-sm text-gray-200 truncate">{file.name}</p> : <p className="text-sm text-gray-500">Click to select MP3, WAV, M4A...</p>}
              <input ref={inputRef} type="file" accept=".mp3,.wav,.m4a,.ogg,.flac" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Agent Name (optional)</label>
            <input type="text" value={agentName} onChange={(e) => setAgentName(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white" placeholder="e.g. John Smith" />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white">Cancel</button>
            <button type="submit" disabled={!file || uploading} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-sm font-semibold text-white">
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
