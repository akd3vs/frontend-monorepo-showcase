## 0.0.5 (2026-06-27)

### 🩹 Fixes

- replace \_redirects with \_routes.json for Cloudflare Pages SPA routing ([01a4f41](https://github.com/akd3vs/frontend-monorepo-showcase/commit/01a4f41))

### ❤️ Thank You

- Karell Contreras

## 0.0.4 (2026-06-27)

### 🩹 Fixes

- remove unsupported [build] section from wrangler.toml ([652ecb1](https://github.com/akd3vs/frontend-monorepo-showcase/commit/652ecb1))

### ❤️ Thank You

- Karell Contreras

## 0.0.3 (2026-06-27)

### 🩹 Fixes

- eliminate flaky property tests in mock-engine Property 6 (Network Latency Bounds) and Property 7 (Error Rate Statistical Conformance) used Math.random() inside fast-check property callbacks. Since fast-check cannot control Math.random(), these tests were non-deterministic and would occasionally fail on CI (~0.3% per run, compounding across runs). Fixes: - Property 6: Replace Math.random() with fc.double() arbitrary, using max: 1 - Number.EPSILON to match Math.random()'s [0, 1) range behavior. - Property 7: Replace Math.random() with a seeded PRNG (mulberry32) where fast-check controls the seed. This gives deterministic, reproducible random distributions without adversarial shrinking. Also increased confidence interval from 3σ to 4σ and sample size from 500 to 1000. ([3181055](https://github.com/akd3vs/frontend-monorepo-showcase/commit/3181055))

### ❤️ Thank You

- Karell Contreras

## 0.0.2 (2026-06-27)

### 🩹 Fixes

- enable automaticFromRef for first release changelog generation ([f55ede1](https://github.com/akd3vs/frontend-monorepo-showcase/commit/f55ede1))
- resolve CI failures (lint, typecheck, tests, build) ([9ff5a61](https://github.com/akd3vs/frontend-monorepo-showcase/commit/9ff5a61))
- resolve lint errors across all workspaces ([04e6efd](https://github.com/akd3vs/frontend-monorepo-showcase/commit/04e6efd))

### ❤️ Thank You

- Karell Contreras
