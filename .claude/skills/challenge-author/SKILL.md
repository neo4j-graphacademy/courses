---
name: challenge-author
description: Write hands-on challenge lessons with verification
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Challenge Author Skill

**Purpose:** Write hands-on challenge lessons with automated verification.

**When to use:** Workshop lesson requires learners to build something hands-on.

**Prerequisites:**
- WORKSHOP-PLAN.md exists with challenge details
- Skeleton lesson.adoc file exists
- Previous concept lesson completed
- Source course lessons identified

---

## Overview

This skill writes **challenge lessons** that:
- Guide learners through hands-on tasks (7-12 minutes)
- Include automated verification (verify.cypher)
- Provide solutions (solution.cypher)
- Complete a building block transformation
- Follow the Learn → Do → Verify pattern (this is the "Do")

**Do NOT write concept lessons, quizzes, or practice lessons.** This skill focuses ONLY on challenge lessons with verification.

---

## Phase 1: Understand Challenge (5 min)

### Checklist: Gather Information
- [ ] Read WORKSHOP-PLAN.md for challenge objectives
- [ ] Read source course lesson(s) identified
- [ ] Read previous concept lesson (what was just taught)
- [ ] Identify what learners will build/import/create
- [ ] Note building block this challenge completes
- [ ] Understand verification criteria (what to check)

### Key Questions to Answer

**Before writing anything, answer:**

1. **What will learners build?** (e.g., import Product nodes, create relationships)
2. **What was just taught?** (previous concept lesson)
3. **What building block does this complete?** (e.g., "Products exist in graph" ✓)
4. **How do we verify success?** (what verify.cypher should check)
5. **What data are they using?** (CSV files, configuration)
6. **What tools are they using?** (Data Importer, Query tool, etc.)

### Read These Files

```
MUST READ:
- WORKSHOP-PLAN.md (for challenge details)
- Source course lesson (for challenge content)
- Previous concept lesson (for context)
- CONTENT_GUIDELINES.md (for style rules)

REFERENCE:
- modules/2-foundation/lessons/4-import-products/ (example challenge)
- verify.cypher, solution.cypher, questions/verify.adoc examples
```

---

## Phase 2: Plan Challenge Structure (10 min)

### Checklist: Challenge Outline
- [ ] Clear challenge statement upfront
- [ ] Data table showing CSV structure
- [ ] Download button for data files
- [ ] Reference to tool mechanics (Module 1 Lesson 3)
- [ ] Step-by-step instructions
- [ ] Property configuration details
- [ ] Snapshot option for skip-ahead
- [ ] Verification criteria defined

### Structure Template

```
Introduction
├── Challenge statement: "You will [action]"
└── Building block: "This completes [description]"

The Data
├── CSV structure table
└── Download button

Tool Reference
└── "See Module 1 Lesson 3 for tool mechanics"

Instructions
├── Step 1: [What to do]
├── Step 2: [What to do]
└── Step N: [What to do]

Configuration Details
└── Property mapping table

Snapshot Option
└── Collapsible with pre-built model

Verification
└── Include questions/verify.adoc
```

### Building Block Marker

Every challenge MUST complete a building block. State it clearly:

```asciidoc
This completes **Building Block 1**: "Products exist in the graph" ✓
```

**Examples:**
- Module 2: "Products exist in the graph" ✓
- Module 3: "Customer→Order path complete" ✓
- Module 4: "Customer→Order→Product path complete" ✓

---

## Phase 3: Write Challenge Introduction (5 min)

### Checklist: Opening
- [ ] Clear challenge statement
- [ ] States what will be built
- [ ] References building block completion
- [ ] 2-3 sentences max (concise!)

### Opening Pattern

```asciidoc
[.slide.discrete]
== Challenge

You will [specific action with tool].

This completes **Building Block [N]**: "[Description]" ✓
```

**Example:**

```asciidoc
[.slide.discrete]
== Challenge

You will use Data Importer to import Product nodes from a CSV file.

This completes **Building Block 1**: "Products exist in the graph" ✓
```

---

## Phase 4: Write Data Section (10 min)

### Checklist: Data Information
- [ ] Shows CSV structure in table format
- [ ] Explains what each column represents
- [ ] Uses [options="header"] AsciiDoc table
- [ ] Download button with correct file path
- [ ] Note about downloading once, using throughout

### Data Table Pattern

```asciidoc
[.slide]
== The Data

[Brief description of what the data represents]

[options="header"]
|===
| Column | Type | Description

| columnName1 | String | What this column contains
| columnName2 | Integer | What this column contains
| columnName3 | Float | What this column contains
|===
```

**Example:**

```asciidoc
[.slide]
== The Data

The products.csv file contains information about items in the Northwind catalog.

[options="header"]
|===
| Column | Type | Description

| productId | String | Unique identifier for each product
| productName | String | Display name of the product
| unitPrice | Float | Price per unit in USD
| unitsInStock | Integer | Current inventory count
| categoryId | String | Reference to product category
|===
```

### Download Button Pattern

```asciidoc
[.slide]
== Load Data Files

button::Download Workshop Data[role=NX_DOWNLOAD_FILE, file="data/workshop-data.zip"]

**Note:** Download once and extract. You will use these CSV files throughout the workshop.
```

---

## Phase 5: Write Instructions (15 min)

### Checklist: Instructions Section
- [ ] References Module 1 Lesson 3 for tool mechanics
- [ ] Steps are numbered and clear
- [ ] Focuses on WHAT to do, not HOW to click
- [ ] Property configuration table included
- [ ] Run import instructions included
- [ ] Confirmation message stated

### Tool Reference Pattern

**CRITICAL:** Do NOT repeat tool mechanics. Reference Module 1 Lesson 3.

```asciidoc
[.slide]
== Using [Tool Name]

**Reference:** See Module 1 Lesson 3 for [tool name] mechanics.

**Steps for this challenge:**
1. [High-level step 1]
2. [High-level step 2]
3. [High-level step 3]
```

**Example:**

```asciidoc
[.slide]
== Using Data Importer

**Reference:** See Module 1 Lesson 3 for Data Importer mechanics.

**Steps for this challenge:**
1. Open **Data Importer** from Aura console
2. Upload products.csv
3. Map to Product node
4. Configure properties
5. Run import
```

### Property Configuration Pattern

```asciidoc
[.slide]
== Configure Properties

Map the CSV columns to node properties:

[options="header"]
|===
| CSV Column | Type | Rename To | Notes

| productId | String | id | Unique identifier
| productName | String | name | Display name
| unitPrice | Float | | Keep original name
| unitsInStock | Integer | | Keep original name
|===

**Important:** Set `id` as the unique identifier property.
```

### Run Import Pattern

```asciidoc
[.slide]
== Run Import

Click **Run Import** to execute.

**Confirmation:** You should see "**77 Product nodes created**"
```

---

## Phase 6: Write Snapshot Section (5 min)

### Checklist: Snapshot Option
- [ ] Uses [.collapsible] block
- [ ] Title: "Load Pre-Built Data Model"
- [ ] Explains what's included
- [ ] Download button with snapshot file
- [ ] Instructions for after loading

### Snapshot Pattern

```asciidoc
[.slide]
== Snapshot Option

[.collapsible]
.Load Pre-Built Data Model
====
**Skip ahead:** If you want to skip this challenge, load the pre-built model.

button::Download Snapshot[role=NX_DOWNLOAD_FILE, file="snapshots/module2-lesson4.zip"]

**What's included:**
* [What was built in this challenge]
* [Configuration details]

**After loading:**
1. Review the model in Data Importer
2. Connect to your instance
3. Click **Run Import**
====
```

**Example:**

```asciidoc
[.slide]
== Snapshot Option

[.collapsible]
.Load Pre-Built Data Model
====
**Skip ahead:** If you want to skip this challenge, load the pre-built model.

button::Download Snapshot[role=NX_DOWNLOAD_FILE, file="snapshots/module2-lesson4.zip"]

**What's included:**
* Product node mapping
* Property configuration (id, name, unitPrice, unitsInStock)
* Ready to import 77 products

**After loading:**
1. Review the model in Data Importer
2. Upload products.csv
3. Click **Run Import**
====
```

---

## Phase 7: Create Verification Files (20 min)

### Checklist: Verification Files
- [ ] verify.cypher returns `outcome` and `reason`
- [ ] solution.cypher provides minimal passing code
- [ ] questions/verify.adoc includes hint and solution
- [ ] Verification checks are specific and helpful

### File Structure

```
lesson-folder/
├── lesson.adoc
├── verify.cypher           (automated check)
├── solution.cypher         (minimal passing code)
└── questions/
    └── verify.adoc         (UI integration)
```

### verify.cypher Pattern

**CRITICAL:** Must return exactly two columns: `outcome` (boolean) and `reason` (string)

```cypher
// verify.cypher
RETURN COUNT { (:NodeLabel) } > 0 AS outcome,
       CASE
           WHEN COUNT { (:NodeLabel) } = 0
           THEN 'No [NodeLabel] nodes found. Check that you imported the data.'
           WHEN COUNT { (:NodeLabel) } < [expected]
           THEN 'Only ' + COUNT { (:NodeLabel) } + ' [NodeLabel] nodes found. Expected [expected].'
           ELSE 'Success! You imported ' + COUNT { (:NodeLabel) } + ' [NodeLabel] nodes.'
       END AS reason;
```

**Example (verify.cypher):**

```cypher
// Verify Product nodes were imported
RETURN COUNT { (:Product) } > 0 AS outcome,
       CASE
           WHEN COUNT { (:Product) } = 0
           THEN 'No Product nodes found. Make sure you ran the import in Data Importer.'
           WHEN COUNT { (:Product) } < 77
           THEN 'Only ' + COUNT { (:Product) } + ' Product nodes found. Expected 77.'
           ELSE 'Success! You imported ' + COUNT { (:Product) } + ' Product nodes.'
       END AS reason;
```

### solution.cypher Pattern

**CRITICAL:** Minimal code that passes verification, NOT full solution

```cypher
// solution.cypher - minimal passing example
CREATE (:NodeLabel {id: "1", name: "Test Item"});
```

**Example (solution.cypher):**

```cypher
// Minimal solution that passes verification
// This is NOT the recommended approach - use Data Importer instead
CREATE (:Product {id: "1", name: "Test Product"});
CREATE (:Product {id: "2", name: "Another Product"});
```

### questions/verify.adoc Pattern

```asciidoc
[.verify.slide]
== Validate Results

verify::[]

[TIP,role=hint]
.Hint
====
[Guidance toward solution without giving it away]

**Check:**
* [Thing to verify 1]
* [Thing to verify 2]
====

[TIP,role=solution]
.Solution
====
[Manual validation query]

[source,cypher]
.Check imported nodes
----
MATCH (n:NodeLabel)
RETURN count(n) AS total;
----

You should see [expected result].

**If verification fails:**
* [Troubleshooting step 1]
* [Troubleshooting step 2]
====
```

**Example (questions/verify.adoc):**

```asciidoc
[.verify.slide]
== Validate Results

verify::[]

[TIP,role=hint]
.Hint
====
Make sure you completed all steps in Data Importer:

**Check:**
* CSV file uploaded
* Product node mapped
* Properties configured (id, name, unitPrice, unitsInStock)
* Import executed successfully
====

[TIP,role=solution]
.Solution
====
Run this query to check your Product nodes:

[source,cypher]
.Check Product nodes
----
MATCH (p:Product)
RETURN count(p) AS total,
       collect(p.name)[0..5] AS sampleNames;
----

You should see 77 total products with names like "Chai", "Chang", "Aniseed Syrup".

**If verification fails:**
* Verify the CSV file was uploaded correctly
* Check that property names match (id, name not productId, productName)
* Ensure you clicked "Run Import"
* Try reloading the Data Importer page
====
```

---

## Phase 8: Write Summary (5 min)

### Checklist: Summary Section
- [ ] Lists what was accomplished
- [ ] States number of nodes/relationships created
- [ ] Notes properties configured
- [ ] Confirms building block completion with ✓
- [ ] Forward reference to next lesson

### Summary Pattern

```asciidoc
[.summary]
== Summary

You imported [Entity] nodes:

* [N] nodes created
* Properties: [list properties]
* **Building Block [N]**: "[Description]" ✓

In the next lesson, you will [what comes next].
```

**Example:**

```asciidoc
[.summary]
== Summary

You imported Product nodes using Data Importer:

* 77 Product nodes created
* Properties: id, name, unitPrice, unitsInStock
* **Building Block 1**: "Products exist in the graph" ✓

In the next lesson, you will write queries to explore the products you imported.
```

---

## Phase 9: Apply Style Rules (10 min)

### Checklist: Technical Requirements
- [ ] Two line breaks between ALL sections
- [ ] [.slide.discrete] for introduction
- [ ] [.slide] for main sections
- [ ] [.summary] for summary
- [ ] Include questions/verify.adoc with leveloffset
- [ ] All tables use [options="header"] AsciiDoc format
- [ ] No tool mechanics (references Module 1 Lesson 3 instead)
- [ ] Building block completion marker present
- [ ] Natural tone (no sales/AI language)

### Include Verification

At the end of instructions, before summary:

```asciidoc
include::questions/verify.adoc[leveloffset=+1]


[.summary]
== Summary
```

---

## Phase 10: Review and Refine (10 min)

### Checklist: Self-Review
- [ ] Re-read lesson aloud
- [ ] Check timing (7-12 minutes to complete)
- [ ] Verify clear challenge statement
- [ ] All tables are AsciiDoc format
- [ ] References Module 1 Lesson 3 for tool mechanics
- [ ] Snapshot option present
- [ ] verify.cypher returns outcome + reason
- [ ] solution.cypher is minimal
- [ ] questions/verify.adoc has hint + solution
- [ ] Building block completion stated
- [ ] Summary includes forward reference

### Test Verification Files

**Before completing:**

1. **Test verify.cypher:**
   - Returns `outcome` (boolean) and `reason` (string)?
   - Handles zero results case?
   - Handles partial results case?
   - Provides helpful error messages?

2. **Test solution.cypher:**
   - Runs without errors?
   - Passes verify.cypher check?
   - Is minimal (not full solution)?

3. **Test questions/verify.adoc:**
   - Hint guides without giving answer?
   - Solution provides manual validation query?
   - Troubleshooting steps are helpful?

---

## Examples and References

### Example Challenge Lessons

**See these real files:**

- `modules/2-foundation/lessons/4-import-products/`
  - Files: lesson.adoc, verify.cypher, solution.cypher, questions/verify.adoc
  - Demonstrates: Data table, property configuration, snapshot, verification

- `modules/3-modeling-relationships/lessons/2-import-customers-orders/`
  - Demonstrates: Multiple entity imports, relationship creation

- `modules/4-many-to-many/lessons/2-create-orders-relationships/`
  - Demonstrates: Many-to-many relationship challenge

### What These Files Demonstrate

**4-import-products/lesson.adoc:**
- Clear challenge statement upfront
- Data table with CSV structure
- Download button for workshop data
- Reference to Module 1 Lesson 3 (no repeated mechanics)
- Property configuration table
- Collapsible snapshot section
- Includes questions/verify.adoc
- Building block marker: "Building Block 1: 'Products exist' ✓"

**verify.cypher:**
- Returns `outcome` and `reason`
- Uses COUNT subquery: `COUNT {(:Product)} > 0`
- Provides helpful error messages for different scenarios

**solution.cypher:**
- Minimal code: `CREATE (:Product {id: "1", name: "Test"})`
- Just enough to pass, not full solution

**questions/verify.adoc:**
- `[.verify.slide]` marker
- `verify::[]` macro for system integration
- Hint section with checklist
- Solution with manual validation query
- Troubleshooting steps

---

## Output Checklist

Before marking challenge complete, verify:

- [ ] File: `lesson.adoc` exists
- [ ] File: `verify.cypher` exists and tested
- [ ] File: `solution.cypher` exists and tested
- [ ] File: `questions/verify.adoc` exists
- [ ] Metadata: `:type: challenge`, `:order: X`, `:duration: 7-12`
- [ ] Source attribution in comments
- [ ] Clear challenge statement with building block
- [ ] Data table with CSV structure
- [ ] Download button for data files
- [ ] References Module 1 Lesson 3 (not repeating mechanics)
- [ ] Property configuration details
- [ ] Snapshot option with collapsible
- [ ] Verification files all working
- [ ] Summary with building block ✓ marker
- [ ] Two line breaks between sections
- [ ] No markdown, only AsciiDoc

---

## References

- [CONTENT_GUIDELINES.md](../../asciidoc/courses/workshop-importing/CONTENT_GUIDELINES.md) - Verification patterns
- [HOW-TO-BUILD-WORKSHOPS.md](../../../docs/workshops/HOW-TO-BUILD-WORKSHOPS.md) - Challenge methodology
- [create-new-workshop.mdc](../create-new-workshop.mdc) - Challenge requirements
- [modules/2-foundation/lessons/4-import-products/](../../asciidoc/courses/workshop-importing/modules/2-foundation/lessons/4-import-products/) - Complete example
