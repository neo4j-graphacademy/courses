#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SOLUTIONS_DIR="$REPO_DIR/genai-maf-context-providers/solutions"
PYTHON="$REPO_DIR/.venv/bin/python"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ ! -f "$PYTHON" ]; then
  echo "ERROR: Virtual environment not found at $REPO_DIR/.venv"
  echo "Run: python -m venv .venv && .venv/bin/pip install -r requirements.txt"
  exit 1
fi

# Token usage report mode: run_all.sh --tokens [--json]
if [[ "${1:-}" == "--tokens" ]]; then
  echo "Running token usage report..."
  shift
  "$PYTHON" "$SCRIPT_DIR/token_usage_report.py" "$@"
  exit $?
fi

passed=0
failed=0
failed_scripts=()

scripts=(
  "simple_agent.py|Simple Agent (hardcoded movie tool)"
  "simple_context_provider.py|Simple Context Provider (user info memory)"
  "vector_context_provider.py|Vector Context Provider (Neo4j vector search)"
  "graph_enriched_provider.py|Graph Enriched Provider (vector + graph traversal)"
  "fulltext_context_provider.py|Fulltext Context Provider (Neo4j fulltext search)"
  "hybrid_provider.py|Hybrid Provider (vector + fulltext combined search)"
  "entity_extraction.py|Entity Extraction (POLE+O extraction pipeline)"
  "memory_context_provider.py|Memory Context Provider (persistent memory)"
  "memory_tools_agent.py|Memory Tools Agent (memory tools + context provider)"
  "reasoning_memory.py|Reasoning Memory (trace recording + tool stats)"
)

for entry in "${scripts[@]}"; do
  script="${entry%%|*}"
  description="${entry#*|}"

  echo ""
  echo "========================================"
  echo "  $description"
  echo "  $script"
  echo "========================================"
  echo ""

  if "$PYTHON" "$SOLUTIONS_DIR/$script"; then
    echo ""
    echo "-- PASSED --"
    ((passed++))
  else
    echo ""
    echo "-- FAILED --"
    ((failed++))
    failed_scripts+=("$script")
  fi
done

echo ""
echo "========================================"
echo "  Summary: $passed passed, $failed failed"
if [ ${#failed_scripts[@]} -gt 0 ]; then
  echo "  Failed: ${failed_scripts[*]}"
fi
echo "========================================"
