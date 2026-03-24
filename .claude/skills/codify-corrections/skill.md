---
name: codify-corrections
description: Analyse manual corrections made to lesson files during review, extract the WHY and WHAT, and append generalizable rules to the appropriate review skill. Run after any manual editing session where you caught something the automated review missed.
allowed-tools: Read, Edit, Bash, Glob, Grep
---

# Codify Corrections

**Purpose:** When you manually correct something in a lesson file that the automated review missed, this skill analyses those corrections, infers the underlying rule, and appends it to the right review skill so the same mistake is caught automatically in future.

**When to use:** After any manual editing session where you or the user corrected lesson content that slipped through grammar, structure, technical, or facts review.

**Input:** None required — auto-detects changed lesson files from `git diff`. Optionally accepts a specific file path.

**Output:** New rules appended to the appropriate review skill files, plus a report of what was added.

---

## Phase 1: Detect Changes

Run `git diff HEAD` filtered to lesson files:

```bash
git diff HEAD -- '**/lesson.adoc' '**/questions/*.adoc'
```

If a specific file was provided as input, limit to that file:

```bash
git diff HEAD -- path/to/lesson.adoc
```

If there are no changes, check the staging area:

```bash
git diff --cached -- '**/lesson.adoc' '**/questions/*.adoc'
```

If still no changes, report: "No lesson file changes found in the working tree or staging area. Commit the changes first if reviewing a past correction, or pass the specific file path."

---

## Phase 2: Parse Each Diff Hunk

For each changed file, parse the diff into discrete hunks. Each hunk is one correction.

For each hunk, extract:

- **Before** (`-` lines): what the file had originally
- **After** (`+` lines): what it was changed to
- **Context**: the surrounding lines (unchanged) that show where the correction sits in the lesson

Skip hunks that are clearly mechanical (`:order:` renumbering, date changes, adding `read::Continue[]`, purely whitespace). Focus on hunks where prose, terminology, AsciiDoc syntax, or code was changed.

---

## Phase 3: Classify Each Correction

For each substantive hunk, classify it into one of four categories:

| Category | Review skill target | When to use |
|----------|--------------------|-|
| **grammar** | `review-lesson-grammar/skill.md` | Voice, tone, word choice, contractions, spelling, redundancy, sentence structure |
| **technical** | `review-lesson-technical/skill.md` | AsciiDoc syntax, link format, code block format, mermaid syntax, admonitions |
| **structure** | `review-lesson-structure/skill.md` | Opening pattern, section headers, preview-before-dive, scaffolding, summary format |
| **facts** | `review-lesson-facts/skill.md` | API names, relationship names, claim accuracy, schema correctness |

A hunk may touch more than one category. In that case, pick the primary category and note the secondary.

---

## Phase 4: Extract the Rule

For each classified hunk, answer these questions:

1. **What pattern was wrong?** — Describe the error in general terms, not just for this lesson. Not "line 44 said X" but "lessons used `[mermaid]` without `source,`".

2. **What is the correct form?** — State the fix as a reusable rule.

3. **Why is this wrong?** — One sentence: what problem does the incorrect form cause?

4. **Is this already in the skill?** — Read the target skill file. Search for the pattern. If a very similar rule already exists, skip this hunk (don't duplicate). If it's partially covered, note that the existing rule should be strengthened.

5. **How specific is the rule?** — Rules should be general enough to catch future instances, but specific enough to be actionable. Avoid rules so broad they catch things they shouldn't.

---

## Phase 5: Format the Rule

Format the rule to match the style of the target skill. Each skill uses slightly different formatting conventions — read a few existing rules in the target skill first to match the style.

### General format

```markdown
### [Short rule name in sentence case]

[One-sentence statement of the rule.]

❌
```asciidoc
[incorrect example]
```

✅
```asciidoc
[correct example]
```

[Optional: one sentence explaining the "why" if it isn't obvious.]
```

### For grammar corrections

Follow the table-and-prose style used in `review-lesson-grammar/skill.md`:

```markdown
| Replace | With |
|---------|------|
| `[wrong phrase]` | `[correct phrase]` |
```

Or, for a structural rule:

```markdown
❌ [Wrong pattern description]
```
[bad example]
```

✅ [Correct pattern description]
```
[good example]
```
```

### For a new row in an existing table

If the rule extends an existing table (e.g., the "informal verbs" table in grammar), add a row — do not create a new section.

---

## Phase 6: Find the Right Insertion Point

Do not append rules to the end of the skill file blindly. Find the most relevant existing section:

- For grammar: find the closest matching phase (voice/tone, redundancy, terminology, etc.)
- For technical: find the most relevant phase (AsciiDoc syntax, code blocks, links, etc.)
- For structure: find the closest matching phase (opening, headers, concept delivery, scaffolding, summary)
- For facts: add to an appropriate verification checklist

Insert the new rule immediately after the most closely related existing rule in that section. This keeps related rules together and makes the skill easier to scan.

If no existing section fits, create a minimal new subsection within the appropriate phase. Do not create a new top-level phase unless the rule genuinely represents a new category.

---

## Phase 7: Check for Duplicates

Before inserting, grep the target skill file for key terms from the new rule:

```bash
grep -i "[key term]" .claude/skills/review-lesson-[target]/skill.md
```

If the same pattern is already documented:
- Skip the insertion
- Note in the report: "Rule already exists: [existing section name]"

If a similar-but-weaker rule exists:
- Strengthen the existing rule instead of adding a duplicate
- Edit the existing entry to be more specific or add the new example

---

## Phase 8: Insert the Rule

Use Edit to insert the new rule at the correct location in the skill file.

After inserting, re-read the surrounding section to verify the insertion reads naturally alongside the existing rules. Check that code block delimiters are balanced and the formatting matches.

---

## Phase 9: Write the Report

After processing all hunks, report to the user:

```markdown
## Corrections Codified — YYYY-MM-DD

### Rules Added

- **[rule name]** → `review-lesson-[target]/skill.md` § [section]
  - Before: `[wrong form]`
  - After: `[correct form]`
  - Why: [one sentence]

- **[rule name]** → `review-lesson-[target]/skill.md` § [section]
  ...

### Skipped

- `[file]` hunk at line [N] — [reason: duplicate / mechanical / too specific to this lesson]

### Strengthened Existing Rules

- **[existing rule name]** in `review-lesson-[target]/skill.md` — added example: `[new example]`
```

---

## What to skip

Do not codify corrections that are:

- **Specific to one lesson's content** — e.g. "Alice was changed to Bob" — not a generalizable rule
- **Data fixes** — correcting a wrong fact, wrong API name, wrong count — these belong in `review-lesson-facts` only if the class of error generalizes (e.g. "always verify method counts against the API reference table")
- **Pure reformatting** — blank lines, `:order:` numbers, file includes — unless the reformatting reveals a missing rule
- **Already covered** — if the skill already has the rule, even loosely, skip it

---

## References

- `review-lesson-grammar/skill.md` — grammar and style rules
- `review-lesson-technical/skill.md` — AsciiDoc and formatting rules
- `review-lesson-structure/skill.md` — pedagogical structure rules
- `review-lesson-facts/skill.md` — technical accuracy rules
