"use client";
import { useState, useEffect, useCallback } from "react";
import type { Call, CallStatus } from "@/lib/api";
import { fetchCalls, fetchStats } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { QualityBar } from "@/components/QualityBar";
import { UploadModal } from "@/components/UploadModal";
import { CallDetailPanel } from "@/components/CallDetailPanel";
import { ALL_STATUSES, STATUS_LABELS } from "@/lib/status";
import { Upload, RefreshCw } from "lucide-react";

const POLL_MS = 8000;

export default function BoardPage() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<CallStatus | "">("" );
  const [stats, setStats] = useState<Record<string, number>>({});
  const [avgQuality, setAvgQuality] = useState<number | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [selected, setSelected] = useState<Call | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, s] = await Promise.all([
        fetchCalls(page, 25, statusFilter || undefined),
        fetchStats(),
      ]);
      setCalls(list.items);
      setTotal(list.total);
      setStats(s.by_status);
      setAvgQuality(s.avg_audio_quality_score);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    load();
    const t = setInterval(load, POLL_MS);
    return () => clearInterval(t);
  }, [load]);

  const totalPages = Math.ceil(total / 25);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-blue-400 font-mono font-bold text-xl">Breaker19</span>
          <span className="text-gray-600 text-sm">Call QA Board</span>
        </div>
        <div className="flex items-center gap-3">
          {avgQuality !== null && (
            <span className="text-xs text-gray-400">Avg Quality: <span className="text-white font-semibold">{avgQuality}</span></span>
          )}
          <button onClick={load} className="text-gray-400 hover:text-white" title="Refresh">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white"
          >
            <Upload size={14} /> Upload
          </button>
        </div>
      </header>

      <div className="px-6 py-2 border-b border-gray-800 flex gap-2 flex-wrap">
        <button
          onClick={() => { setStatusFilter(""); setPage(1); }}
          className={`text-xs px-2.5 py-1 rounded-full border ${statusFilter === "" ? "border-blue-500 text-blue-300 bg-blue-900/30" : "border-gray-700 text-gray-400 hover:text-white"}`}
        >
          All ({Object.values(stats).reduce((a, b) => a + b, 0)})
        </button>
        {ALL_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`text-xs px-2.5 py-1 rounded-full border ${statusFilter === s ? "border-blue-500 text-blue-300 bg-blue-900/30" : "border-gray-700 text-gray-400 hover:text-white"}`}
          >
            {STATUS_LABELS[s]} {stats[s] ? `(${stats[s]})` : ""}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto px-6 py-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 border-b border-gray-800">
              <th className="pb-2 pr-4 font-medium">File</th>
              <th className="pb-2 pr-4 font-medium">Agent</th>
              <th className="pb-2 pr-4 font-medium">Status</th>
              <th className="pb-2 pr-4 font-medium">Duration</th>
              <th className="pb-2 pr-4 font-medium">Quality</th>
              <th className="pb-2 pr-4 font-medium">Flags</th>
              <th className="pb-2 font-medium">Uploaded</th>
            </tr>
          </thead>
          <tbody>
            {calls.length === 0 && !loading && (
              <tr><td colSpan={7} className="py-12 text-center text-gray-600">No calls found.</td></tr>
            )}
            {calls.map((call) => (
              <tr key={call.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 cursor-pointer" onClick={() => setSelected(call)}>
                <td className="py-2.5 pr-4 max-w-[200px] truncate text-gray-200">{call.original_filename}</td>
                <td className="py-2.5 pr-4 text-gray-400">{call.agent_name ?? "-"}</td>
                <td className="py-2.5 pr-4"><StatusBadge status={call.status} /></td>
                <td className="py-2.5 pr-4 text-gray-400">{call.duration_seconds ? `${call.duration_seconds.toFixed(0)}s` : "-"}</td>
                <td className="py-2.5 pr-4"><QualityBar score={call.audio_quality_score} /></td>
                <td className="py-2.5 pr-4 text-gray-500 text-xs">{call.qa_flags?.length ? call.qa_flags.length : "-"}</td>
                <td className="py-2.5 text-gray-500 text-xs">{new Date(call.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-6 py-3 border-t border-gray-800 flex items-center gap-3 text-sm text-gray-400">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="disabled:opacity-30">Prev</button>
          <span>Page {page} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="disabled:opacity-30">Next</button>
        </div>
      )}

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onUploaded={load} />}
      {selected && (
        <CallDetailPanel
          call={selected}
          onClose={() => setSelected(null)}
          onUpdated={(updated) => {
            setCalls((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
            setSelected(updated);
          }}
        />
      )}
    </div>
  );
}
