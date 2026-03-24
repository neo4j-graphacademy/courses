# SME Review Report Format

## SME-REVIEW-REPORT.md template

```markdown
# SME Review — [Course Title]

**Reviewed:** YYYY-MM-DD
**Product:** [Name and version if pinned]
**Course path:** [path/to/course/]
**Stated outcome:** [What the course says the learner will build or be able to do]

---

## 1. Feature Inventory

Full list of the product's public API surface used as the coverage baseline.

| Feature | Category | Coverage |
|---------|----------|----------|
| `ClassName` | Core | ✅ / ⚠️ / ❌ / 🔴 |
| `method_name(params)` → return_type | Method | ✅ / ⚠️ / ❌ / 🔴 |
| configuration_key | Config | ✅ / ⚠️ / ❌ / 🔴 |
| Integration: [name] | Integration | ✅ / ⚠️ / ❌ / 🔴 |

**Coverage summary:** N of N features covered (NN%)

---

## 2. Critical Gaps

Features that are ❌ Missing and rated **Critical** — the learner will immediately need these.

### [Method or Feature Name]

**What it does:** [What the feature does in the product]
**Why it's critical:** [What the learner cannot do without it]
**Where it belongs:** [Which module/lesson should cover it]
**Suggested fix:** [What the course needs to add]

---

## 3. Important Gaps

Features that are ❌ Missing and rated **Important** — learners will hit these in their first real project.

### [Method or Feature Name]

**What it does:** [Brief description]
**When learners need it:** [Scenario where this matters]
**Suggested fix:** [Add to existing lesson X, or add a new lesson]

---

## 4. Incorrect Claims

Features or statements that are 🔴 Incorrect — contradicts the actual product.

### [Lesson path — "Claim text"]

**What the course says:** [Exact quote or paraphrase]
**What is actually correct:** [Correct statement with source if possible]
**Impact:** [What happens if a learner follows the incorrect instruction]
**Fix:** [What needs to change]

---

## 5. Prerequisite Issues

### Hidden prerequisites

Things the course requires that are never stated:

- [ ] [Prerequisite] — assumed in [lesson/module], never stated in course.adoc
- [ ] [Prerequisite] — assumed in [lesson/module], never stated in course.adoc

### Incorrect prerequisites

Prerequisites listed that are wrong or misleading:

- [ ] [Stated prerequisite] — [Why this is wrong or unnecessary]

### Prerequisite adequacy

Would a learner with only the stated prerequisites be able to follow this course?

[Verdict: Yes / No / Partially — with explanation of where they would get stuck]

---

## 6. Outcome Assessment

### Runnable

[Can the learner execute the final output? Yes/No/Partially — what is missing?]

### Demonstrable

[Can the learner show a meaningful result to someone else? Yes/No/Partially]

### Adaptable

[Can the learner vary the example? What would they need that was never taught?]

### Cliff edges

The course ends. The learner immediately encounters:

1. **[First cliff edge]** — [What they need that was never covered]
2. **[Second cliff edge]** — [What they need that was never covered]

---

## 7. Prioritised Fix List

In order of impact on learner success:

| Priority | Issue | Type | Fix |
|----------|-------|------|-----|
| 🔴 Critical | [Issue] | Missing / Incorrect / Prerequisite | [Action] |
| 🟡 Important | [Issue] | Missing / Incorrect / Prerequisite | [Action] |
| 🟢 Nice-to-have | [Issue] | Missing / Incorrect / Prerequisite | [Action] |
```

---

## Scoring guide

### Coverage status definitions

- **✅ Covered** — The learner is shown the method/feature, given its parameters, shown an example, and understands what it produces. They can use it independently after the lesson.
- **⚠️ Partial** — The method/feature is named or referenced but not demonstrated. The learner knows it exists but could not use it without looking it up. Treat as a gap if the learner needs it for the course outcome.
- **❌ Missing** — No mention. The learner has no idea this exists.
- **🔴 Incorrect** — The course actively teaches something wrong. This is worse than a gap because the learner will write broken code with confidence.

### Severity definitions

- **Critical** — Without this, the learner cannot complete the course outcome. The project won't run, or the learner will hit this within 5 minutes of trying to apply what they learned.
- **Important** — Without this, the learner's first real use of the product will fail. They'll need to look it up, but they have the context to do so.
- **Nice-to-have** — Advanced or edge-case. Acceptable to omit from an introductory course. Flag it but do not push for inclusion.

### Outcome verdict definitions

- **Runnable** — The course provides every command, credential, install step, and environment configuration needed to execute the final output. A learner can run it right now on their machine.
- **Demonstrable** — The output produces something visible and meaningful — a query result, a generated response, a graph in the database — that the learner can show someone else.
- **Adaptable** — The learner has been taught the concepts at a level that allows substitution. They know what to change and where, even if they need to look up syntax.

### What counts as a "cliff edge"

A cliff edge is the first real-world requirement that appears immediately after the course ends and that the course never addressed. It is not an advanced topic the learner can save for later — it is something they will hit on their first attempt to apply the course in a real context.

Examples:
- Course teaches how to query a pre-loaded database but never shows how to load data
- Course teaches the happy path but never shows error handling or exceptions
- Course teaches in a sandbox but never shows how to configure production credentials
- Course teaches a hardcoded example but never shows how to parameterise a query
