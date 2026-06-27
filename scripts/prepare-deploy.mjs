/**
 * Prepares the deploy/ directory for Cloudflare Pages by co-locating
 * all federated module assets with the Host_Shell output.
 *
 * Output structure:
 *   deploy/
 *   ├── (Host_Shell files: index.html, assets/, etc.)
 *   ├── data-dashboard/  (Data_Dashboard federated module assets)
 *   └── devtools-panel/  (Devtools_Panel federated module assets)
 */

import { cpSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const DEPLOY_DIR = resolve(ROOT, 'deploy');

const HOST_SHELL_DIST = resolve(ROOT, 'apps/host-shell/dist');
const DATA_DASHBOARD_DIST = resolve(ROOT, 'apps/data-dashboard/dist');
const DEVTOOLS_PANEL_DIST = resolve(ROOT, 'apps/devtools-panel/dist');

// Clean previous deploy directory
if (existsSync(DEPLOY_DIR)) {
  rmSync(DEPLOY_DIR, { recursive: true, force: true });
}

mkdirSync(DEPLOY_DIR, { recursive: true });

// Copy Host_Shell as the root of deploy/
console.log('Copying Host_Shell dist → deploy/');
cpSync(HOST_SHELL_DIST, DEPLOY_DIR, { recursive: true });

// Copy Data_Dashboard into deploy/data-dashboard/
console.log('Copying Data_Dashboard dist → deploy/data-dashboard/');
cpSync(DATA_DASHBOARD_DIST, resolve(DEPLOY_DIR, 'data-dashboard'), { recursive: true });

// Copy Devtools_Panel into deploy/devtools-panel/
console.log('Copying Devtools_Panel dist → deploy/devtools-panel/');
cpSync(DEVTOOLS_PANEL_DIST, resolve(DEPLOY_DIR, 'devtools-panel'), { recursive: true });

// Copy _redirects for SPA routing if present in Host_Shell public
const redirectsSrc = resolve(ROOT, 'apps/host-shell/public/_redirects');
const redirectsDest = resolve(DEPLOY_DIR, '_redirects');
if (existsSync(redirectsSrc) && !existsSync(redirectsDest)) {
  cpSync(redirectsSrc, redirectsDest);
  console.log('Copied _redirects for SPA routing');
}

console.log('Deploy directory prepared successfully.');
