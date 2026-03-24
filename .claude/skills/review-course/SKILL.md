---
name: review-course
description: Review course-level structure and metadata — lesson attributes, module organisation, course.adoc completeness, and last-lesson requirements. Run once per course before publishing.
allowed-tools: Read, Edit, Glob, Grep
---

# Review: Course Structure

**Purpose:** Check and fix course-level structural requirements across all modules and lessons in a course. This is a one-shot review of the whole course, not individual lesson content.

**When to use:** Run once on the whole course after individual lesson reviews are complete, before the course is published or moved to draft mode.

**Input:** Path to a course folder (e.g. `asciidoc/courses/my-course/`)

**Output:**
- Various `.adoc` files fixed in place where possible
- `COURSE-REVIEW-REPORT.md` in the course folder

---

## Overview

This review checks:

1. **Lesson attributes** — every lesson has `:type:` and `:order:` matching its folder
2. **Question includes** — every question file in `questions/` is included in `lesson.adoc`
3. **Module files** — every `module.adoc` has `:order:` matching its folder and accurate overview content
4. **Course file** — `course.adoc` has required attributes, assets, and introductory sections
5. **Last lesson** — the final lesson forces an action (quiz or mark-as-read)

---

## Phase 1: Discover Course Structure

Use Glob to map the course:

```
Glob: asciidoc/courses/[slug]/modules/*/lessons/*/lesson.adoc
Glob: asciidoc/courses/[slug]/modules/*/module.adoc
Glob: asciidoc/courses/[slug]/course.adoc
```

Build a list of all modules and lessons with their folder paths. Note the folder numbering (e.g. `3c-using-foo` → order 3, `4-deleting-nodes` → order 4).

---

## Phase 2: Lesson Attributes

For each `lesson.adoc`, check:

### `:type:` attribute

Every lesson must have a `:type:` attribute. Valid values:

| Value | When to use |
|-------|-------------|
| `lesson` | Default theory/concept lesson |
| `challenge` | Learner must complete a hands-on task |
| `quiz` | Lesson contains only questions (no instructions) |
| `video` | Lesson contains only a `video::` block |

If a lesson has no `:type:`, determine the correct value from its content:
- Has only a `video::` block → `video`
- Has questions but no instructional steps → `quiz`
- Has a hands-on task with verification → `challenge`
- Has instructional text → `lesson`

Add the missing `:type:` attribute.

### `:order:` attribute

The `:order:` value must match the numeric prefix of the lesson folder name.

Examples:
- Folder `1-introduction` → `:order: 1`
- Folder `3c-using-foo` → `:order: 3`
- Folder `4-deleting-nodes` → `:order: 4`

Fix any mismatch.

### Question file includes

For each lesson, check that every `.adoc` file in `questions/` is included in `lesson.adoc`:

```
Glob: [lesson-folder]/questions/*.adoc
```

For every question file found, verify an `include::questions/[filename].adoc[leveloffset=+1]` exists in `lesson.adoc`. Add any missing includes.

---

## Phase 3: Module Files

For each `module.adoc`, check:

### `:order:` attribute

The `:order:` value must match the numeric prefix of the module folder name.

Fix any mismatch.

### Overview content

The `module.adoc` should contain an accurate overview of what the module covers. Read the lesson titles in the module and compare to the module overview text.

If the overview is generic ("This module covers topics...") or does not reflect the actual lesson content, flag it for update:

> ⚠️ module.adoc overview does not reflect lesson content. Update to mention: [list of lesson topics].

Do not rewrite module overviews automatically — this requires content judgment. Flag only.

---

## Phase 4: Course File

Read `course.adoc` and check for:

### Required attributes

| Attribute | Required | Description |
|-----------|----------|-------------|
| `:caption:` | Yes | Short, succinct course description (1 sentence) |
| `:key-points:` | Yes | 3–5 key points covered by the course |

If either is missing, flag it:

> ⚠️ `:caption:` missing from course.adoc — add a 1-sentence description of what this course teaches.

### Required assets

| File | Required |
|------|----------|
| `illustration.svg` | Yes — course card illustration |
| `banner.png` | Yes — course banner image |

Check whether these files exist in the course folder. If not, flag them:

> ⚠️ `illustration.svg` not found in course folder.

### Required sections in course.adoc

The course file should contain:

- `=== What you will learn` — a bulleted list reflecting the content of all modules
- `== This course includes` — a summary of what learners will find (lessons, quizzes, challenges)

If either section is missing, flag it.

If either section exists but does not accurately reflect the current course content (e.g. references modules that no longer exist, or misses newly added modules), flag it for update.

---

## Phase 5: Last Lesson

The last lesson in the course **must** require an action from the learner. This triggers the completion modal and redirects to the certification.

An action means one of:
- The lesson has at least one question (the learner must answer it)
- The lesson has a `read::` button with text (the learner must click it)

If the last lesson is a theory lesson with no questions and no `read::` button:

> ❌ Last lesson has no action. Add a `read::[text][]` button or a question to trigger the completion modal.

If the last lesson is marked `:optional: true`:

> ❌ Last lesson must not be optional. Remove `:optional: true` from the last lesson.

---

## Phase 6: Write the Report

Create `COURSE-REVIEW-REPORT.md` in the course folder.

```markdown
# Course Structure Review — YYYY-MM-DD

**Course:** my-course
**Path:** asciidoc/courses/my-course/

---

## Summary

- Modules reviewed: 4
- Lessons reviewed: 18
- Issues fixed: 3
- Issues requiring manual review: 2

---

## Fixes Applied

- **Lesson type**: `modules/2-querying/lessons/3-match/lesson.adoc` — added `:type: lesson` — _Every lesson must have a :type: attribute_
- **Lesson order**: `modules/3-modelling/lessons/2-relationships/lesson.adoc` — changed `:order: 3` → `:order: 2` — _Order must match folder prefix_
- **Missing include**: `modules/1-intro/lessons/1-overview/lesson.adoc` — added `include::questions/2-check.adoc[leveloffset=+1]` — _Question file existed but was not included_

---

## Issues Requiring Manual Review

- [ ] `modules/2-querying/module.adoc` overview does not reflect lesson content — _Update to mention: MATCH clause, WHERE filtering, RETURN projections_
- [ ] `course.adoc` — `:key-points:` attribute missing — _Add 3–5 key points that summarise what this course teaches_
- [ ] `banner.png` not found in course folder — _Create or add a banner image before publishing_

---

## Module Order Summary

| Module | Folder | :order: | Status |
|--------|--------|---------|--------|
| Introduction | 1-introduction | 1 | ✅ |
| Querying | 2-querying | 2 | ✅ |
| Modelling | 3-modelling | 3 | ✅ |
| Advanced | 4-advanced | 4 | ✅ |

---

## Last Lesson Check

✅ Last lesson (`modules/4-advanced/lessons/5-quiz/lesson.adoc`) has 10 questions — completion modal will trigger.
```

---

## References

- `.cursor/review-course.mdc` — original course structure checklist
- `.cursor/course-outline-checklist.md` — detailed outline requirements
- `.cursor/course-summary-checklist.md` — course summary standards
