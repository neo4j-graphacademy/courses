---
name: workshop-authoring-coordinator
description: Orchestrate creation of workshop lesson content
disable-model-invocation: true
allowed-tools: Read, Write, Skill
---

# Workshop Authoring Coordinator Skill

**Purpose:** Orchestrate the creation of lesson content by invoking specialized skills for different lesson types.

**When to use:** Workshop structure is created and ready for content authoring.

**Prerequisites:**
- Workshop folder structure exists
- WORKSHOP-PLAN.md exists with module/lesson breakdown
- Skeleton lesson.adoc files exist

---

## Overview

This skill coordinates multiple specialized lesson author skills, each handling a specific lesson type:
- `lesson-author` - Theory/concept lessons
- `challenge-author` - Hands-on challenge lessons with verification
- `validation-author` - Query/proof lessons with SQL comparisons
- `practice-author` - Optional practice lessons
- `quiz-author` - Knowledge check quizzes
- `overview-author` - Workshop and module overviews

**How it works:** This coordinator invokes skills sequentially in the same conversation, providing context and tracking progress.

**Do NOT duplicate content.** This skill delegates to other skills; it does not write lessons itself.

---

## How to Use This Skill

This coordinator skill automatically invokes lesson author skills sequentially. When you invoke this skill:

1. **It reads your WORKSHOP-PLAN.md** to understand the workshop structure
2. **It creates AUTHORING-PROGRESS.md** to track completion
3. **It invokes lesson author skills one at a time** using the Skill tool
4. **Each skill has full conversation context** from previous lessons
5. **Progress is tracked and reported** after each lesson completes

**To start authoring:**
```
You: /workshop-authoring-coordinator

Or: Use the workshop-authoring-coordinator skill to author my workshop content
```

The coordinator will guide you through the process, invoking skills automatically as each lesson completes.

---

## Phase 1: Pre-Authoring Setup (5 min)

### Checklist: Ready to Author
- [ ] Workshop folder exists at `asciidoc/courses/workshop-[slug]/`
- [ ] WORKSHOP-PLAN.md exists with complete outline
- [ ] Module folders created
- [ ] Lesson folders created with skeleton files
- [ ] CONTENT_GUIDELINES.md present in workshop folder
- [ ] Data files present (if needed)
- [ ] Snapshots folder created

### Validation
Read WORKSHOP-PLAN.md and confirm:
- Total lesson count: ___ lessons
- Module count: ___ modules
- Lesson types breakdown:
  - ___ concept lessons
  - ___ challenge lessons
  - ___ validation lessons
  - ___ optional practice lessons
  - ___ quizzes
  - ___ overviews

### Create Tracking Document

Create `AUTHORING-PROGRESS.md`:

```markdown
# Workshop Authoring Progress

**Workshop:** [Name]
**Started:** [Date]
**Target Completion:** [Date]

## Module 1: [Name]

### Lessons
- [ ] 1-overview (overview-author) - Not started
- [ ] 2-setup (lesson-author) - Not started
- [ ] 3-tool-overview (lesson-author) - Not started

## Module 2: [Name]

### Lessons
- [ ] 1-concept (lesson-author) - Not started
- [ ] 2-challenge (challenge-author) - Not started
- [ ] 3-validation (validation-author) - Not started
- [ ] 4-optional-practice (practice-author) - Not started

[Repeat for all modules...]

## Completion Stats
- Total: 0/[N] lessons (0%)
- In Progress: 0
- Completed: 0
- Blocked: 0
```

---

## Phase 2: Authoring Coordination (Per Module)

### Module Authoring Order

**IMPORTANT:** Author modules and lessons sequentially (1 → 2 → 3).

**Why sequential:**
- Later modules reference earlier modules
- Later lessons reference earlier lessons
- Building blocks stack progressively
- Allows validation of flow before continuing
- Each skill has full conversation context

**Execution:** Skills are invoked sequentially using the Skill tool in the same conversation. This ensures:
- Context is preserved from previous lessons
- Scaffolding references are accurate
- Building blocks accumulate correctly

### Per-Module Process

#### Step 1: Review Module Plan
Read WORKSHOP-PLAN.md for the current module:
- [ ] Module objectives clear
- [ ] Building block defined
- [ ] Lesson sequence identified
- [ ] Source courses/lessons noted
- [ ] Duration targets set

#### Step 2: Invoke Lesson Skills

For each lesson in the module, invoke the appropriate skill using the Skill tool:

**Concept Lesson - Invoke lesson-author:**

Provide this context when invoking:
```
Workshop: [name]
Module: [number]-[slug] - [module name]
Lesson: [number]-[slug] - [lesson name]

Task: Write concept lesson that teaches [concept] in 3-5 minutes

Source: Adapt from [course]/[lesson] (if applicable)
Goal: Teach [specific concept]
Connects to: [next challenge lesson]
Building block: [which block this supports]

Plan reference: See WORKSHOP-PLAN.md section [X]

Expected output: Complete lesson.adoc file
```

**Challenge Lesson - Invoke challenge-author:**

Provide this context when invoking:
```
Workshop: [name]
Module: [number]-[slug] - [module name]
Lesson: [number]-[slug] - [lesson name]

Task: Write challenge lesson where students build [what]

Challenge: [what students will build/import/create]
Verification: verify.cypher should check [what]
Building block: "[completion statement]" ✓
Source: Adapt from [course]/[lesson] (if applicable)

Plan reference: See WORKSHOP-PLAN.md section [X]

Expected output:
- lesson.adoc
- verify.cypher
- solution.cypher
- questions/verify.adoc
```

**Validation Lesson - Invoke validation-author:**

Provide this context when invoking:
```
Workshop: [name]
Module: [number]-[slug] - [module name]
Lesson: [number]-[slug] - [lesson name]

Task: Write validation lesson that queries what was just built

Validates: [what was built in previous challenge]
SQL comparison: [what to compare against]
Proves: [value proposition - performance, simplicity, etc.]
Business questions: [2-4 questions to answer]

Plan reference: See WORKSHOP-PLAN.md section [X]

Expected output: Complete lesson.adoc with SQL comparisons
```

**Optional Practice Lesson - Invoke practice-author:**

Provide this context when invoking:
```
Workshop: [name]
Module: [number]-[slug] - [module name]
Lesson: [number]-[slug] - [lesson name]

Task: Write optional practice lesson with query exercises

Practices: [what concept/pattern]
Prepares for: [upcoming concept in next module]
Graph structure: [what nodes/relationships exist]

Plan reference: See WORKSHOP-PLAN.md section [X]

Expected output: Complete lesson.adoc (marked :optional: true)
```

**Quiz Lesson - Invoke quiz-author:**

Provide this context when invoking:
```
Workshop: [name]
Module: [number]-[slug] - [module name]
Lesson: [number]-[slug] - [lesson name]

Task: Write knowledge check quiz

Tests: [list concepts from prior modules]
Question count: 8-12 questions
Covers: [list modules to test]

Plan reference: See WORKSHOP-PLAN.md section [X]

Expected output:
- lesson.adoc (with :type: quiz)
- questions/01-[topic].adoc through 10-[topic].adoc
```

**Module Overview - Invoke overview-author:**

Provide this context when invoking:
```
Workshop: [name]
Module: [number]-[slug] - [module name]

Task: Write module overview (module.adoc)

Lessons in module: [list lesson numbers and types]
Module objectives: [from WORKSHOP-PLAN.md]
Building block: [what this module adds]

Plan reference: See WORKSHOP-PLAN.md

Expected output: Complete module.adoc file
```

#### Step 3: Track Progress

Update AUTHORING-PROGRESS.md as skills complete:

```markdown
- [x] 1-concept (lesson-author) - ✓ Completed [date]
- [x] 2-challenge (challenge-author) - ✓ Completed [date]
- [ ] 3-validation (validation-author) - Next to invoke
```

**Process:**
1. Invoke skill with context
2. Wait for skill to complete
3. Mark as completed in AUTHORING-PROGRESS.md
4. Move to next lesson

#### Step 4: Module Integration Check

When all lessons in a module are complete:

**Checklist: Module Complete**
- [ ] All lesson.adoc files exist and have content
- [ ] Module.adoc exists with correct order and objectives
- [ ] Building block progression is clear
- [ ] Lessons reference each other correctly
- [ ] Timing adds up to target (20-30 min per module)
- [ ] Optional lessons marked with :optional: true
- [ ] Verification files exist for challenges
- [ ] SQL comparisons present in validation lessons

**Transition Check:**
- [ ] Module N connects to Module N+1
- [ ] Building blocks stack (N+1 builds on N)
- [ ] No orphaned concepts (everything leads somewhere)

---

## Phase 3: Cross-Lesson Coordination

### Consistency Checks

After each module completion, verify:

#### Building Block Progression
```markdown
Module 1: ✓ "Products exist"
└─> Module 2: Uses products, adds "Customer→Order path" ✓
    └─> Module 3: Uses both, adds "Complete path" ✓
        └─> Module 4: Combines all for "Recommendation query" ✓
```

**Check:**
- [ ] Each module explicitly states what it adds
- [ ] Each module references previous building blocks
- [ ] Final module combines all blocks

#### Tool Mechanics References

Module 1 Lesson 3 is the SOURCE OF TRUTH for tool mechanics.

**Check all later lessons:**
- [ ] Say "See Module 1 Lesson 3 for tool mechanics"
- [ ] Focus on WHAT to do, not HOW to click
- [ ] No repeated UI walkthroughs

#### SQL Comparisons

Every validation lesson should compare to SQL.

**Check:**
- [ ] Comparison shown side-by-side
- [ ] Metrics provided (lines, JOINs, complexity)
- [ ] Explains WHY graph is better for THIS pattern

#### Property Naming

All queries should use consistent property names.

**Check:**
- [ ] IDs use `id` (not `customerId`, `productId`)
- [ ] Names use `name` (not `companyName`, `productName`)
- [ ] Dates use `date` (not `orderDate`)
- [ ] Other properties match import configuration

---

## Phase 4: Module Overviews

After lesson content is complete, create module.adoc files.

### Spawn Module Overview Subagents

For each module:

```markdown
Task: Write module overview for [module]

Agent: overview-author
Context:
- Workshop: [name]
- Module: [number]-[slug]
- Lessons: [list lesson numbers and types]
- Objectives: [from WORKSHOP-PLAN.md]
- Building block: [what this module adds]

Plan reference: See WORKSHOP-PLAN.md
Example: See modules/4-many-to-many/module.adoc

Output: Complete module.adoc file
```

---

## Phase 5: Workshop Overview

Last step: Create workshop overview lesson.

### Spawn Workshop Overview Subagent

```markdown
Task: Write workshop overview lesson

Agent: overview-author
Context:
- Workshop: [name]
- Goal: [concrete deliverable]
- Modules: [count] modules
- Duration: [2 hours core + optional]
- Building blocks: [list all]
- Prerequisites: [from plan]
- Environment: [Aura/Codespaces/Sandbox with why]

Plan reference: See WORKSHOP-PLAN.md
Example: See modules/1-aura-setup/lessons/1-workshop-overview/

Output: Complete 1-workshop-overview/lesson.adoc
```

---

## Phase 6: Final Coordination

### Complete AUTHORING-PROGRESS.md

Update with final status:

```markdown
## Completion Stats
- Total: [N]/[N] lessons (100%)
- In Progress: 0
- Completed: [N]
- Blocked: 0

## Authoring Complete
- Started: [date]
- Completed: [date]
- Duration: [days]

**Next Step:** Review phase (grammar, pedagogy, technical)
```

### Create Handoff Document

Create `READY-FOR-REVIEW.md`:

```markdown
# Workshop Ready for Review

**Workshop:** [Name]
**Folder:** `asciidoc/courses/workshop-[slug]/`
**Authoring Completed:** [Date]

## Structure
- [N] modules
- [N] lessons total
  - [N] concept lessons
  - [N] challenge lessons
  - [N] validation lessons
  - [N] optional practice
  - [N] quizzes

## Building Blocks
1. Module 2: "[Building block 1]" ✓
2. Module 3: "[Building block 2]" ✓
3. Module 4: "[Building block 3]" ✓
4. Module 5: "[Final integration]" ✓

## Timing
- Mandatory: [___] min (target: 120)
- Optional: [___] min
- Total: [___] min

## Files Created
- [N] lesson.adoc files
- [N] module.adoc files
- [N] verify.cypher files
- [N] solution.cypher files
- [N] quiz questions
- course.adoc ✓
- README.md ✓

## Review Checklist
- [ ] Grammar review (use workshop-review-grammar skill)
- [ ] Pedagogy review (use workshop-review-pedagogy skill)
- [ ] Technical review (use workshop-review-technical skill)
- [ ] Timing validation
- [ ] Test workshop walkthrough

**Next Step:** Use review skills to validate quality.
```

---

## Coordination Patterns

### Sequential Execution with Skill Tool

**All lesson skills run sequentially in the same conversation:**
- Modules authored one at a time (1 → 2 → 3)
- Lessons within module authored in order
- Each skill completes before invoking the next

**Why sequential:**
- Skills build on context from previous lessons
- Can validate flow as you go
- Errors caught early before continuing
- Maintains conversation history for context

### Invocation Order

Module 2 authoring order:

```
1. Invoke lesson-author for concept lesson
   ↓ (wait for completion)
2. Invoke challenge-author for challenge lesson
   └─> Uses context from step 1
   ↓ (wait for completion)
3. Invoke validation-author for validation lesson
   └─> Uses context from step 2
   ↓ (wait for completion)
4. Invoke practice-author for optional practice (if needed)
   └─> Uses context from steps 1-3
```

**Pattern:** Each skill has full conversation context and can reference what was just created.

### Dependency Flow

```
Module Overview (invoke overview-author)
└─> Lesson 1: Concept (invoke lesson-author)
    └─> Lesson 2: Challenge (invoke challenge-author)
        ├─> Lesson 3: Validation (invoke validation-author)
        └─> Lesson 4: Optional Practice (invoke practice-author)

Module N Overview
└─> Depends on: Module N-1 completion
```

---

## Error Handling

### If Skill Invocation Fails

1. **Identify issue:** Review skill output and error messages
2. **Update AUTHORING-PROGRESS.md:** Mark as "Blocked - [reason]"
3. **Resolve:**
   - Missing source content? → Get user to clarify
   - Unclear requirements? → Update WORKSHOP-PLAN.md
   - Technical error? → Provide additional context
4. **Retry:** Invoke skill again with clearer context or corrected information

### If Timing Off

If module timing exceeds target:
1. Identify longest lessons
2. Options:
   - Move content to optional lesson
   - Split into two concepts
   - Move advanced content to homework
   - Tighten explanations
3. Update WORKSHOP-PLAN.md with changes
4. Notify user of timing adjustment

### If Building Blocks Don't Stack

If Module N doesn't properly build on Module N-1:
1. **Stop authoring** Module N+1
2. **Review transition:** Read Module N-1 summary and Module N intro
3. **Fix connection:** Update intro to reference previous module explicitly
4. **Verify stack:** Confirm building block progression makes sense
5. **Continue:** Resume with Module N+1

---

## Complete Workflow Example

**User starts the process:**

```
User: /workshop-authoring-coordinator
```

**Coordinator responds:**

```
I'll coordinate authoring your workshop. Let me start by reading WORKSHOP-PLAN.md...

[Reads WORKSHOP-PLAN.md]

Workshop: Northwind Import Workshop
- 5 modules
- 24 lessons total (18 required, 6 optional)

I'll create AUTHORING-PROGRESS.md to track progress.

Starting with Module 1, Lesson 1: Workshop Overview

[Invokes overview-author skill with context]
```

**After lesson 1 completes:**

```
✓ Module 1, Lesson 1 complete: workshop-overview/lesson.adoc created

Moving to Module 1, Lesson 2: Aura Setup

[Invokes lesson-author skill with context]
```

**Process continues sequentially:**

```
✓ Module 1, Lesson 2 complete
✓ Module 1, Lesson 3 complete

Module 1 complete! Moving to Module 2...

✓ Module 2, Lesson 1 complete (concept)
✓ Module 2, Lesson 2 complete (challenge with verification files)
✓ Module 2, Lesson 3 complete (validation with SQL comparisons)
✓ Module 2, Lesson 4 complete (optional practice)

Module 2 complete! Moving to Module 3...

[Continues through all modules...]

✓ All lessons complete!

Final step: Module overviews

[Invokes overview-author for each module.adoc]

✓ Workshop authoring complete!

Next steps:
1. /workshop-review-grammar
2. /workshop-review-pedagogy
3. /workshop-review-technical
```

**User can then invoke review skills:**

```
User: /workshop-review-grammar
```

The coordinator maintains full conversation context, so each skill can reference what was just created.

---

## References

- [lesson-author.md](./lesson-author.md) - Concept lesson skill
- [challenge-author.md](./challenge-author.md) - Challenge lesson skill
- [validation-author.md](./validation-author.md) - Validation lesson skill
- [practice-author.md](./practice-author.md) - Optional practice skill
- [quiz-author.md](./quiz-author.md) - Quiz skill
- [overview-author.md](./overview-author.md) - Overview skill
- [workshop-review-grammar.md](./workshop-review-grammar.md) - Grammar review skill
- [workshop-review-pedagogy.md](./workshop-review-pedagogy.md) - Pedagogy review skill
- [workshop-review-technical.md](./workshop-review-technical.md) - Technical review skill
- [CONTENT_GUIDELINES.md](../../asciidoc/courses/workshop-importing/CONTENT_GUIDELINES.md) - All guidelines
- [HOW-TO-BUILD-WORKSHOPS.md](../../../docs/workshops/HOW-TO-BUILD-WORKSHOPS.md#phase-4-write-content-10-15-hours) - Authoring methodology
