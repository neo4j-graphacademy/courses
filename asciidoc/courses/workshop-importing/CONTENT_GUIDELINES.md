# Content Creation Guidelines

## Lesson Title Rules

### ❌ DO NOT use colons in lesson titles

**Bad:**
```asciidoc
= Challenge: Import Categories
= Optional: Practice Queries
= Module 3: Relationships
= Understanding Graphs: Part 1
```

**Good:**
```asciidoc
= Import Categories
= Practice Queries
= Modeling Relationships
= Understanding Graphs
```

**Why:**
- The lesson metadata (`:type: challenge`, `:optional: true`) already indicates the lesson type
- Colons interfere with parsing and navigation
- Cleaner, more concise titles

### ✅ Use metadata instead

```asciidoc
= Practice Queries
:type: lesson
:optional: true
:duration: 15
```

The system will display "Optional" or "Challenge" badges based on metadata, not the title.

---

## Lesson Structure Rules

### Teaching Pattern: Concept → Example

Every concept should be immediately followed by an example using the workshop dataset.

**Structure:**
1. **Concept** - Introduce the idea
2. **Example** - Demonstrate with Northwind data
3. **Query** - Show Cypher that illustrates the concept
4. **Result** - What students should see

**Example:**

```asciidoc
[.slide]
== Understanding constraints

**Concept:** Constraints enforce uniqueness AND create automatic indexes.

**On your Northwind graph:**

[source,cypher]
.Create constraint on customerId
----
CREATE CONSTRAINT customer_id_unique
FOR (c:Customer)
REQUIRE c.customerId IS UNIQUE;
----

**Result:** Fast lookups and no duplicate customers.
```

### Read Button Placement

**CRITICAL RULE:** Lessons should have EITHER a verification question OR a read button, never both.

#### When to use read:: button:
- Use when the lesson does NOT have a verification question (no `verify::[]` macro)
- Place BEFORE the `[.summary]` section
- Example placement:
  ```asciidoc
  [.slide]
  == Final content slide

  Content here...

  read::Proceed to next lesson[]

  [.summary]
  == Summary
  ```

#### When NOT to use read:: button:
- **DO NOT use when the lesson has a verification question** (`verify::[]` macro)
- The verification question provides the progression mechanism
- Example:
  ```asciidoc
  include::questions/verify.adoc[leveloffset=+1]

  [.summary]
  == Summary
  ```

---

## Verification Pattern

For challenge lessons that require database validation:

1. **Create `questions/verify.adoc`** with this structure:
   ```asciidoc
   [.verify.slide]
   = Validate Import

   Once you have completed [the task], click the **Check Database** button to verify.

   verify::[]

   [TIP,role=hint]
   .Hint
   ====
   Key steps to complete...
   ====

   [TIP,role=solution]
   .Solution
   ====
   Expected configuration and results...
   ====
   ```

2. **Create `verify.cypher`** in the lesson root:
   ```cypher
   // For node verification:
   RETURN COUNT {(:NodeLabel)} > 0 AS outcome, 'There must be one or more (:NodeLabel) nodes in the database. Check your spelling, node labels are case sensitive.' AS reason

   // For relationship verification:
   RETURN COUNT {()-[:REL_TYPE]->()} > 0 AS outcome, 'There must be one or more [:REL_TYPE] relationships in the database. Check your spelling, relationship types are case sensitive.' AS reason
   ```

   **Important:** The query must always return both `outcome` (boolean) and `reason` (string) columns.

3. **Create `solution.cypher`** in the lesson root:

   Every lesson with a `verify.cypher` file must also have a `solution.cypher` file containing the minimal Cypher code to pass the verification.

   ```cypher
   // Example for node import:
   CREATE (:NodeLabel {id: "1"});

   // Example for relationship import:
   CREATE (:FromNode {id: "1"})-[:REL_TYPE]->(:ToNode {id: "2"});
   ```

   **Important:** The solution should be the minimal code to pass verification, not the full import.

4. **Include in lesson.adoc** BEFORE the summary:
   ```asciidoc
   include::questions/verify.adoc[leveloffset=+1]

   [.summary]
   == Summary
   ```

5. **DO NOT include a `read::` button** - the verification handles progression

---

## Snapshot Instructions

Every mandatory lesson should include a collapsible snapshot section for students who want to skip ahead or catch up.

**Template:**

```asciidoc
[.collapsible]
.Load Pre-Built Data Model
====
**Skip ahead or catch up:** Load a pre-built data model at this stage.

**Steps:**
1. Open the **Data Importer** in your Aura instance
2. Click the **⋮ (three-dot menu)** in the top right corner
3. Select **"Open model"**
4. Download and select this snapshot file:

button::Download Model Snapshot[role=NX_DOWNLOAD_FILE, file="snapshots/moduleX-lessonY.zip"]

**What's included:**
* [List what's in the snapshot]
* Ready to run import

**After loading:**
1. Review the model on the canvas
2. Ensure connection to Aura instance
3. Click **"Run Import"** to load data
====
```

---

## Duration Guidelines

**Mandatory lessons:** Should target 120 minutes total (2 hours)
**Optional lessons:** Can be any length
**Homework lessons:** Typically 10-25 minutes each

**Per lesson targets:**
- Theory lessons: 5-10 minutes
- Import lessons: 10-15 minutes
- Query lessons: 10-15 minutes
- Practice lessons: 15-20 minutes

---

## File Structure

### Module Structure
```
modules/
└── X-module-name/
    ├── module.adoc
    └── lessons/
        ├── 1-lesson-slug/
        │   └── lesson.adoc
        ├── 2-lesson-slug/
        │   └── lesson.adoc
        └── 3-optional-lesson/
            └── lesson.adoc
```

### Homework Structure
```
homework/
└── X-module-name/
    └── lessons/
        ├── 1a-homework-slug/
        │   └── lesson.adoc
        └── 2a-homework-slug/
            └── lesson.adoc
```

**Homework numbering:**
- Use `1a`, `2a`, `3a` etc. to indicate homework extensions
- Place in corresponding module folder
- Follow same lesson structure as main modules

---

## Metadata Requirements

Every `lesson.adoc` must include:

```asciidoc
= Lesson Title
:type: lesson|challenge|quiz
:order: 1
:duration: 10
:optional: true  (if optional)
```

**Required fields:**
- `type` - lesson, challenge, or quiz
- `order` - numeric order within module
- `duration` - estimated minutes

**Optional fields:**
- `optional` - marks as optional (true/false)

---

## Writing Style

### DO:
✅ Use active voice ("Create a constraint" not "A constraint should be created")
✅ Use "you" to address students ("You will create..." not "Students will create...")
✅ Start with the concept, then show the example
✅ Use Northwind data in all examples
✅ Include validation queries after imports
✅ Keep lessons focused on one main concept
✅ Use concrete, specific language that explains "how" and "what"
✅ Explain what will be done and what it will be used for (instead of saying "optional")

### DON'T:
❌ Use colons in lesson titles
❌ Use passive voice
❌ Introduce concepts without examples
❌ Use abstract examples (always use Northwind)
❌ Skip validation steps
❌ Combine multiple unrelated concepts in one lesson
❌ Use empty buzzwords: "powerful", "elegant", "robust", "first-class citizens", "flexible", "scalable"
❌ Make vague statements that don't provide concrete information
❌ Call out "This lesson is optional" in lesson content - optional status is in metadata only

---

## Code Block Format

### Cypher queries:

```asciidoc
[source,cypher]
.Descriptive title of what the query does
----
MATCH (c:Customer {customerId: 'ALFKI'})  // (1)
RETURN c.companyName;                      // (2)
----

<1> **Anchor** - Find customer ALFKI
<2> **Return** - Get company name
```

### Important notes:
- Always include a descriptive title (`.Title`)
- Add callouts for complex queries (`// (1)`, `// (2)`)
- Explain each callout below the code block
- Use real Northwind values ('ALFKI', 'Chai', etc.)

---

## Homework Guidelines

**When to create homework:**
- Content is valuable but extends beyond 2-hour workshop
- Topic is advanced/optional
- Provides deeper dive into workshop concepts

**Homework structure:**
- Must reference main module lessons as prerequisites
- Should use same Northwind dataset
- Include clear learning objectives
- Estimated 10-25 minutes per homework lesson

**Total homework time:** Should not exceed 60 minutes across all homework

---

## Review Checklist

Before committing new content:

- [ ] No colons in lesson titles
- [ ] Concept → Example pattern followed
- [ ] All examples use Northwind data
- [ ] Metadata complete (type, order, duration)
- [ ] Snapshot section included (if mandatory lesson)
- [ ] Code blocks have descriptive titles
- [ ] Complex queries have callouts
- [ ] Validation queries included after imports
- [ ] Duration estimate is accurate
- [ ] Writing style follows guidelines (active voice, "you", focused)
- [ ] Read button placement correct: BEFORE summary if no verification, OMIT if has verification
- [ ] Verification pattern complete: questions/verify.adoc + verify.cypher if needed
