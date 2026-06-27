## 0.0.4 (2026-06-27)

### 🩹 Fixes

- remove unsupported [build] section from wrangler.toml ([652ecb1](https://github.com/akd3vs/frontend-monorepo-showcase/commit/652ecb1))

### ❤️ Thank You

- Karell Contreras

## 0.0.3 (2026-06-27)

This was a version bump only for @frontend-monorepo-showcase/ui-core to align it with other projects, there were no code changes.

## 0.0.2 (2026-06-27)

### 🩹 Fixes

- enable automaticFromRef for first release changelog generation ([f55ede1](https://github.com/akd3vs/frontend-monorepo-showcase/commit/f55ede1))
- **ui-core:** skip tree-shaking tests when dist/esm is not built The tree-shaking tests read from dist/esm/ which only exists after a build step. In CI, the test job runs before the build job, causing these tests to fail with ENOENT on the dist files. Use describe.skipIf to gracefully skip these tests when the build output directory doesn't exist. The tests still run when dist is present (locally and in CI jobs that build first). ([81a67cb](https://github.com/akd3vs/frontend-monorepo-showcase/commit/81a67cb))
- resolve CI failures (lint, typecheck, tests, build) ([9ff5a61](https://github.com/akd3vs/frontend-monorepo-showcase/commit/9ff5a61))
- resolve lint errors across all workspaces ([04e6efd](https://github.com/akd3vs/frontend-monorepo-showcase/commit/04e6efd))

### ❤️ Thank You

- Karell Contreras
