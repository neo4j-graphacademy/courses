---
name: lesson-author
description: Write concept/theory lessons for workshops
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Lesson Author Skill

**Purpose:** Write concept/theory lessons that introduce 1-2 new concepts in 3-5 minutes.

**When to use:** Workshop lesson requires teaching a concept before hands-on practice.

**Prerequisites:**
- WORKSHOP-PLAN.md exists with lesson details
- Skeleton lesson.adoc file exists
- Source course lessons identified

---

## Overview

This skill writes **concept/theory lessons** that:
- Introduce 1-2 new concepts in 3-5 minutes
- Focus on Bloom's taxonomy: **remember** and **understand**
- Use examples from the workshop dataset (not generic examples)
- Prepare learners for the next hands-on challenge
- Follow the Learn → Do → Verify pattern (this is the "Learn")

**Do NOT write challenge lessons, quizzes, or practice lessons.** This skill focuses ONLY on concept/theory lessons.

---

## Phase 1: Understand Context (5 min)

### Checklist: Gather Information
- [ ] Read WORKSHOP-PLAN.md for lesson objectives
- [ ] Read source course lesson(s) identified
- [ ] Read previous workshop lesson (if not first)
- [ ] Identify workshop dataset being used
- [ ] Note building block this lesson supports
- [ ] Understand what challenge follows this lesson

### Key Questions to Answer

**Before writing anything, answer:**

1. **What 1-2 concepts** does this lesson teach?
2. **Why now?** Why does this concept come at this point in the workshop?
3. **What comes before?** What did learners just complete?
4. **What comes after?** What challenge will they do next?
5. **How does it connect?** How does this concept enable the next challenge?
6. **What's the building block?** Which transformation does this support?

### Read These Files

```
MUST READ:
- WORKSHOP-PLAN.md (for lesson objectives)
- Source course lesson (for concept content)
- Previous workshop lesson (for context)
- CONTENT_GUIDELINES.md (for style rules)

REFERENCE:
- modules/2-foundation/lessons/1-graph-elements/lesson.adoc (example concept lesson)
- HOW-TO-BUILD-WORKSHOPS.md (methodology)
```

---

## Phase 2: Plan Lesson Structure (10 min)

### Checklist: Lesson Outline
- [ ] Determine 1-2 core concepts to teach
- [ ] Plan two-part opening (context + learning objective)
- [ ] Identify examples from workshop dataset
- [ ] Plan 2-3 main sections (keep it short!)
- [ ] Plan summary with forward reference
- [ ] Verify lesson stays under 5 minutes

### Structure Template

**IMPORTANT:** Follow this exact structure from review-lesson-content.mdc:

```
Introduction (two-part pattern)
├── Part 1: Context or why this matters
└── Part 2: "In this lesson, you will learn..."

Main Content (2-3 sections)
├── Section 1: Core concept A
│   ├── Plain-language definition
│   ├── Example from workshop dataset
│   └── Why it matters for workshop goal
└── Section 2: Core concept B
    ├── Plain-language definition
    ├── Example from workshop dataset
    └── Why it matters for workshop goal

Summary
├── Bullet points with bold concepts
└── Forward reference to next lesson
```

### What NOT to Include

- ❌ More than 2 concepts (too much for 5 minutes)
- ❌ Generic examples (movies, books) unless that's the workshop dataset
- ❌ "Deep dives" or advanced topics
- ❌ Edge cases or exceptions
- ❌ Tool mechanics (those go in Module 1 Lesson 3)
- ❌ Sales language ("powerful", "amazing", "seamlessly")
- ❌ AI artifacts ("comprehensive understanding", "delve into")

### What TO Include

- ✅ 1-2 focused concepts
- ✅ Examples using workshop data (Northwind, etc.)
- ✅ Clear connection to workshop goal
- ✅ Plain language definitions
- ✅ Why each concept matters
- ✅ Preparation for next challenge

---

## Phase 3: Write Opening (5 min)

### Checklist: Two-Part Opening
- [ ] Part 1: Context from previous lesson OR why topic matters
- [ ] Part 2: "In this lesson, you will learn..."
- [ ] Opening is 2-3 sentences total (not more!)
- [ ] Uses "you will" not "we will" or "you'll"
- [ ] No generic analogies unrelated to workshop

### Opening Patterns

**Pattern A: Direct Continuation**

Use when building directly on previous lesson:

```asciidoc
[.slide.discrete]
== Introduction

You learned [X] in the previous lesson. To [accomplish next step], you need to understand [Y].

In this lesson, you will learn [specific concepts].
```

**Example:**
```asciidoc
[.slide.discrete]
== Introduction

You imported Product nodes in the previous lesson. To query those products, you need to understand how Cypher patterns work.

In this lesson, you will learn how to write basic Cypher patterns to find nodes in your graph.
```

**Pattern B: New/Related Topic**

Use when NOT directly continuing:

```asciidoc
[.slide.discrete]
== Introduction

[Statement about primary topic and why it matters for workshop goal].

In this lesson, you will learn [specific concepts].
```

**Example:**
```asciidoc
[.slide.discrete]
== Introduction

Relationships in a graph are first-class citizens, meaning they can store properties just like nodes. This is crucial for modeling business data accurately.

In this lesson, you will learn how to use relationship properties to represent order quantities and prices.
```

### Opening Anti-Patterns to AVOID

❌ **Combining into one sentence:**
```
Now that you understand nodes, you'll learn about relationships and how they connect data.
```

❌ **Generic opening without context:**
```
In modern databases, relationships are important. This lesson covers relationships.
```

❌ **Sales language:**
```
Relationships are a powerful feature that will revolutionize how you think about data.
```

---

## Phase 4: Write Main Content (20 min)

### Checklist: Main Sections
- [ ] 2-3 sections with action-oriented headers
- [ ] Each concept has plain-language definition
- [ ] Examples use workshop dataset
- [ ] Connection to workshop goal stated
- [ ] Code blocks (if any) have context before and after
- [ ] No more than 1-2 code examples (keep it brief)
- [ ] Mermaid diagrams use circles for nodes
- [ ] Screenshots included for tools

### Section Structure

**For each concept:**

1. **Action-oriented header** (sentence case, not question)
   - ✅ "Understanding graph elements"
   - ✅ "How relationships connect nodes"
   - ❌ "What are relationships?"
   - ❌ "Relationships"

2. **Plain-language definition** (1-2 sentences)
   - Explain what it is in simple terms
   - No jargon without explanation

3. **Example from workshop dataset** (concrete, not abstract)
   - Use Northwind, or whatever the workshop uses
   - Show real data, real business scenarios

4. **Why it matters** (connection to goal)
   - How does this concept enable the workshop goal?
   - What can they do with this knowledge?

### Code Block Pattern

**CRITICAL:** Every code block must follow this pattern from create-new-workshop.mdc:

```asciidoc
[Context before - why do we need this?]

[source,cypher]
.Descriptive title describing the query
----
MATCH (n:Node) RETURN n;
----

[Explanation after - what does it do?]

Click **Run** to execute this query. [Expected result].

**Try experimenting:**
* [Suggested modification 1]
* [Suggested modification 2]
```

**Example:**

```asciidoc
You want to see all Product nodes in your graph. In Cypher, you use the MATCH clause to find nodes by their label.

[source,cypher]
.Find all products
----
MATCH (p:Product)
RETURN p.name, p.unitPrice
LIMIT 5;
----

This query matches nodes with the Product label and returns their name and price properties.

Click **Run** to see the first 5 products. You should see items like "Chai" and "Chang" from the Northwind catalog.

**Try experimenting:**
* Change `LIMIT 5` to `LIMIT 10` to see more products
* Remove `p.unitPrice` to see only names
```

### Numbered Annotations for Multi-Concept Code

Use when code teaches 3+ concepts:

```asciidoc
[source,cypher]
.Query with multiple patterns
----
MATCH (c:Customer {id: 'ALFKI'})  // (1)
-[:PLACED]->                       // (2)
(o:Order)                          // (3)
RETURN c.companyName, count(o)    // (4)
----

1. **Node pattern with properties** - Find specific customer by ID
2. **Relationship traversal** - Follow PLACED relationship
3. **Chained pattern** - Continue to Order nodes
4. **Aggregation** - Count the number of orders

Click **Run** to see how many orders this customer placed.
```

### Mermaid Diagrams

**CRITICAL:** Graph nodes must be circles, not boxes.

```asciidoc
[mermaid]
----
graph LR
    Customer((Customer)) -->|PLACED| Order((Order))
    Order -->|ORDERS| Product((Product))
----
```

---

## Phase 5: Write Summary (5 min)

### Checklist: Summary Section
- [ ] Uses [.summary] marker
- [ ] Bullet points with **bold** concept names
- [ ] Brief description after each concept
- [ ] Forward reference to next lesson
- [ ] No "read::" button (auto-completes)

### Summary Pattern

```asciidoc
[.summary]
== Summary

In this lesson, you learned about [topic]:

* **[Concept 1]** - [Brief description]
* **[Concept 2]** - [Brief description]

In the next lesson, you will [what comes next - usually a challenge].
```

**Example:**

```asciidoc
[.summary]
== Summary

In this lesson, you learned about graph elements:

* **Nodes** - Represent entities in your domain (like customers and products)
* **Relationships** - Connect nodes and represent associations (like PLACED and ORDERS)
* **Properties** - Store data on nodes and relationships (like name and quantity)

In the next lesson, you will use Data Importer to create Product nodes from a CSV file.
```

---

## Phase 6: Apply Style Rules (10 min)

### Checklist: Technical Requirements
- [ ] Two line breaks between ALL sections
- [ ] [.slide.discrete] for introduction
- [ ] [.slide] for main sections
- [ ] [.summary] for summary
- [ ] Action-oriented headers in sentence case
- [ ] No markdown syntax (only AsciiDoc)
- [ ] Natural dataset references ("Northwind" not "The Northwind Dataset")
- [ ] No AI artifacts ("comprehensive", "delve into")
- [ ] No sales language ("powerful", "amazing", "seamlessly")
- [ ] Uses "you will" not "we will" or "you'll"

### Apply These Rules

**From .cursor/rules/asciidoc-syntax.mdc:**
- TWO line breaks between elements
- NO MARKDOWN - only AsciiDoc
- Blank lines before lists

**From .cursor/review-lesson-content.mdc:**
- Two-part opening pattern
- Action-oriented headers
- Casual, friendly tone
- Under 5 minutes
- 1-2 concepts max

**From CONTENT_GUIDELINES.md:**
- Property naming (id, name not customerId, companyName)
- Mermaid diagrams use circles
- Code blocks have titles
- Screenshots for tools

### Line Break Example

```asciidoc
= Lesson Title
:type: lesson
:order: 1

// Source: course-name/modules/1/lessons/1-lesson


[.slide.discrete]
== Introduction

Opening paragraph here.


[.slide]
== First Section

Content here.


[.slide]
== Second Section

More content.


[.summary]
== Summary

* Summary points
```

Notice: **TWO blank lines** between every section.

---

## Phase 7: Review and Refine (10 min)

### Checklist: Self-Review
- [ ] Re-read the lesson aloud
- [ ] Check timing (under 5 minutes to read)
- [ ] Verify examples use workshop dataset
- [ ] Confirm connection to workshop goal is clear
- [ ] All code blocks have context before/after
- [ ] Opening follows two-part pattern
- [ ] Summary has forward reference
- [ ] No generic examples or sales language
- [ ] Proper AsciiDoc formatting throughout

### Common Issues to Fix

**Issue:** Too long (over 5 minutes)
- **Fix:** Cut to 1 concept instead of 2, remove deep dives

**Issue:** Generic examples (movies, books)
- **Fix:** Replace with workshop dataset examples (Northwind)

**Issue:** No connection to workshop goal
- **Fix:** Add "why this matters" statements

**Issue:** Code without explanation
- **Fix:** Add context before and "Click **Run**" after

**Issue:** Opening doesn't follow pattern
- **Fix:** Rewrite as Part 1 (context) + Part 2 (learning objective)

**Issue:** Sales/AI language
- **Fix:** Use factual, educational language

---

## Examples and References

### Example Concept Lessons

**See these real files:**

- `modules/2-foundation/lessons/1-graph-elements/lesson.adoc`
  - Demonstrates: Two-part opening, Mermaid diagrams with circles, examples with Northwind data

- `modules/2-foundation/lessons/2-cypher-primer/lesson.adoc`
  - Demonstrates: Code blocks with titles, numbered annotations, experiment suggestions

- `modules/3-modeling-relationships/lessons/1-understanding-relationships/lesson.adoc`
  - Demonstrates: Building on previous lesson, connecting to workshop goal

### What These Files Demonstrate

**1-graph-elements/lesson.adoc:**
- Opens with clear goal: "By the end of this workshop, you will build..."
- Defines concepts (nodes, labels, relationships) with visual diagrams
- Uses Northwind data in all examples
- Shows Cypher patterns progressively
- Connects every concept to recommendation goal
- Ends with summary + forward reference

**Key patterns:**
- `[.slide.discrete]` for introduction
- `[.slide.col-2]` for side-by-side content
- Mermaid diagrams for visualizations
- Callout numbering `// (1)` for code explanations
- Clear connection to goal in every section

---

## Output Checklist

Before marking lesson complete, verify:

- [ ] File: `lesson.adoc` exists in correct folder
- [ ] Metadata: `:type: lesson`, `:order: X`, `:duration: 3-5`
- [ ] Source attribution in comments at top
- [ ] Introduction follows two-part pattern
- [ ] 1-2 concepts clearly explained
- [ ] Examples use workshop dataset
- [ ] Connection to workshop goal stated
- [ ] Summary with bold concepts + forward reference
- [ ] Two line breaks between all sections
- [ ] No markdown, only AsciiDoc
- [ ] Under 5 minutes reading time
- [ ] Natural, friendly tone (no AI/sales language)

---

## References

- [CONTENT_GUIDELINES.md](../../asciidoc/courses/workshop-importing/CONTENT_GUIDELINES.md) - Style guide
- [HOW-TO-BUILD-WORKSHOPS.md](../../../docs/workshops/HOW-TO-BUILD-WORKSHOPS.md) - Methodology
- [create-new-workshop.mdc](../create-new-workshop.mdc) - Workshop requirements
- [review-lesson-content.mdc](../review-lesson-content.mdc) - Lesson review checklist
- [how-we-teach pedagogy](../../asciidoc/courses/how-we-teach/modules/1-introduction/lessons/2-pedagogy/lesson.adoc) - PRIMM, Bloom's taxonomy
