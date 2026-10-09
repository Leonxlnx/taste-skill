const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type CallStatus =
  | "incoming" | "transcribing" | "qa_scoring" | "passed"
  | "needs_review" | "poor_audio" | "compliance_review"
  | "coaching_needed" | "failed" | "complete";

export interface Call {
  id: string;
  filename: string;
  original_filename: string;
  status: CallStatus;
  duration_seconds: number | null;
  agent_name: string | null;
  call_date: string | null;
  transcript_text: string | null;
  transcript_json: unknown | null;
  mean_word_confidence: number | null;
  avg_logprob: number | null;
  audio_quality_score: number | null;
  word_count: number | null;
  qa_flags: string[] | null;
  qa_notes: string | null;
  reviewer_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CallList { items: Call[]; total: number; page: number; page_size: number; }
export interface Stats { total: number; by_status: Record<string, number>; avg_audio_quality_score: number | null; }

export async function fetchCalls(page = 1, pageSize = 25, status?: CallStatus): Promise<CallList> {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  if (status) params.set("status", status);
  const res = await fetch(`${BASE}/api/calls?${params}`);
  if (!res.ok) throw new Error("Failed to fetch calls");
  return res.json();
}

export async function fetchCall(id: string): Promise<Call> {
  const res = await fetch(`${BASE}/api/calls/${id}`);
  if (!res.ok) throw new Error("Call not found");
  return res.json();
}

export async function updateCall(id: string, body: { status?: CallStatus; reviewer_notes?: string; qa_notes?: string }): Promise<Call> {
  const res = await fetch(`${BASE}/api/calls/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error("Update failed");
  return res.json();
}

export async function uploadAudio(file: File, agentName?: string): Promise<{ id: string; status: string }> {
  const form = new FormData();
  form.append("file", file);
  if (agentName) form.append("agent_name", agentName);
  const res = await fetch(`${BASE}/api/uploads/`, { method: "POST", body: form });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

export async function fetchStats(): Promise<Stats> {
  const res = await fetch(`${BASE}/api/stats/`);
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}
