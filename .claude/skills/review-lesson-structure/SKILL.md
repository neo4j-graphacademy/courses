---
name: review-lesson-structure
description: Review a single lesson for pedagogical structure, lesson length, opening pattern, concept delivery, and scaffolding. Fixes issues inline and appends a WHY report.
allowed-tools: Read, Edit, Glob, Grep
---

# Review: Lesson Structure & Pedagogy

**Purpose:** Review a single `lesson.adoc` for structural and pedagogical quality. Checks lesson length, opening pattern, concept delivery, Bloom's taxonomy alignment, and scaffolding. Fixes what can be fixed directly; flags issues that require content decisions.

**When to use:** Stage 2 of the course review pipeline. Run after grammar review.

**Input:** Path to a lesson folder (e.g. `asciidoc/courses/my-course/modules/1-intro/lessons/1-overview/`)

**Output:**

- `lesson.adoc` — fixed in place where possible
- `REVIEW-REPORT.md` in the lesson folder — created or appended with a structure section

---

## Overview

This review checks:

1. **Lesson length** — maximum 3 topics, 450–750 words total
2. **Opening structure** — two-part pattern required
3. **Learning objective** — must start "In this lesson, you will learn"
4. **Section headers** — action-oriented, sentence case
5. **Concept delivery** — plain-language definitions, course-appropriate analogies
6. **Bloom's taxonomy** — theory lessons stay at remember/understand
7. **Scaffolding** — references prior lesson, prepares for what comes next
8. **Summary** — bullet points with bold concepts, forward reference

---

## Phase 1: Read and Classify

Read `lesson.adoc` in full. Identify:

- Lesson type (`:type:` attribute — lesson, quiz, challenge, video)
- Previous lesson context (read `../../course.adoc` for module sequence if needed)
- What challenge or lesson follows this one (check sibling lesson folders)

**Note:** Apply the full checklist to theory lessons (`:type: lesson`). For challenge lessons (`:type: challenge`), focus on sections 2.3 (opening), 2.6 (scaffolding), and 2.7 (summary). Quizzes and videos have minimal structural requirements.

---

## Phase 2: Lesson Length

### Count topics

Identify each distinct concept or workflow introduced in the lesson. A "topic" is a section that introduces something the learner did not know before.

**Rule:** Maximum 3 topics per lesson.

If the lesson has more than 3 topics, flag them for splitting — do not split automatically, as this requires human judgment about how to divide the content.

### Count words per topic

Each topic section should be **150–250 words** (target: 200 words).

| Lesson word count | Status                                      |
| ----------------- | ------------------------------------------- |
| 450–750 words     | ✅ Acceptable                               |
| < 450 words       | ⚠️ May be too thin — check topic count      |
| > 750 words       | ⚠️ Likely needs splitting — flag for review |

**Important:** Do not split automatically. If a lesson is over 750 words, report the word count and topic count so the author can decide. Only flag as a definite problem if there are clearly 4+ distinct topics.

---

## Phase 3: Opening Structure

The introduction must follow a strict **two-part pattern**:

**Part 1: Context (1–2 sentences)**

Choose the appropriate pattern:

- **Option A — Direct continuation**: If this lesson builds directly on the previous one.

  ```
  In the previous lesson, you learned how to use MATCH to read data from the graph. To modify the graph, you need to learn how to create nodes and relationships.
  ```

- **Option B — New/related topic**: If this lesson introduces something not directly built from the last.
  ```
  Heap memory usage directly relates to how often the JVM must perform garbage collection. When heap usage is high, garbage collection runs more frequently, causing query pauses.
  ```

**Part 2: Learning objective (1 sentence)**

Must start with: `In this lesson, you will learn`

```
In this lesson, you will learn how to use the CREATE clause to add data to your graph.
```

### Common opening failures to fix

❌ Combining context and objective into one sentence:

```
Now that you understand MATCH, you'll learn how to use CREATE to add nodes.
```

✅ Split into two separate sentences.

❌ Generic opening with no connection to course context:

```
In modern databases, data modification is important.
In this lesson, you will learn about CREATE.
```

✅ Replace Part 1 with something specific to what was just learned or why this topic matters now.

❌ Learning objective that doesn't start with "In this lesson, you will learn":

```
This lesson covers the CREATE clause.
```

✅ Rewrite to the standard form.

❌ Bare "You learned..." without specifying when:

```
You learned how to use MATCH to read data from the graph.
```

✅ Always specify the referent — "In the previous lesson" makes the callback concrete:

```
In the previous lesson, you learned how to use MATCH to read data from the graph.
```

❌ Explicit scaffold header:

```
== Building on What You Know
```

✅ Remove the header; fold the content into the introduction paragraph.

---

## Phase 4: Section Headers

All `==` headers (other than the lesson title) must be:

1. **Action-oriented** — describe what the learner will do or understand, not just the noun
2. **Sentence case** — first word and proper nouns capitalised only

| ❌ Avoid                           | ✅ Use instead                                                                      |
| ---------------------------------- | ----------------------------------------------------------------------------------- |
| `== Node labels`                   | `== Understanding node labels`                                                      |
| `== The CREATE Clause`             | `== Creating nodes with CREATE`                                                     |
| `== What Are Indexes?`             | `== Understanding indexes`                                                          |
| `== Core Concept 1: Relationships` | `== Modelling relationships`                                                        |
| `== Why it matters`                | `== How indexes eliminate full scans` _(name the specific capability)_              |
| `== Why this is important`         | `== How short-term memory preserves conversation context` _(describe what it does)_ |

Headers must describe what the concept **does**, not announce that it is significant. "Why it matters" and similar phrases are empty — replace them with the specific behaviour, capability, or outcome being explained.

**Do not** use explicit "Core Concept N:" prefixes in headers.

---

## Phase 5: Concept Delivery

### Preview before deep-dive (required for multi-item lessons)

If a lesson covers multiple parallel items — types, layers, stages, patterns, steps — the introduction or an overview paragraph **must name all of them by name** before the first section header begins explaining any of them individually.

❌ Opening says "you will learn about the three memory types" then immediately jumps to `== Understanding short-term memory` without ever listing what the three types are.
✅ Opening or a brief paragraph after the learning objective names all three: "The three layers are short-term memory, long-term memory, and reasoning memory."

This applies whenever the lesson has N parallel sections explaining N items and the learning objective refers to them collectively ("the three layers", "the four stages", "the five patterns"). The learner must see all N names before any section begins.

**How to fix:** Add a brief sentence or bullet list immediately after the learning objective that names all items. One sentence is enough: "The three layers are: _short-term memory_, _long-term memory_, and _reasoning memory_."

### Per-section checks

For each concept section, verify:

- [ ] There is a **plain-language definition** (1–2 sentences explaining what it is in simple terms)
- [ ] Any **analogies** come from the actual course context, not generic examples (no movies, books, or shopping carts unless the course uses those as its primary dataset)
- [ ] There is a **concrete example** using real data from the lesson's context
- [ ] There is no assumed knowledge that hasn't been covered in a prior lesson

To check for assumed knowledge, look at:

- `../../course.adoc` for the prerequisite courses listed
- Sibling lesson files for what was covered earlier

---

## Phase 6: Bloom's Taxonomy Alignment

**Theory lessons** (`:type: lesson`) should target the **remember** and **understand** levels:

✅ Definitions, explanations, comparisons, identification
❌ "Build X from scratch", "Design your own Y", "Evaluate the best approach" — those belong in challenge or quiz lessons

If a theory lesson is asking learners to apply or create, flag it:

> ⚠️ Section "Designing your own schema" asks learners to _create_, which is above the remember/understand level appropriate for a theory lesson. Consider moving this to a challenge lesson.

---

## Phase 7: Scaffolding

### References prior lesson

If this is not the first lesson in the module, the opening should reference what was just learned (Option A above). Check that the reference is accurate — read the previous lesson if needed.

### Prepares for next lesson

The summary or a closing teaser should mention what comes next. This is usually a challenge lesson.

❌ Salesy or dramatic teasers:

```
In the next lesson, you will discover the transformational power of graph traversals!
```

✅ Plain forward reference:

```
In the next lesson, you will use these concepts to build a query that finds all products ordered by a customer.
```

---

## Phase 8: Summary Section

The lesson must end with a `[.summary]` section that:

- Uses the `[.summary]` role marker
- Lists each concept covered as a bullet point with the concept name **bolded**
- Each bullet has a brief description after the bold term
- Ends with a forward reference to the next lesson

```asciidoc
[.summary]
== Summary

In this lesson, you learned about graph elements:

* **Nodes** — Represent entities such as customers and products
* **Relationships** — Connect nodes and represent associations like PLACED
* **Properties** — Store data on nodes and relationships

In the next lesson, you will use Cypher to query these graph elements.
```

If no `[.summary]` section exists, flag it (do not create it — generating the summary requires knowing the full lesson context).

---

## Phase 9: Write the Report

After reviewing and fixing, create or append `REVIEW-REPORT.md` in the lesson folder.

```markdown
## Structure & Pedagogy Review — YYYY-MM-DD

**Status:** ✅ Complete / ⚠️ Issues remain

### Changes Made

- **Opening**: Rewrote Part 1 to reference the previous lesson (MATCH) — _Two-part pattern: Part 1 must contextualise the current lesson_
- **Learning objective**: Changed `This lesson covers CREATE` → `In this lesson, you will learn how to use CREATE` — _Learning objective must start with "In this lesson, you will learn"_
- **Header**: `== The CREATE Clause` → `== Creating nodes with CREATE` — _Action-oriented, sentence case_

### Issues Requiring Manual Review

- [ ] Lesson word count: ~920 words across 4 topics — _Exceeds 750-word guideline; consider splitting "Advanced options" into a separate lesson_
- [ ] Summary section missing — _Add a [.summary] section with bullet-point recap and forward reference_
- [ ] Analogy in "Understanding indexes" uses a library card catalogue — _Verify this matches the course dataset context; if not, replace with an example from the course data_
```

---

## References

- `.cursor/review-lesson-content.mdc` — §1 Length, §3–§7 Pedagogy, Structure, Scaffolding
- `.cursor/rules/lesson-length.mdc` — Word count and topic limits
