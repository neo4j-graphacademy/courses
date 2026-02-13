# How to Convert Courses into Effective Workshops

## Table of Contents

1. [Philosophy](#philosophy)
2. [Workshop vs Course](#workshop-vs-course)
3. [Structural Framework](#structural-framework)
4. [Step-by-Step Conversion Process](#step-by-step-conversion-process)
5. [Content Quality Rules](#content-quality-rules)
6. [Teaching Patterns](#teaching-patterns)
7. [Technical Implementation](#technical-implementation)
8. [Templates and Examples](#templates-and-examples)
9. [Checklist](#checklist)

---

## Philosophy

### The Golden Rule

**Workshops are about DOING, not KNOWING.**

A course teaches knowledge. A workshop builds something real.

### Core Principle: Learn → Do → Verify

The gap between learning and application should be **minutes, not modules**.

**BAD (Course pattern):**

```
Module 1: Theory A, Theory B, Theory C
Module 2: Theory D, Theory E, Theory F
Module 3: Practice A, Practice B, Practice C
Module 4: Build something
```

**GOOD (Workshop pattern):**

```
Module 1: Learn A → Do A → Verify A
Module 2: Learn B → Do B → Verify B
Module 3: Learn C → Do C → Verify C
Module 4: Combine A+B+C → Build final project
```

### The Three Questions Every Lesson Must Answer

1. **What am I building?** (Clear goal from lesson 1)
2. **Why does this decision matter?** (Connect to final goal)
3. **Did it work?** (Automated verification)

---

## Workshop vs Course

### Course Characteristics

- ✅ Comprehensive coverage
- ✅ Deep conceptual understanding
- ✅ Multiple learning modalities
- ❌ Delayed application
- ❌ Theory-heavy front-loading
- ❌ Flexible timing (take your time)

### Workshop Characteristics

- ✅ **Goal-oriented** - Build one specific thing
- ✅ **Hands-on first** - Do immediately after learning
- ✅ **Time-bounded** - Target: 2 hours core
- ✅ **Progressive building** - Each module adds one piece
- ✅ **Immediate feedback** - Automated verification
- ✅ **Multiple paths** - Core + optional + homework

### When to Use a Workshop Format

- You have a **concrete end goal** (build a recommendation system, create a dashboard, deploy an app)
- Students can **see progress incrementally** (building blocks)
- **Hands-on tools** are available (Data Importer, code editor, cloud console)
- Target audience has **2-3 hours** available
- **Immediate application** is important (not theoretical knowledge)

### When to Use a Course Format

- Covering broad theoretical foundations
- Multiple unrelated concepts
- No single end goal
- Self-paced learning over days/weeks
- Heavy on conceptual understanding

---

## Environment Selection

### Choosing the Right Workshop Environment

**The environment choice depends on whether students need tools/GUIs or just database access:**

### For Code Challenges: Use GitHub Codespaces

**When to use:**
- Writing application code (Python, JavaScript, Java)
- Building full-stack applications
- Using code editors and terminals
- Installing packages and dependencies
- Testing and debugging code

**Why Codespaces:**
- Consistent environment for all students
- No local setup required
- Pre-configured with necessary tools
- Easy to share and reproduce
- Integrated with version control

**Example challenges:**
- "Build a REST API with Neo4j driver"
- "Create a web application with authentication"
- "Write Python scripts for data processing"
- "Develop a microservice"

### For Neo4j GUI Challenges: Use Aura

**When to use:**
- Visual data modeling (Data Importer)
- Point-and-click graph exploration (Explore tool)
- Building dashboards (Dashboards tool)
- GUI-based data import
- Visual query building

**Why Aura:**
- Full suite of visual tools
- Real cloud environment experience
- Production-like setup
- Persistent instances
- Professional workflows

**Example challenges:**
- "Design your graph model in Data Importer"
- "Import CSV files using the visual interface"
- "Create a dashboard to visualize results"
- "Explore the graph interactively"

### For Pure Cypher Challenges: Use GraphAcademy Sandbox

**When to use:**
- Writing Cypher queries only
- Pattern matching exercises
- Query optimization practice
- No GUI required
- Quick database operations

**Why GraphAcademy Sandbox:**
- Integrated in-browser experience
- No separate login/setup
- Instant database provisioning
- Pre-loaded datasets
- Seamless verification
- No context switching

**Example challenges:**
- "Write a query to find all customers"
- "Create nodes and relationships with Cypher"
- "Optimize this query pattern"
- "Practice aggregations and filtering"

### Hybrid Approach

**Some workshops may need both:**

```
Module 1-2: Aura (visual modeling and import)
├── Use Data Importer GUI
├── Design graph visually
└── Import data with clicks

Module 3-4: GraphAcademy Sandbox (Cypher practice)
├── Write queries against imported data
├── Practice pattern matching
└── No GUI needed - pure Cypher

Module 5: Codespaces (application building)
├── Build application code
├── Integrate Neo4j driver
└── Deploy working app
```

### Decision Matrix

| Need | Environment | Reason |
|------|-------------|--------|
| Visual data modeling | **Aura** | Data Importer GUI |
| CSV import via GUI | **Aura** | Drag-and-drop interface |
| Graph exploration | **Aura** | Explore tool |
| Dashboard building | **Aura** | Dashboards tool |
| Pure Cypher queries | **GraphAcademy Sandbox** | Seamless, no setup |
| Query practice | **GraphAcademy Sandbox** | Integrated verification |
| Application code | **Codespaces** | Full dev environment |
| API development | **Codespaces** | Code editor + terminal |
| Package installation | **Codespaces** | Dependency management |

### Implementation Guidelines

**For Aura workshops:**
```asciidoc
[.slide]
== Setup Your Environment

You will need a Neo4j Aura instance for this workshop.

1. Go to link:https://console.neo4j.io/graphacademy[console.neo4j.io/graphacademy^]
2. Sign in with GraphAcademy credentials
3. Click **Create Instance** → **Free instance**
4. Save your credentials

**Why Aura:** This workshop uses visual tools (Data Importer, Explore, Dashboards).
```

**For GraphAcademy Sandbox workshops:**
```asciidoc
[.slide]
== Your Workshop Database

This workshop uses an integrated Neo4j sandbox - no setup required!

When you see a Cypher challenge, you'll get an in-browser query editor with:
- Pre-loaded dataset
- Instant query execution
- Automated verification

**Why integrated:** Pure Cypher challenges don't require external tools.
```

**For Codespaces workshops:**
```asciidoc
[.slide]
== Setup Your Development Environment

You will build code in this workshop using GitHub Codespaces.

1. Click the **Open in Codespaces** button
2. Wait for environment to initialize (30-60 seconds)
3. Terminal and editor will be ready

**Why Codespaces:** You'll write application code, install packages, and run tests.
```

### Cost Considerations

**Aura Free:**
- No cost, no credit card
- 200K nodes, 400K relationships
- Perfect for workshops
- Auto-pauses after 72 hours

**GraphAcademy Sandbox:**
- No cost
- Ephemeral (session-based)
- No setup friction
- Ideal for Cypher practice

**Codespaces:**
- Free tier available
- Pay-per-use after free hours
- Students need GitHub account
- Pre-build reduces cost

### Best Practices

**1. Match environment to task:**
```
Visual task → Aura
Query task → Sandbox
Code task → Codespaces
```

**2. Minimize context switching:**
Don't require students to jump between environments unnecessarily.

**3. State environment clearly:**
Tell students upfront what environment they'll use and why.

**4. Provide fallbacks:**
If Aura, include sandbox snapshots. If Codespaces, include local setup option.

**5. Test both paths:**
Validate the workshop in both primary and fallback environments.

---

## Structural Framework

### The Workshop Architecture

```
Module 1: Setup & Tool Introduction (15-20 min)
├── 1. Workshop Overview (introduce THE GOAL)
├── 2. Platform Setup (environment)
└── 3. Tool Overview (mechanics taught ONCE)

Module 2-N: Iterative Building Blocks (20-30 min each)
├── 1. Concept (3-5 min theory)
├── 2. Challenge (7-12 min hands-on)
├── 3. Validation (3-5 min proof + comparison)
└── 4. Optional Practice (5-15 min cementing)

Final Module: Integration & Review (15-20 min)
├── 1. Build Final Project (combine all blocks)
├── 2. Knowledge Check (quiz)
└── 3. Next Steps (where to go from here)
```

### Timing Targets

**Mandatory path: 2 hours**

- Module 1: 15-20 min (setup)
- Modules 2-N: 20-30 min each (4-5 building modules)
- Final module: 15-20 min (integration)

**Optional path: +30-60 min**

- Optional practice lessons after each module
- 5-15 min each

**Homework: +60 min**

- Advanced topics
- Deep dives
- Production considerations

### The Building Block Pattern

Each module should:

1. **Complete one transformation** (nodes → relationships → patterns)
2. **Build on previous modules** (explicit references: "In Module 2 we...")
3. **Contribute to final goal** (always connect to the end objective)
4. **Be independently verifiable** (automated checks)

**Example progression:**

```
Module 2: Building Block 1
"Products exist in the graph" ✓

Module 3: Building Block 2
"Customer→Order path complete" ✓

Module 4: Building Block 3
"Customer→Order→Product path complete" ✓

Module 5: Combine All Blocks
"Build recommendation query using all three paths" ✓
```

---

## Step-by-Step Conversion Process

### Phase 1: Identify the Goal (1 hour)

**1.1 Find the "Money Demo"**

- What's the most impressive thing students can build?
- What showcases the technology's value?
- Can it be built in 2 hours?

**Example (Neo4j):**

```
❌ BAD: "Learn graph databases"
✅ GOOD: "Build a product recommendation query"

Why GOOD wins:
- Concrete output (actual query)
- Demonstrates graph advantage (11 lines vs 38 lines SQL)
- Real-world application (recommendation systems)
- Measurable success (query returns recommendations)
```

**1.2 Reverse Engineer the Requirements**
Work backwards from the goal:

```
Goal: Product recommendation query
├── Requires: Customer→Order→Product path
│   ├── Requires: Customer nodes
│   ├── Requires: Order nodes
│   ├── Requires: Product nodes
│   ├── Requires: PLACED relationships
│   └── Requires: CONTAINS relationships
└── Requires: Pattern matching knowledge
```

This becomes your module structure.

**1.3 Validate the Goal**

- Can beginners achieve it in 2 hours?
- Is success measurable? (query runs, test passes, app deploys)
- Does it demonstrate key technology advantages?
- Will students want to show it off?

### Phase 2: Deconstruct Existing Course (2 hours)

**2.1 Audit Current Content**
Create a spreadsheet:

```
| Current Lesson | Type | Duration | Required for Goal? | Keep/Move/Delete |
|----------------|------|----------|-------------------|------------------|
| Graph Theory   | Theory | 15 min | Partial | Extract 3 min |
| Import Nodes   | Hands-on | 20 min | Yes | Keep |
| Advanced Patterns | Theory | 30 min | No | Move to Homework |
```

**2.2 Categorize Content**

- **Essential (Core Path)**: Required to achieve the goal
- **Enrichment (Optional)**: Helpful but not mandatory
- **Advanced (Homework)**: Deep dives, production topics
- **Redundant**: Duplicates or unnecessary

**2.3 Identify Redundancies**
Look for:

- Same concept taught multiple times
- Tool mechanics repeated in every lesson
- Theory without application
- Queries without context

### Phase 3: Restructure into Building Blocks (3 hours)

**3.1 Create Module Breakdown**

For each building block:

```
Module N: [Transformation Name]
├── Concept lesson (3-5 min)
│   ├── What are we building?
│   ├── Why does it matter for the goal?
│   └── Example with final dataset
│
├── Challenge lesson (7-12 min)
│   ├── Reference tool mechanics (Module 1)
│   ├── Focus on WHAT to build
│   ├── Focus on WHY decisions matter
│   └── Include automated verification
│
├── Validation lesson (3-5 min)
│   ├── Run queries on what you built
│   ├── Compare to alternative approach (SQL, manual, etc.)
│   └── Connect to goal ("now we can...")
│
└── Optional practice (5-15 min)
    ├── Hands-on exercises
    ├── Business questions
    └── Confidence building
```

**3.2 Example: Converting "Data Modeling" Module**

**BEFORE (Course pattern):**

```
Module 2: Data Modeling (60 min)
1. What is Modeling (15 min theory)
2. Understanding Domain (10 min theory)
3. Nodes and Labels (10 min theory)
4. Relationships (10 min theory)
5. Properties (10 min theory)
6. Testing Model (5 min theory)
```

**AFTER (Workshop pattern):**

```
Module 2: Foundation - Your First Nodes (25 min)
1. Graph Elements (5 min)
   - Nodes, labels, relationships, properties
   - Basic Cypher patterns
   - Show final goal query as teaser

2. Identifying Nodes (3 min)
   - What makes something a node?
   - Example: Product is a node
   - Why: "Products are what we recommend"

3. Import Product Nodes (12 min)
   - Challenge: Use Data Importer
   - Verify: MATCH (p:Product) RETURN count(p)
   - Building Block 1: "Products exist" ✓

4. Optional Practice Queries (5 min)
   - Filter by price
   - Count products
   - Find low stock
```

**3.3 Tool Mechanics: Single Source of Truth**

Pick ONE lesson to teach tool mechanics comprehensively:

```
Module 1, Lesson 3: Import Tool Overview
- How Data Importer works
- All UI elements explained
- Step-by-step mechanics
- Screenshots and video

All later lessons:
"Use Data Importer (see Module 1 Lesson 3)"
Focus on WHAT to import, WHY it matters
```

### Phase 4: Write Content (10-15 hours)

**4.1 Module 1: Setup & Introduction**

Lesson 1: Workshop Overview

```asciidoc
= Workshop Overview
:type: lesson
:order: 1
:duration: 5

[.slide.discrete]
== The Challenge

By the end of this workshop, you will build [CONCRETE GOAL].

**Show the final output** (screenshot, query result, live demo)

[.slide]
== What You'll Build

Module by module breakdown:
* Module 2: Building Block 1 - [What]
* Module 3: Building Block 2 - [What]
* Module 4: Building Block 3 - [What]
* Module 5: Combine all blocks - [Final goal]

[.slide]
== What You'll Learn

* [Skill 1] - why it matters
* [Skill 2] - why it matters
* [Skill 3] - why it matters

**Focus:** Hands-on building, not theory.

[.slide]
== Prerequisites

**Required:**
* [Prerequisite 1]
* [Prerequisite 2]

**Helpful but not required:**
* [Nice-to-have 1]

[.slide]
== Let's Get Started

In the next lesson, you'll [immediate next action].

read::I'm ready to begin[]

[.summary]
== Summary

* Goal: [Restate concrete goal]
* Approach: [Building block progression]
* Duration: [2 hours core + optional practice]
```

Lesson 2-3: Setup and Tool Mechanics

- Environment setup
- Tool overview (comprehensive, only taught once)
- Verification that setup works

**4.2 Building Block Modules (Modules 2-N)**

Use this template for each:

**Concept Lesson:**

```asciidoc
= [Concept Name]
:type: lesson
:order: 1
:duration: 5

[.slide.discrete]
== Introduction

[What we built so far]

In this lesson, you will learn [what this concept enables for the goal].

[.slide]
== Understanding [Concept]

**[Concept]** is [definition].

**On your [dataset]:**

[source,cypher]
.Example with workshop data
----
// Real query using workshop dataset
MATCH (n:Node)
RETURN n.property
----

**Result:** [What students should see]

[.slide]
== Why [Concept] Matters for [Goal]

[Connect to final goal explicitly]

Without [concept]: [what you can't do]
With [concept]: [what you CAN do]

**Next:** You'll [action in challenge lesson]

read::Continue to challenge[]

[.summary]
== Summary

* **[Concept]** - [definition]
* **Purpose** - [why it matters for goal]
* **Next** - [what we'll build]
```

**Challenge Lesson:**

```asciidoc
= [Challenge Name]
:type: challenge
:order: 2
:duration: 12

[.slide.discrete]
== Challenge

You will [what students will build].

This completes [Building Block N].

[.slide]
== The Dataset

[Show relevant CSV data as table]

[options="header"]
|===
| Column | Type | Description
| id | String | Unique identifier
| name | String | Display name
| property | Integer | Some value
|===

[.slide]
== Load Data Files

Click the button below to download all data files for this workshop.

button::Download Workshop Data[role=NX_DOWNLOAD_FILE, file="data/workshop-data.zip"]

**One-time setup:** These files will be used throughout the workshop.

[.slide]
== Using the Import Tool

**Reference:** See Module 1 Lesson 3 for import tool mechanics.

**For this challenge:**

1. Open **Data Importer** (Module 1 Lesson 3)
2. Map the [Entity] node
3. Configure properties (see table below)
4. Run import

[.slide]
== Configure Properties

[options="header"]
|===
| Column | Type | Rename To
| entityId | String | id
| entityName | String | name
| someProperty | Integer |
|===

[.slide]
== Run the Import

Click **Run Import** to execute.

You should see confirmation: **[N] [Entity] nodes created**

[.slide]
== Snapshot Option

[.collapsible]
.Load Pre-Built Data Model
====
**Skip ahead or catch up:** Load a pre-built data model.

button::Download Snapshot[role=NX_DOWNLOAD_FILE, file="snapshots/module2-lesson2.zip"]

**What's included:**
* [Entity] nodes with properties
* Ready to run import

**After loading:**
1. Review model on canvas
2. Connect to your instance
3. Click **Run Import**
====

include::questions/verify.adoc[leveloffset=+1]

[.summary]
== Summary

You imported [Entity] nodes:
* [N] nodes created
* Properties: [list key properties]
* Building Block N: "[Status]" ✓

Next: [what's in the next lesson]
```

**Verification Files:**

`questions/verify.adoc`:

```asciidoc
[.verify.slide]
= Validate Import

Once you have imported [Entity] nodes, click **Check Database** to verify.

verify::[]

[TIP,role=hint]
.Hint
====
Key steps:
1. [Step 1]
2. [Step 2]
====

[TIP,role=solution]
.Solution
====
Expected configuration:
* [Config item 1]
* [Config item 2]

To verify manually:
[source,cypher]
----
MATCH (n:Entity)
RETURN count(n)
----

Should return: [N] nodes
====
```

`verify.cypher`:

```cypher
RETURN COUNT {(:Entity)} > 0 AS outcome,
       'There must be one or more (:Entity) nodes in the database. Check your spelling, node labels are case sensitive.' AS reason
```

`solution.cypher`:

```cypher
// Minimal code to pass verification
CREATE (:Entity {id: "1", name: "Test"});
```

**Validation Lesson:**

```asciidoc
= Querying [What You Built]
:type: lesson
:order: 3
:duration: 5

[.slide.discrete]
== Introduction

You imported [Entity] nodes. Now you'll query them.

[.slide]
== Basic Query

[source,cypher]
.Find all [entities]
----
MATCH (n:Entity)
RETURN n.name, n.property
LIMIT 10;
----

**Try it:** Run this query in Query tool.

[.slide]
== Comparing to SQL

**SQL equivalent:**
[source,sql]
----
SELECT name, property
FROM entities
LIMIT 10;
----

**Cypher advantages:**
* [Advantage 1]
* [Advantage 2]

[.slide]
== Building Block Complete

✓ **Building Block N:** "[Description]"

**What's next:** [Preview next module]

With [what we have now], we can [capability unlocked].

read::Continue[]

[.summary]
== Summary

* Queried [Entity] nodes
* Pattern: MATCH (n:Label) RETURN properties
* Progress: [Building block status]
```

**Optional Practice Lesson:**

```asciidoc
= Practice Queries
:type: lesson
:order: 4
:duration: 15
:optional: true

[.slide.discrete]
== Optional Practice

You imported [entities]. In this lesson, you will practice writing queries to explore the data and build Cypher confidence.

**Advanced learners:** Skip to Module [N+1].
**Beginners:** These exercises prepare you for [upcoming concept].

[.slide]
== Challenge 1: [Business Question]

[Business question in plain language]

[source,cypher]
.Query to answer the question
----
MATCH (n:Entity)
WHERE n.property > value
RETURN n.name
ORDER BY n.property DESC;
----

<1> **Pattern** - Explanation
<2> **Filter** - Explanation
<3> **Return** - Explanation

**Try it:** Modify to [variation].

[.slide]
== Challenge 2: [Business Question]

[Repeat pattern]

[.slide]
== Challenge 3: [Business Question]

[Repeat pattern]

read::Complete practice[]

[.summary]
== Summary

Practice patterns:
* Filtering: WHERE clause
* Aggregating: count(), sum()
* Sorting: ORDER BY

These patterns prepare you for [upcoming concept].
```

**4.3 Final Module: Integration**

```asciidoc
= Building the [Final Goal]
:type: lesson
:order: 1
:duration: 15

[.slide.discrete]
== Introduction

You've built all the pieces:
* Building Block 1: [What]
* Building Block 2: [What]
* Building Block 3: [What]

Now you'll combine them to build [final goal].

[.slide]
== Understanding the Algorithm

[Final solution] works by:
1. [Step 1]
2. [Step 2]
3. [Step 3]

[.slide]
== Step 1: [First Part]

[Build up solution piece by piece]

[source,cypher]
.Partial solution
----
// First part of final query
----

[.slide]
== Step 2: [Second Part]

[Continue building]

[source,cypher]
.Extended solution
----
// Add second part
----

[.slide]
== Complete Solution

[source,cypher]
.Final [goal] query
----
// Complete final query
----

**Result:** [What it produces]

[.slide]
== Comparing to [Alternative Approach]

**[Alternative] (complex):**
[source,sql]
----
// Long, complex alternative
----

**[Your solution] (elegant):**
[source,cypher]
----
// Your solution
----

| Metric | Your Solution | Alternative |
|--------|---------------|-------------|
| Lines | 11 | 38 |
| Complexity | O(k) | O(n×m) |
| Readability | High | Low |

[.slide]
== Experimenting

**Try modifying:**
1. [Variation 1]
2. [Variation 2]
3. [Variation 3]

read::Complete workshop[]

[.summary]
== Summary

You built [final goal]:
* [Outcome 1]
* [Outcome 2]
* [Outcome 3]

Advantages over [alternative]:
* [Advantage 1]
* [Advantage 2]
```

### Phase 5: Content Quality Pass (3-5 hours)

**5.1 Remove Empty Buzzwords**

Search and replace:

```
❌ "powerful" → ✅ [specific capability]
❌ "elegant" → ✅ [concrete comparison]
❌ "flexible" → ✅ [what it enables]
❌ "scalable" → ✅ [performance metrics]
❌ "robust" → ✅ [reliability features]
❌ "first-class citizens" → ✅ [technical detail]
```

**Before/After Example:**

```
❌ BEFORE:
"Neo4j provides a powerful and elegant way to model relationships
as first-class citizens, offering flexible and robust solutions."

✅ AFTER:
"Neo4j stores relationships with properties and enables O(1) traversal.
Relationships connect nodes with type, direction, and properties."
```

**5.2 Apply Text Formatting Rules**

```asciidoc
**Bold for first definitions:**
A **graph database** stores data as nodes and relationships.

_Italics for emphasis:_
This is _really important_ to understand.

`Backticks for code elements:`
The `Customer` node has an `id` property.
The `:PLACED` relationship connects customers to orders.

**Bold for UI elements (not backticks):**
Click the **Run Import** button.
Open the **Data Importer** tool.

❌ Never use CAPITALS for emphasis:
This is VERY IMPORTANT → This is _very important_
```

**5.3 Fix Question Types**

```asciidoc
✅ Multiple choice:
[.question]
= Question Title
- [ ] A. Wrong
- [x] B. Correct

✅ Fill-in-the-blank:
[.question.select-in-source]
= Complete the Code
MATCH (n/*select::Label*/)

✅ Database verification:
[.verify.slide]
= Validate Import
verify::[]

❌ NEVER use freetext for multiple choice:
[.question.freetext]  ← WRONG for checkbox questions
```

**5.4 Consistency Checks**

Run global checks:

```
□ No colons in lesson titles
□ Metadata uses :optional: true, not prose
□ Properties use consistent naming (id, name)
□ "tabular data" not "CSV data" (except filenames)
□ Every challenge has verify.cypher + solution.cypher
□ Every lesson has read:: OR verify::, never both
□ SQL comparisons after major patterns
□ Building blocks explicitly named and numbered
```

### Phase 6: Timing Validation (2 hours)

**6.1 Calculate Durations**

```bash
find modules -name "lesson.adoc" | xargs grep "^:duration:" | \
  awk -F': ' '{sum+=$2} END {print "Total:", sum, "minutes"}'
```

**6.2 Check Mandatory Path**

Target: 120 minutes (2 hours)

If over:

- Move content to optional lessons
- Move advanced topics to homework
- Consolidate redundant lessons
- Tighten explanations

**6.3 Balance Modules**

```
Module 1: 15-20 min (setup)
Modules 2-N: 20-30 min each (building)
Final: 15-20 min (integration)
```

If a module is too long:

- Split into two modules
- Move theory to earlier module
- Move practice to optional lesson

### Phase 7: Testing (3-5 hours)

**7.1 Manual Walkthrough**

Do the workshop yourself:

- Start fresh (new database)
- Follow every step
- Time yourself
- Note friction points

**7.2 Verification Testing**

Test every verify.cypher:

```bash
# Run verification queries
cat verify.cypher | cypher-shell

# Run minimal solution
cat solution.cypher | cypher-shell

# Verify the verification passes
cat verify.cypher | cypher-shell  # Should return outcome=true
```

**7.3 Snapshot Testing**

For each snapshot:

- Load into Data Importer
- Verify it contains expected nodes/relationships
- Verify it can be imported successfully
- Verify next lesson works with snapshot

**7.4 External Review**

Have someone unfamiliar:

- Follow the workshop
- Note confusions
- Time themselves
- Provide feedback

---

## Content Quality Rules

### The Concrete Information Test

Every statement must pass this test:
**"Can a student take action or make a decision based on this statement?"**

```
❌ FAIL: "Graphs are powerful for connected data"
   → Action: None. Decision: None.

✅ PASS: "Graph queries scale with connection count (O(k)), not table size (O(n))"
   → Action: Use graphs for connected data
   → Decision: Choose graph when connections matter more than row count
```

### Writing Style Rules

**DO:**

- ✅ Use active voice ("Create a node" not "A node should be created")
- ✅ Use "you" to address students ("You will build" not "Students will build")
- ✅ Start with concept, then show example
- ✅ Use concrete, specific language
- ✅ Include validation after imports
- ✅ Keep lessons focused on one concept
- ✅ Use bold for first definitions
- ✅ Use italics for emphasis
- ✅ Use backticks for code/graph elements

**DON'T:**

- ❌ Use passive voice
- ❌ Use empty buzzwords (powerful, elegant, robust)
- ❌ Make vague statements
- ❌ Say "This lesson is optional"
- ❌ Use CAPITALS for emphasis
- ❌ Use colons in titles
- ❌ Duplicate content across lessons

### Terminology Rules

**Be precise:**

- Use "tabular data" not "CSV data" (format agnostic)
- Keep filenames as .csv (specific files)
- Use "graph database" not "graph" (when referring to the system)
- Use "node" not "vertex" (Neo4j terminology)

**Property naming:**

- Remove entity prefix when it matches: `customerId` → `id`
- Keep prefix when different: `shipCountry` stays `shipCountry`
- Use consistent names: `id`, `name`, `date`

### Comparison Rules

Always provide quantifiable comparisons:

```asciidoc
| Metric | Your Solution | Alternative |
|--------|---------------|-------------|
| **Lines of code** | 11 | 38 |
| **JOINs** | 0 | 7 |
| **Performance** | O(k) | O(n × m) |
| **Readability** | Reads like English | Complex nested logic |
```

Not:

```
Your solution is better than SQL.
Graphs are faster.
```

---

## Teaching Patterns

### Pattern 1: Single Source of Truth

**Teach tool mechanics once comprehensively:**

```
Module 1, Lesson 3: Import Tool Overview
├── Comprehensive mechanics
├── Every UI element explained
├── Step-by-step process
└── This is the SOURCE OF TRUTH

Later lessons:
├── "Use Data Importer (see Module 1 Lesson 3)"
├── Focus on WHAT to import
└── Focus on WHY decisions matter
```

### Pattern 2: Progressive Complexity

**Layer concepts incrementally:**

```
Module 2: Simple pattern
MATCH (n:Node) RETURN n

Module 3: One hop
MATCH (a:A)-[:REL]->(b:B) RETURN a, b

Module 4: Two hops
MATCH (a:A)-[:REL1]->(b:B)-[:REL2]->(c:C) RETURN a, c

Module 5: Complex multi-hop with filtering
MATCH (a:A)-[:REL1]->(b:B)-[:REL2]->(c:C)
WHERE NOT (a)-[:REL3]->(c)
RETURN c, count(b) AS score
ORDER BY score DESC
```

### Pattern 3: Contextual Practice

**Place optional practice immediately after building relevant graph structure:**

```
Module 3: Import PLACED relationships
├── 1. Understanding Relationships (concept)
├── 2. Import PLACED (challenge)
└── 3. Optional: Relationship Queries ← CONTEXTUAL

NOT:
Module 5: All Practice Queries (consolidated) ← WRONG
```

### Pattern 4: Snapshot Resilience

**Every mandatory lesson gets a snapshot:**

```asciidoc
[.collapsible]
.Load Pre-Built Data Model
====
**Skip ahead or catch up:** Load pre-built data at this stage.

button::Download Snapshot[role=NX_DOWNLOAD_FILE, file="snapshots/module2-lesson3.zip"]

**What's included:**
* Product nodes (77 nodes)
* Customer nodes (91 nodes)
* Ready to run import

**After loading:**
1. Review model on canvas
2. Connect to your instance
3. Click **Run Import**
====
```

**Why snapshots matter:**

- Students can recover from mistakes
- Time management for live workshops
- Multiple entry points
- Reduces frustration

### Pattern 5: Automated Verification

**Every challenge has automated verification:**

```
lesson-folder/
├── lesson.adoc (includes questions/verify.adoc)
├── verify.cypher (automated check)
├── solution.cypher (minimal passing code)
└── questions/
    └── verify.adoc (UI integration)
```

**Never:**

```asciidoc
Run this query to check:
MATCH (n) RETURN count(n)

You should see 77. If not, try again.
```

**Always:**

```asciidoc
include::questions/verify.adoc[leveloffset=+1]

// System validates automatically
// Student clicks "Check Database"
// Immediate feedback
```

### Pattern 6: SQL Comparison Throughout

**Show comparative advantage at EVERY major pattern:**

```
Module 2 (nodes only):
└── Basic SELECT vs MATCH

Module 3 (one relationship):
└── 1 JOIN vs 1-hop traversal

Module 4 (two relationships):
└── 3 JOINs vs 2-hop traversal

Module 5 (complex):
└── 7 JOINs + subqueries vs multi-hop with filtering
```

**Never:**

- Wait until the end to show comparisons
- Make vague claims ("graphs are faster")
- Skip the SQL equivalent

**Always:**

- Show both side-by-side
- Provide metrics (line count, JOIN count, complexity)
- Explain WHY graph is better for this specific pattern

---

## Technical Implementation

### File Structure

```
course-name/
├── course.adoc
├── CONTENT_GUIDELINES.md
├── README.md
├── modules/
│   ├── 1-setup/
│   │   ├── module.adoc
│   │   └── lessons/
│   │       ├── 1-overview/
│   │       │   └── lesson.adoc
│   │       ├── 2-setup/
│   │       │   └── lesson.adoc
│   │       └── 3-tool-overview/
│   │           ├── lesson.adoc
│   │           └── images/
│   │
│   ├── 2-building-block-1/
│   │   ├── module.adoc
│   │   └── lessons/
│   │       ├── 1-concept/
│   │       │   └── lesson.adoc
│   │       ├── 2-challenge/
│   │       │   ├── lesson.adoc
│   │       │   ├── verify.cypher
│   │       │   ├── solution.cypher
│   │       │   ├── data/
│   │       │   │   └── *.csv
│   │       │   └── questions/
│   │       │       └── verify.adoc
│   │       ├── 3-validation/
│   │       │   └── lesson.adoc
│   │       └── 4-optional-practice/
│   │           └── lesson.adoc
│   │
│   └── N-final/
│       └── lessons/
│           ├── 1-final-project/
│           │   └── lesson.adoc
│           └── 2-knowledge-check/
│               ├── lesson.adoc
│               └── questions/
│                   ├── 01-question.adoc
│                   └── 02-question.adoc
│
├── homework/
│   └── 2-building-block-1/
│       └── lessons/
│           └── 1a-advanced-topic/
│               └── lesson.adoc
│
└── snapshots/
    ├── module2-lesson2.zip
    ├── module3-lesson2.zip
    └── module4-lesson2.zip
```

### Lesson Metadata

**Required fields:**

```asciidoc
= Lesson Title
:type: lesson|challenge|quiz
:order: 1
:duration: 10
```

**Optional fields:**

```asciidoc
:optional: true
:sandbox: true
```

**Question metadata:**

```asciidoc
[.question] ← multiple choice
[.question.select-in-source] ← fill-in-the-blank
[.verify.slide] ← database verification
```

### Module Metadata

```asciidoc
= Module Title
:order: 2

Brief description of what this module accomplishes.

By the end of the module, you will:
* [Outcome 1]
* [Outcome 2]
* [Outcome 3]

link:./1-first-lesson/[Ready? Let's go →, role=btn]
```

### Verification Pattern

**verify.cypher:**

```cypher
// Must return 'outcome' (boolean) and 'reason' (string)
RETURN COUNT {(:Entity)} > 0 AS outcome,
       'There must be one or more (:Entity) nodes in the database. Check your spelling, node labels are case sensitive.' AS reason
```

**solution.cypher:**

```cypher
// Minimal code to pass verification
// NOT full solution, just enough to pass
CREATE (:Entity {id: "1", name: "Test"});
```

**questions/verify.adoc:**

```asciidoc
[.verify.slide]
= Validate Import

Once you have completed the import, click **Check Database** to verify.

verify::[]

[TIP,role=hint]
.Hint
====
Key steps to complete:
1. [Step 1]
2. [Step 2]
====

[TIP,role=solution]
.Solution
====
Expected configuration:
* [Config 1]
* [Config 2]

To verify manually:
[source,cypher]
----
MATCH (n:Entity) RETURN count(n);
----

Should return: [expected count]
====
```

### Snapshot Creation

**Create snapshot files:**

1. Complete the import in Data Importer
2. Click **⋮ (three-dot menu)** → Export model
3. Save as `moduleN-lessonM.zip`
4. Place in `snapshots/` folder
5. Reference in lesson:
   ```asciidoc
   button::Download Snapshot[role=NX_DOWNLOAD_FILE, file="snapshots/module2-lesson3.zip"]
   ```

---

## Templates and Examples

**Instead of generic templates, reference real working examples from the workshop-importing course.**

### Example: Concept Lesson

**See:** `modules/2-foundation/lessons/1-graph-elements/lesson.adoc`

**What it demonstrates:**
- Opens with clear goal ("By the end of this workshop, you will build a query that answers...")
- Defines core concepts (nodes, labels, relationships, properties) with visual diagrams
- Uses real workshop data (Northwind) in all examples
- Shows Cypher patterns progressively (simple to complex)
- Connects every concept to the final recommendation goal
- Ends with `read::` button before summary

**Key patterns:**
- `[.slide.discrete]` for introduction slides
- `[.slide.col-2]` for side-by-side content
- Mermaid diagrams for visualizations
- Callout numbering `// (1)` for code explanations
- Clear connection to goal in every section

### Example: Challenge Lesson

**See:** `modules/2-foundation/lessons/4-import-products/lesson.adoc`

**What it demonstrates:**
- Clear challenge statement upfront
- Data table showing CSV structure (Column | Type | Description)
- Download button for data files: `button::Download Workshop Data[...]`
- Reference to tool mechanics: "See Module 1 Lesson 3"
- Property configuration table (Column | Type | Rename To)
- Collapsible snapshot section for skip-ahead option
- Includes `questions/verify.adoc` for automated verification
- Building block completion marker: "Building Block 1: 'Products exist' ✓"

**Verification files in same folder:**
- `verify.cypher` - Returns `outcome` and `reason`
- `solution.cypher` - Minimal code to pass verification
- `questions/verify.adoc` - UI integration with hints and solution

### Example: Optional Practice Lesson

**See:** `modules/3-modeling-relationships/lessons/3-optional-queries/lesson.adoc`

**What it demonstrates:**
- Explicitly addresses both paths: "**Advanced learners:** Skip ahead. **Beginners:** These exercises prepare you for..."
- Multiple business questions with progressive difficulty
- Each query includes callout explanations
- "Try experimenting" sections for variations
- Clear connection to upcoming concepts
- Marked with `:optional: true` metadata

### Example: Validation/Query Lesson

**See:** `modules/4-many-to-many/lessons/4-multi-hop-traversals/lesson.adoc`

**What it demonstrates:**
- Shows queries on data just imported
- Includes SQL comparison side-by-side
- Provides metrics table (Lines | JOINs | Performance | Readability)
- Explains advantages concretely (O(k) vs O(n×m))
- Multiple query examples building in complexity
- Connects pattern to final recommendation goal

### Example: Final Integration Lesson

**See:** `modules/5-final-review/lessons/1-recommendation-query/lesson.adoc`

**What it demonstrates:**
- Step-by-step construction (5 steps)
- Each step builds on previous
- Shows what's wrong with each iteration
- Explains why each refinement matters
- Complete SQL comparison (38 lines vs 11 lines)
- Metrics table for multi-dimensional comparison
- Experimentation suggestions at end

### Example: Verification Pattern

**See:** `modules/2-foundation/lessons/4-import-products/`

**File structure:**
```
4-import-products/
├── lesson.adoc (includes questions/verify.adoc)
├── verify.cypher (automated check)
├── solution.cypher (minimal passing code)
├── data/
│   └── products.csv
└── questions/
    └── verify.adoc
```

**verify.cypher:**
- Returns exactly two columns: `outcome` (boolean) and `reason` (string)
- Uses COUNT subquery: `COUNT {(:Product)} > 0`
- Provides helpful error message

**solution.cypher:**
- Minimal code: `CREATE (:Product {id: "1", name: "Test Product"});`
- Just enough to pass verification, not full solution

**questions/verify.adoc:**
- `[.verify.slide]` marker
- `verify::[]` macro for system integration
- Hint section with guidance
- Solution section with manual validation query

### Example: Knowledge Check Quiz

**See:** `modules/5-final-review/lessons/2-knowledge-check/`

**Structure:**
```
2-knowledge-check/
├── lesson.adoc (includes all questions)
└── questions/
    ├── 01-node-identification.adoc
    ├── 02-relationships-vs-properties.adoc
    ├── 03-many-to-many.adoc
    └── ... (10 total)
```

**lesson.adoc:**
- `:type: quiz` metadata
- `:sequential: true` for ordered questions
- Includes each question: `include::questions/01-question.adoc[leveloffset=+1]`

**Individual question file:**
- `[.question]` marker (NOT `.freetext` for multiple choice)
- Question text
- Four options with `- [ ]` and `- [x]` syntax
- Hint section with guidance
- Solution with explanation and "Recall Module N" reference

### Example: Module Overview

**See:** `modules/4-many-to-many/module.adoc`

**What it demonstrates:**
- Clear module title and order
- Brief description of what module accomplishes
- "By the end of the module, you will:" bullet list
- Link to first lesson with styled button: `link:./1-first-lesson/[Ready? Let's go →, role=btn]`

### Example: Workshop Overview

**See:** `modules/1-aura-setup/lessons/1-workshop-overview/lesson.adoc`

**What it demonstrates:**
- Introduces THE GOAL immediately
- Shows what will be built
- Module-by-module progression outline
- Prerequisites clearly stated
- Duration expectations set
- Motivates with value proposition

### File Locations Reference

All examples are in the `asciidoc/courses/workshop-importing/` directory:

**Core patterns:**
- Concept lesson: `modules/2-foundation/lessons/1-graph-elements/lesson.adoc`
- Challenge lesson: `modules/2-foundation/lessons/4-import-products/lesson.adoc`
- Validation lesson: `modules/4-many-to-many/lessons/4-multi-hop-traversals/lesson.adoc`
- Optional practice: `modules/3-modeling-relationships/lessons/3-optional-queries/lesson.adoc`
- Final integration: `modules/5-final-review/lessons/1-recommendation-query/lesson.adoc`
- Knowledge check: `modules/5-final-review/lessons/2-knowledge-check/lesson.adoc`

**Verification examples:**
- Any challenge lesson folder (e.g., `4-import-products/`) shows the complete pattern

**Guidelines document:**
- `CONTENT_GUIDELINES.md` - Comprehensive style guide with examples

**Analysis documents:**
- `WORKSHOP-CHANGES-ANALYSIS.md` - What changed and why
- `WORKSHOP-RESTRUCTURE-AS-BUILT.md` - Final structure rationale
- `WORKSHOP-COMPLETE.md` - Current state summary

---

## Checklist

### Pre-Conversion Checklist

- [ ] Identified the "money demo" (concrete final goal)
- [ ] Validated goal is achievable in 2 hours
- [ ] Reverse-engineered building blocks needed
- [ ] Audited existing course content
- [ ] Categorized as Core/Optional/Homework/Delete
- [ ] Identified tool mechanics source of truth lesson
- [ ] **Determined environment:** Codespaces / Aura / GraphAcademy Sandbox
- [ ] **Environment matches tasks:** GUI → Aura, Cypher → Sandbox, Code → Codespaces

### Structure Checklist

- [ ] Module 1: Setup and tool overview (15-20 min)
- [ ] Modules 2-N: Building blocks (20-30 min each)
- [ ] Each module follows Learn → Do → Verify pattern
- [ ] Optional practice after each module
- [ ] Final module integrates all building blocks
- [ ] Total mandatory time ≤ 2 hours
- [ ] Optional lessons clearly marked in metadata
- [ ] Homework separated from core path
- [ ] **Environment appropriate for task type:**
  - [ ] GUI challenges use Aura
  - [ ] Pure Cypher challenges use GraphAcademy Sandbox
  - [ ] Code challenges use Codespaces
- [ ] Environment choice explained to students (with "why")

### Content Quality Checklist

- [ ] No empty buzzwords (powerful, elegant, flexible)
- [ ] All statements provide actionable information
- [ ] Bold for first definitions
- [ ] Italics for emphasis (not CAPITALS)
- [ ] Backticks for code/graph elements
- [ ] Bold for UI elements (not backticks)
- [ ] No colons in lesson titles
- [ ] Metadata used for optional/challenge designation
- [ ] "tabular data" not "CSV data" (except filenames)
- [ ] Properties use consistent naming
- [ ] SQL comparisons at every major pattern
- [ ] Comparisons use quantifiable metrics
- [ ] Building blocks explicitly named and numbered

### Teaching Pattern Checklist

- [ ] Tool mechanics taught once comprehensively
- [ ] Later lessons reference tool mechanics, focus on decisions
- [ ] Optional practice is contextual (after relevant build)
- [ ] Every mandatory lesson has snapshot
- [ ] Snapshots tested and working
- [ ] Progressive complexity (simple → complex)
- [ ] Real business questions used in practice
- [ ] Clear "what's next" transitions

### Technical Implementation Checklist

- [ ] All lessons have required metadata (type, order, duration)
- [ ] Optional lessons marked with :optional: true
- [ ] Every challenge has verify.cypher
- [ ] Every challenge has solution.cypher
- [ ] Every challenge has questions/verify.adoc
- [ ] Verification queries return outcome + reason
- [ ] Solution files contain minimal passing code
- [ ] Question types correct ([.question] for multiple choice)
- [ ] No .freetext for checkbox questions
- [ ] Lessons have read:: OR verify::, never both
- [ ] Read button placed BEFORE summary
- [ ] Course.adoc updated with new structure

### Testing Checklist

- [ ] Manual walkthrough completed
- [ ] All verify.cypher tested
- [ ] All solution.cypher tested
- [ ] All snapshots loaded and tested
- [ ] Timing validated (mandatory ≤ 2 hours)
- [ ] External reviewer completed workshop
- [ ] Feedback incorporated
- [ ] All links working
- [ ] All images loading
- [ ] All code blocks tested

### Documentation Checklist

- [ ] CONTENT_GUIDELINES.md created
- [ ] README.md updated with workshop description
- [ ] Module overviews written
- [ ] Prerequisites clearly stated
- [ ] Learning outcomes listed
- [ ] Next steps/resources provided
- [ ] Homework README if homework exists

---

## Common Pitfalls

### 1. Tool Mechanics Repetition

**Mistake:** Explaining how to use the import tool in every lesson.
**Fix:** Teach once comprehensively in Module 1. Later lessons say "Use Data Importer (Module 1 Lesson 3)" and focus on WHAT/WHY.

### 2. Theory Front-Loading

**Mistake:** Modules 1-3 are all theory, module 4 is practice.
**Fix:** Each module combines theory + practice. Learn → Do gap = minutes.

### 3. Optional Without Value

**Mistake:** "This lesson is optional."
**Fix:** "**Advanced learners:** Skip ahead. **Beginners:** This prepares you for [specific concept]."

### 4. Missing Verification

**Mistake:** "Run this query. You should see 77. If not, try again."
**Fix:** Automated verify.cypher that system checks. Immediate feedback.

### 5. Empty Comparisons

**Mistake:** "Graphs are faster than SQL."
**Fix:** "Graphs scale O(k) with connections. SQL scales O(n×m) with table size."

### 6. Consolidated Practice

**Mistake:** Module 5 = All Practice Queries
**Fix:** Optional practice after each module, contextual to what was just built.

### 7. Vague Goals

**Mistake:** "Learn graph databases."
**Fix:** "Build a product recommendation query that answers: 'What do people like me buy?'"

### 8. No Snapshots

**Mistake:** If import fails, students are stuck.
**Fix:** Every mandatory lesson has snapshot. Students can skip ahead or catch up.

### 9. Hidden Optional Status

**Mistake:** Optional status only in metadata, lesson says "You must complete..."
**Fix:** Lesson explicitly addresses both paths: "Advanced" vs "Beginners"

### 10. Delayed Payoff

**Mistake:** Show why it matters in Module 6.
**Fix:** Show SQL comparison after every major pattern. Progressive value demonstration.

### 11. Wrong Environment Choice

**Mistake:** Using Aura for pure Cypher challenges or Sandbox for GUI challenges.
**Fix:**
- **Code challenges** → Codespaces (full dev environment)
- **GUI challenges** (Data Importer, Explore, Dashboards) → Aura
- **Pure Cypher** → GraphAcademy Sandbox (seamless, no setup)

**Example:**
```
❌ WRONG: "Use Aura to practice writing MATCH queries"
→ Creates setup friction for a simple task

✅ RIGHT: "Use the integrated sandbox to practice MATCH queries"
→ Seamless, in-browser, instant

✅ ALSO RIGHT: "Use Aura to design your graph model in Data Importer"
→ GUI tool requires Aura
```

---

## Success Metrics

### During Workshop

- **Completion rate**: >80% complete mandatory path
- **Time distribution**: Peak completions around 2-hour mark
- **Verification success**: >90% pass automated checks first try
- **Optional uptake**: 30-50% complete optional lessons

### Post-Workshop

- **Satisfaction**: >4.5/5 rating
- **Learning outcomes**: >80% pass knowledge check
- **Application**: Students can import their own data
- **Retention**: Students remember and use building blocks

### Content Quality Indicators

- No empty buzzwords
- All comparisons quantified
- Every lesson references final goal
- Building blocks explicitly tracked
- Tool mechanics taught once
- Verification automated
- Snapshots tested

---

## Maintenance

### Regular Updates

- Update dataset if underlying data changes
- Refresh screenshots if UI changes
- Test verify.cypher against latest DB version
- Review timing if content added/removed
- Check snapshot compatibility

### Feedback Integration

- Monitor completion rates per lesson
- Track where students get stuck
- Review verification failure patterns
- Collect "what was confusing" feedback
- Iterate on problem areas

### Version Control

When making changes:

1. Test full workshop walkthrough
2. Verify all verify.cypher still pass
3. Check timing hasn't exceeded targets
4. Update snapshots if data model changed
5. Update CONTENT_GUIDELINES.md if new patterns emerge

---

## Appendix: Example Transformation

### BEFORE: Course Structure

```
Workshop-Importing (Course format)

Module 1: Setup (20 min)
- Overview
- Aura setup

Module 2: Data Modeling Theory (60 min)
- What is modeling
- Domain understanding
- Nodes and labels
- Relationships
- Properties
- Testing models
- Refactoring

Module 3: Import Mechanics (45 min)
- Import overview
- Data Importer intro
- Importing nodes
- Importing relationships
- Constraints and indexes

Module 4: Cypher Queries (45 min)
- Intro to Cypher
- Reading data
- Pattern matching
- Filtering
- Aggregating

Total: 170 minutes (theory-heavy, delayed hands-on)
```

### AFTER: Workshop Structure

```
Workshop-Importing (Workshop format)

Module 1: Aura Setup (20 min)
- Workshop overview (goal: recommendation query)
- About Aura
- Import tool overview (SOURCE OF TRUTH)

Module 2: Foundation (25 min core + 5 min optional)
- Graph elements (5 min theory)
- Identifying nodes (3 min concept)
- Import products (12 min challenge with verify)
- Optional practice queries (5 min)

Module 3: Modeling Relationships (20 min core + 15 min optional)
- Understanding relationships (5 min theory)
- Import PLACED relationships (10 min challenge with verify)
- Optional practice queries (15 min)

Module 4: Many-to-Many (25 min core + 15 min optional)
- Graph vs pivot tables (5 min theory)
- Import CONTAINS relationships (12 min challenge with verify)
- Multi-hop traversals (8 min validation + SQL comparison)
- Optional practice queries (15 min)

Module 5: Building Recommendations (15 min)
- Build recommendation query (10 min final project)
- Knowledge check (5 min quiz)

Total:
- Mandatory: 125 minutes (~2 hours) ✓
- Optional: 35 minutes
- Hands-on throughout
```

### Key Improvements

1. **Goal-oriented**: Recommendation query introduced in lesson 1
2. **Immediate application**: Learn → Do gap = minutes
3. **Building blocks**: Explicit progression tracking
4. **Automated verification**: Every challenge has verify.cypher
5. **SQL comparisons**: After every major pattern
6. **Contextual practice**: Optional queries after each build
7. **Tool mechanics**: Taught once in Module 1
8. **Flexible paths**: Core + optional + homework
9. **Time target met**: 2 hours core achieved

---

## Final Thoughts

**Workshops succeed when students build something they're proud of.**

The transformation from course to workshop is about:

- **Clarity of purpose** (one concrete goal)
- **Immediacy of application** (do it now, not later)
- **Visibility of progress** (building blocks)
- **Confidence through success** (automated verification)
- **Flexibility of pace** (multiple paths)

Follow these patterns, and your workshop will:

- Keep students engaged (hands-on every 5-10 minutes)
- Demonstrate value quickly (comparisons throughout)
- Build confidence incrementally (automated feedback)
- Achieve the goal (2-hour target with optional extensions)
- Leave students capable (they built something real)

**Remember:** The best workshop is the one where students say "I can't believe I built that in 2 hours!"
