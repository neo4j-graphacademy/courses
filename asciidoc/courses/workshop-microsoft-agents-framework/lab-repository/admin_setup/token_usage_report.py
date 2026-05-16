#!/usr/bin/env python3
"""
Token Usage Report for Workshop Solutions

Runs each solution script and captures token usage via the official
agent_framework.ChatResponse.usage_details API and the OpenAI Embeddings
API to produce a per-solution breakdown.

Supports both OpenAI direct and Azure AI Foundry providers.

Usage:
    python admin_setup/token_usage_report.py
    python admin_setup/token_usage_report.py --json
    python admin_setup/token_usage_report.py --log logs/mini-run
"""

import importlib
import io
import json
import os
import sys
import time
from dataclasses import dataclass, field
from pathlib import Path

# ---------------------------------------------------------------------------
# Token tracking data structures
# ---------------------------------------------------------------------------


@dataclass
class CallRecord:
    endpoint: str  # "chat" or "embeddings"
    model: str
    input_tokens: int
    output_tokens: int
    total_tokens: int


@dataclass
class SolutionUsage:
    name: str
    description: str
    calls: list[CallRecord] = field(default_factory=list)
    duration_s: float = 0.0
    error: str | None = None

    @property
    def total_input(self) -> int:
        return sum(c.input_tokens for c in self.calls)

    @property
    def total_output(self) -> int:
        return sum(c.output_tokens for c in self.calls)

    @property
    def total_tokens(self) -> int:
        return sum(c.total_tokens for c in self.calls)

    @property
    def embedding_tokens(self) -> int:
        return sum(c.total_tokens for c in self.calls if c.endpoint == "embeddings")

    @property
    def chat_input(self) -> int:
        return sum(c.input_tokens for c in self.calls if c.endpoint == "chat")

    @property
    def chat_output(self) -> int:
        return sum(c.output_tokens for c in self.calls if c.endpoint == "chat")

    @property
    def num_api_calls(self) -> int:
        return len(self.calls)


# Collector for the currently-running solution.
_current_calls: list[CallRecord] = []

# ---------------------------------------------------------------------------
# Instrumentation hooks
#
# ChatResponse (agent_framework._types) is constructed by the framework for
# every LLM API call — both the top-level agent.run() responses and internal
# tool-calling round-trips.  Its usage_details property is populated from the
# OpenAI response.usage by the OpenAIResponsesClient.  By hooking __init__
# we capture every call at the framework's official abstraction layer,
# avoiding any need to monkey-patch the OpenAI SDK or wrap async streams.
#
# Embeddings go through the OpenAI SDK directly (via neo4j-graphrag), so we
# still intercept those at the SDK level.
# ---------------------------------------------------------------------------


def _install_chat_response_hook():
    """Hook ChatResponse and Content.from_usage to record token usage.

    Non-streaming: ChatResponse is constructed with usage_details directly.
    Streaming: usage arrives via Content.from_usage() in a ChatResponseUpdate.
    We hook both paths to capture usage regardless of streaming mode.
    """
    from agent_framework._types import ChatResponse, Content

    # Non-streaming path: ChatResponse.__init__ receives usage_details
    _original_cr_init = ChatResponse.__init__

    def _hooked_cr_init(self, *args, **kwargs):
        _original_cr_init(self, *args, **kwargs)
        ud = self.usage_details
        if ud:
            _current_calls.append(CallRecord(
                endpoint="chat",
                model=self.model_id or "unknown",
                input_tokens=ud.get("input_token_count") or 0,
                output_tokens=ud.get("output_token_count") or 0,
                total_tokens=ud.get("total_token_count") or 0,
            ))

    ChatResponse.__init__ = _hooked_cr_init

    # Streaming path: Content.from_usage() is called once per API response
    # with the parsed UsageDetails from the response.completed event.
    _original_from_usage = Content.from_usage

    @classmethod
    def _hooked_from_usage(cls, usage_details, **kwargs):
        if usage_details:
            _current_calls.append(CallRecord(
                endpoint="chat",
                model="streaming",
                input_tokens=usage_details.get("input_token_count") or 0,
                output_tokens=usage_details.get("output_token_count") or 0,
                total_tokens=usage_details.get("total_token_count") or 0,
            ))
        return _original_from_usage.__func__(cls, usage_details, **kwargs)

    Content.from_usage = _hooked_from_usage


def _install_embeddings_hook():
    """Hook the OpenAI async embeddings endpoint to record embedding token usage.

    Embeddings are called by neo4j-graphrag's OpenAIEmbeddings, which uses
    the OpenAI SDK directly rather than the agent framework.
    """
    import openai.resources.embeddings

    cls = openai.resources.embeddings.AsyncEmbeddings
    _original_create = cls.create

    async def _hooked_create(*args, **kwargs):
        response = await _original_create(*args, **kwargs)
        if hasattr(response, "usage") and response.usage:
            u = response.usage
            _current_calls.append(CallRecord(
                endpoint="embeddings",
                model=kwargs.get("model", "unknown"),
                input_tokens=getattr(u, "prompt_tokens", 0) or 0,
                output_tokens=0,
                total_tokens=getattr(u, "total_tokens", 0) or 0,
            ))
        return response

    cls.create = _hooked_create


# ---------------------------------------------------------------------------
# Tee writer for --log support
# ---------------------------------------------------------------------------


class _TeeWriter:
    """Write to multiple streams simultaneously.

    Implements enough of the TextIO interface to serve as a drop-in
    replacement for sys.stdout.  Attribute lookups (encoding, isatty, etc.)
    are delegated to the primary (first) stream.
    """

    def __init__(self, primary, *others):
        self._primary = primary
        self._others = others

    def write(self, data):
        self._primary.write(data)
        for s in self._others:
            s.write(data)

    def flush(self):
        self._primary.flush()
        for s in self._others:
            s.flush()

    def isatty(self):
        return self._primary.isatty()

    def __getattr__(self, name):
        return getattr(self._primary, name)


# ---------------------------------------------------------------------------
# Solution runner
# ---------------------------------------------------------------------------

SOLUTIONS = [
    ("simple_agent.py", "Simple Agent (hardcoded movie tool)"),
    ("simple_context_provider.py", "Simple Context Provider (user info memory)"),
    ("fulltext_context_provider.py", "Fulltext Context Provider (Neo4j fulltext search)"),
    ("vector_context_provider.py", "Vector Context Provider (Neo4j vector search)"),
    ("graph_enriched_provider.py", "Graph Enriched Provider (vector + graph traversal)"),
    ("memory_context_provider.py", "Memory Context Provider (persistent memory)"),
    ("memory_tools_agent.py", "Memory Tools Agent (memory tools + context provider)"),
    ("hybrid_provider.py", "Hybrid Provider (vector + fulltext combined search)"),
    ("entity_extraction.py", "Entity Extraction (POLE+O extraction pipeline)"),
    ("reasoning_memory.py", "Reasoning Memory (trace recording + tool stats)"),
]


def run_solution(
    script_name: str,
    description: str,
    solutions_dir: Path,
    log_dir: Path | None = None,
) -> SolutionUsage:
    """Run a single solution and capture its token usage."""
    global _current_calls
    _current_calls = []

    usage = SolutionUsage(name=script_name, description=description)
    script_path = solutions_dir / script_name

    print(f"\n{'=' * 60}", file=sys.stderr)
    print(f"  {description}", file=sys.stderr)
    print(f"  {script_name}", file=sys.stderr)
    print(f"{'=' * 60}\n", file=sys.stderr)

    log_buf = io.StringIO() if log_dir else None

    start = time.time()
    # Redirect stdout so solution print() output doesn't pollute the
    # JSON or report on stdout.  When logging, tee to both stderr
    # (for live monitoring) and the log buffer.
    saved_stdout = sys.stdout
    output_stream = (
        _TeeWriter(sys.stderr, log_buf) if log_buf else sys.stderr
    )
    sys.stdout = output_stream
    try:
        spec = importlib.util.spec_from_file_location(
            script_name.replace(".py", ""), script_path
        )
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
    except Exception as e:
        usage.error = str(e)
        # Flows through tee when logging, so log_buf gets it automatically.
        print(f"  ERROR: {e}", file=output_stream)
    finally:
        sys.stdout = saved_stdout
        usage.duration_s = time.time() - start
        usage.calls = list(_current_calls)
        _current_calls = []

    if log_dir and log_buf:
        log_path = log_dir / f"{script_name.replace('.py', '')}.log"
        log_path.write_text(log_buf.getvalue())

    return usage


# ---------------------------------------------------------------------------
# Report generation
# ---------------------------------------------------------------------------


def _get_report_model() -> str:
    """Return the active model name for display purposes."""
    provider = os.environ.get("LLM_PROVIDER", "openai").lower()
    if provider == "azure":
        return os.environ.get("AZURE_OPENAI_RESPONSES_DEPLOYMENT_NAME", "default")
    return os.environ.get("OPENAI_RESPONSES_MODEL_ID", "default")


def _get_report_provider() -> str:
    """Return the active provider for display purposes."""
    return os.environ.get("LLM_PROVIDER", "openai").lower()


def print_report(
    results: list[SolutionUsage],
    output_json: bool = False,
    file=None,
):
    """Print a formatted token usage report.

    Args:
        results: Token usage results for each solution.
        output_json: Emit machine-readable JSON instead of text.
        file: Output stream (defaults to sys.stdout).
    """
    if file is None:
        file = sys.stdout

    def _print(*args, **kwargs):
        kwargs.setdefault("file", file)
        print(*args, **kwargs)

    provider = _get_report_provider()
    model = _get_report_model()

    if output_json:
        data = []
        for r in results:
            data.append({
                "solution": r.name,
                "description": r.description,
                "status": "error" if r.error else "ok",
                "error": r.error,
                "duration_s": round(r.duration_s, 2),
                "api_calls": r.num_api_calls,
                "chat_input_tokens": r.chat_input,
                "chat_output_tokens": r.chat_output,
                "embedding_tokens": r.embedding_tokens,
                "total_tokens": r.total_tokens,
                "calls": [
                    {
                        "endpoint": c.endpoint,
                        "model": c.model,
                        "input_tokens": c.input_tokens,
                        "output_tokens": c.output_tokens,
                        "total_tokens": c.total_tokens,
                    }
                    for c in r.calls
                ],
            })
        _print(json.dumps({
            "provider": provider,
            "model": model,
            "solutions": data,
            "totals": {
                "total_input_tokens": sum(r.total_input for r in results),
                "total_output_tokens": sum(r.total_output for r in results),
                "total_tokens": sum(r.total_tokens for r in results),
            },
        }, indent=2))
        return

    # Header
    _print("\n" + "=" * 80)
    _print(f"  WORKSHOP TOKEN USAGE REPORT  ({provider}: {model})")
    _print("=" * 80)

    # Per-solution breakdown
    for r in results:
        status = "FAILED" if r.error else "OK"
        _print(f"\n{'─' * 80}")
        _print(f"  {r.description}")
        _print(f"  {r.name}  [{status}]  ({r.duration_s:.1f}s)")
        _print(f"{'─' * 80}")

        if r.error:
            _print(f"  Error: {r.error}")
            continue

        if not r.calls:
            _print("  No OpenAI API calls detected")
            continue

        _print(f"  {'Endpoint':<14} {'Model':<30} {'Input':>8} {'Output':>8} {'Total':>8}")
        _print(f"  {'─' * 68}")
        for c in r.calls:
            _print(f"  {c.endpoint:<14} {c.model:<30} {c.input_tokens:>8,} {c.output_tokens:>8,} {c.total_tokens:>8,}")

        _print(f"  {'─' * 68}")
        _print(f"  {'SUBTOTAL':<14} {'':<30} {r.total_input:>8,} {r.total_output:>8,} {r.total_tokens:>8,}")

    # Summary table
    _print(f"\n{'=' * 80}")
    _print("  SUMMARY")
    _print(f"{'=' * 80}")
    _print(f"\n  {'Solution':<40} {'API Calls':>10} {'Input':>10} {'Output':>10} {'Total':>10}")
    _print(f"  {'─' * 80}")

    grand_input = 0
    grand_output = 0
    grand_total = 0
    grand_calls = 0

    for r in results:
        if r.error:
            _print(f"  {r.name:<40} {'FAILED':>10} {'':>10} {'':>10} {'':>10}")
            continue
        _print(f"  {r.name:<40} {r.num_api_calls:>10} {r.total_input:>10,} {r.total_output:>10,} {r.total_tokens:>10,}")
        grand_input += r.total_input
        grand_output += r.total_output
        grand_total += r.total_tokens
        grand_calls += r.num_api_calls

    _print(f"  {'─' * 80}")
    _print(f"  {'TOTAL PER PARTICIPANT':<40} {grand_calls:>10} {grand_input:>10,} {grand_output:>10,} {grand_total:>10,}")

    # Cost estimates
    _print(f"\n{'=' * 80}")
    _print("  COST ESTIMATE (approximate)")
    _print(f"{'=' * 80}")

    chat_input = sum(r.chat_input for r in results if not r.error)
    chat_output = sum(r.chat_output for r in results if not r.error)
    embed_tokens = sum(r.embedding_tokens for r in results if not r.error)

    # Pricing per 1M tokens (input / output)
    # OpenAI: https://openai.com/api/pricing/
    # Azure:  https://azure.microsoft.com/pricing/details/cognitive-services/openai-service/
    embed_price_openai = 0.02   # text-embedding-3-small per 1M tokens (OpenAI)
    embed_price_azure = 0.02    # text-embedding-3-small per 1M tokens (Azure)

    openai_pricing = [
        ("GPT-5 Mini (OpenAI)",  0.25,  2.00, embed_price_openai),
    ]
    azure_pricing = [
        ("GPT-5 Mini (Azure)",  0.25,  2.00, embed_price_azure),
    ]

    all_pricing = openai_pricing + azure_pricing

    _print(f"\n  Chat tokens:      {chat_input + chat_output:>10,}  (input: {chat_input:,}, output: {chat_output:,})")
    _print(f"  Embedding tokens: {embed_tokens:>10,}")
    _print(f"  Total tokens:     {grand_total:>10,}")

    _print(f"\n  {'Model':<26} {'Input $/1M':>12} {'Output $/1M':>12} {'Cost/Participant':>18}")
    _print(f"  {'─' * 68}")
    costs = {}
    for model_name, in_price, out_price, emb_price in all_pricing:
        cost = (chat_input * in_price + chat_output * out_price + embed_tokens * emb_price) / 1_000_000
        costs[model_name] = cost
        _print(f"  {model_name:<26} ${in_price:>10.2f} ${out_price:>10.2f} ${cost:>16.4f}")

    # Flag high-usage solutions
    _print(f"\n{'=' * 80}")
    _print("  HIGH USAGE SOLUTIONS (> 20% of total)")
    _print(f"{'=' * 80}")
    threshold = grand_total * 0.20 if grand_total > 0 else float("inf")
    flagged = False
    for r in sorted(results, key=lambda x: x.total_tokens, reverse=True):
        if r.error or r.total_tokens == 0:
            continue
        pct = (r.total_tokens / grand_total * 100) if grand_total > 0 else 0
        if r.total_tokens >= threshold:
            flagged = True
            _print(f"  ⚠  {r.name:<40} {r.total_tokens:>8,} tokens ({pct:.1f}%)")
            for c in sorted(r.calls, key=lambda x: x.total_tokens, reverse=True)[:3]:
                _print(f"       └─ {c.endpoint} ({c.model}): {c.total_tokens:,} tokens")

    if not flagged:
        _print("  None — token usage is well distributed across solutions.")

    # Workshop planning
    _print(f"\n{'=' * 80}")
    _print("  WORKSHOP PLANNING")
    _print(f"{'=' * 80}")
    for num_participants in [10, 25, 50, 100]:
        _print(f"\n  {num_participants} participants ({grand_total * num_participants:,} tokens):")
        for model_name, cost in costs.items():
            _print(f"    {model_name:<26} ${cost * num_participants:>8.2f}")

    _print()


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main():
    import argparse

    parser = argparse.ArgumentParser(description="Workshop token usage report")
    parser.add_argument("--json", action="store_true", help="JSON output")
    parser.add_argument(
        "--log",
        metavar="DIR",
        help="Write per-solution logs and report to DIR",
    )
    args = parser.parse_args()

    repo_dir = Path(__file__).resolve().parent.parent
    solutions_dir = repo_dir / "genai-maf-context-providers" / "solutions"

    sys.path.insert(0, str(repo_dir / "genai-maf-context-providers"))
    sys.path.insert(0, str(solutions_dir))

    from dotenv import load_dotenv
    load_dotenv(override=True)

    # Set up log directory if requested.
    log_dir = None
    if args.log:
        log_dir = Path(args.log)
        log_dir.mkdir(parents=True, exist_ok=True)
        print(f"Logging solution output to: {log_dir}", file=sys.stderr)

    # Install hooks before importing any solution code.
    _install_chat_response_hook()
    _install_embeddings_hook()

    results = []
    for script_name, description in SOLUTIONS:
        usage = run_solution(script_name, description, solutions_dir, log_dir=log_dir)
        results.append(usage)

    # Write report to stdout.  When --log is active, also write a copy
    # to the log directory (report.txt for text, report.json for JSON).
    if log_dir:
        report_buf = io.StringIO()
        output_stream = _TeeWriter(sys.stdout, report_buf)
        ext = "json" if args.json else "txt"
        print_report(results, output_json=args.json, file=output_stream)
        (log_dir / f"report.{ext}").write_text(report_buf.getvalue())
        print(f"\nReport and logs written to: {log_dir}/", file=sys.stderr)
    else:
        print_report(results, output_json=args.json)


if __name__ == "__main__":
    main()
