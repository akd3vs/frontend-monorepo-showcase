#!/usr/bin/env node

/**
 * Security Audit Script
 *
 * Runs npm audit for dependency vulnerability scanning and filters results
 * against the .security-allowlist.json configuration.
 *
 * Exits non-zero if unresolved high/critical vulnerabilities exist.
 *
 * Reports: package name, vulnerability ID, severity, recommended fix version.
 *
 * Usage:
 *   node scripts/security-audit.mjs
 */

import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(__dirname, '..');
const ALLOWLIST_PATH = resolve(ROOT_DIR, '.security-allowlist.json');

/**
 * Load and parse the security allowlist configuration.
 */
function loadAllowlist() {
  if (!existsSync(ALLOWLIST_PATH)) {
    console.warn('⚠ No .security-allowlist.json found. No advisories will be suppressed.');
    return { advisories: [] };
  }

  try {
    const raw = readFileSync(ALLOWLIST_PATH, 'utf-8');
    const config = JSON.parse(raw);
    return {
      advisories: Array.isArray(config.advisories) ? config.advisories : [],
    };
  } catch (err) {
    console.error(`✗ Failed to parse .security-allowlist.json: ${err.message}`);
    process.exit(1);
  }
}

/**
 * Check if an advisory is suppressed by the allowlist.
 */
function isAllowlisted(advisoryId, allowlist) {
  const now = new Date();
  return allowlist.advisories.some((entry) => {
    if (String(entry.id) !== String(advisoryId)) return false;
    // Check expiration if present
    if (entry.expiresAt) {
      const expiry = new Date(entry.expiresAt);
      if (expiry < now) return false;
    }
    return true;
  });
}

/**
 * Run npm audit and parse results.
 */
function runNpmAudit() {
  try {
    // npm audit --json returns exit code 0 only when no vulnerabilities found
    const output = execSync('npm audit --json 2>/dev/null', {
      cwd: ROOT_DIR,
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024,
    });
    return JSON.parse(output);
  } catch (err) {
    // npm audit exits non-zero when vulnerabilities exist — parse stdout
    if (err.stdout) {
      try {
        return JSON.parse(err.stdout);
      } catch {
        console.error('✗ Failed to parse npm audit output');
        process.exit(1);
      }
    }
    // If no stdout, the command itself failed
    console.error(`✗ npm audit command failed: ${err.message}`);
    process.exit(1);
  }
}

/**
 * Extract high/critical vulnerabilities from npm audit JSON output.
 */
function extractVulnerabilities(auditResult) {
  const vulnerabilities = [];

  // npm audit v7+ format uses "vulnerabilities" object
  if (auditResult.vulnerabilities) {
    for (const [pkgName, vuln] of Object.entries(auditResult.vulnerabilities)) {
      if (vuln.severity === 'high' || vuln.severity === 'critical') {
        const via = Array.isArray(vuln.via)
          ? vuln.via.filter((v) => typeof v === 'object')
          : [];

        vulnerabilities.push({
          package: pkgName,
          severity: vuln.severity,
          id: via.length > 0 ? String(via[0].url || via[0].source || pkgName) : pkgName,
          fixAvailable: vuln.fixAvailable
            ? typeof vuln.fixAvailable === 'object'
              ? `${vuln.fixAvailable.name}@${vuln.fixAvailable.version}`
              : 'Yes (run npm audit fix)'
            : 'No fix available',
          range: vuln.range || 'unknown',
        });
      }
    }
  }

  return vulnerabilities;
}

/**
 * Main execution
 */
function main() {
  console.log('🔒 Running security audit...\n');

  const allowlist = loadAllowlist();
  const suppressedCount = allowlist.advisories.length;

  if (suppressedCount > 0) {
    console.log(`ℹ ${suppressedCount} advisory(s) in allowlist\n`);
  }

  // Run npm audit
  console.log('📦 Scanning dependencies for vulnerabilities...');
  const auditResult = runNpmAudit();
  const allVulnerabilities = extractVulnerabilities(auditResult);

  // Filter against allowlist
  const unresolvedVulnerabilities = allVulnerabilities.filter(
    (vuln) => !isAllowlisted(vuln.id, allowlist)
  );

  const allowlistedVulnerabilities = allVulnerabilities.filter((vuln) =>
    isAllowlisted(vuln.id, allowlist)
  );

  // Report suppressed
  if (allowlistedVulnerabilities.length > 0) {
    console.log(`\n⚠ ${allowlistedVulnerabilities.length} vulnerability(s) suppressed by allowlist:`);
    for (const vuln of allowlistedVulnerabilities) {
      console.log(`  - ${vuln.package} (${vuln.severity}) [${vuln.id}]`);
    }
  }

  // Report unresolved
  if (unresolvedVulnerabilities.length === 0) {
    console.log('\n✓ No unresolved high/critical vulnerabilities found.\n');
    return;
  }

  console.log(
    `\n✗ ${unresolvedVulnerabilities.length} unresolved high/critical vulnerability(s):\n`
  );

  for (const vuln of unresolvedVulnerabilities) {
    console.log(`  Package:  ${vuln.package}`);
    console.log(`  ID:       ${vuln.id}`);
    console.log(`  Severity: ${vuln.severity.toUpperCase()}`);
    console.log(`  Fix:      ${vuln.fixAvailable}`);
    console.log('');
  }

  // Output machine-readable summary
  const summary = {
    total: allVulnerabilities.length,
    unresolved: unresolvedVulnerabilities.length,
    suppressed: allowlistedVulnerabilities.length,
    vulnerabilities: unresolvedVulnerabilities,
  };

  // Write summary to file for CI consumption
  const summaryJson = JSON.stringify(summary, null, 2);
  console.log('--- JSON Summary ---');
  console.log(summaryJson);
  console.log('---');

  process.exit(1);
}

main();
