---
name: review-lesson-facts
description: Fact-check a single lesson against Neo4j documentation using the neo4j-docs MCP. Fixes inaccurate claims inline and appends a WHY report.
allowed-tools: Read, Edit, Grep, WebSearch, WebFetch, mcp_neo4j-docs_read_page, mcp_neo4j-docs_list_manual_pages
---

# Review: Fact Checking

**Purpose:** Verify technical claims in a single `lesson.adoc` against official Neo4j documentation. Fixes confirmed inaccuracies inline; flags unverified claims; softens best-practice recommendations that are not in official docs.

**When to use:** Stage 4 of the course review pipeline. Run after grammar, structure, and technical formatting reviews.

**Input:** Path to a lesson folder (e.g. `asciidoc/courses/my-course/modules/1-intro/lessons/1-overview/`)

**Output:**
- `lesson.adoc` — fixed in place where claims are confirmed wrong
- `REVIEW-REPORT.md` in the lesson folder — created or appended with a fact-check section

---

## Overview

This review:

1. **Identifies verifiable claims** — metric names, feature availability, API syntax, version numbers, thresholds
2. **Verifies via neo4j-docs MCP** — reads relevant documentation pages
3. **Categorises findings** — Accurate / Needs clarification / Unverified / Incorrect
4. **Fixes confirmed errors** — changes text that contradicts documentation
5. **Softens unverified recommendations** — adds qualifying language where claims are not in docs

---

## Third-party library courses

When fact-checking a lesson about a third-party library (not Neo4j core), the neo4j-docs MCP does not cover it. Use `WebSearch` and `WebFetch` instead to build a live API baseline before Phase 1.

**For `neo4j-agent-memory`:**

1. Search for the library: `WebSearch "neo4j-agent-memory python library site:github.com OR site:pypi.org"`
2. Fetch the PyPI page and GitHub README to get the current public API surface, configuration objects, and graph schema
3. Key facts to establish before reviewing any lesson:
   - How many and which configuration objects are required (`MemorySettings`, `Neo4jConfig`, `EmbeddingConfig` — all three)
   - The correct relationship name between `Message` and `Entity` nodes (direction and type)
   - Which classes and functions are exported at the top-level vs sub-modules
   - Whether any `deps` argument is required when calling `agent.run()` with `create_memory_tools()`
   - What fields the `get_context()` return object exposes

Do not rely on what the lesson says the library does — fetch the authoritative source first, then compare.

---

## Phase 1: Read and Extract Claims

Read `lesson.adoc` in full. Build a list of technical claims to verify:

**Types of claims to extract:**

- Specific metric names (e.g. `neo4j.dbms.page.cache.hits`)
- Feature availability (e.g. "available in Aura Professional and above")
- Version-specific behaviour (e.g. "introduced in Neo4j 5.0")
- API syntax (e.g. procedure names, parameter names, return columns)
- Performance thresholds (e.g. "cache hit rate should be above 98%")
- Configuration values (e.g. default settings, limits)
- Official recommendations (e.g. "Neo4j recommends setting X to Y")
- Cypher syntax or clause behaviour

---

## Phase 2: Determine Relevant Documentation

### Neo4j core docs — use the `neo4j-docs` MCP

The project includes a local MCP server (`neo4j-docs`) that fetches and caches neo4j.com documentation. Use it for all Neo4j core claims:

- **Find pages in a manual:** `mcp_neo4j-docs_list_manual_pages(manual_name)` — returns a list of URLs in that manual's sitemap
- **Read a page:** `mcp_neo4j-docs_read_page(url)` — fetches and strips the page to plain text

Available manuals (pass the exact string to `list_manual_pages`):

| Manual name | Content |
|-------------|---------|
| `aura` | Aura cloud service — metrics, tiers, console, performance |
| `operations-manual` | Self-managed Neo4j — config, monitoring, metrics, clustering |
| `cypher-manual` | Cypher language reference — clauses, functions, syntax |
| `graph-data-science` | GDS library — algorithms, procedures, syntax |
| `java-reference` | Java API, JVM settings |
| `cdc` | Change Data Capture |

If you already know the URL, call `read_page` directly rather than listing the sitemap first.

### Third-party libraries — use WebSearch + WebFetch

The `neo4j-docs` MCP only covers neo4j.com. For third-party libraries, fetch their PyPI page or GitHub README via `WebSearch` + `WebFetch` before starting (see "Third-party library courses" section above).

---

## Phase 3: Verify Each Claim

For each claim, use `mcp_neo4j-docs_read_page` to read the relevant documentation page.

Categorise each finding:

| Symbol | Meaning |
|--------|---------|
| ✅ Accurate | Directly confirmed by documentation |
| ⚠️ Needs clarification | Correct but could be more precise |
| ❓ Unverified | Not found in docs — may be a best practice |
| ❌ Incorrect | Contradicts documentation |

---

## Phase 4: Fix Confirmed Errors

For claims categorised as **❌ Incorrect**, update the lesson text to match the documentation.

**Examples:**

- Wrong metric name → correct name from docs
- Wrong API syntax → correct from Cypher manual or procedure reference
- Incorrect version availability → update to reflect actual release version
- Wrong default value → update to documented default

---

## Phase 5: Soften Unverified Recommendations

For claims categorised as **❓ Unverified** that contain specific thresholds or recommendations not found in official docs, add qualifying language to make it clear these are guidelines, not official requirements.

### Transformation examples

**Thresholds presented as absolute rules:**

❌ `Failed queries should be less than 1% of total queries.`
✅ `As a general guideline, failed queries should be low, typically less than 1% of total queries. The right threshold depends on your application requirements.`

**Specific numbers without qualification:**

❌ `A cache hit rate below 98% indicates a problem.`
✅ `A cache hit rate below 98%, for example, may indicate that more memory is needed. The appropriate threshold varies by workload.`

**Imperative recommendations without source:**

❌ `Always set the page cache to 50% of available RAM.`
✅ `A common starting point is to set the page cache to around 50% of available RAM. Tune this value based on your workload and data size.`

### Qualifying phrases to use

- "As a general guideline..."
- "A common starting point is..."
- "For example..."
- "The appropriate value depends on your specific use case..."
- "These thresholds will vary depending on..."

**Do not** use parentheses for examples — use commas instead.

---

## Phase 6: Handle Cypher Syntax

For any Cypher code blocks in the lesson, verify:

1. **Clause names** are valid (MATCH, CREATE, MERGE, RETURN, WITH, WHERE, etc.)
2. **Function names** are correct and current (use `cypher-manual` to verify)
3. **Procedure calls** use the correct namespace and parameters (especially GDS procedures, which graduate from beta)
4. **Deprecated syntax** is flagged (e.g. `OPTIONAL MATCH` for counting — use `COUNT {}` subqueries instead)

For GDS procedures, always check whether they have graduated from alpha/beta:

```
mcp_neo4j-docs_list_manual_pages("graph-data-science")
```

---

## Phase 7: Write the Report

After reviewing, create or append `REVIEW-REPORT.md` in the lesson folder.

```markdown
## Fact Check Review — YYYY-MM-DD

**Status:** ✅ Complete / ⚠️ Issues remain

### Claims Verified

| Claim | Status | Source |
|-------|--------|--------|
| Cache hit rate metric name `neo4j.page_cache.hits` | ✅ Accurate | operations-manual/monitoring/metrics/reference |
| "Available in all Aura tiers" | ⚠️ Needs clarification | Aura Free has limited metrics — updated to "Aura Professional and above" |
| Threshold "above 98%" for cache hits | ❓ Unverified | Not in docs — qualified with "as a general guideline" |
| Procedure name `gds.beta.kmeans` | ❌ Incorrect | Graduated to `gds.kmeans` in GDS 2.3 — fixed |

### Changes Made

- **Procedure name**: `gds.beta.kmeans` → `gds.kmeans` — _Procedure graduated from beta in GDS 2.3 per graph-data-science docs_
- **Availability**: "available in all Aura tiers" → "available in Aura Professional and above" — _Aura Free has limited monitoring capabilities_
- **Threshold language**: Added "As a general guideline..." before 98% cache hit recommendation — _Threshold not found in official docs; framed as guidance not rule_

### Issues Requiring Manual Review

- [ ] Claim "default page cache is 512MB" — _Not verified against current docs; check operations-manual for current default_
- [ ] Code example uses deprecated `OPTIONAL MATCH` for counting — _Consider updating to COUNT {} subquery per neo4j-cypher best practices_
```

---

## References

- `.cursor/rules/fact-check-lessons.mdc` — fact-check process, categories, handling recommendations
- Neo4j docs MCP tools: `mcp_neo4j-docs_read_page`, `mcp_neo4j-docs_list_manual_pages`
- For third-party libraries: use `WebSearch` + `WebFetch` to fetch PyPI and GitHub docs before reviewing
