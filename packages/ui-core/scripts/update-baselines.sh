#!/usr/bin/env bash
# Update visual regression baselines for UI_Core Storybook stories.
# This script starts Storybook, runs the test-runner with --updateSnapshot,
# and stores new baseline images in .storybook/baselines/.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_DIR="$(dirname "$SCRIPT_DIR")"
BASELINES_DIR="$PACKAGE_DIR/.storybook/baselines"

echo "🔄 Updating visual regression baselines..."
echo "   Baselines directory: $BASELINES_DIR"

# Ensure baselines directory exists
mkdir -p "$BASELINES_DIR"

# Clear existing baselines to regenerate fresh
if [ "$(ls -A "$BASELINES_DIR" 2>/dev/null)" ]; then
  echo "   Removing old baselines..."
  rm -f "$BASELINES_DIR"/*.png
fi

# Start Storybook in the background (CI mode)
echo "   Starting Storybook..."
npx storybook dev -p 6007 --ci --no-open &
STORYBOOK_PID=$!

# Wait for Storybook to be ready
echo "   Waiting for Storybook to start on port 6007..."
npx wait-on http://localhost:6007 --timeout 60000 2>/dev/null || {
  echo "❌ Storybook failed to start within 60 seconds"
  kill "$STORYBOOK_PID" 2>/dev/null || true
  exit 1
}

echo "   Running test-runner with --updateSnapshot..."
npx test-storybook --url http://localhost:6007 --updateSnapshot || {
  echo "⚠️  Some snapshots may have failed to generate"
}

# Cleanup
echo "   Stopping Storybook..."
kill "$STORYBOOK_PID" 2>/dev/null || true
wait "$STORYBOOK_PID" 2>/dev/null || true

BASELINE_COUNT=$(find "$BASELINES_DIR" -name "*.png" 2>/dev/null | wc -l | tr -d ' ')
echo "✅ Updated $BASELINE_COUNT baseline images in $BASELINES_DIR"
