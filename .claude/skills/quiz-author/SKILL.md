---
name: quiz-author
description: Write knowledge check quizzes
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Quiz Author Skill

**Purpose:** Write knowledge check quizzes that test understanding of workshop concepts.

**When to use:** Workshop requires a quiz to test learner comprehension (usually final module).

**Prerequisites:**
- WORKSHOP-PLAN.md exists with quiz details
- Skeleton lesson.adoc file exists
- All prior modules completed
- Concepts to test identified

---

## Overview

This skill writes **quiz lessons** that:
- Test understanding with 8-12 multiple choice questions
- Cover concepts from across the workshop
- Use `[.question]` format (NOT `.freetext`)
- Include hints and solutions for each question
- Are typically the final or second-to-final lesson

**Do NOT write concept lessons, challenges, or practice lessons.** This skill focuses ONLY on quiz lessons.

---

## Phase 1: Understand Quiz Scope (10 min)

### Checklist: Gather Information
- [ ] Read WORKSHOP-PLAN.md for quiz details
- [ ] Review all prior workshop lessons
- [ ] List concepts to test (from each module)
- [ ] Determine question count (8-12 typical)
- [ ] Note if this is the final lesson (completion modal)
- [ ] Identify learning objectives from each module

### Key Questions to Answer

**Before writing anything, answer:**

1. **What concepts should be tested?** (one question per major concept)
2. **Which modules to cover?** (usually all modules)
3. **How many questions?** (8-12 recommended)
4. **Is this the final lesson?** (if yes, must trigger completion)
5. **What should learners recall?** (facts, patterns, best practices)
6. **What misconceptions exist?** (wrong answers should be plausible)

### Read These Files

```
MUST READ:
- WORKSHOP-PLAN.md (for quiz scope)
- All prior workshop lessons (for concepts covered)
- CONTENT_GUIDELINES.md (for question format)

REFERENCE:
- modules/5-final-review/lessons/2-knowledge-check/ (complete example)
- Question format examples in CONTENT_GUIDELINES.md
```

---

## Phase 2: Plan Quiz Structure (15 min)

### Checklist: Quiz Outline
- [ ] 8-12 questions identified
- [ ] Each question tests one specific concept
- [ ] Questions cover all modules
- [ ] Mix of difficulty levels
- [ ] Wrong answers are plausible (not obvious)
- [ ] Each question has hint and solution

### Quiz Structure Template

```
Quiz Introduction
└── Brief statement about testing knowledge

Questions
├── Question 1: Module 1 concept
├── Question 2: Module 1 concept
├── Question 3: Module 2 concept
├── Question 4: Module 2 concept
├── Question 5: Module 3 concept
├── Question 6: Module 3 concept
├── Question 7: Module 4 concept
├── Question 8: Module 4 concept
├── Question 9: Integration question
└── Question 10: Best practices question

Summary
└── Congratulations and next steps
```

### Question Distribution

**Recommended distribution for a 4-module workshop:**

- Module 1 (Setup): 1-2 questions
- Module 2 (Foundation): 3-4 questions
- Module 3 (Relationships): 2-3 questions
- Module 4 (Integration): 2-3 questions
- Best practices/integration: 1-2 questions

**Total:** 8-12 questions

---

## Phase 3: Create Main Quiz File (10 min)

### Checklist: lesson.adoc Structure
- [ ] Metadata: `:type: quiz`, `:sequential: true`
- [ ] Brief introduction
- [ ] Includes all question files
- [ ] Summary with congratulations
- [ ] If final lesson: triggers completion modal

### Main Quiz File Pattern

```asciidoc
= Knowledge Check
:type: quiz
:sequential: true
:order: X

// Source: [course-name]/modules/X/lessons/Y-quiz


Test your understanding of the workshop concepts.


include::questions/01-[topic].adoc[leveloffset=+1]

include::questions/02-[topic].adoc[leveloffset=+1]

include::questions/03-[topic].adoc[leveloffset=+1]

include::questions/04-[topic].adoc[leveloffset=+1]

include::questions/05-[topic].adoc[leveloffset=+1]

include::questions/06-[topic].adoc[leveloffset=+1]

include::questions/07-[topic].adoc[leveloffset=+1]

include::questions/08-[topic].adoc[leveloffset=+1]

include::questions/09-[topic].adoc[leveloffset=+1]

include::questions/10-[topic].adoc[leveloffset=+1]


[.summary]
== Summary

Congratulations on completing the [Workshop Name]!

You've successfully:

* [Achievement 1]
* [Achievement 2]
* [Achievement 3]

**Continue learning:**
* link:/courses/[course-slug]/[[Next Course Name]^]
* link:/courses/[course-slug]/[[Advanced Course]^]

read::Mark as completed[]
```

**Example:**

```asciidoc
= Knowledge Check
:type: quiz
:sequential: true
:order: 2

// Source: neo4j-fundamentals/modules/5-review/lessons/1-knowledge-check


Test your understanding of graph data modeling, importing, and querying.


include::questions/01-node-identification.adoc[leveloffset=+1]

include::questions/02-relationships-vs-properties.adoc[leveloffset=+1]

include::questions/03-many-to-many.adoc[leveloffset=+1]

include::questions/04-bidirectional-traversals.adoc[leveloffset=+1]

include::questions/05-collection-filtering.adoc[leveloffset=+1]

include::questions/06-data-quality.adoc[leveloffset=+1]

include::questions/07-graph-advantages.adoc[leveloffset=+1]

include::questions/08-recommendation-pattern.adoc[leveloffset=+1]


[.summary]
== Summary

Congratulations on completing the Northwind Import Workshop!

You've successfully:

* Modeled business data as a graph
* Imported CSV files using Data Importer
* Written Cypher queries to answer business questions
* Built a recommendation query using collaborative filtering

**Continue learning:**
* link:/courses/cypher-fundamentals/[Cypher Fundamentals^]
* link:/courses/modeling-fundamentals/[Modeling Fundamentals^]

read::Mark as completed[]
```

---

## Phase 4: Write Question Files (60 min)

### Checklist: Question File Structure
- [ ] One file per question (01-topic.adoc)
- [ ] Uses `[.question]` marker (NOT `.freetext`)
- [ ] Question title in title case
- [ ] Question text with clear ask
- [ ] 4 answer options (single or multiple choice)
- [ ] Correct answer(s) marked with [x]
- [ ] Hint that guides without giving answer
- [ ] Solution that explains why answer is correct

### Question File Pattern

```asciidoc
[.question]
= Question Title in Title Case

Question text asking about specific concept?

- [ ] A. Wrong answer with plausible reason
- [x] B. Correct answer
- [ ] C. Wrong answer with plausible reason
- [ ] D. Wrong answer with plausible reason

[TIP,role=hint]
.Hint
====
[Guidance toward solution without giving it away]
====

[TIP,role=solution]
.Solution
====
**B is correct:** [Explanation of why B is the right answer]

**Why others are wrong:**
* A: [Reason this is incorrect]
* C: [Reason this is incorrect]
* D: [Reason this is incorrect]

**Recall Module [N]:** [Reference to where this was taught]
====
```

### Example Question 1 (Single Choice)

File: `questions/01-node-identification.adoc`

```asciidoc
[.question]
= Identifying Graph Nodes

When modeling business data as a graph, which of the following should be represented as a node?

- [ ] A. A customer's email address
- [x] B. A customer entity with properties
- [ ] C. The relationship between a customer and an order
- [ ] D. The quantity of products in an order

[TIP,role=hint]
.Hint
====
Think about what has independent existence and can have its own properties and relationships.
====

[TIP,role=solution]
.Solution
====
**B is correct:** A customer entity should be represented as a node because it has independent existence, its own properties (name, email, address), and can be connected to other entities through relationships.

**Why others are wrong:**
* A: Email address is a property of a customer, not a separate entity
* C: Relationships connect nodes, they are not nodes themselves
* D: Quantity is a property that belongs on the relationship between an order and a product

**Recall Module 2:** Nodes represent entities with independent existence in your domain model.
====
```

### Example Question 2 (Multiple Choice)

File: `questions/02-graph-advantages.adoc`

```asciidoc
[.question]
= Graph Database Advantages

Which of the following are advantages of using a graph database for connected data? **Select all that apply.**

- [x] A. Relationships are traversed efficiently without JOIN operations
- [ ] B. All queries are automatically faster than SQL
- [x] C. Query complexity stays constant as relationship depth increases
- [x] D. Queries read like the questions you're asking

[TIP,role=hint]
.Hint
====
Focus on specific technical advantages related to how relationships work, not general performance claims.
====

[TIP,role=solution]
.Solution
====
**A, C, and D are correct:**

* **A is correct:** Graph databases store relationship pointers, enabling O(k) traversal complexity without scanning tables
* **C is correct:** Traversal performance depends on connection count (k), not table sizes (n×m), so adding more hops doesn't exponentially increase complexity
* **D is correct:** Cypher patterns like `(Customer)-[:PLACED]->(Order)` mirror natural language questions

**Why B is wrong:**
* Not ALL queries are faster - graphs excel at connected data queries, but simple aggregations or full table scans may perform similarly to SQL
* Performance depends on the query pattern and data structure

**Recall Module 4:** We compared Cypher multi-hop traversals (O(k)) to SQL JOINs (O(n×m)) and showed specific advantages for relationship-heavy queries.
====
```

---

## Phase 5: Write Hints (20 min)

### Checklist: Hint Requirements
- [ ] Guides learner toward answer
- [ ] Does NOT give away the answer
- [ ] Friendly and empathetic tone
- [ ] References key concepts
- [ ] Helps learner reason through it

### Good Hint Patterns

**Pattern 1: Reference concept**
```asciidoc
[TIP,role=hint]
.Hint
====
Think about what happens when you need to find data that's several relationship hops away in SQL vs Cypher.
====
```

**Pattern 2: Ask guiding question**
```asciidoc
[TIP,role=hint]
.Hint
====
Which option represents something with independent existence that can have its own properties and relationships?
====
```

**Pattern 3: Provide checklist**
```asciidoc
[TIP,role=hint]
.Hint
====
Consider these criteria:

* Does it have independent existence?
* Can it have its own properties?
* Does it connect to other entities?
====
```

### Hint Anti-Patterns to AVOID

❌ **Giving away the answer:**
```asciidoc
The correct answer is B because customers are nodes.
```

❌ **Antagonistic tone:**
```asciidoc
This should be obvious if you paid attention during Module 2.
```

❌ **Vague and unhelpful:**
```asciidoc
Review the lesson materials.
```

✅ **Good hint:**
```asciidoc
Nodes represent entities with independent existence. Properties are attributes of those entities.
```

---

## Phase 6: Write Solutions (20 min)

### Checklist: Solution Requirements
- [ ] States correct answer(s) in bold
- [ ] Explains WHY it's correct
- [ ] Explains why wrong answers are wrong
- [ ] References module where concept was taught
- [ ] Friendly, educational tone

### Solution Pattern

```asciidoc
[TIP,role=solution]
.Solution
====
**[Letter] is correct:** [Explanation of why this is the right answer]

**Why others are wrong:**
* [Letter]: [Specific reason]
* [Letter]: [Specific reason]
* [Letter]: [Specific reason]

**Recall Module [N]:** [Reference to where this was taught]
====
```

### Example Solutions

**Example 1: Single correct answer**

```asciidoc
[TIP,role=solution]
.Solution
====
**C is correct:** Cypher uses `MATCH (n:Label)` syntax to find nodes by their label.

**Why others are wrong:**
* A: `FIND` is not a Cypher clause - use `MATCH` instead
* B: `SELECT` is SQL syntax, not Cypher
* D: `GET` is not a Cypher clause

**Recall Module 2:** You learned the basic Cypher pattern syntax in the Cypher Primer lesson.
====
```

**Example 2: Multiple correct answers**

```asciidoc
[TIP,role=solution]
.Solution
====
**A and C are correct:**

* **A is correct:** Relationship properties store data that belongs to the connection between two entities (like quantity on an ORDER relationship)
* **C is correct:** Properties can be used for filtering without requiring additional JOINs or table scans

**Why others are wrong:**
* B: Relationship properties don't eliminate the need for relationships - they enhance them
* D: You can still query data with properties - this is a primary use case

**Recall Module 3:** The lesson on modeling relationships explained when to use relationship properties vs node properties.
====
```

---

## Phase 7: Question Quality Review (15 min)

### Checklist: Question Quality
- [ ] Question tests understanding, not memorization
- [ ] All answer options are plausible
- [ ] Wrong answers represent common misconceptions
- [ ] Question is fair (answer was taught in workshop)
- [ ] Clear what's being asked
- [ ] Not tricky or deliberately confusing

### Good vs Bad Questions

**❌ BAD - Trivia/memorization:**
```
What is the default port number for Neo4j?
- [ ] A. 7474
- [x] B. 7687
- [ ] C. 8080
- [ ] D. 3000
```

**✅ GOOD - Understanding/application:**
```
You need to find customers who ordered the same products. Which pattern should you use?

- [ ] A. Single-hop traversal
- [ ] B. Aggregation with GROUP BY
- [x] C. Bidirectional traversal through products
- [ ] D. Direct Customer-Customer relationship
```

**❌ BAD - Obvious wrong answers:**
```
Which is a graph database?
- [x] A. Neo4j
- [ ] B. Microsoft Word
- [ ] C. Photoshop
- [ ] D. Calculator
```

**✅ GOOD - Plausible wrong answers:**
```
Which is best suited for highly connected data?
- [x] A. Graph database
- [ ] B. Document database (good for nested data, not connected)
- [ ] C. Key-value store (good for simple lookups, not connected)
- [ ] D. Relational database (works but requires complex JOINs)
```

---

## Phase 8: Apply Style Rules (10 min)

### Checklist: Technical Requirements
- [ ] Main file: `:type: quiz`, `:sequential: true`
- [ ] Each question file: `[.question]` marker (NOT `.freetext`)
- [ ] Question titles in title case
- [ ] Checkbox syntax: `- [x]` for correct, `- [ ]` for wrong
- [ ] Hint uses `[TIP,role=hint]`
- [ ] Solution uses `[TIP,role=solution]`
- [ ] Include statements use `leveloffset=+1`
- [ ] Summary has congratulations and next steps
- [ ] No markdown, only AsciiDoc

### Question Type Markers

**CRITICAL:** Use correct marker based on question type.

**Multiple choice (default):**
```asciidoc
[.question]
= Question Title
```

**Fill-in-the-blank code:**
```asciidoc
[.question.select-in-source]
= Question Title
```

**Database verification (challenges only):**
```asciidoc
[.verify.slide]
== Validate Results
```

**NEVER use for multiple choice:**
```asciidoc
[.question.freetext]  ❌ WRONG - only for open-ended text entry
```

---

## Phase 9: Review and Refine (15 min)

### Checklist: Self-Review
- [ ] Re-read all questions aloud
- [ ] Check that concepts were taught in workshop
- [ ] Verify answer keys are correct
- [ ] Test that hints guide without revealing
- [ ] Confirm solutions explain fully
- [ ] All questions reference module taught
- [ ] No typos or grammar errors
- [ ] Congratulatory tone in summary
- [ ] Next steps provided

### Test Questions

**Before completing:**

1. **Can you answer each question?**
   - Was this taught in the workshop?
   - Is the correct answer defensible?
   - Are wrong answers plausible?

2. **Are hints helpful?**
   - Do they guide reasoning?
   - Do they avoid giving answer away?
   - Are they friendly and empathetic?

3. **Are solutions complete?**
   - Explain why correct answer is right?
   - Explain why wrong answers are wrong?
   - Reference where concept was taught?

---

## Examples and References

### Example Quiz Lesson

**See this real file:**

- `modules/5-final-review/lessons/2-knowledge-check/`
  - Files: lesson.adoc + questions/01-10.adoc
  - Demonstrates: Quiz structure, question types, hints, solutions

### What This File Demonstrates

**2-knowledge-check/lesson.adoc:**
- `:type: quiz` and `:sequential: true` metadata
- Includes all question files with leveloffset=+1
- Summary with congratulations
- Next learning steps

**Question files:**
- `[.question]` marker (NOT `.freetext`)
- Title case question titles
- 4 answer options each
- Checkbox syntax for answers
- Hint with guidance
- Solution with full explanation + module reference

**Question topics covered:**
1. Node identification
2. Relationships vs properties
3. Many-to-many patterns
4. Bidirectional traversals
5. Collection filtering
6. Specific relationship types
7. Data quality
8. Graph advantages
9. Property renaming
10. Recommendation query pattern

---

## Question Topic Ideas

### Module 1: Setup
- Tool identification (Data Importer, Query tool)
- Instance management
- Data file formats

### Module 2: Foundation
- Node identification (what should be a node)
- Property vs node decisions
- Label usage
- Cypher syntax basics

### Module 3: Relationships
- Relationship direction
- Relationship properties
- When to use relationships vs properties
- Traversal patterns

### Module 4: Many-to-Many
- Pivot tables vs relationships
- Multi-hop traversals
- Bidirectional patterns
- Collection operations

### Module 5: Integration
- Query optimization
- Best practices
- Graph advantages
- Common patterns (recommendation, pathfinding)

---

## Output Checklist

Before marking quiz complete, verify:

- [ ] File: `lesson.adoc` exists with `:type: quiz`
- [ ] Files: All question files (01-XX.adoc) exist
- [ ] Metadata: `:sequential: true` (if questions build on each other)
- [ ] 8-12 questions total
- [ ] Each question has `[.question]` marker
- [ ] Each question has 4 answer options
- [ ] Correct answers marked with [x]
- [ ] Each question has hint with [TIP,role=hint]
- [ ] Each question has solution with [TIP,role=solution]
- [ ] Solutions reference module where taught
- [ ] Summary has congratulations
- [ ] Next learning steps provided
- [ ] No markdown, only AsciiDoc
- [ ] All questions tested for accuracy

---

## References

- [CONTENT_GUIDELINES.md](../../asciidoc/courses/workshop-importing/CONTENT_GUIDELINES.md) - Question format section
- [HOW-TO-BUILD-WORKSHOPS.md](../../../docs/workshops/HOW-TO-BUILD-WORKSHOPS.md) - Quiz requirements
- [modules/5-final-review/lessons/2-knowledge-check/](../../asciidoc/courses/workshop-importing/modules/5-final-review/lessons/2-knowledge-check/) - Complete example
- [review-lesson-content.mdc](../review-lesson-content.mdc) - Question review checklist
