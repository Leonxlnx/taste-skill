"use client";
import { useState } from "react";
import type { Call, CallStatus } from "@/lib/api";
import { updateCall } from "@/lib/api";
import { StatusBadge } from "./StatusBadge";
import { QualityBar } from "./QualityBar";
import { ALL_STATUSES, STATUS_LABELS } from "@/lib/status";
import { X } from "lucide-react";

export function CallDetailPanel({ call, onClose, onUpdated }: { call: Call; onClose: () => void; onUpdated: (c: Call) => void }) {
  const [reviewerNotes, setReviewerNotes] = useState(call.reviewer_notes ?? "");
  const [status, setStatus] = useState<CallStatus>(call.status);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const updated = await updateCall(call.id, { status, reviewer_notes: reviewerNotes });
      onUpdated(updated);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-gray-900 border-l border-gray-700 shadow-2xl z-40 flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
        <h2 className="font-bold text-white truncate">{call.original_filename}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
      </div>
      <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-gray-500 text-xs mb-0.5">Status</p><StatusBadge status={call.status} /></div>
          <div><p className="text-gray-500 text-xs mb-0.5">Duration</p><p className="text-gray-200">{call.duration_seconds ? `${call.duration_seconds.toFixed(1)}s` : "-"}</p></div>
          <div><p className="text-gray-500 text-xs mb-0.5">Agent</p><p className="text-gray-200">{call.agent_name ?? "-"}</p></div>
          <div><p className="text-gray-500 text-xs mb-0.5">Words</p><p className="text-gray-200">{call.word_count ?? "-"}</p></div>
          <div><p className="text-gray-500 text-xs mb-0.5">Audio Quality</p><QualityBar score={call.audio_quality_score} /></div>
          <div><p className="text-gray-500 text-xs mb-0.5">Word Confidence</p><p className="text-gray-200">{call.mean_word_confidence !== null ? (call.mean_word_confidence * 100).toFixed(1) + "%" : "-"}</p></div>
        </div>
        {call.qa_flags && call.qa_flags.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 mb-1">QA Flags</p>
            <div className="flex flex-wrap gap-1">
              {call.qa_flags.map((f) => <span key={f} className="text-xs bg-red-900 text-red-300 px-2 py-0.5 rounded">{f}</span>)}
            </div>
          </div>
        )}
        <div>
          <p className="text-xs text-gray-500 mb-1">Transcript</p>
          <div className="bg-gray-800 rounded-lg p-3 text-sm text-gray-300 max-h-64 overflow-y-auto whitespace-pre-wrap leading-relaxed">
            {call.transcript_text ?? <span className="text-gray-600 italic">No transcript yet</span>}
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Override Status</p>
          <select value={status} onChange={(e) => setStatus(e.target.value as CallStatus)} className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white">
            {ALL_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Reviewer Notes</p>
          <textarea rows={4} value={reviewerNotes} onChange={(e) => setReviewerNotes(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white resize-none" placeholder="Add notes here..." />
        </div>
      </div>
      <div className="px-5 py-3 border-t border-gray-700">
        <button onClick={save} disabled={saving} className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-sm font-semibold text-white">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
