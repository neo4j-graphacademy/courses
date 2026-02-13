---
name: workshop-review-grammar
description: Review workshop content for grammar and formatting
disable-model-invocation: true
allowed-tools: Read, Edit, Write, Glob, Grep
---

# Workshop Review: Grammar and Formatting

**Purpose:** Review workshop content for grammar, spelling, formatting, and style consistency.

**When to use:** After all lesson content is authored and ready for review.

**Prerequisites:**
- Workshop content is complete
- All lesson.adoc files exist
- AUTHORING-PROGRESS.md shows all lessons completed

---

## Overview

This skill performs a **grammar and formatting review** that checks:
- US English spelling and grammar
- AsciiDoc formatting compliance
- Consistent style and tone
- Proper line breaks and spacing
- Markdown vs AsciiDoc issues
- Typography and punctuation

**This is a SYSTEMATIC review, not a surface read.**

---

## Phase 1: Pre-Review Setup (5 min)

### Checklist: Preparation
- [ ] Read WORKSHOP-PLAN.md for context
- [ ] Read CONTENT_GUIDELINES.md for style rules
- [ ] Identify all lesson.adoc files to review
- [ ] Create review tracking document
- [ ] Note common issues to watch for

### Files to Review

```
Find all lesson files:
- modules/*/lessons/*/lesson.adoc
- modules/*/lessons/*/questions/*.adoc
- modules/*/module.adoc
- course.adoc
- README.md
```

### Create Tracking Document

Create `GRAMMAR-REVIEW-PROGRESS.md`:

```markdown
# Grammar Review Progress

**Workshop:** [Name]
**Reviewer:** Grammar Review Skill
**Date:** [Date]

## Review Status

### Module 1: [Name]
- [ ] Lesson 1 - [Name]
- [ ] Lesson 2 - [Name]
- [ ] Lesson 3 - [Name]

### Module 2: [Name]
- [ ] Lesson 1 - [Name]
- [ ] Lesson 2 - [Name]
- [ ] Lesson 3 - [Name]

[Continue for all modules...]

## Common Issues Found
- Issue category: [count] occurrences
- Issue category: [count] occurrences

## Review Complete
- Total files reviewed: [N]
- Issues found: [N]
- Issues fixed: [N]
```

---

## Phase 2: Grammar and Spelling Review (Per Lesson)

### Checklist: Grammar Check
- [ ] US English spelling (color not colour, analyze not analyse)
- [ ] Subject-verb agreement
- [ ] Proper tense usage (consistent past/present)
- [ ] Pronoun agreement
- [ ] Complete sentences (no fragments unless intentional)
- [ ] Proper capitalization
- [ ] Correct punctuation

### Common Grammar Issues

**Issue 1: British vs US spelling**

❌ **British:**
- colour → color
- behaviour → behavior
- analyse → analyze
- optimise → optimize
- centre → center
- realise → realize

✅ **US English:**
- color
- behavior
- analyze
- optimize
- center
- realize

**Issue 2: Tense consistency**

❌ **Inconsistent:**
```
You learned about nodes. Now you will learn relationships.
In the previous lesson, you learn about properties.
```

✅ **Consistent:**
```
You learned about nodes. Now you will learn about relationships.
In the previous lesson, you learned about properties.
```

**Issue 3: Subject-verb agreement**

❌ **Incorrect:**
```
The data are stored in CSV files.
These pattern matches any node.
```

✅ **Correct:**
```
The data is stored in CSV files.
This pattern matches any node.
```

**Issue 4: Pronoun agreement**

❌ **Incorrect:**
```
Each customer has their own orders.
The user can customize their dashboard.
```

✅ **Correct:**
```
Each customer has its own orders.
Users can customize their dashboards.
```

### Capitalization Rules

**Capitalize:**
- Proper nouns: Neo4j, Cypher, Aura, Data Importer
- Titles in title case: "Understanding Graph Elements"
- Tool names: Query tool, Data Importer, Explore
- Button text: "Click **Run**"

**Don't capitalize:**
- Common nouns: graph, database, node, relationship
- Headers in sentence case: "How relationships work"
- Dataset references: "Northwind dataset" (lowercase "dataset")

---

## Phase 3: AsciiDoc Formatting Review (Per Lesson)

### Checklist: AsciiDoc Compliance
- [ ] TWO line breaks between all major elements
- [ ] No markdown syntax (**, ##, ```)
- [ ] Proper list spacing (blank line before lists)
- [ ] Correct code block format (----)
- [ ] Proper heading levels (=, ==, ===)
- [ ] Correct admonition format
- [ ] Proper table format
- [ ] Image syntax correct

### Common Formatting Issues

**Issue 1: Line breaks**

❌ **One line break (WRONG):**
```asciidoc
[.slide]
== Section One
Content here.
[.slide]
== Section Two
```

✅ **Two line breaks (CORRECT):**
```asciidoc
[.slide]
== Section One

Content here.


[.slide]
== Section Two
```

**Issue 2: Markdown vs AsciiDoc**

❌ **Markdown syntax:**
```markdown
## Section Header
**bold text**
`code`
[link](url)
```

✅ **AsciiDoc syntax:**
```asciidoc
== Section Header
*bold text*
`code`
link:url[link text]
```

**Issue 3: List spacing**

❌ **No blank line before list:**
```asciidoc
Here are the steps:
* Step 1
* Step 2
```

✅ **Blank line before list:**
```asciidoc
Here are the steps:

* Step 1
* Step 2
```

**Issue 4: Code blocks**

❌ **Wrong delimiters:**
```asciidoc
```cypher
MATCH (n) RETURN n;
```
```

✅ **Correct AsciiDoc format:**
```asciidoc
[source,cypher]
.Query title
----
MATCH (n) RETURN n;
----
```

**Issue 5: Admonition format**

❌ **Missing title:**
```asciidoc
[NOTE]
====
This is a note.
====
```

✅ **With title:**
```asciidoc
[NOTE]
.Important
====
This is a note.
====
```

---

## Phase 4: Style and Tone Review (Per Lesson)

### Checklist: Style Compliance
- [ ] Uses "you will" not "we will" or "you'll"
- [ ] Active voice (not passive)
- [ ] No AI artifacts ("comprehensive", "delve into")
- [ ] No sales language ("powerful", "amazing", "seamlessly")
- [ ] Sentence case headers (not title case for sections)
- [ ] Natural dataset references ("Northwind" not "The Northwind Dataset")
- [ ] Friendly but professional tone
- [ ] Concise (no unnecessary words)

### Common Style Issues

**Issue 1: Contractions**

❌ **Contractions:**
```
You'll learn about nodes.
We'll import data next.
```

✅ **Full form:**
```
You will learn about nodes.
You will import data next.
```

**Issue 2: AI artifacts**

❌ **AI language:**
```
To gain a comprehensive understanding, we'll delve into...
It's worth noting that...
Moreover, furthermore, additionally...
```

✅ **Natural language:**
```
To understand this concept, you will learn...
Note that...
Also, next, then...
```

**Issue 3: Sales language**

❌ **Sales pitch:**
```
Graphs are powerful and provide amazing performance.
This seamlessly integrates with your workflow.
The revolutionary approach transforms how you work.
```

✅ **Factual language:**
```
Graphs are well-suited for connected data.
This integrates with your workflow.
This approach improves query performance.
```

**Issue 4: Passive voice**

❌ **Passive:**
```
Data is stored in nodes.
Queries are written in Cypher.
Relationships are traversed efficiently.
```

✅ **Active:**
```
Nodes store data.
You write queries in Cypher.
Graph databases traverse relationships efficiently.
```

**Issue 5: Header capitalization**

❌ **Title Case:**
```
== Understanding Graph Elements
== How Relationships Connect Nodes
```

✅ **Sentence case:**
```
== Understanding graph elements
== How relationships connect nodes
```

---

## Phase 5: Typography and Punctuation Review (Per Lesson)

### Checklist: Typography
- [ ] Consistent quote style (use " not ')
- [ ] Proper apostrophes (not straight quotes)
- [ ] Consistent dash usage (— for em dash, – for ranges)
- [ ] Ellipsis as … not ...
- [ ] Proper spacing around punctuation
- [ ] Code/monospace formatting for identifiers

### Common Typography Issues

**Issue 1: Quote marks**

❌ **Straight quotes:**
```
'Product' nodes
"Customer" label
```

✅ **Curly quotes or backticks for code:**
```
`Product` nodes
`Customer` label
```

**Issue 2: Code formatting**

❌ **Not formatted as code:**
```
Use the MATCH clause to find nodes.
The customerId property stores the ID.
```

✅ **Formatted as code:**
```
Use the `MATCH` clause to find nodes.
The `id` property stores the customer ID.
```

**Issue 3: Punctuation spacing**

❌ **Inconsistent:**
```
Lists:nodes,relationships,properties
Question:What is Cypher?
```

✅ **Consistent:**
```
Lists: nodes, relationships, properties
Question: What is Cypher?
```

---

## Phase 6: Systematic File Review Process

### For Each Lesson File

**Step 1: Read entire file**
- Get context and understanding
- Note overall structure

**Step 2: Check metadata**
- `:type:` correct?
- `:order:` correct?
- `:duration:` reasonable?
- `:optional:` if applicable?

**Step 3: Review line by line**
- Grammar and spelling
- AsciiDoc formatting
- Style and tone
- Typography and punctuation

**Step 4: Fix issues found**
- Make corrections directly
- Document patterns for other files
- Note issues that need manual review

**Step 5: Re-read after fixes**
- Verify corrections
- Check nothing broke

**Step 6: Update tracking**
- Mark lesson as reviewed
- Note issues found/fixed

---

## Phase 7: Cross-Lesson Consistency Check

### Checklist: Consistency Across Files
- [ ] Property names consistent (id, name not customerId, companyName)
- [ ] Dataset references consistent (Northwind vs northwind)
- [ ] Tool names consistent (Data Importer not data importer)
- [ ] Cypher keywords consistent (MATCH not match)
- [ ] Building block markers consistent
- [ ] Forward references accurate

### Common Consistency Issues

**Issue 1: Property naming**

❌ **Inconsistent:**
```
Lesson 1: customerId
Lesson 2: id
Lesson 3: customer_id
```

✅ **Consistent:**
```
All lessons: id
```

**Issue 2: Tool names**

❌ **Inconsistent:**
```
Lesson 1: data importer
Lesson 2: Data Importer
Lesson 3: Data importer tool
```

✅ **Consistent:**
```
All lessons: Data Importer
```

**Issue 3: Forward references**

❌ **Broken:**
```
Lesson 3: "In the next lesson, you will import products."
Lesson 4: (Actually about relationships, not products)
```

✅ **Accurate:**
```
Lesson 3: "In the next lesson, you will create relationships."
Lesson 4: (About relationships)
```

---

## Phase 8: Final Review Report

### Create Review Summary

Update `GRAMMAR-REVIEW-PROGRESS.md` with results:

```markdown
# Grammar Review Complete

**Workshop:** [Name]
**Date Completed:** [Date]

## Summary Statistics

- **Total files reviewed:** [N]
- **Total issues found:** [N]
- **Issues fixed:** [N]
- **Issues requiring manual review:** [N]

## Issues by Category

### Grammar and Spelling
- US English corrections: [N]
- Tense consistency: [N]
- Subject-verb agreement: [N]
- Other grammar: [N]

### AsciiDoc Formatting
- Line break issues: [N]
- Markdown syntax: [N]
- List spacing: [N]
- Code block format: [N]
- Admonition format: [N]

### Style and Tone
- Contraction fixes: [N]
- AI artifact removal: [N]
- Sales language removal: [N]
- Voice changes (passive to active): [N]
- Header capitalization: [N]

### Typography
- Quote mark fixes: [N]
- Code formatting: [N]
- Punctuation spacing: [N]

### Consistency
- Property naming: [N]
- Tool name standardization: [N]
- Forward reference corrections: [N]

## Manual Review Required

[List any issues that need human review]

## Ready for Next Review Phase

✅ Grammar and formatting review complete

**Next step:** Use `workshop-review-pedagogy` skill for pedagogical review.
```

---

## Common Issue Patterns

### Pattern 1: Lesson Openings

**Check for:**
- Two-part opening pattern
- "In this lesson, you will learn..." present
- "you will" not "you'll" or "we will"

**Fix:**
```asciidoc
[.slide.discrete]
== Introduction

[Context from previous or why this matters].

In this lesson, you will learn [specific concepts].
```

---

### Pattern 2: Code Blocks

**Check for:**
- `[source,cypher]` marker
- `.Title` before code
- Four hyphens `----`
- Explanation before and after code

**Fix:**
```asciidoc
[Context before code]

[source,cypher]
.Descriptive title
----
MATCH (n) RETURN n;
----

[Explanation after code]
```

---

### Pattern 3: Summaries

**Check for:**
- `[.summary]` marker
- Bullet points with bold concepts
- Forward reference to next lesson

**Fix:**
```asciidoc
[.summary]
== Summary

In this lesson, you learned:

* **Concept 1** - Description
* **Concept 2** - Description

In the next lesson, you will [what comes next].
```

---

## References

- [CONTENT_GUIDELINES.md](../../asciidoc/courses/workshop-importing/CONTENT_GUIDELINES.md) - Style guide
- [.cursor/rules/asciidoc-syntax.mdc](../asciidoc-syntax.mdc) - AsciiDoc requirements
- [.cursor/review-lesson-content.mdc](../review-lesson-content.mdc) - Lesson review checklist
- [.cursor/create-new-workshop.mdc](../create-new-workshop.mdc) - Workshop requirements
