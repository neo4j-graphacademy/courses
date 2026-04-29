---
name: deprecated-cypher
description: Identify deprecated Cypher syntax in code files.
---

# Identify Deprecated Cypher Syntax

**Purpose:** To scan code files for deprecated Cypher syntax and suggest replacements. It can be used to find issues and update codebases to be compatible with newer versions of Neo4j. It does not make changes to the code directly but provides suggestions for updates.

**When to use:** Use this skill when you want to modernize your Cypher code or ensure compatibility with the latest Neo4j features.

## Overview

This skill scans through file to identify any deprecated Cypher clauses, functions, or syntax. It then provides suggestions for modern alternatives based on the latest Neo4j documentation.

Process:

1. Identify current deprecations, additions, removal, and compatibility issues in Neo4j documentation
2. Scan files for any deprecated Cypher syntax
3. Provide suggestions for replacements based on the latest documentation

## Step 1: Identify Current Deprecations and Additions

Scan the following resources to identify any deprecated Cypher syntax and their modern alternatives:

* Cypher 25 - https://neo4j.com/docs/cypher-manual/current/deprecations-additions-removals-compatibility/
* Cypher 5 https://neo4j.com/docs/cypher-manual/5/deprecations-additions-removals-compatibility/
* GenAI plugin - https://neo4j.com/docs/genai/plugin/current/reference/changelog
* APOC plugin - https://neo4j.com/docs/apoc/current/deprecations-and-additions/

## Step 2: Scan Files for Deprecated Syntax

Scan through the current repository for any instances of deprecated Cypher syntax. This can be done using regular expressions or by leveraging existing code analysis tools.

## Step 3: Provide Suggestions for Replacements

For each instance of deprecated syntax found, provide a suggestion for the modern alternative based on the latest Neo4j documentation. 

Provide the file path, line number, the complete query that uses the deprecated syntax along with the suggested replacement.

Do not change any code directly.

### Example

1. /path/to/file:line - Deprecated syntax: `genai.vector.encode` and `db.index.vector.queryNodes`

**Deprecated functions:**

- `genai.vector.encode` was deprecated in 2025.11 and superseded by `ai.text.embed` see documentation for more information: https://neo4j.com/docs/genai/plugin/current/embeddings/
- `db.index.vector.queryNodes` as Neo4j 2026.01, the preferred way of querying vector indexes is by using the Cypher SEARCH clause - https://neo4j.com/docs/cypher-manual/current/clauses/search/


Original query:

```cypher
WITH genai.vector.encode(
    "A mysterious spaceship lands Earth",
    "OpenAI",
    { token: "sk-..." }) AS myMoviePlot

CALL db.index.vector.queryNodes('moviePlots', 6, myMoviePlot)
YIELD node, score

RETURN node.title, node.plot, score
```

Suggested replacement:

```cypher
WITH ai.text.embed(
  "A mysterious spaceship lands Earth",
  "OpenAI",
  { token: "sk-...", model: "text-embedding-ada-002" }
) AS myMoviePlot

MATCH (node:Movie)
SEARCH node IN (
  VECTOR INDEX moviePlots
  FOR myMoviePlot
  LIMIT 6
) SCORE AS score

RETURN node.title, node.plot, score
```