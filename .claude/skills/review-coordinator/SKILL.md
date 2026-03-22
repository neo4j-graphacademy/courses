---
name: review-coordinator
description: Orchestrate the full lesson review pipeline across all lessons in a course. Runs grammar, structure, technical, facts, and questions reviews on one lesson at a time — pausing between lessons for human review.
allowed-tools: Read, Write, Edit, Glob, Grep, Skill
---

# Review: Coordinator

**Purpose:** Orchestrate the complete review pipeline across every lesson in a course. Reviews one lesson at a time through all stages, then pauses so you can inspect and accept or reject changes before moving to the next lesson.

**When to use:** When you want to run a full review pass on a whole course. Also use to resume a review that was paused.

**Input:** Path to a course folder (e.g. `asciidoc/courses/my-course/`)

**Review stages per lesson (run in order):**

1. `review-lesson-grammar` — US English, voice, terminology
2. `review-lesson-structure` — pedagogy, length, opening pattern
3. `review-lesson-technical` — AsciiDoc, links, code blocks, slides
4. `review-lesson-facts` — fact-check against neo4j-docs MCP
5. `review-questions` — questions/ subfolder (if present)

**Output:**
- `REVIEW-REPORT.md` created in each lesson folder (grammar, structure, technical, facts, questions all append to the same file)
- `REVIEW-PROGRESS.md` created in the course folder (tracks which lessons have been reviewed)

---

## How to Start

```
/review-coordinator asciidoc/courses/my-course/
```

Or just invoke the skill and provide the course path when prompted.

---

## How to Resume

If you have already started a review, run the skill again with the same course path. It reads `REVIEW-PROGRESS.md` and picks up where it left off.

---

## Phase 1: Setup

### Read existing progress

Check whether `REVIEW-PROGRESS.md` exists in the course folder:

- If it exists, read it to find the first lesson marked as **Pending**
- If it does not exist, create it (see below)

### Discover all lessons

Use Glob to find all `lesson.adoc` files:

```
Glob: [course-path]/modules/*/lessons/*/lesson.adoc
```

Sort by module order then lesson order (alphabetically by path works for consistently numbered folders).

### Create REVIEW-PROGRESS.md

```markdown
# Review Progress

**Course:** [course slug]
**Path:** [course path]
**Started:** [date]

## Lessons

| Lesson | Path | Status |
|--------|------|--------|
| Module 1 / Lesson 1 | modules/1-intro/lessons/1-overview/ | Pending |
| Module 1 / Lesson 2 | modules/1-intro/lessons/2-concepts/ | Pending |
| Module 2 / Lesson 1 | modules/2-querying/lessons/1-match/ | Pending |
[... all lessons ...]

## Summary

- Total lessons: N
- Reviewed: 0
- Pending: N
- Skipped: 0
```

---

## Phase 2: Review One Lesson

Find the **first Pending** lesson in `REVIEW-PROGRESS.md`. Run all five review stages on it sequentially:

### Step 1 — Grammar

Invoke the `review-lesson-grammar` skill:

```
Skill: review-lesson-grammar
Context: [lesson folder path]
```

Wait for completion.

### Step 2 — Structure

Invoke the `review-lesson-structure` skill:

```
Skill: review-lesson-structure
Context: [lesson folder path]
```

Wait for completion.

### Step 3 — Technical

Invoke the `review-lesson-technical` skill:

```
Skill: review-lesson-technical
Context: [lesson folder path]
```

Wait for completion.

### Step 4 — Facts

Invoke the `review-lesson-facts` skill:

```
Skill: review-lesson-facts
Context: [lesson folder path]
```

Wait for completion.

### Step 5 — Questions (if applicable)

Check whether a `questions/` folder exists in the lesson folder. If it does, invoke `review-questions`:

```
Skill: review-questions
Context: [lesson folder path]
```

Wait for completion.

---

## Phase 3: Update Progress and Report

After all stages complete for the lesson:

1. Mark the lesson as **Reviewed** in `REVIEW-PROGRESS.md`
2. Update the summary counts

```markdown
| Module 1 / Lesson 1 | modules/1-intro/lessons/1-overview/ | ✅ Reviewed |
```

Then report to the user:

```
✅ Review complete: Module 1 / Lesson 1 — Understanding graph elements

Changes were made to:
  modules/1-intro/lessons/1-overview/lesson.adoc

A full report of every change and why is in:
  modules/1-intro/lessons/1-overview/REVIEW-REPORT.md

To accept all changes:
  git add modules/1-intro/lessons/1-overview/
  git commit -m "review: grammar, structure, and formatting fixes for 1-overview"

To review changes before accepting:
  git diff modules/1-intro/lessons/1-overview/lesson.adoc

To reject all changes:
  git checkout modules/1-intro/lessons/1-overview/lesson.adoc

─────────────────────────────
Next lesson: Module 1 / Lesson 2 — Introduction to Cypher
Run /review-coordinator again to continue.
─────────────────────────────
```

---

## Phase 4: Pause for Human Review

**Stop after each lesson.** Do not automatically continue to the next lesson.

The human must:
1. Review the changes (`git diff`)
2. Accept or reject (`git add` + `git commit`, or `git checkout`)
3. Run `/review-coordinator` again to continue

This ensures changes are reviewed incrementally and mistakes can be caught before they propagate.

---

## Phase 5: Run Course Structure Review (Last Step)

Once all lessons are marked **Reviewed** in `REVIEW-PROGRESS.md`, prompt:

```
✅ All lessons reviewed!

Final step: Run course structure review.
This checks lesson attributes, module files, course.adoc completeness, and last-lesson requirements.

Run: /review-course [course-path]

Or run it now? (yes/no)
```

If the user confirms, invoke `review-course`.

---

## Skipping Lessons

To skip a lesson (e.g. it was recently updated and doesn't need review), update its status in `REVIEW-PROGRESS.md` manually:

```markdown
| Module 2 / Lesson 3 | modules/2-querying/lessons/3-advanced/ | ⏭️ Skipped |
```

The coordinator will skip any lesson marked Skipped or Reviewed.

---

## Running a Single Stage Across All Lessons

To run just one review stage across the whole course (e.g. grammar review only), invoke the individual skill on each lesson manually, or describe what you want:

```
Run grammar review on all lessons in asciidoc/courses/my-course/
```

The coordinator can be directed to invoke only one stage if requested.

---

## Progress File Reference

```markdown
# Review Progress

**Course:** my-course
**Path:** asciidoc/courses/my-course/
**Started:** 2026-02-24
**Last updated:** 2026-02-24

## Lessons

| Lesson | Path | Status |
|--------|------|--------|
| M1 L1 — Understanding graph elements | modules/1-intro/lessons/1-overview/ | ✅ Reviewed |
| M1 L2 — Introduction to Cypher | modules/1-intro/lessons/2-cypher/ | Pending |
| M1 L3 — Challenge: Your first query | modules/1-intro/lessons/3-challenge/ | Pending |
| M2 L1 — Working with nodes | modules/2-nodes/lessons/1-nodes/ | Pending |
[...]

## Summary

- Total lessons: 18
- Reviewed: 1
- Pending: 17
- Skipped: 0

## Next Lesson

modules/1-intro/lessons/2-cypher/
```

---

## References

- Individual review skills: `review-lesson-grammar`, `review-lesson-structure`, `review-lesson-technical`, `review-lesson-facts`, `review-questions`
- Course structure review: `review-course`
