import { promises as fs } from 'node:fs';
import path from 'node:path';

export const SUPPORTED_EXTENSIONS = new Set([
  '.html', '.htm', '.jsx', '.tsx', '.js', '.mjs', '.ts', '.vue', '.svelte', '.md', '.mdx', '.css'
]);

export const DEFAULT_IGNORED_DIRS = new Set([
  '.git', '.next', '.nuxt', '.svelte-kit', 'build', 'coverage', 'dist', 'node_modules', 'out', 'vendor'
]);

const CODE_EXTENSIONS = new Set(['.html', '.htm', '.jsx', '.tsx', '.js', '.mjs', '.ts', '.vue', '.svelte', '.mdx', '.css']);

const TEXT_RULES = [
  {
    id: 'no-em-dash',
    severity: 'error',
    confidence: 'deterministic',
    description: 'Section 14 requires zero em-dashes in page output.',
    pattern: /—/g,
    message: 'Em-dash found. Replace it with punctuation that satisfies the zero-em-dash rule.'
  },
  {
    id: 'no-h-screen',
    severity: 'error',
    confidence: 'deterministic',
    description: 'Section 14 requires dynamic viewport units instead of h-screen.',
    pattern: /\bh-screen\b/g,
    message: 'h-screen found. Use min-h-[100dvh] or another dynamic-viewport-safe layout.'
  },
  {
    id: 'no-scroll-listener',
    severity: 'error',
    confidence: 'deterministic',
    description: 'Section 14 bans direct window/document scroll listeners for animation.',
    pattern: /(?:addEventListener\s*\(\s*['"`]scroll['"`]|\.onscroll\s*=)/g,
    message: 'Direct scroll listener found. Use Motion useScroll(), ScrollTrigger, IntersectionObserver, or CSS scroll-driven animation.'
  },
  {
    id: 'no-scroll-cue',
    severity: 'error',
    confidence: 'high',
    description: 'Section 14 bans decorative scroll cues.',
    pattern: /\bscroll\s+to\s+(?:explore|discover|continue)\b|(?:↓|\u2193)\s*scroll\b/gi,
    message: 'Decorative scroll cue found. Remove it unless it conveys required product behavior.'
  },
  {
    id: 'no-placeholder-identity',
    severity: 'error',
    confidence: 'high',
    description: 'Section 14 bans generic AI placeholder identities.',
    pattern: /\b(?:Jane Doe|John Doe|Acme(?:\s+(?:Inc\.?|Corp\.?|Company))?)\b/g,
    message: 'Generic placeholder identity found. Replace it with real content or an explicitly labeled placeholder.'
  },
  {
    id: 'no-ai-tell-copy',
    severity: 'error',
    confidence: 'high',
    description: 'Section 14 requires removal of named AI-tell copy patterns.',
    pattern: /\bquietly\s+in\s+use\s+at\b/gi,
    message: 'Known AI-tell copy found: "Quietly in use at". Rewrite with concrete, project-specific language.'
  }
];

const DESIGN_SYSTEMS = [
  { name: 'Material', pattern: /(?:@material\/|@mui\/)/g },
  { name: 'Fluent UI', pattern: /@fluentui\//g },
  { name: 'Carbon', pattern: /@carbon\//g },
  { name: 'Primer', pattern: /@primer\//g },
  { name: 'Polaris', pattern: /@shopify\/(?:polaris|app-bridge)/g },
  { name: 'Atlassian', pattern: /@atlaskit\//g },
  { name: 'Radix Themes', pattern: /@radix-ui\/themes/g },
  { name: 'Bootstrap', pattern: /(?:['"]bootstrap(?:\/[^'"]*)?['"]|"bootstrap"\s*:)/g }
];

const VOID_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
const SEMANTIC_TEXT_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'small', 'blockquote', 'figcaption']);
const EYEBROW_HINT = /(?:^|[\s_-])(eyebrow|kicker|overline|micro-label|section-label)(?:$|[\s_-])/i;

function lineAndColumn(content, offset) {
  const before = content.slice(0, offset);
  const lines = before.split('\n');
  return { line: lines.length, column: lines.at(-1).length + 1 };
}

function lineExcerpt(content, line) {
  return content.split(/\r?\n/)[line - 1]?.trim().slice(0, 180) ?? '';
}

function finding({ ruleId, severity, confidence, message, file, content, offset = 0, detail }) {
  const { line, column } = lineAndColumn(content, offset);
  return {
    ruleId,
    severity,
    confidence,
    file,
    line,
    column,
    message,
    ...(detail ? { detail } : {}),
    excerpt: lineExcerpt(content, line)
  };
}

function stripNonRenderableNoise(content, extension) {
  let result = content;
  result = result.replace(/<!--[\s\S]*?-->/g, match => ' '.repeat(match.length));
  result = result.replace(/\/\*[\s\S]*?\*\//g, match => match.replace(/[^\n]/g, ' '));
  result = result.replace(/(^|[^:])\/\/[^\n]*/g, match => match.replace(/[^\n]/g, ' '));

  if (extension === '.md' || extension === '.mdx') {
    result = result.replace(/(?:```[\s\S]*?```|~~~[\s\S]*?~~~)/g, match => match.replace(/[^\n]/g, ' '));
  }

  return result;
}

function runTextRules(file, content) {
  const extension = path.extname(file).toLowerCase();
  const searchable = stripNonRenderableNoise(content, extension);
  const findings = [];

  for (const rule of TEXT_RULES) {
    rule.pattern.lastIndex = 0;
    for (const match of searchable.matchAll(rule.pattern)) {
      findings.push(finding({
        ruleId: rule.id,
        severity: rule.severity,
        confidence: rule.confidence,
        message: rule.message,
        file,
        content,
        offset: match.index ?? 0
      }));
    }
  }

  return findings;
}

function parseAttributes(rawTag) {
  const attrs = new Map();
  const attrPattern = /([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{?`([^`]*)`\}?|\{?"([^"]*)"\}?|\{?'([^']*)'\}?)/g;
  for (const match of rawTag.matchAll(attrPattern)) {
    attrs.set(match[1].toLowerCase(), match[2] ?? match[3] ?? match[4] ?? match[5] ?? match[6] ?? '');
  }
  return attrs;
}

function parseMarkup(content) {
  const root = { tag: '#root', attrs: new Map(), children: [], parent: null, start: 0, end: content.length };
  const stack = [root];
  const tokenPattern = /<!--[\s\S]*?-->|<![^>]*>|<\/?[A-Za-z][^>]*>|[^<]+/g;

  for (const match of content.matchAll(tokenPattern)) {
    const token = match[0];
    const offset = match.index ?? 0;
    if (token.startsWith('<!--') || token.startsWith('<!')) continue;

    if (!token.startsWith('<')) {
      const parent = stack.at(-1);
      if (token.trim() && parent && !['script', 'style'].includes(parent.tag)) {
        parent.children.push({ tag: '#text', text: token, parent, start: offset, end: offset + token.length });
      }
      continue;
    }

    const closing = /^<\//.test(token);
    const tagMatch = token.match(/^<\/?\s*([A-Za-z][\w:-]*)/);
    if (!tagMatch) continue;
    const rawName = tagMatch[1];
    const tag = rawName.toLowerCase();

    if (closing) {
      for (let i = stack.length - 1; i > 0; i -= 1) {
        if (stack[i].tag === tag) {
          stack[i].end = offset + token.length;
          stack.length = i;
          break;
        }
      }
      continue;
    }

    const parent = stack.at(-1);
    const node = {
      tag,
      rawName,
      attrs: parseAttributes(token),
      rawTag: token,
      children: [],
      parent,
      start: offset,
      end: offset + token.length
    };
    parent.children.push(node);

    const selfClosing = /\/\s*>$/.test(token) || (VOID_TAGS.has(tag) && rawName === tag);
    if (!selfClosing) stack.push(node);
  }

  return root;
}

function walk(node, visitor) {
  visitor(node);
  for (const child of node.children ?? []) walk(child, visitor);
}

function attributeText(node) {
  return [...(node.attrs?.entries() ?? [])]
    .filter(([key]) => ['id', 'class', 'classname', 'data-section', 'aria-label', 'role'].includes(key))
    .map(([, value]) => value)
    .join(' ');
}

function hasText(node) {
  let found = false;
  walk(node, child => {
    if (child.tag === '#text' && child.text.trim()) found = true;
  });
  return found;
}

function hasAncestor(node, predicate, boundary) {
  let current = node.parent;
  while (current && current !== boundary) {
    if (predicate(current)) return true;
    current = current.parent;
  }
  return false;
}

function isHeroNode(node) {
  if (!node.tag || node.tag === '#text' || node.tag === '#root') return false;

  if (node.rawName && /Hero$/.test(node.rawName)) return true;

  const dataSection = node.attrs?.get('data-section')?.trim();
  if (/^hero$/i.test(dataSection ?? '')) return true;

  const id = node.attrs?.get('id')?.trim();
  if (/(?:^|[-_:])hero$/i.test(id ?? '')) return true;

  for (const key of ['class', 'classname']) {
    const classes = node.attrs?.get(key)?.split(/\s+/).filter(Boolean) ?? [];
    if (classes.some(value => /^hero$/i.test(value))) return true;
  }

  const ariaLabel = node.attrs?.get('aria-label')?.trim();
  return /\bhero\b/i.test(ariaLabel ?? '');
}

function findHeroes(root) {
  const heroes = [];
  walk(root, node => {
    if (isHeroNode(node)) heroes.push(node);
  });
  return heroes;
}

function countHeroTextBlocks(hero) {
  const blocks = [];
  const ctaParents = new Set();

  walk(hero, node => {
    if (!node.tag || node.tag === '#text' || node === hero) return;

    const isSemantic = SEMANTIC_TEXT_TAGS.has(node.tag);
    const isEyebrow = (node.tag === 'span' || node.tag === 'div') && EYEBROW_HINT.test(attributeText(node));
    const isInteractive = node.tag === 'a' || node.tag === 'button' || node.rawName === 'Link';

    if ((isSemantic || isEyebrow) && hasText(node)) {
      const nestedInTextBlock = hasAncestor(node, ancestor =>
        SEMANTIC_TEXT_TAGS.has(ancestor.tag) || EYEBROW_HINT.test(attributeText(ancestor)), hero);
      if (!nestedInTextBlock) {
        blocks.push({ type: isEyebrow ? 'eyebrow' : node.tag, node });
      }
    }

    if (isInteractive && hasText(node)) {
      const parent = node.parent === hero ? node : node.parent;
      ctaParents.add(parent);
    }
  });

  for (const parent of ctaParents) {
    const alreadyInsideText = blocks.some(block => {
      let current = parent;
      while (current && current !== hero) {
        if (current === block.node) return true;
        current = current.parent;
      }
      return false;
    });
    if (!alreadyInsideText) blocks.push({ type: 'cta-group', node: parent });
  }

  return blocks;
}

function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function nodeText(node) {
  const parts = [];
  walk(node, child => {
    if (child.tag === '#text') parts.push(child.text.trim());
  });
  return parts.filter(Boolean).join(' ');
}

function runMarkupRules(file, content) {
  const extension = path.extname(file).toLowerCase();
  if (!['.html', '.htm', '.jsx', '.tsx', '.vue', '.svelte', '.mdx'].includes(extension)) return [];

  const root = parseMarkup(stripNonRenderableNoise(content, extension));
  const heroes = findHeroes(root);
  const findings = [];

  for (const hero of heroes) {
    const blocks = countHeroTextBlocks(hero);
    if (blocks.length > 4) {
      findings.push(finding({
        ruleId: 'hero-max-four-text-blocks',
        severity: 'error',
        confidence: 'structural',
        message: `Hero contains ${blocks.length} top-level text/CTA blocks; Section 14 allows at most 4.`,
        detail: `Counted: ${blocks.map(block => block.type).join(', ')}`,
        file,
        content,
        offset: hero.start
      }));
    }

    const paragraphs = [];
    walk(hero, node => {
      if (node.tag === 'p' && !hasAncestor(node, ancestor => ancestor.tag === 'p', hero)) paragraphs.push(node);
    });
    for (const paragraph of paragraphs) {
      const words = wordCount(nodeText(paragraph));
      if (words > 20) {
        findings.push(finding({
          ruleId: 'hero-subtext-word-limit',
          severity: 'error',
          confidence: 'structural',
          message: `Hero paragraph contains ${words} words; Section 14 caps hero subtext at 20 words.`,
          file,
          content,
          offset: paragraph.start
        }));
      }
    }
  }

  return findings;
}

function detectDesignSystems(records) {
  const detected = new Map();

  for (const record of records) {
    const extension = path.extname(record.file).toLowerCase();
    if (path.basename(record.file) !== 'package.json' && !CODE_EXTENSIONS.has(extension)) continue;
    const searchable = stripNonRenderableNoise(record.content, extension);
    for (const system of DESIGN_SYSTEMS) {
      system.pattern.lastIndex = 0;
      const match = system.pattern.exec(searchable);
      if (!match) continue;
      if (!detected.has(system.name)) detected.set(system.name, []);
      const position = lineAndColumn(record.content, match.index);
      detected.get(system.name).push({ file: record.file, ...position });
    }
  }

  if (detected.size <= 1) return [];

  const systems = [...detected.keys()];
  const firstEntry = detected.values().next().value[0];
  return [{
    ruleId: 'one-design-system',
    severity: 'error',
    confidence: 'high',
    file: firstEntry.file,
    line: firstEntry.line,
    column: firstEntry.column,
    message: `Multiple design systems detected: ${systems.join(', ')}. Section 14 requires one design system per project.`,
    detail: Object.fromEntries(detected),
    excerpt: ''
  }];
}

export async function collectSourceFiles(targets, options = {}) {
  const ignoredDirs = new Set(options.ignoredDirs ?? DEFAULT_IGNORED_DIRS);
  const records = [];

  async function visit(target) {
    const stat = await fs.stat(target);
    if (stat.isDirectory()) {
      if (ignoredDirs.has(path.basename(target))) return;
      const entries = await fs.readdir(target, { withFileTypes: true });
      entries.sort((a, b) => a.name.localeCompare(b.name));
      for (const entry of entries) await visit(path.join(target, entry.name));
      return;
    }

    if (!stat.isFile()) return;
    const extension = path.extname(target).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.has(extension) && path.basename(target) !== 'package.json') return;
    records.push({ file: target, content: await fs.readFile(target, 'utf8') });
  }

  for (const target of targets) await visit(path.resolve(target));
  return records;
}

export function analyzeRecords(records, options = {}) {
  const cwd = options.cwd ? path.resolve(options.cwd) : process.cwd();
  const normalized = records.map(record => ({
    file: path.isAbsolute(record.file) ? path.relative(cwd, record.file) || path.basename(record.file) : record.file,
    content: record.content
  }));

  const findings = [];
  for (const record of normalized) {
    findings.push(...runTextRules(record.file, record.content));
    findings.push(...runMarkupRules(record.file, record.content));
  }
  findings.push(...detectDesignSystems(normalized));

  findings.sort((a, b) =>
    a.file.localeCompare(b.file) || a.line - b.line || a.column - b.column || a.ruleId.localeCompare(b.ruleId));

  return {
    findings,
    summary: {
      files: normalized.length,
      errors: findings.filter(item => item.severity === 'error').length,
      warnings: findings.filter(item => item.severity === 'warning').length
    },
    coverage: {
      deterministic: TEXT_RULES.filter(rule => rule.confidence === 'deterministic').map(rule => rule.id),
      highConfidence: TEXT_RULES.filter(rule => rule.confidence === 'high').map(rule => rule.id).concat(['one-design-system']),
      structural: ['hero-max-four-text-blocks', 'hero-subtext-word-limit'],
      intentionallyManual: [
        'visual hierarchy and composition quality',
        'actual rendered contrast',
        'responsive layout quality',
        'animation motivation and perceived smoothness',
        'Core Web Vitals',
        'copy quality beyond named anti-patterns'
      ]
    }
  };
}

export async function analyzeTargets(targets, options = {}) {
  const records = await collectSourceFiles(targets, options);
  return analyzeRecords(records, options);
}
