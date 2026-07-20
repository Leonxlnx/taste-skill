"use client"

import {
  Commit,
  CommitActions,
  CommitContent,
  CommitCopyButton,
  CommitFile,
  CommitFileAdditions,
  CommitFileChanges,
  CommitFileDeletions,
  CommitFileIcon,
  CommitFileInfo,
  CommitFilePath,
  CommitFileStatus,
  CommitFiles,
  CommitHash,
  CommitHeader,
  CommitInfo,
  CommitMessage,
  CommitMetadata,
  CommitSeparator,
  CommitTimestamp,
} from "@/registry/sources/vercel-ai-elements/components/vercel-ai-elements/commit";

const files = [
  { additions: 38, deletions: 4, path: "src/search.ts", status: "modified" as const },
  { additions: 82, deletions: 0, path: "src/search.test.ts", status: "added" as const },
];

export default function CommitInspectorPreview() {
  return (
    <Commit className="w-full max-w-2xl" defaultOpen>
      <CommitHeader>
        <CommitInfo>
          <CommitMessage>fix: keep search results stable while filtering</CommitMessage>
          <CommitMetadata>
            <CommitHash>8c61f2a</CommitHash>
            <CommitSeparator />
            <CommitTimestamp date={new Date("2026-07-20T06:00:00Z")} />
          </CommitMetadata>
        </CommitInfo>
        <CommitActions>
          <CommitCopyButton hash="8c61f2acb1e43d7" />
        </CommitActions>
      </CommitHeader>
      <CommitContent>
        <CommitFiles>
          {files.map((file) => (
            <CommitFile key={file.path}>
              <CommitFileInfo>
                <CommitFileStatus status={file.status} />
                <CommitFileIcon />
                <CommitFilePath>{file.path}</CommitFilePath>
              </CommitFileInfo>
              <CommitFileChanges>
                <CommitFileAdditions count={file.additions} />
                <CommitFileDeletions count={file.deletions} />
              </CommitFileChanges>
            </CommitFile>
          ))}
        </CommitFiles>
      </CommitContent>
    </Commit>
  );
}
