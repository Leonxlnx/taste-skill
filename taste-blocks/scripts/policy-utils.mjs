import { createHash } from "node:crypto";
import path from "node:path";
import ts from "typescript";

const scriptKinds = new Map([
  [".cjs", ts.ScriptKind.JS],
  [".cts", ts.ScriptKind.TS],
  [".js", ts.ScriptKind.JS],
  [".jsx", ts.ScriptKind.JSX],
  [".mjs", ts.ScriptKind.JS],
  [".mts", ts.ScriptKind.TS],
  [".ts", ts.ScriptKind.TS],
  [".tsx", ts.ScriptKind.TSX],
]);

export function sha256(value) {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

export function aggregateHash(hashes) {
  return sha256([...hashes].sort().join("\n"));
}

function normalizeScript(file, content, scriptKind) {
  const source = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, false, scriptKind);
  const kinds = [];

  function visit(node) {
    if (node.kind !== ts.SyntaxKind.EndOfFileToken) kinds.push(node.kind);
    ts.forEachChild(node, visit);
  }

  visit(source);
  return kinds.join(",");
}

function normalizeCss(content) {
  const tokens = content
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .match(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|#[\da-f]+|-?(?:\d*\.)?\d+(?:e[+-]?\d+)?(?:%|[a-z]+)?|--?[_a-z][\w-]*|[_a-z][\w-]*|[~|^$*]=|::|[{}[\]():;,.>+~*=|^$@!?/-]/gi);

  return (tokens ?? [])
    .map((token) => {
      if (/^["']/.test(token)) return "string";
      if (/^#[\da-f]+$/i.test(token)) return "color";
      if (/^-?(?:\d*\.)?\d/i.test(token)) return "number";
      if (/^--?[_a-z]|^[_a-z]/i.test(token)) return "identifier";
      return token;
    })
    .join(" ");
}

export function structureHash(files) {
  const normalized = files
    .map(({ path: file, content }) => {
      const extension = path.extname(file).toLowerCase();
      const scriptKind = scriptKinds.get(extension);
      if (!scriptKind && extension !== ".css") return null;
      const source = Buffer.isBuffer(content) ? content.toString("utf8") : String(content);
      return {
        extension,
        file: file.replaceAll("\\", "/"),
        structure: scriptKind ? normalizeScript(file, source, scriptKind) : normalizeCss(source),
      };
    })
    .filter(Boolean)
    .sort((left, right) => (left.file < right.file ? -1 : left.file > right.file ? 1 : 0));

  if (normalized.length === 0) throw new Error("A component needs at least one JavaScript, TypeScript, JSX, TSX, or CSS file");
  return sha256(normalized.map(({ extension, structure }) => `${extension}:${structure}`).join("\n"));
}
