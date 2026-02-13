---
name: validation-author
description: Write validation/query lessons with SQL comparisons
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Validation Author Skill

**Purpose:** Write validation/query lessons that prove the value of what was built with SQL comparisons.

**When to use:** Workshop lesson requires proving the value of what learners just built.

**Prerequisites:**
- WORKSHOP-PLAN.md exists with validation details
- Skeleton lesson.adoc file exists
- Previous challenge lesson completed
- Understanding of what was built
- SQL equivalent identified

---

## Overview

This skill writes **validation/query lessons** that:
- Query the data that was just imported/created (3-5 minutes)
- Show SQL comparison side-by-side
- Prove concrete value (performance, simplicity, readability)
- Use business questions, not abstract queries
- Follow the Learn → Do → Verify pattern (this is the "Verify")

**Do NOT write concept lessons, challenges, or practice lessons.** This skill focuses ONLY on validation lessons with SQL comparisons.

---

## Phase 1: Understand What to Validate (5 min)

### Checklist: Gather Information
- [ ] Read WORKSHOP-PLAN.md for validation objectives
- [ ] Read previous challenge lesson (what was built)
- [ ] Identify business questions to answer
- [ ] Find SQL equivalent queries
- [ ] Note what value proposition to prove
- [ ] Understand building block being validated

### Key Questions to Answer

**Before writing anything, answer:**

1. **What was just built?** (e.g., Product nodes, Customer→Order relationships)
2. **What business questions** can we now answer?
3. **What's the SQL equivalent?** How would you do this in a relational database?
4. **What value do we prove?** (fewer lines? no JOINs? better performance?)
5. **How many queries?** 2-4 progressive examples showing increasing complexity
6. **What's the connection?** How does this move toward the workshop goal?

### Read These Files

```
MUST READ:
- WORKSHOP-PLAN.md (for validation objectives)
- Previous challenge lesson (what was built)
- Source course lesson (for query examples)
- CONTENT_GUIDELINES.md (for SQL comparison patterns)

REFERENCE:
- modules/4-many-to-many/lessons/4-multi-hop-traversals/lesson.adoc
- SQL comparison examples throughout workshop
```

---

## Phase 2: Plan Validation Structure (10 min)

### Checklist: Lesson Outline
- [ ] Opening references what was just built
- [ ] 2-4 business questions identified
- [ ] Queries progress from simple to complex
- [ ] SQL comparisons planned for each
- [ ] Metrics table planned (lines, JOINs, performance)
- [ ] Connection to workshop goal stated

### Structure Template

```
Introduction
├── References what was just built
└── States what will be validated

Query 1: Simple Business Question
├── Question in plain language
├── Cypher query with explanation
├── SQL comparison
└── Why graph is better for THIS query

Query 2: More Complex Question
├── Question in plain language
├── Cypher query with explanation
├── SQL comparison
└── Why graph is better for THIS query

Comparison Table
└── Metrics (Lines, JOINs, Performance, Readability)

Connection to Goal
└── How this pattern enables the final workshop goal

Summary
└── What was proven, forward reference
```

### Query Progression Pattern

Start simple, build complexity:

1. **Query 1:** Single-hop traversal (Customer → Orders)
2. **Query 2:** Multi-hop traversal (Customer → Orders → Products)
3. **Query 3:** Filtering and aggregation
4. **Query 4:** Advanced pattern (collections, counts)

---

## Phase 3: Write Opening (5 min)

### Checklist: Introduction
- [ ] References what was just built in challenge
- [ ] States what will be validated/proven
- [ ] Mentions business value
- [ ] 2-3 sentences (concise!)

### Opening Pattern

```asciidoc
[.slide.discrete]
== Introduction

You [what was just built in previous challenge]. Now you can answer business questions that would require complex JOINs in SQL.

In this lesson, you will query [what was built] and compare the Cypher queries to their SQL equivalents.
```

**Example:**

```asciidoc
[.slide.discrete]
== Introduction

You created relationships between Order and Product nodes. Now you can traverse the complete Customer → Order → Product path with simple queries.

In this lesson, you will answer business questions using multi-hop traversals and compare them to the equivalent SQL queries.
```

---

## Phase 4: Write Query Sections (30 min)

### Checklist: Query Section Structure
- [ ] Business question in plain language
- [ ] Context before code (why this query)
- [ ] Cypher query with title
- [ ] Explanation after code (what it does)
- [ ] "Click **Run**" encouragement
- [ ] SQL comparison side-by-side
- [ ] Metrics or concrete comparison
- [ ] Why graph is better for THIS specific pattern

### Query Section Pattern

```asciidoc
[.slide]
== [Business Question as Header]

[Plain language business question]

[source,cypher]
.[Descriptive query title]
----
[Cypher query here]
----

[Explanation of what query does]

Click **Run** to see the results.

**SQL equivalent:**

[source,sql]
----
[SQL query here]
----

**Comparison:**
* [Specific advantage 1]
* [Specific advantage 2]
```

### Example Query Section

```asciidoc
[.slide]
== Finding Customer Purchases

What products has a specific customer purchased?

[source,cypher]
.Products purchased by customer
----
MATCH (c:Customer {id: 'ALFKI'})
      -[:PLACED]->(:Order)
      -[:ORDERS]->(p:Product)
RETURN DISTINCT p.name AS product
ORDER BY product;
----

This query starts at a customer, traverses through their orders, and collects all products they've purchased.

Click **Run** to see all products purchased by customer ALFKI.

**SQL equivalent:**

[source,sql]
----
SELECT DISTINCT p.productName
FROM customers c
JOIN orders o ON c.customerId = o.customerId
JOIN order_details od ON o.orderId = od.orderId
JOIN products p ON od.productId = p.productId
WHERE c.customerId = 'ALFKI'
ORDER BY p.productName;
----

**Comparison:**

* **Cypher:** 2 relationship hops, reads like the question
* **SQL:** 3 JOIN operations scanning intermediate tables
* **Performance:** Graph traversal is O(k) where k = number of connections; SQL JOIN is O(n×m) where n,m = table sizes
```

### SQL Comparison Patterns

**Side-by-side blocks:**

```asciidoc
[.slide]
== Query Comparison

**Cypher:**

[source,cypher]
----
MATCH (c:Customer)-[:PLACED]->(o:Order)
WHERE c.id = 'ALFKI'
RETURN count(o) AS orderCount;
----

**SQL:**

[source,sql]
----
SELECT COUNT(o.orderId) AS orderCount
FROM customers c
JOIN orders o ON c.customerId = o.customerId
WHERE c.customerId = 'ALFKI';
----
```

**Two-column layout:**

```asciidoc
[.slide.col-2]
== Query Comparison

[.col]
====
**Cypher:**

[source,cypher]
----
MATCH (c:Customer)
      -[:PLACED]->
      (o:Order)
RETURN c.name, count(o)
----
====

[.col]
====
**SQL:**

[source,sql]
----
SELECT c.companyName,
       COUNT(o.orderId)
FROM customers c
LEFT JOIN orders o
  ON c.customerId = o.customerId
GROUP BY c.companyName
----
====
```

---

## Phase 5: Create Metrics Table (10 min)

### Checklist: Comparison Metrics
- [ ] Table shows Cypher vs SQL
- [ ] Includes: Lines, JOINs, Complexity
- [ ] Optional: Performance, Readability
- [ ] Uses AsciiDoc table format
- [ ] Concrete numbers, not vague claims

### Metrics Table Pattern

```asciidoc
[.slide]
== Cypher vs SQL Comparison

[options="header"]
|===
| Metric | Cypher | SQL

| Lines of code | [N] | [M]
| JOIN operations | 0 | [N]
| Complexity | O(k) | O(n×m)
| Readability | Matches question structure | Multiple JOIN clauses
|===

**Key insight:** [Specific advantage for THIS query pattern]
```

**Example:**

```asciidoc
[.slide]
== Multi-Hop Traversal Comparison

[options="header"]
|===
| Metric | Cypher | SQL

| Lines of code | 4 | 8
| JOIN operations | 0 | 3
| Tables accessed | 0 | 4 (customers, orders, order_details, products)
| Complexity | O(k) - k relationships | O(n×m×p) - table sizes
| Readability | Path-based, visual | Multiple JOIN conditions
|===

**Key insight:** For connected data queries, graph traversal eliminates expensive JOIN operations that scan entire tables.
```

---

## Phase 6: Explain Advantages (10 min)

### Checklist: Value Proposition
- [ ] Explains WHY graph is better for THIS pattern
- [ ] Uses concrete metrics (lines, JOINs, complexity)
- [ ] Avoids sales language ("powerful", "amazing")
- [ ] Focuses on specific technical advantages
- [ ] Connects to business value

### Advantage Explanation Patterns

**Performance explanation:**

```asciidoc
[.slide]
== Performance Advantage

**Relational approach:**
* Scans entire tables for JOIN conditions
* Creates intermediate result sets
* Complexity grows with table sizes: O(n×m)

**Graph approach:**
* Follows direct relationship pointers
* No table scans or intermediate results
* Complexity grows with connection count: O(k)

For highly connected data, graph traversal maintains constant performance as data volume increases.
```

**Simplicity explanation:**

```asciidoc
[.slide]
== Simplicity Advantage

**Graph queries read like the questions you're asking:**

* "What products did this customer buy?" →
  `(Customer)-[:PLACED]->(:Order)-[:ORDERS]->(Product)`

**SQL requires understanding schema implementation:**

* Which tables to JOIN
* Which foreign keys to match
* ORDER of JOIN operations
```

### Anti-Patterns to AVOID

❌ **Vague sales claims:**
```
Graphs are powerful and provide amazing performance.
```

✅ **Concrete technical facts:**
```
Graph traversal is O(k) where k = number of relationships, vs SQL JOIN which is O(n×m) where n,m = table sizes.
```

❌ **Generic statements:**
```
Cypher is easier to read and write.
```

✅ **Specific comparison:**
```
Cypher: 4 lines, 0 JOINs. SQL: 8 lines, 3 JOINs scanning 4 tables.
```

---

## Phase 7: Connect to Workshop Goal (5 min)

### Checklist: Goal Connection
- [ ] Explains how this enables the final goal
- [ ] References recommendation query or end deliverable
- [ ] Shows progression from current state to end goal
- [ ] 2-3 sentences

### Connection Pattern

```asciidoc
[.slide]
== Building Toward [Workshop Goal]

[Current capability statement]

[How this pattern extends for final goal]

[What comes next to complete the path]
```

**Example:**

```asciidoc
[.slide]
== Building Toward Recommendations

You can now traverse Customer → Order → Product to find what each customer has purchased.

To build a recommendation query, you'll extend this pattern: find customers who bought similar products, then recommend products they haven't purchased yet.

This multi-hop traversal pattern is the foundation for collaborative filtering.
```

---

## Phase 8: Write Summary (5 min)

### Checklist: Summary Section
- [ ] Lists queries covered
- [ ] States what was proven
- [ ] Includes SQL comparison summary
- [ ] Forward reference to next lesson
- [ ] Uses [.summary] marker

### Summary Pattern

```asciidoc
[.summary]
== Summary

In this lesson, you validated [what was built] by answering business questions:

* **[Query 1]** - [What it showed]
* **[Query 2]** - [What it showed]
* **[Query 3]** - [What it showed]

**Cypher vs SQL:** [N] lines vs [M] lines, [X] JOINs eliminated

In the next lesson, you will [what comes next].
```

**Example:**

```asciidoc
[.summary]
== Summary

In this lesson, you validated the Customer → Order → Product path by answering business questions:

* **Customer purchases** - Found all products a customer bought
* **Popular products** - Identified most frequently ordered items
* **Order totals** - Calculated spending per customer

**Cypher vs SQL:** 4 lines vs 8 lines, 3 JOINs eliminated, O(k) vs O(n×m) complexity

In the next lesson, you will learn how to find similar customers using bidirectional traversals.
```

---

## Phase 9: Apply Style Rules (10 min)

### Checklist: Technical Requirements
- [ ] Two line breaks between ALL sections
- [ ] [.slide.discrete] for introduction
- [ ] [.slide] for main sections
- [ ] [.summary] for summary
- [ ] All code blocks have descriptive titles
- [ ] SQL comparisons shown for each query
- [ ] Metrics table uses AsciiDoc format
- [ ] No sales language, concrete facts only
- [ ] "Click **Run**" encouragement after Cypher queries

### Code Block Requirements

**Every Cypher query:**
- Context before (why this query)
- Descriptive title
- Explanation after (what it does)
- "Click **Run**" prompt
- Experiment suggestions (optional)

**Every SQL query:**
- Shown for comparison
- Same business question
- No "Click Run" (not executable in workshop)

---

## Phase 10: Review and Refine (10 min)

### Checklist: Self-Review
- [ ] Re-read lesson aloud
- [ ] Check timing (3-5 minutes to read)
- [ ] All queries tested and correct
- [ ] SQL comparisons are accurate
- [ ] Metrics are concrete (not vague)
- [ ] Advantages are specific to this pattern
- [ ] Connection to workshop goal is clear
- [ ] No sales language or AI artifacts
- [ ] Two line breaks between sections

### Test Queries

**Before completing:**

1. **Test each Cypher query:**
   - Returns expected results?
   - Syntax is correct?
   - Uses workshop dataset?
   - Property names match (id, name not customerId, productName)?

2. **Verify SQL equivalents:**
   - Produces same results as Cypher?
   - Accurately represents relational approach?
   - Fair comparison (not intentionally bad SQL)?

3. **Check metrics:**
   - Line counts accurate?
   - JOIN counts correct?
   - Performance claims defensible?

---

## Examples and References

### Example Validation Lessons

**See these real files:**

- `modules/4-many-to-many/lessons/4-multi-hop-traversals/lesson.adoc`
  - Demonstrates: Multi-hop queries, SQL comparisons, metrics table

- `modules/3-modeling-relationships/lessons/3-traversing-relationships/lesson.adoc`
  - Demonstrates: Simple traversals, explaining advantages

- `modules/5-final-review/lessons/1-recommendation-query/lesson.adoc`
  - Demonstrates: Complex query with full SQL comparison

### What These Files Demonstrate

**4-multi-hop-traversals/lesson.adoc:**
- Shows queries on data just imported
- Includes SQL comparison side-by-side
- Provides metrics table (Lines | JOINs | Performance | Readability)
- Explains advantages concretely (O(k) vs O(n×m))
- Multiple query examples building in complexity
- Connects pattern to final recommendation goal

**Key patterns:**
- Business questions as headers
- Cypher query with `.Title`
- SQL equivalent in separate block
- Concrete comparison (4 lines vs 8 lines, 0 JOINs vs 3 JOINs)
- "Click **Run**" encouragement
- Metrics table with AsciiDoc format

---

## Common SQL Comparison Scenarios

### Single-Hop Traversal

**Cypher:**
```cypher
MATCH (c:Customer {id: 'ALFKI'})-[:PLACED]->(o:Order)
RETURN c.name, o.id, o.date;
```

**SQL:**
```sql
SELECT c.companyName, o.orderId, o.orderDate
FROM customers c
JOIN orders o ON c.customerId = o.customerId
WHERE c.customerId = 'ALFKI';
```

**Comparison:** 1 line vs 4 lines, 1 JOIN

---

### Multi-Hop Traversal

**Cypher:**
```cypher
MATCH (c:Customer {id: 'ALFKI'})
      -[:PLACED]->(:Order)
      -[:ORDERS]->(p:Product)
RETURN DISTINCT p.name;
```

**SQL:**
```sql
SELECT DISTINCT p.productName
FROM customers c
JOIN orders o ON c.customerId = o.customerId
JOIN order_details od ON o.orderId = od.orderId
JOIN products p ON od.productId = p.productId
WHERE c.customerId = 'ALFKI';
```

**Comparison:** 4 lines vs 7 lines, 3 JOINs, 4 tables

---

### Bidirectional Traversal

**Cypher:**
```cypher
MATCH (c1:Customer {id: 'ALFKI'})
      -[:PLACED]->(:Order)
      -[:ORDERS]->(p:Product)
      <-[:ORDERS]-(:Order)
      <-[:PLACED]-(c2:Customer)
WHERE c1 <> c2
RETURN c2.name, count(DISTINCT p) AS sharedProducts;
```

**SQL:**
```sql
SELECT c2.companyName, COUNT(DISTINCT p2.productId)
FROM customers c1
JOIN orders o1 ON c1.customerId = o1.customerId
JOIN order_details od1 ON o1.orderId = od1.orderId
JOIN products p1 ON od1.productId = p1.productId
JOIN order_details od2 ON p1.productId = od2.productId
JOIN orders o2 ON od2.orderId = o2.orderId
JOIN customers c2 ON o2.customerId = c2.customerId
WHERE c1.customerId = 'ALFKI' AND c1.customerId <> c2.customerId
GROUP BY c2.companyName;
```

**Comparison:** 7 lines vs 11 lines, 6 JOINs, exponential complexity

---

## Output Checklist

Before marking validation lesson complete, verify:

- [ ] File: `lesson.adoc` exists
- [ ] Metadata: `:type: lesson`, `:order: X`, `:duration: 3-5`
- [ ] Source attribution in comments
- [ ] Introduction references what was built
- [ ] 2-4 business question queries
- [ ] Each Cypher query has: context, title, explanation, "Run" prompt
- [ ] Each query has SQL comparison
- [ ] Metrics table with concrete numbers
- [ ] Advantages explained with specifics
- [ ] Connection to workshop goal stated
- [ ] Summary with forward reference
- [ ] All queries tested and working
- [ ] SQL comparisons accurate
- [ ] Two line breaks between sections
- [ ] No markdown, only AsciiDoc
- [ ] No sales language, factual comparisons only

---

## References

- [CONTENT_GUIDELINES.md](../../asciidoc/courses/workshop-importing/CONTENT_GUIDELINES.md) - SQL comparison patterns
- [HOW-TO-BUILD-WORKSHOPS.md](../../../docs/workshops/HOW-TO-BUILD-WORKSHOPS.md) - Validation methodology
- [modules/4-many-to-many/lessons/4-multi-hop-traversals/](../../asciidoc/courses/workshop-importing/modules/4-many-to-many/lessons/4-multi-hop-traversals/) - Complete example
