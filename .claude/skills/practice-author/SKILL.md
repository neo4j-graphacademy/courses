---
name: practice-author
description: Write optional practice lessons with query exercises
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Practice Author Skill

**Purpose:** Write optional practice lessons with query exercises.

**When to use:** Workshop lesson provides additional query practice for skill reinforcement.

**Prerequisites:**
- WORKSHOP-PLAN.md exists with practice objectives
- Skeleton lesson.adoc file exists
- Graph structure has been built (nodes/relationships exist)
- Concepts have been taught

---

## Overview

This skill writes **optional practice lessons** that:
- Provide additional query practice (5-15 minutes)
- Are marked with `:optional: true`
- Include 3-5 business question exercises
- Have collapsible solutions with explanations
- Prepare learners for upcoming concepts
- Are contextual (right after building relevant structure)

**Do NOT write concept lessons, challenges, or validation lessons.** This skill focuses ONLY on optional practice lessons.

---

## Phase 1: Understand Practice Context (5 min)

### Checklist: Gather Information
- [ ] Read WORKSHOP-PLAN.md for practice objectives
- [ ] Read source course lesson(s) identified
- [ ] Identify what graph structure exists
- [ ] Note what concepts were just taught
- [ ] Understand what upcoming concept this prepares for
- [ ] Determine target audience (beginners vs advanced)

### Key Questions to Answer

**Before writing anything, answer:**

1. **What graph structure exists?** (what nodes/relationships are available)
2. **What was just taught?** (what concepts to practice)
3. **Who is this for?** (beginners need practice vs advanced can skip)
4. **What comes next?** (what upcoming concept does this prepare for)
5. **How many exercises?** (3-5 progressive business questions)
6. **What patterns to practice?** (specific Cypher patterns to reinforce)

### Read These Files

```
MUST READ:
- WORKSHOP-PLAN.md (for practice objectives)
- Previous lessons (what structure exists, what was taught)
- Source course lesson (for query examples)
- CONTENT_GUIDELINES.md (for style rules)

REFERENCE:
- modules/3-modeling-relationships/lessons/3-optional-queries/lesson.adoc
- modules/4-many-to-many/lessons/3-optional-queries/lesson.adoc
```

---

## Phase 2: Plan Practice Structure (10 min)

### Checklist: Lesson Outline
- [ ] Opening addresses both paths (skip or practice)
- [ ] 3-5 business questions identified
- [ ] Questions progress from simple to complex
- [ ] Each question has collapsible solution
- [ ] Solutions include explanations and experiments
- [ ] Connection to upcoming concept stated

### Structure Template

```
Introduction
├── Explicitly addresses two paths
│   ├── Advanced learners: Skip ahead
│   └── Beginners: These exercises prepare you for [upcoming concept]
└── States what will be practiced

Exercise 1: [Simple Business Question]
├── Question in plain language
└── Collapsible solution with explanation

Exercise 2: [More Complex Question]
├── Question in plain language
└── Collapsible solution with explanation

Exercise 3-5: [Progressive Questions]
├── Each builds complexity
└── Each has solution with variations

Summary
├── Patterns practiced
└── Connection to upcoming concept
```

### Practice Progression Pattern

Start simple, increase complexity:

1. **Exercise 1:** Basic pattern (single MATCH, simple RETURN)
2. **Exercise 2:** Filtering (add WHERE clause)
3. **Exercise 3:** Aggregation (COUNT, collect)
4. **Exercise 4:** Multi-hop or complex filtering
5. **Exercise 5:** Advanced pattern (optional, stretch)

---

## Phase 3: Write Opening (5 min)

### Checklist: Introduction
- [ ] References what was just built
- [ ] Explicitly addresses both learning paths
- [ ] States what will be practiced
- [ ] Connects to upcoming concept
- [ ] Marked with `:optional: true` metadata

### Opening Pattern

```asciidoc
= [Practice Topic]
:type: lesson
:order: X
:duration: 15
:optional: true

// Source: [course-name]/modules/X/lessons/Y-lesson


[.slide.discrete]
== Optional Practice

You [what was just built]. In this lesson, you will practice [what patterns].

**Advanced learners:** Skip to Module [N+1].

**Beginners:** These exercises prepare you for [upcoming concept].
```

**Example:**

```asciidoc
= Optional Query Practice
:type: lesson
:order: 4
:duration: 15
:optional: true

// Source: neo4j-fundamentals/modules/2-querying/lessons/3-practice


[.slide.discrete]
== Optional Practice

You imported Customer and Order nodes with PLACED relationships. In this lesson, you will practice traversing these relationships to answer business questions.

**Advanced learners:** Skip to Module 4 for many-to-many relationships.

**Beginners:** These exercises prepare you for multi-hop traversals and collaborative filtering.
```

### Metadata Requirements

**CRITICAL:** Mark as optional:

```asciidoc
:optional: true
```

This tells the platform this lesson can be skipped.

---

## Phase 4: Write Exercise Sections (30 min)

### Checklist: Exercise Structure
- [ ] Business question in plain language
- [ ] Clear, specific ask
- [ ] Collapsible solution block
- [ ] Solution includes query with title
- [ ] Explanation with numbered annotations
- [ ] "Try experimenting" variations
- [ ] 3-5 exercises total

### Exercise Pattern

```asciidoc
[.slide]
== Exercise [N]: [Business Question]

[Plain language business question or scenario]

[%collapsible]
====
[source,cypher]
.[Descriptive query title]
----
[Query here with numbered annotations if complex]
----

[Explanation of what query does]

**Try experimenting:**
* [Variation 1]
* [Variation 2]
====
```

**Example Exercise 1 (Simple):**

```asciidoc
[.slide]
== Exercise 1: Count Customer Orders

How many orders did customer ALFKI place?

[%collapsible]
====
[source,cypher]
.Count orders for a customer
----
MATCH (c:Customer {id: 'ALFKI'})-[:PLACED]->(o:Order)
RETURN c.name, count(o) AS orderCount;
----

This query finds the customer, follows PLACED relationships to orders, and counts them.

**Try experimenting:**
* Change 'ALFKI' to 'ANTON' to count orders for a different customer
* Add `ORDER BY orderCount DESC` after RETURN to see who ordered most
====
```

**Example Exercise 2 (Filtering):**

```asciidoc
[.slide]
== Exercise 2: Recent Orders

Find orders placed by customer ALFKI in 1997.

[%collapsible]
====
[source,cypher]
.Filter orders by year
----
MATCH (c:Customer {id: 'ALFKI'})-[:PLACED]->(o:Order)
WHERE o.date STARTS WITH '1997'
RETURN o.id, o.date
ORDER BY o.date;
----

The WHERE clause filters orders to only those from 1997. The STARTS WITH operator checks if the date string begins with '1997'.

**Try experimenting:**
* Change '1997' to '1998' to see orders from a different year
* Remove the WHERE clause to see all orders
* Add `LIMIT 5` to see only the first 5 results
====
```

**Example Exercise 3 (Aggregation):**

```asciidoc
[.slide]
== Exercise 3: Customer Order Summary

List all customers with their order counts, sorted by who ordered most.

[%collapsible]
====
[source,cypher]
.Customer order summary
----
MATCH (c:Customer)-[:PLACED]->(o:Order)
RETURN c.name,
       count(o) AS orderCount
ORDER BY orderCount DESC
LIMIT 10;
----

This query finds all customers and their orders, aggregates the count per customer, and sorts to show top customers first.

**Try experimenting:**
* Remove `LIMIT 10` to see all customers
* Add `WHERE orderCount > 5` after RETURN to filter to active customers
* Add `c.country` to RETURN to see where customers are located
====
```

**Example Exercise 4 (Complex):**

```asciidoc
[.slide]
== Exercise 4: Orders with Multiple Products

Find orders that contain more than 5 different products.

[%collapsible]
====
[source,cypher]
.Orders with many products
----
MATCH (o:Order)-[:ORDERS]->(p:Product)  // (1)
WITH o, count(DISTINCT p) AS productCount  // (2)
WHERE productCount > 5  // (3)
RETURN o.id, productCount  // (4)
ORDER BY productCount DESC;
----

1. **Pattern match** - Find orders and their products
2. **Aggregation** - Count distinct products per order
3. **Filter** - Only orders with more than 5 products
4. **Return** - Show order ID and product count

This query uses WITH to aggregate before filtering, a common pattern when you need to filter on aggregated values.

**Try experimenting:**
* Change `> 5` to `> 10` to find even larger orders
* Add `LIMIT 5` to see just the top 5
* Try counting `o` before the WITH to see total products including duplicates
====
```

---

## Phase 5: Write Summary (5 min)

### Checklist: Summary Section
- [ ] Lists patterns practiced
- [ ] States what skills were reinforced
- [ ] Connects to upcoming concept
- [ ] Uses [.summary] marker
- [ ] Includes forward reference

### Summary Pattern

```asciidoc
[.summary]
== Summary

In this optional practice, you reinforced [patterns/skills]:

* **[Pattern 1]** - [What it practices]
* **[Pattern 2]** - [What it practices]
* **[Pattern 3]** - [What it practices]

These patterns prepare you for [upcoming concept].

In the next module, you will [what comes next].
```

**Example:**

```asciidoc
[.summary]
== Summary

In this optional practice, you reinforced query patterns:

* **Relationship traversal** - Following PLACED relationships from customers to orders
* **Filtering** - Using WHERE to find specific data
* **Aggregation** - Counting and collecting results per customer
* **Complex patterns** - Using WITH to aggregate before filtering

These patterns prepare you for multi-hop traversals and collaborative filtering in the next module.

In Module 4, you will learn how to traverse many-to-many relationships between orders and products.
```

---

## Phase 6: Apply Style Rules (10 min)

### Checklist: Technical Requirements
- [ ] `:optional: true` in metadata
- [ ] Two line breaks between ALL sections
- [ ] [.slide.discrete] for introduction
- [ ] [.slide] for exercise sections
- [ ] [%collapsible] for solutions
- [ ] [.summary] for summary
- [ ] All code blocks have descriptive titles
- [ ] Numbered annotations for complex queries
- [ ] "Try experimenting" suggestions included
- [ ] Natural tone (no sales/AI language)

### Collapsible Solution Format

**CRITICAL:** Use `[%collapsible]` not `[.collapsible]`

```asciidoc
[%collapsible]
====
[Solution content here]
====
```

NOT:

```asciidoc
[.collapsible]
====
[This won't work!]
====
```

---

## Phase 7: Review and Refine (10 min)

### Checklist: Self-Review
- [ ] Re-read lesson aloud
- [ ] Check timing (5-15 minutes to complete)
- [ ] All queries tested and working
- [ ] Progressive difficulty (simple → complex)
- [ ] Solutions have explanations
- [ ] "Try experimenting" suggestions are helpful
- [ ] Connection to upcoming concept is clear
- [ ] Explicitly addresses both learning paths
- [ ] Marked with `:optional: true`
- [ ] Two line breaks between sections

### Test Queries

**Before completing:**

1. **Test each query:**
   - Returns expected results?
   - Syntax is correct?
   - Uses correct property names (id, name not customerId, companyName)?
   - Works with workshop dataset?

2. **Verify progression:**
   - Exercises increase in complexity?
   - Each builds on previous skills?
   - Variations are helpful and relevant?

3. **Check explanations:**
   - Clear what the query does?
   - Numbered annotations help for complex queries?
   - Experiments are interesting and educational?

---

## Examples and References

### Example Optional Practice Lessons

**See these real files:**

- `modules/3-modeling-relationships/lessons/3-optional-queries/lesson.adoc`
  - Demonstrates: Explicit path choice, business questions, collapsible solutions

- `modules/4-many-to-many/lessons/3-optional-queries/lesson.adoc`
  - Demonstrates: Multi-hop practice, progressive complexity

- `modules/2-foundation/lessons/6-optional-queries-cycle1/lesson.adoc`
  - Demonstrates: Simple queries after first import

### What These Files Demonstrate

**3-optional-queries/lesson.adoc (Module 3):**
- Explicitly addresses both paths: "Advanced learners: Skip ahead. Beginners: These exercises prepare you for..."
- Multiple business questions with progressive difficulty
- Each query includes callout explanations
- "Try experimenting" sections for variations
- Clear connection to upcoming concepts
- Marked with `:optional: true` metadata

**Key patterns:**
- `:optional: true` in front matter
- Two-path introduction (skip or practice)
- [%collapsible] for solutions (NOTE: % not .)
- Numbered annotations for complex queries
- Experiment suggestions for active learning
- Connection to upcoming module stated

---

## Exercise Types to Include

### Type 1: Counting and Aggregation

**Pattern to practice:** COUNT, collect, sum

```asciidoc
== Exercise: Total Order Value

Calculate the total value of all orders for customer ALFKI.

[%collapsible]
====
[source,cypher]
----
MATCH (c:Customer {id: 'ALFKI'})-[:PLACED]->(o:Order)
RETURN c.name, sum(o.total) AS totalSpent;
----
====
```

---

### Type 2: Filtering

**Pattern to practice:** WHERE, comparison operators

```asciidoc
== Exercise: High-Value Orders

Find orders with a total value greater than $1000.

[%collapsible]
====
[source,cypher]
----
MATCH (o:Order)
WHERE o.total > 1000
RETURN o.id, o.total
ORDER BY o.total DESC;
----
====
```

---

### Type 3: Pattern Matching

**Pattern to practice:** Multi-hop traversals

```asciidoc
== Exercise: Customer Product Preferences

What products did customer ALFKI order most frequently?

[%collapsible]
====
[source,cypher]
----
MATCH (c:Customer {id: 'ALFKI'})
      -[:PLACED]->(:Order)
      -[:ORDERS]->(p:Product)
RETURN p.name, count(*) AS timesOrdered
ORDER BY timesOrdered DESC;
----
====
```

---

### Type 4: Collections

**Pattern to practice:** collect, list operations

```asciidoc
== Exercise: Customer Product List

List all unique products each customer has ordered.

[%collapsible]
====
[source,cypher]
----
MATCH (c:Customer)-[:PLACED]->(:Order)-[:ORDERS]->(p:Product)
RETURN c.name,
       collect(DISTINCT p.name) AS products
LIMIT 5;
----
====
```

---

### Type 5: WITH Clause

**Pattern to practice:** WITH for chaining queries

```asciidoc
== Exercise: Active Customers

Find customers who placed more than 10 orders, show their top 3 most-ordered products.

[%collapsible]
====
[source,cypher]
----
MATCH (c:Customer)-[:PLACED]->(o:Order)
WITH c, count(o) AS orderCount
WHERE orderCount > 10
MATCH (c)-[:PLACED]->(:Order)-[:ORDERS]->(p:Product)
WITH c, p, count(*) AS timesOrdered
ORDER BY timesOrdered DESC
RETURN c.name,
       collect(p.name)[0..3] AS topProducts
LIMIT 5;
----
====
```

---

## Output Checklist

Before marking practice lesson complete, verify:

- [ ] File: `lesson.adoc` exists
- [ ] Metadata: `:type: lesson`, `:order: X`, `:duration: 5-15`, `:optional: true`
- [ ] Source attribution in comments
- [ ] Introduction addresses both paths (skip or practice)
- [ ] 3-5 business question exercises
- [ ] Each exercise has collapsible solution
- [ ] Solutions include query + explanation + experiments
- [ ] Progressive difficulty
- [ ] Summary connects to upcoming concept
- [ ] All queries tested and working
- [ ] Two line breaks between sections
- [ ] No markdown, only AsciiDoc
- [ ] Natural tone (no sales/AI language)

---

## References

- [CONTENT_GUIDELINES.md](../../asciidoc/courses/workshop-importing/CONTENT_GUIDELINES.md) - Style guide
- [HOW-TO-BUILD-WORKSHOPS.md](../../../docs/workshops/HOW-TO-BUILD-WORKSHOPS.md) - Optional lesson methodology
- [modules/3-modeling-relationships/lessons/3-optional-queries/](../../asciidoc/courses/workshop-importing/modules/3-modeling-relationships/lessons/3-optional-queries/) - Complete example
