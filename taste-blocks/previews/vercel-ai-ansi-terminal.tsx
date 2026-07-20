import {
  Terminal,
  TerminalActions,
  TerminalClearButton,
  TerminalContent,
  TerminalCopyButton,
  TerminalHeader,
  TerminalStatus,
  TerminalTitle,
} from "@/registry/sources/vercel-ai-elements/components/vercel-ai-elements/terminal";

const output = `\u001B[32m✓\u001B[0m Typecheck passed
\u001B[32m✓\u001B[0m Registry policy passed
\u001B[34minfo\u001B[0m 20 components ready for review`;

export default function AnsiTerminalPreview() {
  return (
    <Terminal className="w-full max-w-2xl" output={output}>
      <TerminalHeader>
        <TerminalTitle>Verification</TerminalTitle>
        <div className="flex items-center gap-1">
          <TerminalStatus />
          <TerminalActions>
            <TerminalCopyButton />
            <TerminalClearButton />
          </TerminalActions>
        </div>
      </TerminalHeader>
      <TerminalContent />
    </Terminal>
  );
}
