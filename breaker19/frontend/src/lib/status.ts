import type { CallStatus } from "./api";

export const STATUS_LABELS: Record<CallStatus, string> = {
  incoming: "Incoming", transcribing: "Transcribing", qa_scoring: "QA Scoring",
  passed: "Passed", needs_review: "Needs Review", poor_audio: "Poor Audio",
  compliance_review: "Compliance Review", coaching_needed: "Coaching Needed",
  failed: "Failed", complete: "Complete",
};

export const STATUS_COLORS: Record<CallStatus, string> = {
  incoming: "bg-slate-700 text-slate-200",
  transcribing: "bg-blue-800 text-blue-100",
  qa_scoring: "bg-indigo-800 text-indigo-100",
  passed: "bg-green-800 text-green-100",
  needs_review: "bg-yellow-700 text-yellow-100",
  poor_audio: "bg-orange-700 text-orange-100",
  compliance_review: "bg-red-800 text-red-100",
  coaching_needed: "bg-purple-800 text-purple-100",
  failed: "bg-rose-900 text-rose-200",
  complete: "bg-emerald-800 text-emerald-100",
};

export const ALL_STATUSES: CallStatus[] = [
  "incoming", "transcribing", "qa_scoring", "passed",
  "needs_review", "poor_audio", "compliance_review",
  "coaching_needed", "failed", "complete",
];
