---
name: review-lesson-grammar
description: Review a single lesson for US English grammar, style, voice, and Neo4j terminology. Fixes issues inline and appends a WHY report.
allowed-tools: Read, Edit, Glob, Grep
---

# Review: Grammar, Style & Terminology

**Purpose:** Fix US English grammar, writing style, voice, and Neo4j-specific terminology in a single `lesson.adoc` file. Every change is recorded with a reason.

**When to use:** Stage 1 of the course review pipeline. Run this before structure or technical reviews so later stages work on clean prose.

---

## Critical context: this is a spoken video script

Lesson content is read aloud by an instructor on camera. Every sentence must sound natural when spoken. This is the most important constraint in the review — it overrides purely academic writing rules.

Write for the ear, not the eye:

- **Sentences must flow when read aloud.** If a sentence would cause a presenter to stumble, hesitate, or take an awkward breath, rewrite it.
- **No abbreviations or symbols that cannot be spoken.** `via`, `vs.`, `etc.`, `e.g.`, `i.e.` — all must be written out (see Phase 4).
- **Prefer short, clear sentences over long compound ones.** A presenter needs natural pause points.
- **Avoid dense noun stacks.** `knowledge graph data retrieval tool invocation` is unreadable aloud; break it up.
- **Lists read as sequences, not prose.** A bullet list in the lesson becomes a spoken list. Make sure each item is parallel in structure so it sounds consistent when read one after another.
- **No ambiguous "it", "this", or "they".** Every pronoun must have an unambiguous antecedent. If the referent is not the immediately preceding noun, replace the pronoun with the noun. When spoken, the listener cannot reread the sentence to resolve ambiguity.
- **State transitions are paragraphs, not bullets.** When content describes what happens as a user moves through states (default → configured, internal → external, free → paid), write it as prose paragraphs in journey order, not a bullet list. Each paragraph covers one state: what it is, what it enables, and any constraints. Bullets are for parallel, independent items — not for a sequence with cause and effect.
- **List items must be consistent in mode — descriptive or instructional, not both.** If a bullet item describes what something is, all sentences in that item must stay descriptive. Do not switch to an imperative mid-item. `**Internal** is the default and is free. Create, add tools...` mixes modes; `**Internal** is the default and is free. It lets you create, add tools...` stays descriptive throughout.
- **No parenthetical annotations in list items.** `**Internal** (default, free):` cannot be spoken naturally. The bold term must be the grammatical subject of a sentence: `**Internal** is the default and is free.` Weave metadata (pricing, defaults, constraints) into the sentence rather than bracketing it.
- **Numbers and symbols must be speakable.** Write `REST API or MCP server` not `REST/MCP`; write `one or two` not `1-2`.
- **Every sentence must be semantically correct.** Before keeping a sentence, ask: is this actually true? A hedging word like `primarily` often signals that a claim is imprecise rather than fixing it. If a sentence is only approximately true, rewrite it to say precisely what is true.
- **After any edit, re-read every affected sentence in isolation.** A clause that made sense as part of a compound sentence may be meaningless or empty on its own. When a semicolon is split or a sentence is shortened, check that each resulting sentence carries its own weight. If it does not, absorb it into surrounding prose or remove it.

When in doubt, read the sentence out loud. If it sounds unnatural or doesn't make complete sense on its own, fix it.

**Input:** Path to a lesson folder (e.g. `asciidoc/courses/my-course/modules/1-intro/lessons/1-overview/`)

**Output:**

- `lesson.adoc` — fixed in place
- `REVIEW-REPORT.md` in the lesson folder — created or appended with a grammar section

---

## Overview

This review checks and fixes:

1. **US English spelling** — colour → color, behaviour → behavior, etc.
2. **Grammar** — subject-verb agreement, tense consistency, pronoun agreement
3. **Voice** — "you will" not "we will", direct instructions not passive
4. **Tone** — no marketing language, no AI artifacts, no filler phrases
5. **Redundancy** — no repeated information, no sentences that add nothing to learning
6. **Neo4j terminology** — correct product names, acronyms defined on first use
7. **Header case** — level-2+ headers in sentence case
8. **Admonition titles** — every admonition block must have a title

---

## Phase 1: Read the Lesson

- Read `lesson.adoc` in full before making any changes
- Note the lesson type (`:type:` attribute) and topic area
- Read any referenced prior lessons if needed to judge voice consistency
- Map the topics covered and check that every distinct topic has a header. A paragraph that starts a new subject without a header is a missing section break.

---

## Phase 2: US English Spelling

Scan for and correct British/non-US spellings:

| British         | US English |
| --------------- | ---------- |
| colour          | color      |
| behaviour       | behavior   |
| analyse/analyse | analyze    |
| optimise        | optimize   |
| centre          | center     |
| realise         | realize    |
| honour          | honor      |
| neighbour       | neighbor   |
| programme       | program    |
| focussed        | focused    |
| travelling      | traveling  |
| modelling       | modeling   |
| labelling       | labeling   |

Fix each occurrence directly in the file.

---

## Phase 3: Grammar

### Tense consistency

Lessons should use **present tense** for descriptions of what the learner is doing now, and **future tense** for what they will do next. Check that tense does not shift unexpectedly within a paragraph.

❌ `In the previous lesson, you learn about MATCH.`
✅ `In the previous lesson, you learned about MATCH.`

### Subject-verb agreement

❌ `The data are stored in a CSV.`
✅ `The data is stored in a CSV.`

### Pronoun agreement

❌ `Each customer has their own orders.`
✅ `Each customer has its own orders.`
✅ `Customers have their own orders.` (restructuring to plural is acceptable)

---

## Phase 4: Voice and Tone

### "You" not "we"

Replace all first-person plural with second person. Never use "we", "we'll", "we use", "let's", or similar.

| Replace                        | With                                  |
| ------------------------------ | ------------------------------------- |
| `We'll walk you through...`    | `This lesson walks you through...`    |
| `We use the same dataset...`   | `The course uses the same dataset...` |
| `Let's look at...`             | `Look at...` or `You will see...`     |
| `In this module we look at...` | `In this module you will look at...`  |

### Direct instructions

Replace optional/passive phrasing with direct instructions:

| Replace                                | With                           |
| -------------------------------------- | ------------------------------ |
| `You can create a node...`             | `Create a node...`             |
| `If you want to change the styling...` | `To change the styling...`     |
| `It is possible to...`                 | Direct statement of the action |

### No bold labels at the start of sentences

Bold is for inline emphasis on a term within a sentence — not for labelling a paragraph or section. A sentence must never open with a bold word used as a label.

❌ `**Location**: All Aura Agents run in Belgium...`
❌ `**Visibility** controls who can access your agent.`

Convert bold labels to:

- A proper header (`==` or `===`) if the content warrants its own section
- A NOTE or TIP admonition with a title if the content is supplementary reference information
- A plain sentence with the concept woven in naturally: `Your agent's visibility controls who can access it.`

This applies equally to bold labels in bullet list items (`* **Term**: definition...`). Definition-style lists should use AsciiDoc definition list syntax or be rewritten as prose.

### No marketing language

Remove or replace these terms entirely:

- powerful → omit or describe the actual capability
- amazing, incredible, revolutionary → omit
- seamlessly → omit or say "integrates with"
- with confidence → omit
- core feature → "feature" or name it specifically
- state-of-the-art → omit

### No AI artifacts

These phrases mark AI-generated text and should be removed or rewritten:

- "comprehensive understanding" → "understanding"
- "delve into" → "look at" or "explore"
- "it's worth noting that" → omit the preamble
- "moreover", "furthermore", "additionally" (at the start of sentences) → "Also," or restructure
- "in the realm of" → omit
- "harness the power of" → omit

### Prefer precise words over informal alternatives

Informal and colloquial words weaken instructional credibility and sound unprofessional when spoken aloud.

**Vague or colloquial verbs**

| Replace               | With                                                             |
| --------------------- | ---------------------------------------------------------------- |
| `get` / `grab`        | `retrieve`, `obtain`, `receive`, or `fetch` depending on context |
| `put`                 | `place`, `insert`, or `store`                                    |
| `spin up`             | `create`, `start`, or `launch`                                   |
| `check out`           | `see`, `review`, or `examine`                                    |
| `hook up` / `plug in` | `connect` or `integrate`                                         |
| `work with`           | `use` or `interact with`                                         |
| `deal with`           | `handle` or `process`                                            |
| `figure out`          | `determine` or `identify`                                        |
| `come up with`        | `create`, `generate`, or `produce`                               |
| `end up`              | rewrite to state the result directly                             |
| `make sure`                   | `ensure`                                                         |
| `the right X`                 | `the correct X`                                                  |
| `like X, Y` (giving examples) | `such as X, Y` or `for example, X and Y`                        |

**Minimising and filler words — remove entirely**

| Word                            | Why                                                                                         |
| ------------------------------- | ------------------------------------------------------------------------------------------- |
| `just`                          | Minimises the step; remove it                                                               |
| `simply`                        | Condescending; implies the learner should find it easy                                      |
| `basically`                     | Vague; say what you mean directly                                                           |
| `essentially`                   | Same as basically                                                                           |
| `quick` / `quickly`             | Subjective; omit or quantify                                                                |
| `easy` / `easily`               | Subjective; omit or explain why                                                             |
| `straightforward`               | Omit; show don't tell                                                                       |
| `go ahead`                      | Filler before an instruction; remove                                                        |
| `feel free to`                  | Omit; give the direct instruction                                                           |
| `kind of` / `sort of`           | Be precise; remove hedging                                                                  |
| `a bit`                         | Quantify or remove                                                                          |
| `pretty` (as in "pretty fast")  | Quantify or remove                                                                          |
| `quite`                         | Remove                                                                                      |
| `primarily`                     | Hedges a factual claim; rewrite to say precisely what is true                               |
| `largely` / `mainly` / `mostly` | Same as primarily — state the specific case or rewrite                                      |
| `generally`                     | Vague; state the specific rule, or use "in most cases" only when exceptions genuinely exist |
| `nice`                          | Omit; describe the specific benefit                                                         |
| `handy`                         | Replace with `useful` or describe why                                                       |

**Non-specific nouns — name the thing**

| Replace         | With                              |
| --------------- | --------------------------------- |
| `stuff`         | Name the specific items           |
| `things`        | Name the specific items           |
| `a lot of`      | `many` or a specific quantity     |
| `big` / `small` | Quantify or describe specifically |

### No filler phrases

| Replace                              | With                           |
| ------------------------------------ | ------------------------------ |
| `Think about...`                     | Provide the direct explanation |
| `Think of X as...`                   | `X is...` or `X acts as...`    |
| `to do this,` (at start of sentence) | remove and state the action    |
| `it goes without saying`             | omit entirely                  |

### No abbreviations or Latin shorthand

Spell everything out. Abbreviations are informal and can break non-native readers.

| Replace      | With                                                                                                                                |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `via`        | `through` or `using` (`exposed via API` → `exposed through the API`; `query via natural language` → `query using natural language`) |
| `vs` / `vs.` | `versus` or restructure as a comparison                                                                                             |
| `etc.`       | list the remaining items, or end with "and similar"                                                                                 |
| `e.g.`       | `for example`                                                                                                                       |
| `i.e.`       | `that is`                                                                                                                           |
| `w/`         | `with`                                                                                                                              |
| `w/o`        | `without`                                                                                                                           |

### No contractions

| Replace                 | With                     |
| ----------------------- | ------------------------ |
| `you'll`                | `you will`               |
| `it's` (instructional)  | `it is`                  |
| `don't` (instructional) | `do not`                 |
| `we've`, `we're`        | rewrite in second person |

---

## Phase 5: Redundancy and Content Value

Every sentence must earn its place. Read each paragraph and ask: does this sentence teach the learner something they do not already know from earlier in the lesson?

### Complete lead-in sentences before lists

A sentence that introduces a bullet list must be grammatically complete. A bare infinitive phrase ending in a colon is not complete.

❌ `To create an Aura Agent:`
✅ `To create an Aura Agent, you need:`

❌ `The agent supports:`
✅ `The agent supports the following tools:`

Check every colon that immediately precedes a list and verify the sentence before it stands on its own.

### Named items must state their type

When a sentence lists named things (tools, commands, nodes, properties, roles), the sentence must state what those things are. A quoted or bold name alone is ambiguous.

❌ `Consider an agent with "Get Customer", "Top Customers by Order Count", and Text2Cypher.`
✅ `Consider an agent with three tools: a "Get Customer" Cypher Template, a "Top Customers by Order Count" Cypher Template, and Text2Cypher.`

❌ `The graph contains Customer, Order, and Product.`
✅ `The graph contains three node labels: Customer, Order, and Product.`

Apply this whenever proper names, quoted strings, or code-formatted terms appear in a list without an explicit type noun.

### Named subsection items open with "A **Name** [type]..."

When parallel named items each have their own `===` subsection, the opening sentence of each subsection must identify the item as an instance of its category before describing what it does. Use the form "A **Name** [type noun] [verb phrase]."

❌
```asciidoc
=== Cypher Template

Runs predefined Cypher queries with parameters you define.
```

✅
```asciidoc
=== Cypher Template

A **Cypher Template** tool runs predefined Cypher queries with parameters you define.
```

This orients the reader to what category of thing is being described and reinforces the type noun, which helps when items have similar-sounding names.

### Content follows the user journey

When describing a feature with multiple states, modes, or options, present them in the order the learner encounters them — default or simplest first, advanced or optional second. This mirrors how a user actually works: they start in the default state, then progress when they need more.

❌ Describing External before Internal when Internal is the default starting point
✅ Internal (default, what you start with) → External (what you unlock when you need it)

The same principle applies to prerequisites, configuration steps, and pricing tiers: simple and free before advanced and paid.

### No prose paragraph that previews a list

A paragraph that summarises what a following bullet list will say is redundant. The list itself carries the information. Remove the prose and let the list lead-in sentence do the framing.

❌

```
When your agent is Internal, you can create and test it. When it is External, you get API endpoints.

* **Internal**: Create and test in the Console.
* **External**: Exposes API endpoints.
```

✅

```
Your agent has two visibility options:

* **Internal**: Create and test in the Console.
* **External**: Exposes API endpoints.
```

### No repeated information

If two sentences or clauses cover the same ground, keep the more specific one and remove or merge the other.

❌

```
It queries a knowledge graph stored in AuraDB and invokes the right tools to retrieve answers.

The agent interprets your question, finds relevant information in the graph, and invokes the appropriate tool: Similarity Search, Text2Cypher, or Cypher Template.
```

✅ Remove "and invokes the right tools to retrieve answers" from the first sentence — the second sentence says this more precisely.

### No sentences that add nothing

Remove sentences that:

- Restate the section heading in prose form ("In this section, you will learn about X")
- Say something is useful without explaining why ("This is a useful feature")
- Bridge between ideas without carrying meaning ("Now that you know X, you can learn Y")

❌ `This makes Neo4j well-suited for highly connected data.` (if the paragraph just explained exactly why)
✅ Delete it — the explanation already made the point.

### Concepts must be explained at first mention

Every concept, term, or product name that a learner may not already know must be explained — in one sentence if needed — at the point it first appears. Never use a term in a sentence and leave the learner to infer its meaning from context.

This includes tool names, component names, architectural terms, and product features.

❌ Listing "Cypher Template, Text2Cypher, and Similarity Search" as tool names in multiple places before ever explaining what any of them does
✅ At first mention: "Text2Cypher generates a Cypher query from a natural language question and executes it against your graph."

**How to check:** For every bold term, code-formatted name, or product feature introduced in the lesson, ask: has the lesson explained what this is before it appears in a sentence that depends on the learner understanding it? If not, add a one-sentence explanation at first mention or in the nearest preceding section.

A trace-through example, worked scenario, or lifecycle walkthrough must never be the first place a concept is explained. Those sections test understanding — they cannot simultaneously teach the concept for the first time.

### Introductory and summary sentences

The lesson-level intro and summary (first and last paragraphs) are intentionally repetitive by design — they frame and close the lesson. Do not remove them, but apply all voice, tone, semantic, and spoken-delivery checks to them. An intro sentence that is awkward, inaccurate, or empty must be fixed, not preserved. The protection is against removing the intro paragraph entirely — not against fixing the sentences within it.

---

## Phase 6: Neo4j terminology

### Product names — always exact

| Incorrect                  | Correct      |
| -------------------------- | ------------ |
| AuraDB free                | AuraDB Free  |
| on-premises, on-prem       | Self-Managed |
| integrated Query tool      | Query tool   |
| platform (for pricing)     | tier         |
| database (Aura deployment) | instance     |
| Aura console               | Aura Console |
| Aura Agents (product name) | Aura Agent   |
| Neo4j Aura Agents          | Aura Agent   |

**Aura Agent — singular product name, lowercase for instances**

The product is **Aura Agent** (singular). An individual agent you create is an **agent** (lowercase). Never write "Aura Agents" to refer to the product or platform. Use "agents" (lowercase, plural) only when referring to multiple agent instances.

✅ `Aura Agent lets you build retrieval systems...`
✅ `An Aura Agent uses three read-only tool types...`
✅ `The agents you create are listed under Data Services.`
❌ `Aura Agents let you build retrieval systems...`
❌ `Neo4j Aura Agents are useful when...`

**MCP client vs MCP host**

In Aura Agent content, call the consuming AI application an **MCP client** (e.g. Cursor, Claude Desktop). Do not use "MCP host" — the term is ambiguous in MCP architecture and was corrected by the product team.

✅ `MCP clients such as Cursor and Claude Desktop can connect to your agent.`
❌ `AI hosts such as Cursor can connect to your agent.`

### Tool names — always capitalised as shown

- Query tool
- Explore tool
- Import tool (or Data Importer)
- Dashboards tool

### Acronyms — define on first use

Acronyms must be written out in full on first occurrence, with the abbreviation in parentheses. After that, the acronym alone is acceptable.

❌ `Business Critical provides multi-AZ clusters.`
✅ `Business Critical provides multi-Availability Zone (AZ) clusters.`

**Exceptions — common acronyms that need no definition:**
API, UI, CSV, JSON, URL, HTTP/HTTPS, AWS, GCP, Azure, SQL, JVM

### No Big-O notation

Do not use O(1), O(n), O(k), O(n×m), "constant time", or "linear time" in course content.

❌ `Index lookup is O(1); traversal is O(k).`
✅ `Index lookups are fast because they avoid full scans. Traversals follow relationship pointers in memory, so cost scales with the connections you traverse, not the total data size.`

---

## Phase 7: Headers

### Every topic change needs a header

Each distinct topic must have its own header. A paragraph that opens a new subject without a header is a missing section break. When reading the lesson, ask: does this paragraph follow naturally from the one above, or does it start a different idea? If different, add a header.

❌ A prerequisites list followed immediately by a visibility explanation with no header between them
✅ `=== Visibility` header before the visibility paragraphs

Use `==` for major sections and `===` for sub-topics within a section.

### Sentence case

All level-2+ headers (`==`, `===`) must be in **sentence case** — only the first word and proper nouns are capitalised.

❌ `== Installing the Neo4j Driver` ← "Installing" is first word, "Neo4j Driver" is a proper noun — this is fine
❌ `== How To Use MATCH Queries` ← "To" and "Use" should be lowercase
✅ `== How to use MATCH queries`

Action-oriented headers use the gerund form:

❌ `== Node labels`
✅ `== Understanding node labels`

### No generic "why it matters" language in headers or sentences

Headers and sentences must describe what the thing _does_, not use generic phrases like "why it matters", "why this is important", or "the value of X". Those phrases are empty — they announce that something is important without saying what it does.

❌ `== Why it matters`
❌ `== Why this is important`
❌ `== The value of graph traversal`
❌ `This is why graph traversal matters.`

✅ `== How graph traversal follows pointer chains in memory`
✅ `Graph traversal scales with the number of connections, not the total data size.`

If a header says "why X matters", rewrite it to name the specific capability, behaviour, or outcome that X provides. The header earns its place by telling the learner something concrete, not by signalling that something is significant.

---

## Phase 8: Admonitions

### One admonition per section

Each section (`==` or `===`) must contain at most one admonition block. Two admonitions in the same section compete for the learner's attention and dilute both.

If a section contains two or more admonitions:

1. **Identify the most important one** — prefer `[WARNING]` over `[CAUTION]` over `[IMPORTANT]` over `[NOTE]` over `[TIP]`. Within the same type, prefer the one whose content is essential to avoiding an error or understanding the concept.
2. **Keep that admonition in place.**
3. **For the less important admonition**, choose the best option:
   - **Move it** to another section where it is more relevant — for example, a pricing note that appears in a prerequisites section might belong in a visibility or pricing section instead.
   - **Absorb it** into the body prose if the content can be expressed as a plain sentence without losing impact.
   - **Suggest removal** if the content is already covered by the prose or by the remaining admonition. Flag this in the report as a manual review item rather than deleting it silently.

❌

```asciidoc
== Prerequisites and pricing

[NOTE]
.Agent location
====
All agents run in Belgium.
====

[NOTE]
.AI models
====
Aura Agent uses curated AI models.
====
```

✅ Keep the more critical note; move or absorb the other — or flag for manual review if both are needed.

### Admonition titles are directives — no contrast phrases

An admonition title must be a concise directive or noun phrase. Do not add contrast phrases like "not X", "vs X", or ", not Y" to the title — the contrast belongs in the body.

❌ `.Write descriptions as instructions, not labels`
✅ `.Write descriptions as instructions`

The body explains what "instructions" means and what "labels" means. The title just names the rule.

### Admonitions must have a title

Every `[NOTE]`, `[TIP]`, `[WARNING]`, `[CAUTION]`, and `[IMPORTANT]` block must have a title on the line immediately after the type marker.

❌

```asciidoc
[WARNING]
=====
Restoring a snapshot overwrites all current data.
=====
```

✅

```asciidoc
[WARNING]
.Overwriting existing data
=====
Restoring a snapshot overwrites all current data.
=====
```

---

## Phase 9: Write the report

After fixing the file, create or append `REVIEW-REPORT.md` in the same lesson folder.

**Report format:**

```markdown
## Grammar & Style Review — YYYY-MM-DD

**Status:** ✅ Complete / ⚠️ Issues remain

### Changes Made

- **Spelling**: `colour` → `color` — _US English spelling_
- **Voice**: `We'll walk you through` → `This lesson walks you through` — _Use "you" not "we"_
- **Marketing**: removed `powerful` from "the powerful MATCH clause" — _Avoid marketing language_
- **Contraction**: `you'll learn` → `you will learn` — _No contractions in instructional text_
- **Terminology**: `on-prem` → `Self-Managed` — _Official Neo4j product term_

### Issues Requiring Manual Review

- [ ] Header "Understanding the data model" — consider whether this should be more action-oriented (_if the existing phrasing is appropriate in context, this can be ignored_)
```

If no changes were needed, record:

```markdown
## Grammar & Style Review — YYYY-MM-DD

**Status:** ✅ No issues found
```

---

## References

- `.cursor/rules/course-content-style.mdc` — tone, voice, terminology rules
- `.cursor/rules/neo4j-naming-ontology.mdc` — product names and capitalisation
- `.cursor/review-lesson-content.mdc` — §2 Tone and Clarity
