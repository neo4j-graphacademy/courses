---
name: review-lesson-facts
description: Fact-check a single lesson against Neo4j documentation using the neo4j-docs MCP. Fixes inaccurate claims inline and appends a WHY report.
allowed-tools: Read, Edit, Grep, mcp_neo4j-docs_read_page, mcp_neo4j-docs_list_manual_pages, mcp_neo4j-docs_read_course
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

Map each claim to the appropriate manual. Use `mcp_neo4j-docs_list_manual_pages` to find relevant pages.

**Available manuals:**

| Manual               | Content                                                      |
| -------------------- | ------------------------------------------------------------ |
| `aura`               | Aura cloud service — metrics, tiers, console, performance    |
| `operations-manual`  | Self-managed Neo4j — config, monitoring, metrics, clustering |
| `cypher-manual`      | Cypher language reference — clauses, functions, syntax       |
| `graph-data-science` | GDS library — algorithms, procedures, syntax                 |
| `java-reference`     | Java API, JVM settings                                       |
| `cdc`                | Change Data Capture                                          |

**Key documentation URLs to check directly:**

- Aura metrics view: `https://neo4j.com/docs/aura/metrics/view-metrics/`
- Aura metrics reference: `https://neo4j.com/docs/aura/metrics/metrics-integration/reference/`
- Self-managed essential metrics: `https://neo4j.com/docs/operations-manual/current/monitoring/metrics/essential/`
- Self-managed metrics reference: `https://neo4j.com/docs/operations-manual/current/monitoring/metrics/reference/`
- Cypher manual (current): `https://neo4j.com/docs/cypher-manual/current/`

---

## Phase 3: Verify Each Claim

For each claim, use `mcp_neo4j-docs_read_page` to read the relevant documentation page.

Categorise each finding:

| Symbol                 | Meaning                                    |
| ---------------------- | ------------------------------------------ |
| ✅ Accurate            | Directly confirmed by documentation        |
| ⚠️ Needs clarification | Correct but could be more precise          |
| ❓ Unverified          | Not found in docs — may be a best practice |
| ❌ Incorrect           | Contradicts documentation                  |

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

| Claim                                              | Status                 | Source                                                                   |
| -------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------ |
| Cache hit rate metric name `neo4j.page_cache.hits` | ✅ Accurate            | operations-manual/monitoring/metrics/reference                           |
| "Available in all Aura tiers"                      | ⚠️ Needs clarification | Aura Free has limited metrics — updated to "Aura Professional and above" |
| Threshold "above 98%" for cache hits               | ❓ Unverified          | Not in docs — qualified with "as a general guideline"                    |
| Procedure name `gds.beta.kmeans`                   | ❌ Incorrect           | Graduated to `gds.kmeans` in GDS 2.3 — fixed                             |

### Changes Made

- **Procedure name**: `gds.beta.kmeans` → `gds.kmeans` — _Procedure graduated from beta in GDS 2.3 per graph-data-science docs_
- **Availability**: "available in all Aura tiers" → "available in Aura Professional and above" — _Aura Free has limited monitoring capabilities_
- **Threshold language**: Added "As a general guideline..." before 98% cache hit recommendation — _Threshold not found in official docs; framed as guidance not rule_

### Issues Requiring Manual Review

- [ ] Claim "default page cache is 512MB" — _Not verified against current docs; check operations-manual for current default_
- [ ] Code example uses deprecated `OPTIONAL MATCH` for counting — _Consider updating to COUNT {} subquery per neo4j-cypher best practices_
```

---

## Aura Agent — platform-specific facts to verify

### Text2Cypher tool description — schema is auto-supplied

The Text2Cypher tool automatically receives the full database schema on every invocation. Lessons must **not** instruct learners to manually list all node labels and relationship types in the tool description.

❌ `List the relevant node labels and relationship types. For Northwind: Customer, Order, Product connected by PLACED, CONTAINS...`
✅ `Add context the schema does not provide: the shape of identifiers (for example, "Customer IDs are uppercase codes like ALFKI"), which categorical properties are useful for filtering, and which numeric properties are suitable for aggregation.`

Repeating the schema in the description adds noise and creates maintenance burden as the schema evolves. The agent already has it.

### Do not advise adding schema hints to fix Cypher generation errors

The platform has built-in retry logic for hallucinated labels and relationship types. Do not advise learners to fix Text2Cypher errors by adding node labels or relationship types to the tool description.

❌ `If the Text2Cypher tool produces Cypher with incorrect relationship types or node labels, try adding the correct nodes and relationship types to the tool description.`
✅ Guide learners to inspect the reasoning panel, verify domain context (identifier shapes, aggregation fields), and trust the platform's retry mechanism for schema-level errors.

---

## References

- `.cursor/rules/fact-check-lessons.mdc` — fact-check process, categories, handling recommendations
- Neo4j docs MCP tools: `mcp_neo4j-docs_read_page`, `mcp_neo4j-docs_list_manual_pages`
- For third-party libraries: use `WebSearch` + `WebFetch` to fetch PyPI and GitHub docs before reviewing
