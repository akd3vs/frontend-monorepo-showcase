#!/usr/bin/env node
/* global console, process */
/**
 * Serves all workspace coverage reports from a single local server.
 * Run: node scripts/serve-coverage.mjs
 */
import { execSync } from 'child_process';
import { mkdirSync, existsSync, writeFileSync, cpSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
const OUT = resolve(ROOT, '.coverage-reports');
const PORT = 9000;

const workspaces = [
  { name: 'host-shell', path: 'apps/host-shell/coverage' },
  { name: 'data-dashboard', path: 'apps/data-dashboard/coverage' },
  { name: 'devtools-panel', path: 'apps/devtools-panel/coverage' },
  { name: 'ui-core', path: 'packages/ui-core/coverage' },
  { name: 'design-tokens', path: 'packages/design-tokens/coverage' },
  { name: 'mock-engine', path: 'packages/mock-engine/coverage' },
  { name: 'perf-guardian', path: 'packages/perf-guardian/coverage' },
];

// Create output directory
mkdirSync(OUT, { recursive: true });

// Copy each coverage report
const available = [];
for (const ws of workspaces) {
  const src = resolve(ROOT, ws.path);
  if (existsSync(src)) {
    const dest = resolve(OUT, ws.name);
    cpSync(src, dest, { recursive: true });
    available.push(ws.name);
  }
}

if (available.length === 0) {
  console.error('No coverage reports found. Run tests with --coverage first:');
  console.error('  npm run test:coverage');
  process.exit(1);
}

// Generate index HTML
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Coverage Reports</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 600px; margin: 40px auto; padding: 0 20px; }
    h1 { font-size: 1.5rem; margin-bottom: 24px; }
    ul { list-style: none; padding: 0; }
    li { margin: 8px 0; }
    a { display: block; padding: 12px 16px; background: #f5f5f5; border-radius: 8px; text-decoration: none; color: #111; font-weight: 500; }
    a:hover { background: #e5e7eb; }
  </style>
</head>
<body>
  <h1>Coverage Reports</h1>
  <ul>
    ${available.map((name) => `<li><a href="/${name}/">${name}</a></li>`).join('\n    ')}
  </ul>
</body>
</html>`;

writeFileSync(resolve(OUT, 'index.html'), html);

console.log(`\nCoverage reports available at: http://localhost:${PORT}\n`);
console.log(`   Reports: ${available.join(', ')}\n`);

// Serve using http-server (already a devDependency)
execSync(`npx http-server ${OUT} --port ${PORT} -o`, { stdio: 'inherit' });
