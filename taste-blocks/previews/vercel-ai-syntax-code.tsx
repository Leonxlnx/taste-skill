"use client"

import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockCopyButton,
  CodeBlockFilename,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@/registry/sources/vercel-ai-elements/components/vercel-ai-elements/code-block";
import { FileCodeIcon } from "lucide-react";

const code = `type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: Error };

export function unwrap<T>(result: Result<T>) {
  if (!result.ok) throw result.error;
  return result.value;
}`;

export default function SyntaxCodePreview() {
  return (
    <CodeBlock className="w-full max-w-2xl" code={code} language="typescript">
      <CodeBlockHeader>
        <CodeBlockTitle>
          <FileCodeIcon className="size-4" />
          <CodeBlockFilename>result.ts</CodeBlockFilename>
        </CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton />
        </CodeBlockActions>
      </CodeBlockHeader>
    </CodeBlock>
  );
}
