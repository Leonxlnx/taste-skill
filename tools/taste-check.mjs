#!/usr/bin/env node
import path from 'node:path';
import process from 'node:process';
import { analyzeTargets } from './lib/taste-check.mjs';

const HELP = `taste-check - deterministic pre-flight checks for Taste Skill output

Usage:
  node tools/taste-check.mjs [path ...] [--format text|json]

Examples:
  node tools/taste-check.mjs app components
  node tools/taste-check.mjs ./out/index.html
  node tools/taste-check.mjs app components --format json

Exit codes:
  0  no error-level findings
  1  one or more error-level findings
  2  invalid invocation or unreadable target

The tool intentionally automates only checks that static analysis can evaluate with
reasonable confidence. Visual hierarchy, rendered contrast, responsive behavior,
and other perceptual checks remain manual pre-flight items.
`;

function parseArgs(argv) {
  const targets = [];
  let format = 'text';

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') return { help: true, targets, format };
    if (arg === '--format') {
      format = argv[++i];
      if (!['text', 'json'].includes(format)) throw new Error('--format must be "text" or "json"');
      continue;
    }
    if (arg.startsWith('--')) throw new Error(`Unknown option: ${arg}`);
    targets.push(arg);
  }

  if (targets.length === 0) targets.push('.');
  return { help: false, targets, format };
}

function formatLocation(item) {
  return `${item.file}:${item.line}:${item.column}`;
}

function printText(result) {
  if (result.findings.length === 0) {
    console.log(`Taste pre-flight: PASS (${result.summary.files} files checked)`);
    console.log('Automated checks passed. Manual Section 14 checks are still required.');
    return;
  }

  console.log(`Taste pre-flight: FAIL (${result.summary.errors} errors, ${result.summary.warnings} warnings)`);
  console.log('');
  for (const item of result.findings) {
    console.log(`${item.severity.toUpperCase()} ${item.ruleId} ${formatLocation(item)}`);
    console.log(`  ${item.message}`);
    if (item.excerpt) console.log(`  > ${item.excerpt}`);
    if (typeof item.detail === 'string') console.log(`  ${item.detail}`);
  }
  console.log('');
  console.log('Manual checks still required:');
  for (const check of result.coverage.intentionallyManual) console.log(`  - ${check}`);
}

async function main() {
  let parsed;
  try {
    parsed = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`taste-check: ${error.message}`);
    console.error('Run with --help for usage.');
    process.exitCode = 2;
    return;
  }

  if (parsed.help) {
    console.log(HELP);
    return;
  }

  try {
    const result = await analyzeTargets(parsed.targets, { cwd: process.cwd() });
    if (result.summary.files === 0) {
      console.error(`taste-check: no supported source files found in ${parsed.targets.map(item => path.normalize(item)).join(', ')}`);
      process.exitCode = 2;
      return;
    }

    if (parsed.format === 'json') console.log(JSON.stringify(result, null, 2));
    else printText(result);

    if (result.summary.errors > 0) process.exitCode = 1;
  } catch (error) {
    console.error(`taste-check: ${error.message}`);
    process.exitCode = 2;
  }
}

await main();
