---
name: overview-author
description: Write workshop and module overviews
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Overview Author Skill

**Purpose:** Write workshop and module overview lessons.

**When to use:** Workshop needs an overview lesson (always first lesson) or module needs an overview (module.adoc).

**Prerequisites:**
- WORKSHOP-PLAN.md exists with workshop/module details
- Understanding of workshop goal and outcomes
- Knowledge of module structure

---

## Overview

This skill writes **overview lessons** for:
- **Workshop overviews** - First lesson of every workshop (Module 1, Lesson 1)
- **Module overviews** - Introduction to each module (module.adoc)

**Do NOT write concept lessons, challenges, or practice lessons.** This skill focuses ONLY on overviews.

---

## Part A: Workshop Overview Lessons

### Phase 1: Understand Workshop Goal (10 min)

#### Checklist: Gather Information
- [ ] Read WORKSHOP-PLAN.md for workshop goals
- [ ] Identify concrete deliverable
- [ ] List all modules and their building blocks
- [ ] Note prerequisites
- [ ] Determine duration (core + optional)
- [ ] Understand value proposition

#### Key Questions to Answer

**Before writing anything, answer:**

1. **What will learners build?** (concrete end deliverable)
2. **Why does it matter?** (value proposition, business benefit)
3. **What are the modules?** (list with building blocks)
4. **Who is this for?** (target audience, prerequisites)
5. **How long will it take?** (core path + optional)
6. **What's the progression?** (how modules build on each other)

#### Read These Files

```
MUST READ:
- WORKSHOP-PLAN.md (for workshop structure)
- CONTENT_GUIDELINES.md (for style rules)
- HOW-TO-BUILD-WORKSHOPS.md (for methodology)

REFERENCE:
- modules/1-aura-setup/lessons/1-workshop-overview/lesson.adoc
```

---

### Phase 2: Plan Workshop Overview Structure (10 min)

#### Checklist: Overview Outline
- [ ] THE GOAL stated upfront
- [ ] What will be built
- [ ] Module-by-module progression
- [ ] Prerequisites clearly listed
- [ ] Duration expectations set
- [ ] Value proposition motivated

#### Workshop Overview Structure

```
Introduction
└── States THE GOAL immediately

What You'll Build
├── Concrete deliverable
└── What it demonstrates

Module Progression
├── Module 1: [Transformation]
├── Module 2: [Transformation]
├── Module 3: [Transformation]
└── Module N: [Final integration]

Prerequisites
└── Required knowledge/tools

Duration
├── Core path: X hours
└── With optional: Y hours

Why This Matters
└── Value proposition (factual, not sales)

Summary
└── Call to action: "Ready? Let's go →"
```

---

### Phase 3: Write Workshop Overview Content (30 min)

#### Checklist: Content Sections
- [ ] Opening states THE GOAL immediately
- [ ] Shows what will be built
- [ ] Module-by-module outline
- [ ] Prerequisites clear
- [ ] Duration stated
- [ ] Motivates with value (factual, not sales)
- [ ] Ends with "let's go" button

#### Workshop Overview Pattern

```asciidoc
= Workshop Overview: [What They'll Build]
:type: lesson
:order: 1

// Source: Adapted from [course-name]/[lesson]


[.slide.discrete]
== Introduction

In this workshop, you will [concrete action and deliverable].


[.slide]
== The Goal

By the end of this workshop, you will have built [concrete deliverable].

[Explain what this demonstrates or enables]


[.slide]
== What You'll Learn

This workshop guides you through [X] modules:

**Module 1: [Name]**
* [What you'll do]
* [Building block completion]

**Module 2: [Name]**
* [What you'll do]
* [Building block completion]

**Module 3: [Name]**
* [What you'll do]
* [Building block completion]

**Module N: [Name]**
* [What you'll do]
* [Building block completion]


[.slide]
== Prerequisites

To complete this workshop, you should have:

* [Prerequisite 1]
* [Prerequisite 2]
* [Prerequisite 3]

**Tools needed:**
* [Tool 1] - [Why]
* [Tool 2] - [Why]


[.slide]
== Duration

**Core path:** [X] hours
* All required lessons
* Essential concepts and challenges

**With optional lessons:** [Y] hours
* Additional practice exercises
* Deeper exploration of concepts

**Pace yourself:**
* Take breaks between modules
* Optional lessons can be completed as homework


[.slide]
== Why [This Approach]?

[Factual value proposition - NOT sales language]

[Specific benefits:]
* [Benefit 1 with concrete example]
* [Benefit 2 with concrete example]
* [Benefit 3 with concrete example]


[.summary]
== Summary

In this workshop, you will:

* [Outcome 1]
* [Outcome 2]
* [Outcome 3]

**Time commitment:** [X] hours core, [Y] hours with optional lessons

Ready to get started?

read::Let's go![]
```

#### Example Workshop Overview

```asciidoc
= Workshop Overview: Import and Query the Northwind Dataset
:type: lesson
:order: 1

// Source: Adapted from modeling-fundamentals and importing-fundamentals


[.slide.discrete]
== Introduction

In this workshop, you will import a business dataset into a graph database and build queries to answer business questions.


[.slide]
== The Goal

By the end of this workshop, you will have built **a complete recommendation query** that finds similar customers and suggests products they might like.

This demonstrates how graph databases excel at connected data queries that would require complex JOINs in SQL.


[.slide]
== What You'll Learn

This workshop guides you through 5 modules:

**Module 1: Aura Setup**
* Create a free Neo4j Aura instance
* Understand the tools you'll use
* Prepare your environment

**Module 2: Building Your Graph**
* Model business data as nodes and relationships
* Import products using Data Importer
* Query your graph with Cypher

**Module 3: Basic Relationships**
* Import customers and orders
* Create relationships between entities
* Traverse the Customer → Order path

**Module 4: Many-to-Many Relationships**
* Model order line items
* Create the full Customer → Order → Product path
* Write multi-hop traversal queries

**Module 5: Building Recommendations**
* Find similar customers
* Use collaborative filtering patterns
* Build the complete recommendation query


[.slide]
== Prerequisites

To complete this workshop, you should have:

* Basic understanding of databases (SQL helpful but not required)
* Familiarity with CSV files and data structures
* Comfort with reading and modifying query syntax

**Tools needed:**
* **Web browser** - Chrome, Firefox, or Safari
* **Neo4j Aura Free account** - We'll create this in Module 1


[.slide]
== Duration

**Core path:** 2 hours
* All required lessons
* Essential modeling, importing, and querying

**With optional lessons:** 3 hours
* Additional query practice
* Deeper exploration of patterns

**Pace yourself:**
* Each module takes 20-30 minutes
* Take breaks between modules
* Optional lessons can be completed as homework


[.slide]
== Why Graphs for Connected Data?

Graph databases are well-suited for connected data because relationships are stored as first-class citizens with direct pointers, not foreign keys requiring table scans.

**Concrete advantages:**
* **Simpler queries** - No JOIN operations for relationship traversals
* **Constant performance** - O(k) complexity based on connections, not table sizes (O(n×m))
* **Natural modeling** - Queries read like the questions you're asking

**Example:** Finding "what products did this customer buy" requires 3 JOINs in SQL (4 tables) vs a simple 2-hop traversal in Cypher.


[.summary]
== Summary

In this workshop, you will:

* Model business data as a graph
* Import CSV files using Data Importer
* Write Cypher queries to answer business questions
* Build a recommendation query using collaborative filtering

**Time commitment:** 2 hours core path, 3 hours with optional practice

Ready to get started?

read::Let's go![]
```

---

## Part B: Module Overviews

### Phase 1: Understand Module Purpose (5 min)

#### Checklist: Module Information
- [ ] Read WORKSHOP-PLAN.md for module objectives
- [ ] Identify building block this module completes
- [ ] List lessons in this module
- [ ] Note what was completed in previous module
- [ ] Understand what comes after this module

#### Key Questions to Answer

**Before writing anything, answer:**

1. **What does this module accomplish?** (building block)
2. **What was just completed?** (previous module)
3. **How many lessons?** (count and types)
4. **What will learners be able to do?** (outcomes)
5. **How long will it take?** (duration)

---

### Phase 2: Write Module Overview (15 min)

#### Checklist: Module Overview Content
- [ ] Clear module title with order
- [ ] Brief description of accomplishment
- [ ] "By the end of this module" bullet list
- [ ] Link to first lesson with styled button

#### Module Overview Pattern

```asciidoc
= [Module Title]
:order: N

[Brief description of what this module accomplishes - 1-2 sentences]


By the end of this module, you will:

* [Outcome 1]
* [Outcome 2]
* [Outcome 3]


link:./1-first-lesson/[Ready? Let's go →, role=btn]
```

#### Example Module Overview 1

```asciidoc
= Aura Setup
:order: 1

In this module, you will create a free Neo4j Aura instance and familiarize yourself with the tools you'll use throughout the workshop.


By the end of this module, you will:

* Understand what Neo4j Aura is and how it works
* Have a running Aura Free instance
* Know how to use Data Importer and Query tools
* Be ready to import your first dataset


link:./1-workshop-overview/[Ready? Let's go →, role=btn]
```

#### Example Module Overview 2

```asciidoc
= Building Your Graph
:order: 2

In this module, you will learn graph fundamentals and import your first dataset using Data Importer.


By the end of this module, you will:

* Understand nodes, relationships, and properties
* Know basic Cypher syntax for reading data
* Have Product nodes imported into your graph
* Be able to query products with simple patterns


link:./1-graph-elements/[Ready? Let's go →, role=btn]
```

#### Example Module Overview 3

```asciidoc
= Many-to-Many Relationships
:order: 4

In this module, you will model the many-to-many relationship between orders and products, completing the full Customer → Order → Product path.


By the end of this module, you will:

* Understand how graphs eliminate pivot tables
* Create ORDERS relationships between Order and Product nodes
* Write multi-hop traversal queries
* Compare graph queries to their SQL equivalents


link:./1-graph-vs-pivot-tables/[Ready? Let's go →, role=btn]
```

---

## Phase 3: Apply Style Rules (5 min)

### Checklist: Technical Requirements
- [ ] Two line breaks between sections
- [ ] Module title is clear and descriptive
- [ ] Order attribute is correct
- [ ] Outcomes are bulleted
- [ ] Link uses role=btn styling
- [ ] No markdown, only AsciiDoc
- [ ] Natural tone (no sales language)

### Module Overview Requirements

**Metadata:**
```asciidoc
= Module Title
:order: N
```

**Structure:**
- Brief description (1-2 sentences)
- "By the end of this module, you will:" + bullets
- Link to first lesson with `role=btn`

**Style:**
- Sentence case titles
- Active voice ("you will", not "you'll")
- Concrete outcomes (not vague)
- Forward-looking (what they'll accomplish)

---

## Phase 4: Review and Refine (5 min)

### Checklist: Self-Review
- [ ] Re-read overview aloud
- [ ] THE GOAL is clear (workshop overview only)
- [ ] Outcomes are specific and concrete
- [ ] Prerequisites are accurate
- [ ] Duration is realistic
- [ ] Value proposition is factual (not sales)
- [ ] Link points to correct first lesson
- [ ] Two line breaks between sections
- [ ] Natural, friendly tone

### Common Issues to Fix

**Issue:** Vague outcomes
- ❌ "Learn about graphs"
- ✅ "Model business data as nodes and relationships"

**Issue:** Sales language
- ❌ "Powerful graph capabilities that will transform your queries"
- ✅ "Graph traversal is O(k) vs SQL JOIN which is O(n×m)"

**Issue:** Missing prerequisites
- ❌ "Anyone can take this workshop"
- ✅ "Basic understanding of databases, familiarity with CSV files"

**Issue:** Unrealistic duration
- ❌ "Complete in 30 minutes"
- ✅ "2 hours core path, 3 hours with optional lessons"

---

## Examples and References

### Example Workshop Overview

**See this real file:**

- `modules/1-aura-setup/lessons/1-workshop-overview/lesson.adoc`
  - Demonstrates: THE GOAL upfront, module progression, prerequisites, duration, value proposition

### Example Module Overviews

**See these real files:**

- `modules/2-building-your-graph/module.adoc`
- `modules/3-modeling-relationships/module.adoc`
- `modules/4-many-to-many/module.adoc`
- `modules/5-final-review/module.adoc`

### What These Files Demonstrate

**Workshop overview (1-workshop-overview/lesson.adoc):**
- Introduces THE GOAL immediately
- Shows what will be built
- Module-by-module progression outline
- Prerequisites clearly stated
- Duration expectations set (2 hours core, 3 with optional)
- Motivates with factual value proposition (not sales)

**Module overviews (module.adoc files):**
- Clear module title and order
- Brief description of accomplishment
- "By the end of this module, you will:" bullet list
- Link to first lesson with styled button

**Key patterns:**
- Concrete outcomes (not vague)
- Forward-looking (what they'll accomplish)
- Sentence case titles
- Natural tone (no sales language)
- Two line breaks between sections

---

## Output Checklist

### Workshop Overview Checklist

Before marking workshop overview complete, verify:

- [ ] File: `lesson.adoc` in first lesson folder
- [ ] Metadata: `:type: lesson`, `:order: 1`
- [ ] THE GOAL stated in opening
- [ ] What will be built section
- [ ] Module-by-module progression
- [ ] Prerequisites section
- [ ] Duration section (core + optional)
- [ ] Value proposition (factual, not sales)
- [ ] Summary with outcomes
- [ ] "Let's go" button
- [ ] Two line breaks between sections
- [ ] No markdown, only AsciiDoc

### Module Overview Checklist

Before marking module overview complete, verify:

- [ ] File: `module.adoc` in module folder
- [ ] Metadata: `:order: N`
- [ ] Clear module title
- [ ] Brief description (1-2 sentences)
- [ ] "By the end of this module" section
- [ ] 3-5 concrete outcomes
- [ ] Link to first lesson with role=btn
- [ ] Two line breaks between sections
- [ ] No markdown, only AsciiDoc

---

## References

- [CONTENT_GUIDELINES.md](../../asciidoc/courses/workshop-importing/CONTENT_GUIDELINES.md) - Style guide
- [HOW-TO-BUILD-WORKSHOPS.md](../../../docs/workshops/HOW-TO-BUILD-WORKSHOPS.md) - Overview methodology
- [create-new-workshop.mdc](../create-new-workshop.mdc) - Workshop overview requirements
- [modules/1-aura-setup/lessons/1-workshop-overview/](../../asciidoc/courses/workshop-importing/modules/1-aura-setup/lessons/1-workshop-overview/) - Complete workshop overview example
- [modules/4-many-to-many/module.adoc](../../asciidoc/courses/workshop-importing/modules/4-many-to-many/module.adoc) - Module overview example
