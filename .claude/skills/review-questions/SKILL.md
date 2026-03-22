---
name: review-questions
description: Review all question files in a lesson's questions/ folder. Checks titles, question text, answer options, hints, and solutions. Fixes issues inline and appends a WHY report.
allowed-tools: Read, Edit, Glob, Grep
---

# Review: Questions

**Purpose:** Review all `.adoc` files in the `questions/` subfolder of a lesson. Fixes formatting, hint quality, and solution completeness directly in each file. Records every change with a reason.

**When to use:** Alongside or after the other lesson review stages. Run on any lesson that has a `questions/` folder.

**Input:** Path to a lesson folder (e.g. `asciidoc/courses/my-course/modules/1-intro/lessons/1-overview/`)

**Output:**
- Each `questions/*.adoc` — fixed in place
- `REVIEW-REPORT.md` in the lesson folder — created or appended with a questions section

---

## Overview

This review is separate from lesson content review because questions have different rules and a different purpose. The skill checks:

1. **Title** — title case, brief and descriptive
2. **Question text** — one clear question, no bullet lists in the scenario
3. **Answer options** — correct answers marked, multi-answer phrasing
4. **Hint** — guides toward the answer without revealing it, friendly tone
5. **Solution** — gives the answer, explains WHY, bolds correct answer(s)
6. **Coverage** — question content is covered in the lesson

---

## Phase 1: Find and Read All Question Files

Check whether a `questions/` folder exists:

```
questions/*.adoc
```

If no `questions/` folder or no `.adoc` files exist, record "No questions found" in the report and stop.

Read each question file in full before making any changes.

---

## Phase 2: Title

Question titles must be in **Title Case** — all major words capitalised.

❌ `= What is a graph database?`
✅ `= What Is a Graph Database?`

The title should be brief (3–8 words) and describe the question topic, not repeat the question text.

---

## Phase 3: Question Text Structure

Each question file must follow this structure:

```asciidoc
[.question]
= Question Title

Brief question text here. One or two sentences maximum.

For multiple-answer questions, add: "Select all that apply."

* [ ] Option A
* [x] Option B (correct)
* [ ] Option C
* [ ] Option D

[TIP,role=hint]
.Hint
====
Hint text
====

[TIP,role=solution]
.Solution
====
Solution text
====
```

### One clear question

The question text should ask exactly one thing. If the text contains sub-bullets explaining a scenario, convert them to prose or a numbered list.

❌
```asciidoc
Given the following:
* A graph database with 1 million nodes
* A query that scans all nodes
* No indexes defined

What will happen?
```

✅
```asciidoc
A query scans all nodes in a graph database with 1 million nodes and no indexes defined. What will happen?
```

**Only one bullet list is permitted in a question file** — the answer choices. Bullet lists in the scenario or question text must be converted to prose or numbered lists.

### Multi-answer phrasing

If more than one answer option has `[x]`, the question text must say "Select all that apply:" (or similar) before the answer list.

❌ (two correct answers, no instruction)
```asciidoc
Which of the following are valid Cypher clauses?

* [x] MATCH
* [ ] FIND
* [x] RETURN
* [ ] GET
```

✅
```asciidoc
Which of the following are valid Cypher clauses? Select all that apply.

* [x] MATCH
* [ ] FIND
* [x] RETURN
* [ ] GET
```

---

## Phase 4: Answer Options

### Format

Answer options must use AsciiDoc checkbox syntax:

- Correct answers: `* [x] Answer text`
- Incorrect answers: `* [ ] Answer text`

### Number of options

Questions should have **3–5** answer options. Fewer than 3 makes it too easy to guess; more than 5 creates cognitive overload.

### Plausible distractors

Incorrect options should be plausible — things a learner who hasn't fully understood the content might reasonably choose. If any option is obviously wrong (nothing to do with the topic), flag it for improvement.

---

## Phase 5: Hint

The hint guides the learner **toward** the answer without giving it away. It should explain the relevant concept, not tell them to "think about" something.

### Hint rules

- **Friendly and empathetic** — the learner is stuck; be helpful, not condescending
- **Explains the concept** — gives enough information to guide reasoning
- **Does not reveal the answer directly** — the learner should still have to think
- **Uses AsciiDoc format** with `.Hint` title

❌ (tells them what to think, not helpful)
```asciidoc
[TIP,role=hint]
.Hint
====
Think about the features and limitations of each tier.
====
```

✅ (explains the concept enough to guide reasoning)
```asciidoc
[TIP,role=hint]
.Hint
====
AuraDB Free provides a fully managed Neo4j instance with limited resources at no cost, making it ideal for learning and small projects. The other tiers add features like larger storage, higher performance, or enterprise controls.
====
```

❌ (antagonistic or dismissive)
```asciidoc
[TIP,role=hint]
.Hint
====
You should know this from the lesson.
====
```

✅ (warm and direct)
```asciidoc
[TIP,role=hint]
.Hint
====
The lesson covered how relationships in a graph are different from foreign keys in a relational database. Consider which approach stores adjacency information directly.
====
```

---

## Phase 6: Solution

The solution must:

1. **State the correct answer** directly
2. **Explain WHY** that answer is correct
3. **Bold the correct answer(s)** in the explanation
4. Use AsciiDoc format with `.Solution` title

❌ (states the answer but doesn't explain why)
```asciidoc
[TIP,role=solution]
.Solution
====
The correct answer is B.
====
```

✅ (states the answer and explains the reasoning)
```asciidoc
[TIP,role=solution]
.Solution
====
The correct answer is **AuraDB Free**.

**AuraDB Free** is the only tier that is available at no cost. It provides a fully managed Neo4j instance suitable for learning and experimentation. AuraDB Professional and above include additional features and resources but require a paid subscription.
====
```

For multi-answer questions, bold each correct answer in the explanation:

```asciidoc
[TIP,role=solution]
.Solution
====
The correct answers are **MATCH** and **RETURN**.

**MATCH** is the Cypher clause used to find patterns in the graph. **RETURN** specifies what data to include in the results. `FIND` and `GET` are not valid Cypher clauses.
====
```

---

## Phase 7: Coverage Check

Each question should test content that is **explicitly covered** in the corresponding `lesson.adoc`.

Read `lesson.adoc` and check whether the topic of each question is clearly explained there.

If a question tests something not covered in the lesson:

> ⚠️ Question "What Is a Graph Database?" tests a definition that does not appear in lesson.adoc. Either add the definition to the lesson, or move this question to the lesson where it is taught.

Do not remove questions — flag them for the author to resolve.

---

## Phase 8: Write the Report

After fixing all question files, create or append `REVIEW-REPORT.md` in the lesson folder.

```markdown
## Questions Review — YYYY-MM-DD

**Questions found:** 3 (questions/1-graph-elements.adoc, questions/2-cypher-match.adoc, questions/3-create-nodes.adoc)

**Status:** ✅ Complete / ⚠️ Issues remain

### questions/1-graph-elements.adoc

#### Changes Made

- **Title**: `= What is a graph database?` → `= What Is a Graph Database?` — _Question titles must be in Title Case_
- **Hint**: Replaced "Think about what makes graphs different" with explanation of graph structure — _Hint must guide reasoning, not tell learners what to think_
- **Solution**: Added bold to correct answer and added explanation of why — _Solution must state the answer AND explain the reasoning_

### questions/2-cypher-match.adoc

#### Changes Made

- **Multi-answer phrasing**: Added "Select all that apply." — _Two correct answers marked; learner must be told to select multiple_

#### Issues Requiring Manual Review

- [ ] Correct answer is `[x] MATCH` but lesson.adoc does not explain the MATCH clause — _Question tests content not covered in lesson; add to lesson or move question_

### questions/3-create-nodes.adoc

#### Changes Made

- None — no issues found
```

---

## References

- `.cursor/review-lesson-content.mdc` — §8 Question Reviews
- `.cursor/technical-lesson-review.mdc` — Questions section
- `.cursor/rules/course-content-style.mdc` — Quiz Guidelines
- `.cursor/write-lesson-question.mdc` — Full question authoring guide
