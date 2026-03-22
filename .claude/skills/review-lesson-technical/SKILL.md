---
name: review-lesson-technical
description: Review a single lesson for AsciiDoc syntax, link formatting, code blocks, slides structure, and question includes. Fixes issues inline and appends a WHY report.
allowed-tools: Read, Edit, Glob, Grep
---

# Review: Technical Formatting

**Purpose:** Fix AsciiDoc syntax errors, link formatting problems, code block issues, slides structure, and question includes in a single `lesson.adoc` file. Every change is recorded with a reason.

**When to use:** Stage 3 of the course review pipeline. Run after grammar and structure reviews.

**Input:** Path to a lesson folder (e.g. `asciidoc/courses/my-course/modules/1-intro/lessons/1-overview/`)

**Output:**
- `lesson.adoc` — fixed in place
- `REVIEW-REPORT.md` in the lesson folder — created or appended with a technical section

---

## Overview

This review checks and fixes:

1. **AsciiDoc syntax** — blank lines between elements, lists, no markdown
2. **Links** — action text, external window flag, Aura console URL
3. **Code blocks** — correct delimiters, titles, callout syntax
4. **Admonitions** — titles required, correct delimiter
5. **Questions** — read button vs questions, all question files included
6. **Slides** — opening header required when slides are present

---

## Phase 1: Read the Lesson

Read `lesson.adoc` in full before making changes. Note:

- Whether the lesson contains `[.slide` blocks (slides-enabled)
- Whether there is a `questions/` subfolder with `.adoc` files
- Whether the lesson has a `read::` button

---

## Phase 2: AsciiDoc Syntax

### Blank lines between elements

There must be a blank line between a paragraph and any list (ordered or unordered).

❌
```asciidoc
Here is some text.
* Item 1
* Item 2
```

✅
```asciidoc
Here is some text.

* Item 1
* Item 2
```

### Two blank lines between major sections

There must be **two** blank lines between section blocks (before a `[.slide]` marker or a `==` header).

❌
```asciidoc
[.slide]
== Section One

Content here.
[.slide]
== Section Two
```

✅
```asciidoc
[.slide]
== Section One

Content here.


[.slide]
== Section Two
```

### No markdown syntax

Replace any markdown that has crept in:

| Markdown (wrong) | AsciiDoc (correct) |
|------------------|-------------------|
| `## Heading` | `== Heading` |
| `**bold**` | `*bold*` |
| `` ```lang `` / ` ``` ` | `[source,lang]\n----\n----` |
| `[link text](url)` | `link:url[link text]` |
| `> blockquote` | `[quote]\n____\ntext\n____` |
| `---` (horizontal rule) | `'''` |

### Ordered lists — dot notation

Use `.` for ordered list items, not explicit numbers.

❌
```asciidoc
1. First step
2. Second step
```

✅
```asciidoc
. First step
. Second step
```

If an image or code block appears mid-list, use `+` for continuation:

```asciidoc
. First step
+
image::images/step.png[]

. Second step
```

---

## Phase 3: Links

### Link text must be actionable

Link text should describe the action the user takes by clicking, not the destination name alone.

❌ `link:https://neo4j.com/docs[here]`
❌ `link:https://neo4j.com/docs[Neo4j documentation]`
✅ `link:https://neo4j.com/docs[Read the Neo4j documentation^]`
✅ `link:https://neo4j.com/docs[View installation options^]`

### External links must open in a new window

Any link to a URL outside the course must have `^` at the end of the link text.

❌ `link:https://neo4j.com/docs[Read the docs]`
✅ `link:https://neo4j.com/docs[Read the docs^]`

### Aura console URL

Links to the Aura console must use the `/graphacademy` path:

❌ `link:https://console.neo4j.io/[Open the Aura console^]`
✅ `link:https://console.neo4j.io/graphacademy[Open the Aura console^]`

### Internal course links

Links within the course (to other lessons or modules) do not need `^` and should use relative paths, not absolute URLs.

---

## Phase 4: Code Blocks

### Correct delimiter format

Code blocks must use four hyphens `----`, not backticks.

❌
````asciidoc
```cypher
MATCH (n) RETURN n;
```
````

✅
```asciidoc
[source,cypher]
.Find all nodes
----
MATCH (n) RETURN n;
----
```

### Code block title

Every code block should have a descriptive title on the line immediately after the `[source,...]` marker, prefixed with `.`:

```asciidoc
[source,cypher]
.Find all customers who placed an order
----
MATCH (c:Customer)-[:PLACED]->(o:Order)
RETURN c.name, count(o) AS orderCount;
----
```

### Callout syntax

Callouts in code blocks use angle-bracket notation with a `//` comment:

❌ `MATCH (n) RETURN n; // (1)`
✅ `MATCH (n) RETURN n; // <1>`

The callout list below the code block uses:
```asciidoc
<1> Explanation of this part
<2> Explanation of this part
```

### Code block context and explanation

Every code block must be introduced by a sentence that explains **what the code demonstrates and why it is there**. A code block that appears directly after prose without a setup sentence is a missing explanation — flag it.

❌
```asciidoc
Your AuraDB graph stores connected data.

[source,cypher]
----
MATCH (m:Movie)<-[:ACTED_IN]-(a:Person)
RETURN m.title
----
```

✅
```asciidoc
A Cypher Template stores a fixed query with one or more parameters the LLM fills at runtime.
A "Get Customer" tool might look like this:

[source,cypher]
----
MATCH (c:Customer {customerID: $customerID})
RETURN c.companyName, c.contactName
----
```

### Code must use the course schema

Code examples must use the same data model as the course — not a generic placeholder from an unrelated domain. A Northwind course must not show Movie/Person examples; a movie course must not show Customer/Order examples. If a code block uses a schema that does not match the course topic, flag it for replacement.

### No placeholder syntax inside code blocks

Code shown in a `[source,...]` block or an inline backtick must be valid, runnable code. Ellipsis (`...`), placeholder comments (`// add more here`), or truncation markers inside executable positions are not valid and will produce syntax errors if a learner runs them.

❌ `` `MATCH (c:Customer {id: $id}) RETURN c.name, ...` ``
✅ `` `MATCH (c:Customer {id: $id}) RETURN c.name, c.city` ``

If the code is intentionally incomplete, move it into a callout explanation rather than the code itself.

---

## Phase 5: Admonitions

Every admonition (`[NOTE]`, `[TIP]`, `[WARNING]`, `[CAUTION]`, `[IMPORTANT]`) must have a title:

❌
```asciidoc
[NOTE]
=====
This is important.
=====
```

✅
```asciidoc
[NOTE]
.Important
=====
This is important.
=====
```

The title should be brief and descriptive, not just repeat the admonition type.

---

## Phase 6: Questions

### Read button vs questions

A lesson **cannot** have both a `read::` button and questions. If a `questions/` folder exists with `.adoc` files, remove the `read::` button.

❌ (lesson has both)
```asciidoc
read::Let's move on[]

include::questions/1-question.adoc[leveloffset=+1]
```

✅ (keep only the include)
```asciidoc
include::questions/1-question.adoc[leveloffset=+1]
```

### All question files must be included

Check the `questions/` folder for `.adoc` files:

```
Glob pattern: questions/*.adoc
```

For every `.adoc` file found, verify there is a corresponding `include::questions/[filename].adoc[leveloffset=+1]` in `lesson.adoc`. Add any missing includes.

### Quiz marker

The `== Check your understanding` section must be preceded by `[.quiz]` on the previous line:

```asciidoc
[.quiz]
== Check your understanding
```

### Sequential attribute

If the lesson has **more than one** question, the `:sequential: true` attribute may be appropriate (if questions build on each other). If there is only one question, remove `:sequential: true` if present.

---

## Phase 7: Slides

If the lesson contains any `[.slide` markers, it has slide view enabled and requires additional checks.

### Opening header required

The lesson must begin with a level-2 header immediately after the attributes. Text before the first header is not shown in slide view.

❌
```asciidoc
= Lesson Title
:order: 1

Some opening text without a header.
```

✅ (header visible in slide view)
```asciidoc
= Lesson Title
:order: 1


[.slide]
== Introduction

Some opening text.
```

✅ (header hidden in read view with discrete)
```asciidoc
= Lesson Title
:order: 1


[.slide.discrete]
== Introduction

Some opening text.
```

---

## Phase 8: Write the Report

After fixing the file, create or append `REVIEW-REPORT.md` in the lesson folder.

```markdown
## Technical Formatting Review — YYYY-MM-DD

**Status:** ✅ Complete / ⚠️ Issues remain

### Changes Made

- **List spacing**: Added blank line before bullet list in "Understanding indexes" section — _AsciiDoc requires blank line before lists_
- **Link**: Added `^` to docs link — _External links must open in new window_
- **Aura URL**: Changed `console.neo4j.io/` → `console.neo4j.io/graphacademy` — _Must use /graphacademy path for learner context_
- **Code block**: Replaced backtick fence with `[source,cypher]\n----` — _AsciiDoc format required; no markdown_
- **Callout**: Changed `// (1)` → `// <1>` — _AsciiDoc callout syntax_
- **Read button**: Removed `read::` button — _Lesson has questions; cannot have both_
- **Missing include**: Added `include::questions/2-verify.adoc[leveloffset=+1]` — _Question file existed but was not included_

### Issues Requiring Manual Review

- [ ] Dead link suspected: `link:https://neo4j.com/docs/old-page[...]` — _Could not verify; check that this URL still resolves_
```

---

## References

- `.cursor/technical-lesson-review.mdc` — AsciiDoc, links, questions, slides
- `.cursor/rules/asciidoc-syntax.mdc` — Line break requirements
- `.cursor/rules/code-callouts.mdc` — Callout syntax
- `.cursor/rules/slides-formatting.mdc` — Slide structure rules
