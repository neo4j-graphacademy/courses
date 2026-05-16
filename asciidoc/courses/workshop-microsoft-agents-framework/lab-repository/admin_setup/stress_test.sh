#!/usr/bin/env bash
# Stress test: run memory_tools_agent.py 20 times to reproduce transient errors
set -uo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PYTHON="$REPO_DIR/.venv/bin/python"
SCRIPT="$REPO_DIR/genai-maf-context-providers/solutions/memory_tools_agent.py"
RUNS=${1:-20}

export PYTHONPATH="$REPO_DIR/genai-maf-context-providers/solutions:$REPO_DIR/genai-maf-context-providers"

passed=0
failed=0

for i in $(seq 1 "$RUNS"); do
  printf "\n=== Run %d/%d ===\n" "$i" "$RUNS"
  if "$PYTHON" "$SCRIPT" > /dev/null 2>&1; then
    echo "PASSED"
    ((passed++))
  else
    echo "FAILED"
    # Re-run with output visible to capture the error
    "$PYTHON" "$SCRIPT" 2>&1 | tail -5
    ((failed++))
  fi
done

printf "\n=== Results: %d passed, %d failed out of %d ===\n" "$passed" "$failed" "$RUNS"
