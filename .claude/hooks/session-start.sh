#!/bin/bash
set -euo pipefail

# Only run setup in the Claude Code remote (web/mobile) environment
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# Disable Next.js anonymous telemetry for clean, non-interactive output
if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  echo 'export NEXT_TELEMETRY_DISABLED=1' >> "$CLAUDE_ENV_FILE"
fi

# Install npm dependencies (idempotent; uses cached node_modules when possible)
npm install
