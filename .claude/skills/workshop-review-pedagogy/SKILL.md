---
name: workshop-review-pedagogy
description: Review workshop content for pedagogical effectiveness
disable-model-invocation: true
allowed-tools: Read, Edit, Write, Glob, Grep
---

# Workshop Review: Pedagogy and Flow

**Purpose:** Review workshop content for pedagogical effectiveness, learning progression, and instructional design.

**When to use:** After grammar review is complete and content is ready for pedagogical review.

**Prerequisites:**
- Workshop content is complete
- Grammar review completed
- AUTHORING-PROGRESS.md shows all lessons completed

---

## Overview

This skill performs a **pedagogical review** that checks:
- Learning progression (scaffolding)
- Building block accumulation
- Learn → Do → Verify pattern
- Bloom's taxonomy alignment
- PRIMM framework application (where relevant)
- Concept introduction and reinforcement
- Duration and pacing

**This review focuses on HOW WELL the workshop teaches, not grammar/formatting.**

---

## Phase 1: Pre-Review Setup (10 min)

### Checklist: Preparation
- [ ] Read WORKSHOP-PLAN.md for intended progression
- [ ] Read HOW-TO-BUILD-WORKSHOPS.md for methodology
- [ ] Read how-we-teach pedagogy lesson
- [ ] Map out all lessons and types
- [ ] Identify building blocks
- [ ] Create review tracking document

### Read These Files

```
MUST READ:
- WORKSHOP-PLAN.md (intended design)
- HOW-TO-BUILD-WORKSHOPS.md (methodology)
- asciidoc/courses/how-we-teach/modules/1-introduction/lessons/2-pedagogy/lesson.adoc
- CONTENT_GUIDELINES.md

REFERENCE:
- All lesson.adoc files in workshop
- All module.adoc files
```

### Create Tracking Document

Create `PEDAGOGY-REVIEW-PROGRESS.md`:

```markdown
# Pedagogy Review Progress

**Workshop:** [Name]
**Reviewer:** Pedagogy Review Skill
**Date:** [Date]

## Overall Structure

**Modules:** [N]
**Lessons:** [N] total ([X] required, [Y] optional)
**Duration:** [X] hours core, [Y] hours with optional

## Building Block Progression

- [ ] Module 2: "[Building block 1]" ✓
- [ ] Module 3: "[Building block 2]" ✓
- [ ] Module 4: "[Building block 3]" ✓
- [ ] Module 5: "[Final integration]" ✓

## Review Checklist

### Module 1: [Name]
- [ ] Lesson 1: Pedagogical review
- [ ] Lesson 2: Pedagogical review
- [ ] Lesson 3: Pedagogical review

[Continue for all modules...]

## Issues Found
- Issue: [Description]
- Issue: [Description]

## Review Complete
- Scaffolding verified: Yes/No
- Building blocks stack: Yes/No
- Duration realistic: Yes/No
```

---

## Phase 2: Workshop-Level Review (30 min)

### Checklist: Workshop Structure
- [ ] First lesson is workshop overview
- [ ] Module 1 is setup/introduction
- [ ] Building blocks clearly defined
- [ ] Building blocks stack progressively
- [ ] Each module has Learn → Do → Verify pattern
- [ ] Optional lessons marked and positioned correctly
- [ ] Final lesson triggers completion modal
- [ ] Total duration matches target (2 hours core)

### Workshop Structure Validation

**Required structure:**

```
Module 1: Setup and Introduction (15-20 min)
├── Lesson 1: Workshop Overview (REQUIRED - explains goal)
├── Lesson 2-3: Environment setup
└── Lesson 4: Tool overview (SOURCE OF TRUTH for mechanics)

Modules 2-N: Building Blocks (20-30 min each)
├── Learn: Concept lesson
├── Do: Challenge lesson
├── Verify: Validation/query lesson
└── Practice: Optional practice (marked :optional: true)

Final Module: Integration and Review (15-20 min)
├── Integration lesson or final query
├── Knowledge check quiz (REQUIRED)
└── Triggers completion modal
```

**Check:**
1. Does Module 1, Lesson 1 explain what will be built?
2. Does each module complete a building block?
3. Do building blocks stack (each builds on previous)?
4. Are optional lessons marked `:optional: true`?
5. Does final lesson trigger completion (quiz or questions)?

---

## Phase 3: Building Block Review (20 min)

### Checklist: Building Block Progression
- [ ] Each module states its building block
- [ ] Building blocks are concrete and measurable
- [ ] Building blocks stack progressively
- [ ] No orphaned concepts (all lead somewhere)
- [ ] Final module combines all blocks

### Building Block Pattern

**Verify each module completes a clear transformation:**

```markdown
Module 2: "Products exist in graph" ✓
└─> Module 3: Uses products, adds "Customer→Order path" ✓
    └─> Module 4: Uses both, adds "Customer→Order→Product path" ✓
        └─> Module 5: Combines all for "Recommendation query" ✓
```

**Check:**
- [ ] Each challenge lesson states what building block it completes
- [ ] Each validation lesson references the building block
- [ ] Module overviews state what will be added
- [ ] Building blocks are cumulative (not independent)

**Example good building block markers:**

```asciidoc
This completes **Building Block 1**: "Products exist in the graph" ✓
```

```asciidoc
This completes **Building Block 2**: "Customer→Order path complete" ✓
```

**Issues to flag:**
- Building block not stated
- Building blocks don't stack
- Module doesn't add to previous work
- Final module doesn't integrate all blocks

---

## Phase 4: Learn → Do → Verify Pattern Review (Per Module)

### Checklist: Pattern Compliance
- [ ] Concept lesson (Learn) comes before challenge
- [ ] Challenge lesson (Do) applies the concept
- [ ] Validation lesson (Verify) proves the value
- [ ] Gap between Learn and Do is minutes, not modules
- [ ] Optional practice (if present) comes after Verify

### Ideal Pattern

```
Module N: [Building Block]
├── Lesson 1: [Concept] (Learn) - 3-5 min
│   └─> Teaches 1-2 concepts
├── Lesson 2: [Challenge] (Do) - 7-12 min
│   └─> Applies concepts from Lesson 1
├── Lesson 3: [Validation] (Verify) - 3-5 min
│   └─> Queries what was built in Lesson 2
│   └─> Shows SQL comparison
└── Lesson 4: [Optional Practice] - 5-15 min (optional)
    └─> Additional practice on same structure
```

**Check:**
1. Does concept lesson prepare for the challenge?
2. Does challenge apply what was just taught?
3. Does validation query what was just built?
4. Is the gap small (same module)?

**Issues to flag:**
- Concept taught but not applied
- Challenge without preceding concept
- Validation without preceding challenge
- Large gap between Learn and Do (multiple modules)

---

## Phase 5: Lesson-Level Pedagogical Review (Per Lesson)

### Checklist: Lesson Pedagogy
- [ ] Appropriate length for type (concept: 3-5 min, challenge: 7-12 min)
- [ ] Blooms taxonomy level appropriate (concept: remember/understand, challenge: apply)
- [ ] Scaffolding from previous lesson
- [ ] Introduces no more than 1-2 new concepts (for theory lessons)
- [ ] Examples use workshop dataset (not generic)
- [ ] Connection to workshop goal is clear
- [ ] Prepares for what comes next

### Theory/Concept Lesson Review

**For each concept lesson, verify:**

**Opening scaffolding:**
- [ ] References what was learned previously (if not first lesson)
- [ ] States what will be learned in this lesson
- [ ] Two-part pattern (context + learning objective)

**Content:**
- [ ] 1-2 concepts max (not 5-6)
- [ ] Plain language definitions
- [ ] Examples from workshop dataset
- [ ] Connection to workshop goal stated
- [ ] Bloom's taxonomy: remember/understand (not apply/analyze)

**Summary:**
- [ ] Bullet points with bold concepts
- [ ] Forward reference to next lesson

**Issues to flag:**
- Too many concepts (cognitive overload)
- Generic examples (movies, books) instead of workshop data
- No connection to workshop goal
- Missing scaffolding from previous lesson
- Wrong Bloom's level (asking them to "build" in theory lesson)

---

### Challenge Lesson Review

**For each challenge lesson, verify:**

**Structure:**
- [ ] Clear challenge statement upfront
- [ ] States building block completion
- [ ] References tool mechanics (Module 1 Lesson 3)
- [ ] Step-by-step instructions
- [ ] Verification files present (verify.cypher, solution.cypher)

**Pedagogy:**
- [ ] Applies concept from previous lesson
- [ ] Hands-on (learners DO something)
- [ ] Automated verification gives feedback
- [ ] Snapshot option for skip-ahead
- [ ] Bloom's taxonomy: apply

**Connection:**
- [ ] Challenge references preceding concept lesson
- [ ] Building block marker present
- [ ] Next lesson will validate what was built

**Issues to flag:**
- Challenge without preceding concept
- No verification files
- Repeats tool mechanics (should reference Module 1 Lesson 3)
- Doesn't complete a building block
- No connection to previous/next lessons

---

### Validation Lesson Review

**For each validation lesson, verify:**

**Structure:**
- [ ] Queries what was just built
- [ ] 2-4 business questions
- [ ] SQL comparisons for each query
- [ ] Metrics table (lines, JOINs, complexity)

**Pedagogy:**
- [ ] Proves value with concrete comparisons
- [ ] Business questions (not abstract queries)
- [ ] Progressive complexity
- [ ] Connection to workshop goal

**SQL Comparisons:**
- [ ] Shows SQL side-by-side with Cypher
- [ ] Fair comparison (not intentionally bad SQL)
- [ ] Concrete metrics (4 lines vs 8 lines, 0 JOINs vs 3 JOINs)
- [ ] Explains WHY graph is better for THIS pattern

**Issues to flag:**
- Queries data not yet built
- No SQL comparisons
- Vague advantages ("faster" without specifics)
- Abstract queries (not business questions)
- Missing connection to workshop goal

---

### Optional Practice Lesson Review

**For each optional practice lesson, verify:**

**Metadata:**
- [ ] Marked with `:optional: true`

**Opening:**
- [ ] Explicitly addresses both paths (skip or practice)
- [ ] States who should do it (beginners) and who can skip (advanced)
- [ ] Connects to upcoming concept

**Content:**
- [ ] 3-5 progressive exercises
- [ ] Each has collapsible solution
- [ ] Solutions include explanations
- [ ] "Try experimenting" suggestions

**Issues to flag:**
- Not marked `:optional: true`
- Doesn't address both learning paths
- Too few exercises (< 3)
- Solutions without explanations
- No connection to upcoming concept

---

### Quiz Lesson Review

**For each quiz lesson, verify:**

**Metadata:**
- [ ] `:type: quiz`
- [ ] `:sequential: true` (if questions build on each other)

**Questions:**
- [ ] 8-12 questions total
- [ ] Cover concepts from all modules
- [ ] Use `[.question]` marker (NOT `.freetext`)
- [ ] Each has 4 answer options
- [ ] Each has hint and solution

**Pedagogy:**
- [ ] Tests understanding (not trivia)
- [ ] Wrong answers are plausible
- [ ] Hints guide without revealing
- [ ] Solutions explain why answer is correct
- [ ] Solutions reference module where taught

**Final Lesson:**
- [ ] If this is final lesson: triggers completion modal
- [ ] Summary has congratulations
- [ ] Next learning steps provided

**Issues to flag:**
- Too few questions (< 8)
- Questions test trivia (not understanding)
- Wrong marker (`.freetext` instead of `.question`)
- Missing hints or solutions
- Final lesson doesn't trigger completion

---

## Phase 6: Scaffolding and Progression Review

### Checklist: Scaffolding
- [ ] Each lesson builds on previous
- [ ] No sudden difficulty spikes
- [ ] Prerequisites clearly stated (workshop level)
- [ ] Concepts introduced before application
- [ ] Vocabulary defined before use

### Scaffolding Validation

**For each lesson, check:**

1. **Does it reference what came before?**
   - Concept lessons: "You learned [X] in the previous lesson"
   - Challenges: "Using [concepts from previous lesson]"
   - Validations: "You just built [X], now query it"

2. **Does it prepare for what comes next?**
   - Summary: "In the next lesson, you will..."
   - Forward references are accurate

3. **Is the difficulty progression smooth?**
   - Simple concepts → Complex concepts
   - Single-hop → Multi-hop queries
   - Basic patterns → Advanced patterns

**Issues to flag:**
- Lesson doesn't reference previous work
- Forward reference is inaccurate
- Sudden difficulty spike
- Vocabulary used before definition
- Concept applied before taught

---

## Phase 7: Duration and Pacing Review

### Checklist: Duration
- [ ] Each lesson duration is realistic
- [ ] Module durations add up correctly
- [ ] Total core path ≈ 2 hours (target: 1.5-2.5 hours)
- [ ] Optional lessons add 30-60 minutes
- [ ] Pacing is balanced across modules

### Duration Guidelines

**By lesson type:**
- Concept lesson: 3-5 minutes
- Challenge lesson: 7-12 minutes
- Validation lesson: 3-5 minutes
- Optional practice: 5-15 minutes
- Quiz: 5-10 minutes

**By module:**
- Module 1 (Setup): 15-20 minutes
- Building block modules: 20-30 minutes each
- Final module: 15-20 minutes

**Total workshop:**
- Core path: 2 hours (target: 100-140 minutes)
- With optional: 2.5-3 hours

**Issues to flag:**
- Individual lesson too long (> 15 min for any lesson)
- Module too long (> 40 min)
- Total duration off target (< 90 min or > 180 min for core)
- Pacing unbalanced (one module 45 min, another 10 min)

---

## Phase 8: Connection to Workshop Goal Review

### Checklist: Goal Connection
- [ ] Workshop goal stated in overview
- [ ] Each module connects to goal
- [ ] Each lesson explains how it enables goal
- [ ] Building blocks stack toward goal
- [ ] Final lesson achieves the goal

### Goal Connection Validation

**Check each lesson for:**

1. **Does it state WHY this matters for the goal?**
   - Concept lessons: "This concept is needed for [goal]"
   - Challenges: "This building block enables [goal]"
   - Validations: "This pattern is used in [final goal]"

2. **Can you trace from lesson to final goal?**
   - Lesson → Building Block → Workshop Goal

**Example good connections:**

```asciidoc
You can now traverse Customer → Order → Product paths.

To build a recommendation query, you'll extend this pattern: find customers who bought similar products, then recommend products they haven't purchased yet.

This multi-hop traversal pattern is the foundation for collaborative filtering.
```

**Issues to flag:**
- Lesson doesn't explain why it matters
- Unclear how lesson enables goal
- Orphaned concepts (not used in goal)
- Goal never actually achieved

---

## Phase 9: PRIMM Framework Review (For Challenges)

### Checklist: PRIMM Application
- [ ] Predict: Challenge states what will be built
- [ ] Run: Hands-on task with verification
- [ ] Investigate: Validation queries what was built
- [ ] Modify: Optional practice varies the pattern
- [ ] Make: Learners build their own (in challenges)

### PRIMM Progression

**Ideal flow:**

1. **Predict** (Concept lesson): "You will build X"
2. **Run** (Challenge lesson): Build X with guidance
3. **Investigate** (Validation lesson): Query X, understand how it works
4. **Modify** (Optional practice): Variations on X
5. **Make** (Later challenges): Build similar things independently

**Check:**
- Does workshop move from "Not mine" → "Mine" → "All mine"?
- Do later challenges require less guidance?
- Are learners gaining agency over time?

**Issues to flag:**
- Always hand-holding (no agency gained)
- No opportunity to modify/experiment
- Jump from guided to independent too quickly

---

## Phase 10: Final Pedagogical Report

### Create Review Summary

Update `PEDAGOGY-REVIEW-PROGRESS.md` with results:

```markdown
# Pedagogy Review Complete

**Workshop:** [Name]
**Date Completed:** [Date]

## Summary Assessment

### Overall Structure: ✅ Pass / ❌ Fail
- First lesson is overview: [Yes/No]
- Building blocks stack: [Yes/No]
- Learn → Do → Verify pattern: [Yes/No]
- Final lesson triggers completion: [Yes/No]

### Scaffolding: ✅ Pass / ❌ Fail
- Lessons build on previous: [Yes/No]
- Smooth difficulty progression: [Yes/No]
- Concepts before application: [Yes/No]

### Duration: ✅ Pass / ❌ Fail
- Core path ≈ 2 hours: [Actual: X hours]
- Individual lessons appropriate: [Yes/No]
- Pacing balanced: [Yes/No]

### Goal Connection: ✅ Pass / ❌ Fail
- Goal clearly stated: [Yes/No]
- All lessons connect to goal: [Yes/No]
- Goal achieved in final lesson: [Yes/No]

## Issues Found

### Critical Issues (Must Fix)
1. [Issue description]
2. [Issue description]

### Moderate Issues (Should Fix)
1. [Issue description]
2. [Issue description]

### Minor Issues (Nice to Fix)
1. [Issue description]
2. [Issue description]

## Recommendations

1. [Recommendation]
2. [Recommendation]
3. [Recommendation]

## Ready for Next Review Phase

✅ Pedagogy review complete

**Next step:** Use `workshop-review-technical` skill for technical accuracy review.
```

---

## References

- [HOW-TO-BUILD-WORKSHOPS.md](../../../docs/workshops/HOW-TO-BUILD-WORKSHOPS.md) - Workshop methodology
- [how-we-teach pedagogy](../../asciidoc/courses/how-we-teach/modules/1-introduction/lessons/2-pedagogy/lesson.adoc) - PRIMM, Bloom's, principles
- [CONTENT_GUIDELINES.md](../../asciidoc/courses/workshop-importing/CONTENT_GUIDELINES.md) - Workshop patterns
- [.cursor/review-lesson-content.mdc](../review-lesson-content.mdc) - Lesson review checklist
