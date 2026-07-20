"use client"

import {
  StackTrace,
  StackTraceActions,
  StackTraceContent,
  StackTraceCopyButton,
  StackTraceError,
  StackTraceErrorMessage,
  StackTraceErrorType,
  StackTraceExpandButton,
  StackTraceFrames,
  StackTraceHeader,
} from "@/registry/sources/vercel-ai-elements/components/vercel-ai-elements/stack-trace";

const trace = `TypeError: Cannot read properties of undefined (reading 'map')
    at ResultList (/app/components/result-list.tsx:24:18)
    at renderWithHooks (node_modules/react-dom/cjs/react-dom.development.js:14985:18)
    at updateFunctionComponent (node_modules/react-dom/cjs/react-dom.development.js:17356:20)`;

export default function StackTracePreview() {
  return (
    <StackTrace className="w-full max-w-2xl" defaultOpen trace={trace}>
      <StackTraceHeader>
        <StackTraceError>
          <StackTraceErrorType />
          <StackTraceErrorMessage />
        </StackTraceError>
        <StackTraceActions>
          <StackTraceCopyButton />
          <StackTraceExpandButton />
        </StackTraceActions>
      </StackTraceHeader>
      <StackTraceContent>
        <StackTraceFrames />
      </StackTraceContent>
    </StackTrace>
  );
}
