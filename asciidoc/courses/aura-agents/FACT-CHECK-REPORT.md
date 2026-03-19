# Fact-Check Report: Aura Agents Course

**Documentation consulted:** [Aura Agent](https://neo4j.com/docs/aura/aura-agent/), [Tool authentication with Aura user](https://neo4j.com/docs/aura/security/tool-auth/)

**Lessons reviewed:** All 11 lesson files in aura-agents (1-agents-overview, 2-create-with-ai, 1-cypher-template, 2-create-your-own-cypher-tool, 3-text2cypher, 4-text2cypher-challenge, 5-bp-create-from-scratch, 6-create-from-scratch, 1-publishing-agent, 2-connect-mcp, 3-next-steps) and related quiz/summary content.

---

## 1. Accurate (confirmed by documentation)

| Claim | Location | Doc source |
|-------|----------|------------|
| Aura Agent is a no/low-code platform for building agents contextualized by your knowledge graph in AuraDB | 1-agents-overview | "Aura Agent is a no/low-code agent platform that allows you to build, test, and deploy GraphRAG agents contextualized by your own knowledge graph in AuraDB." |
| Three tools: Cypher Template, Text2Cypher, Similarity Search | 1-agents-overview, 5-bp | "Aura Agent has three tools available: Cypher Template, Similarity Search, Text2Cypher." |
| Agent only supports read-only queries against the database | 1-agents-overview, quiz 4-tool-types | "Keep in mind that currently the agent only supports read only queries against the database." |
| Only project admins can create, edit, or delete agents | 1-agents-overview, 1-publishing-agent, quiz | "A saved agent can then be used internally... but only project admins can create, edit, or delete agents." |
| Internal agents free; external agents incur charges | 1-publishing-agent | "Internal agents are free to use, but once you make an agent external, it incurs charges per Neo4j pricing." |
| External: REST API and MCP server endpoints | 1-publishing-agent | "make it available externally via either an Aura API endpoint or an MCP server endpoint" |
| Make agent external and enable MCP server before saving | 1-publishing-agent, 2-connect-mcp | "make it external and enable MCP server before saving it" |
| Cypher Template: pre-defined parameterized Cypher; best for common/repeated questions, predictable results, complex queries | 1-cypher-template, 5-bp | "executes pre-defined, parameterized Cypher queries... best for: Common and repeated questions, Predictable results, Complex queries, Well-defined business logic patterns" |
| Text2Cypher: natural language to Cypher at runtime; adds database schema and system prompt; best for unpredictable questions, structural queries/aggregations | 3-text2cypher, 5-bp | "transforms natural language questions into Cypher queries... takes the question, adds the database schema and the Text2Cypher system prompt... best for: Questions that can't be predicted in advance, Structural queries like aggregations" |
| Text2Cypher instructions: when to use (and when not), database/domain aspects, relevant entities, attributes for aggregation | 5-bp, 2-tool-description quiz | "The instructions should include: When to use the Text2Cypher tool (and when not), Specific aspects about your database and domain, Relevant entities..., Which attributes are suitable for aggregation" |
| Text2Cypher can produce errors; use caution in production | 3-text2cypher NOTE | "The Text2Cypher tool relies on an LLM and this can potentially result in queries that contain inconsistencies or logical errors. Therefore, use caution when deploying Text2Cypher in production." |
| Best practice: use Text2Cypher only when no other tool applies | 5-bp | "this tool should only be used when none of the other tools meet your needs, so make sure the description explicitly instructs the agent to use this tool only when no other option applies." |
| Similarity Search requires vector index and embeddings | 1-agents-overview, 4-tool-types | "the similarity search requires text embeddings and the presence of a vector index in your database" |
| Tool descriptions: better description = better performance; LLM selects from descriptions; change descriptions if wrong tool is used | 5-bp, 2-tool-description quiz | "The better the description, the better your agent will perform"; "consider changing the tool descriptions to make sure the right tool is used in the right situation" |
| Tool authentication required; enable from Security, organization level | 1-agents-overview (current) | "Additionally, you need to enable Tool authentication for the project in which you create the agent. This is done from Security on the organization level." |

---

## 2. Resolved clarification

| Claim | Location | Resolution |
|-------|----------|------------|
| **Generative AI assistance / Aura Agent** | 1-agents-overview | Lesson and image caption aligned with the docs: both toggles are in **organization settings**; Aura Agent can be toggled on and off when Generative AI assistance is enabled. The 2-create-with-ai prerequisite was updated to reference organization settings only. |

---

## 3. Unverified (consistent with docs but not quoted)

| Content | Location | Note |
|---------|----------|------|
| Chain-of-thought / multi-step reasoning (interpret → execute tools → generate response) | 1-agents-overview | Docs describe testing and "how it reasons," "which tool(s) it used," and iterating until the agent has "collected enough information to return an answer." The three-step breakdown is a clear interpretation. |
| "Agent decides which tools to run; tools only return data" | 1-agents-overview, 2-agent-workflow quiz | Implied by docs (tools execute and return results; agent uses them to respond). Not stated verbatim. |
| Viewer and Member can list and invoke; Project Admin can create/update/delete | 1-publishing-agent table | Docs: "only project admins can create, edit, or delete agents." That Viewers/Members can list and invoke is implied by "share it internally with other members." |

---

## 4. Incorrect

None. No course statements contradict the documentation.

---

## 5. Best-practice / threshold framing

- **Docs** recommend limiting Cypher Template results to "10-50 rows" for relevance. The course does **not** cite this range, so no change needed. If you add it later, frame as a guideline (e.g. "As a general guideline, limit results to 10-50 rows") per the fact-check rule.

---

## 6. Edits already in place

- **1-agents-overview:** Sentence added under "Getting access to Aura Agents": if the agent cannot connect to the instance, check that **Tool authentication** is enabled for the project (Security, organization level), with link to Aura Agent documentation. This matches the documented prerequisite.

---

## 7. Summary

- **Accurate:** No/low-code platform, three read-only tools, project-admin-only create/edit/delete, Internal free / External charged, REST + MCP, Cypher Template vs Text2Cypher use cases and descriptions, Text2Cypher production caution, Similarity Search requirements, tool descriptions matter, Tool authentication prerequisite.
- **Clarify:** Where Aura Agent is enabled (Organization vs Project) to match docs and current UI.
- **Unverified:** Wording such as "chain-of-thought" and "tools only return data" is consistent with docs but not quoted.
- **Doc sources:** https://neo4j.com/docs/aura/aura-agent/ , https://neo4j.com/docs/aura/security/tool-auth/
