---
name: post-review-suggestions
description: Post inline GitHub PR review suggestions from modified .adoc files. Detects changes made by a review skill, converts each diff hunk into a one-click GitHub suggestion comment, posts them as a single PR review, then restores the working directory.
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
---

# Post Review Suggestions

**Purpose:** After a review skill (grammar, structure, technical, etc.) modifies one or more `.adoc` files, post every change as an inline GitHub PR suggestion comment so the PR author can accept or reject each change individually with one click.

**When to use:** Immediately after running a review skill that has modified `.adoc` files in place, while those modifications are still uncommitted in the working directory. Run before committing or restoring any files.

**Input:**
- File path (optional — if omitted, targets all modified `.adoc` files)
- PR number (optional — auto-detected from current branch)
- Review type label (optional — used in the review body, e.g. "Grammar review", "Structure review"; defaults to "Grammar, style, and clarity review")

**Output:**
- GitHub PR review URL
- Count of suggestions posted

---

## Overview

This skill bridges the in-place file editing done by review skills and the GitHub PR review system. It:

1. Detects which `.adoc` files have been modified since the last commit
2. Parses `git diff` output to extract every changed hunk with its exact line numbers in the committed file
3. Analyses each hunk and writes a concise one-sentence reason for the change
4. Posts all hunks as a single GitHub PR review with inline suggestion comments
5. Restores the modified files so the working directory is clean

---

## Phase 1: Setup

### 1.1 — Get repository info

Run:

```bash
gh repo view --json nameWithOwner -q .nameWithOwner
```

Store the result as `{owner_repo}` (e.g. `neo4j-graphacademy/courses`). Split on `/` to get `{owner}` and `{repo}` separately.

### 1.2 — Detect the PR

Run:

```bash
gh pr view --json number -q .number
```

If this fails or returns empty, tell the user:

> "No open PR found for the current branch. Push the branch and open a PR before running this skill."

Then stop.

Store the result as `{pr}` (integer).

### 1.3 — Detect modified files

If the user provided a specific file path, use that. Otherwise run:

```bash
git diff --name-only
```

Filter the results to `.adoc` files only.

If no `.adoc` files are modified, tell the user:

> "No modified .adoc files found. Run a review skill first, then run this skill before committing or restoring."

Then stop.

Store the list as `{modified_files}`.

---

## Phase 2: Parse the diff

For each file in `{modified_files}`, extract every changed hunk with its line numbers in the committed (HEAD) version of the file.

### 2.1 — Get the full diff for the file

Run:

```bash
git diff {filepath}
```

### 2.2 — Understand diff hunk headers

A unified diff hunk begins with a line like:

```
@@ -40,7 +40,5 @@
```

This means:
- `-40,7` — in the original file, the hunk starts at line 40 and covers 7 lines
- `+40,5` — in the modified file, the hunk starts at line 40 and covers 5 lines

The line numbers you need for the GitHub API are the line numbers in the **committed** (original, HEAD) file — that is, the `-` numbers from the hunk header. These map to the RIGHT side of the diff in GitHub's PR view.

### 2.3 — Verify line numbers against HEAD

Run:

```bash
git show HEAD:{filepath}
```

with `cat -n` style numbering (or count lines manually) to confirm the hunk's starting line falls within the file and the removed lines match what the diff shows. This step catches any off-by-one errors.

### 2.4 — Extract hunks

For each hunk, record:

| Field | Value |
|-------|-------|
| `path` | Relative path from repo root (e.g. `asciidoc/courses/my-course/modules/1-intro/lessons/1-overview/lesson.adoc`) |
| `start_line` | First line number of the removed block in the committed file (from `-NNN` in hunk header) |
| `line` | Last line number of the removed block in the committed file (`start_line + count_of_removed_lines - 1`) |
| `removed` | All lines prefixed with `-` in the hunk (strip the `-` prefix) |
| `added` | All lines prefixed with `+` in the hunk (strip the `+` prefix) |

Rules:
- Lines prefixed with a space are context lines — do not include them in `removed` or `added`.
- If a hunk removes exactly one line (`start_line == line`), the GitHub comment uses `line` only (omit `start_line`).
- If a hunk removes multiple lines (`start_line < line`), use both `start_line` and `line`.
- If a hunk only adds lines (pure insertion, no removed lines), skip it — GitHub suggestions cannot represent pure insertions without a line anchor. Warn the user that N insertion-only hunks were skipped.
- If a hunk removes lines but adds nothing (pure deletion), the suggestion body is an empty code block. Include it so the author can apply the deletion with one click.

### 2.5 — Skip unmappable hunks

If a hunk's line range falls outside the file's line count (as seen in `git show HEAD:{filepath}`), skip the hunk and print a warning:

> "Warning: Could not map hunk at lines {start_line}–{line} in {filepath} — skipping."

---

## Phase 3: Write reasons

For each hunk, analyse the `removed` lines versus the `added` lines and write a single concise sentence explaining WHY the change was made. Do not describe what changed — explain the rule that requires it.

Use these patterns as a guide (adapt the wording to the specific text):

| Change pattern | Reason template |
|----------------|-----------------|
| Title/header capitalisation changed | "Sentence case — only the first word and proper nouns are capitalised in level-2+ headers." |
| `via` replaced with `through` or `using` | "`via` is an abbreviation; this is a spoken script, so abbreviations must be spelled out." |
| Bold label at start of sentence/list item removed | "Sentences must not open with a bold label — this content is a spoken video script, not a reference document." |
| Repeated content removed | "Redundant — the following sentence already covers this point more precisely." |
| Missing section header added | "A new topic is introduced here without a section header." |
| Informal word replaced (`right` → `correct`, `grab` → `retrieve`, etc.) | "`{original}` is informal and colloquial; `{replacement}` is more precise in instructional content." |
| First-person plural replaced (`we`, `let's`) | "Use second person (`you`) not first-person plural (`we`/`let's`) in instructional content." |
| Contraction expanded (`you'll` → `you will`) | "No contractions in instructional text — expand to full form." |
| Abbreviation spelled out (`etc.` → explicit list, `e.g.` → `for example`) | "No abbreviations in spoken content — `{original}` must be written out." |
| Parenthetical removed or woven into sentence | "Parenthetical annotations cannot be spoken naturally — the information is woven into the sentence instead." |
| Filler phrase removed (`just`, `simply`, `basically`) | "`{word}` is a filler word that adds no meaning — removed." |
| Marketing language removed (`powerful`, `seamlessly`) | "`{word}` is marketing language with no instructional value — removed." |
| Passive voice → active/direct instruction | "Passive voice weakened the instruction — rewritten as a direct imperative." |
| Concept explained at first mention | "The concept `{name}` was used before it was defined — explanation added at first mention." |
| Tense corrected | "Tense inconsistency — lesson body uses present/future tense." |
| Product name corrected | "`{original}` is not the official Neo4j product name — the correct term is `{replacement}`." |
| Admonition title added | "Every admonition block requires a title on the line immediately after the type marker." |
| US English spelling | "`{original}` is British English — the US English spelling is `{replacement}`." |
| Lead-in sentence made complete | "The lead-in sentence before this list must be grammatically complete — a bare infinitive phrase ending in a colon is not a sentence." |
| Prose preview of list removed | "A prose summary that previews the following list is redundant — the list itself carries the information." |

If none of the patterns above match, write a short, clear reason in plain English.

---

## Phase 4: Post the review

### 4.1 — Build the comments array

Construct a JSON array of comment objects. For each hunk:

**Single-line change:**

```json
{
  "path": "asciidoc/courses/my-course/modules/1-intro/lessons/1-overview/lesson.adoc",
  "line": 42,
  "side": "RIGHT",
  "body": "Sentence case — only the first word and proper nouns are capitalised in level-2+ headers.\n```suggestion\n== Understanding node labels\n```"
}
```

**Multi-line change:**

```json
{
  "path": "asciidoc/courses/my-course/modules/1-intro/lessons/1-overview/lesson.adoc",
  "start_line": 40,
  "line": 43,
  "start_side": "RIGHT",
  "side": "RIGHT",
  "body": "Redundant — the following sentence already covers this point more precisely.\n```suggestion\nThe graph contains three node labels: Customer, Order, and Product.\n```"
}
```

Important formatting rules for the `body` field:
- The reason sentence comes first, on its own line.
- The suggestion block immediately follows with no blank line between them.
- The suggestion block uses triple backticks with the word `suggestion` (not a language name).
- The replacement content inside the suggestion block is the exact text that will replace the original lines in the file — include all lines of the replacement, preserving indentation and AsciiDoc syntax exactly.
- Do NOT include the `-`/`+` diff prefixes inside the suggestion block.
- For pure deletions, the suggestion block body is empty (just the opening and closing backtick lines).

### 4.2 — Determine the review body

If the user provided a review type label (e.g. "Grammar review"), use:

> "{Review type label}. Each comment includes the reason for the change and a suggested replacement you can apply with one click."

Otherwise default to:

> "Grammar, style, and clarity review. Each comment includes the reason for the change and a suggested replacement you can apply with one click."

### 4.3 — Write the Python script

Write a Python script to `/tmp/post_review_{pr}.py`:

```python
import json
import subprocess
import sys

owner_repo = "{owner_repo}"
pr = {pr}

comments = [
    # ... one dict per hunk, as constructed in 4.1
]

payload = {
    "body": "{review_body}",
    "event": "COMMENT",
    "comments": comments
}

payload_path = f"/tmp/review_payload_{pr}.json"
with open(payload_path, "w") as f:
    json.dump(payload, f, indent=2)

print(f"Payload written to {payload_path}")
print(f"Posting {len(comments)} suggestion(s) to PR #{pr}...")

result = subprocess.run(
    [
        "gh", "api",
        f"/repos/{owner_repo}/pulls/{pr}/reviews",
        "--input", payload_path,
        "--jq", ".html_url"
    ],
    capture_output=True,
    text=True
)

if result.returncode != 0:
    print("ERROR: gh api call failed.", file=sys.stderr)
    print(result.stderr, file=sys.stderr)
    print("Files have NOT been restored. Fix the error and retry.", file=sys.stderr)
    sys.exit(1)

print(f"Review posted successfully.")
print(f"URL: {result.stdout.strip()}")
```

Populate the `comments` list with the actual hunk data constructed in Phase 4.1.

### 4.4 — Run the script

```bash
python3 /tmp/post_review_{pr}.py
```

Capture stdout and stderr. If the script exits with a non-zero code:
- Print the error output to the user
- Do NOT restore files (see Phase 5)
- Tell the user: "The files have not been restored. Fix the error above, then rerun the script with `python3 /tmp/post_review_{pr}.py`, or manually restore with `git restore {filepath}`."
- Stop.

If the script succeeds, capture the review URL from stdout.

---

## Phase 5: Restore files

After a successful post (exit code 0 from the script), restore each modified file:

```bash
git restore {filepath}
```

Run this for every file in `{modified_files}`. Confirm each restore succeeds before moving to the next.

After all restores, run `git diff --name-only` to verify the working directory is clean.

---

## Phase 6: Report to user

Print a summary:

```
Review posted successfully.

URL: https://github.com/{owner}/{repo}/pull/{pr}#pullrequestreview-XXXXXXXXX

Suggestions posted: N
Files restored: M

The PR author can now accept or reject each suggestion individually using
the "Apply suggestion" button in the GitHub UI.
```

If any hunks were skipped (unmappable or insertion-only), list them:

```
Skipped hunks (could not post):
  - {filepath} lines {start}–{end}: insertion-only hunk (no line anchor)
  - {filepath} line {line}: line number outside committed file range
```

---

## Error handling

| Situation | Action |
|-----------|--------|
| No open PR on current branch | Tell the user and stop |
| No modified `.adoc` files | Tell the user and stop |
| `gh api` call fails | Print the error, do NOT restore files, tell the user the files are preserved |
| A hunk's line range is outside the file | Skip the hunk, warn the user, continue with other hunks |
| Insertion-only hunk (no removed lines) | Skip the hunk, warn the user, continue with other hunks |
| `git restore` fails for a file | Warn the user, continue restoring remaining files |

Never silently swallow errors. Every skipped hunk and every failure must be reported to the user.

---

## GitHub suggestion syntax reference

A suggestion comment body must follow this exact format:

```
One-sentence reason for the change.
```suggestion
replacement line 1
replacement line 2
```
```

- The opening ` ```suggestion ` must be on its own line immediately after the reason sentence.
- The replacement content follows on subsequent lines.
- The closing ` ``` ` must be on its own line with nothing after it.
- The `line` field in the API payload refers to the line number in the committed version of the file (the RIGHT side of the diff in GitHub's UI). It is the last line of the replaced range.
- `start_line` is required only when replacing multiple lines; it is the first line of the replaced range.
- `start_side` must equal `"RIGHT"` whenever `start_line` is present.
- `side` is always `"RIGHT"`.

---

## Worked example

Given this diff hunk for `lesson.adoc`:

```diff
@@ -18,3 +18,3 @@

-== Installing the Neo4j Driver
+== Installing the Neo4j driver

```

- `path`: `asciidoc/courses/my-course/modules/1-intro/lessons/1-overview/lesson.adoc`
- `line`: 19 (line 18 is blank, line 19 is the header — check with `git show HEAD:{path}`)
- `start_line`: omitted (single line)
- Reason: "Sentence case — only the first word and proper nouns are capitalised in level-2+ headers."
- Suggestion body: `== Installing the Neo4j driver`

The resulting comment object:

```json
{
  "path": "asciidoc/courses/my-course/modules/1-intro/lessons/1-overview/lesson.adoc",
  "line": 19,
  "side": "RIGHT",
  "body": "Sentence case — only the first word and proper nouns are capitalised in level-2+ headers.\n```suggestion\n== Installing the Neo4j driver\n```"
}
```

---

## Common pitfalls

- **Off-by-one line numbers.** The hunk header gives the starting line of the changed block, not the ending line. Always compute `line` as `start_line + (count of removed lines) - 1`. Verify against `git show HEAD:{filepath}`.
- **Context lines in the diff.** Lines with a leading space are context, not changes. Do not count them when computing `line`.
- **Relative vs absolute paths.** The `path` field in the GitHub API must be relative to the repository root, not an absolute filesystem path. Strip the repo root prefix from any absolute path.
- **Trailing newlines in suggestion blocks.** The suggestion block replaces exactly the lines specified by `start_line`–`line`. If the original lines had trailing content (AsciiDoc attributes, blank lines), include them in the suggestion if they should be preserved.
- **Do not restore files on API failure.** If the API call fails, the working directory changes are the only record of what was reviewed. Preserving them lets the user retry or manually apply them.

---

## References

- GitHub REST API — Pull Request Reviews: https://docs.github.com/en/rest/pulls/reviews
- GitHub suggestion comment syntax: https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/incorporating-feedback-in-your-pull-request
- `gh api` documentation: `gh api --help`
- Review skills that produce diffs this skill can consume: `review-lesson-grammar`, `review-lesson-structure`, `review-lesson-technical`, `review-lesson-facts`
