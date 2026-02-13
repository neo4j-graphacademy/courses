---
name: workshop-ideation
description: Plan workshop structure from existing courses, extract topics, and create outline. Use when user wants to create a new workshop.
allowed-tools: Read, Glob, Grep, Write, Bash
---

# Workshop Ideation Skill

**Purpose:** Collaborate with user to plan a workshop from existing courses, extract topics, and create a structured outline.

**When to use:** User wants to create a new workshop and needs help planning the structure.

---

## Phase 1: Discovery (10-15 min)

### Checklist: Understanding the Goal
- [ ] What is the concrete end goal? (e.g., "Build a recommendation query")
- [ ] What will students have built by the end?
- [ ] Is it achievable in 2 hours (mandatory path)?
- [ ] What existing courses contain relevant content?
- [ ] What is the target audience level? (beginner/intermediate/advanced)

### Questions to Ask
1. "What specific thing should students be able to build/do at the end?"
2. "Which existing courses have content we can adapt?"
3. "What's the 'money demo' that showcases the value?"
4. "Who is this workshop for?" (developers, analysts, architects)
5. "What prerequisites should students have?"

### Output
Create a goal statement:
```
Workshop Goal: [Concrete deliverable]
Duration: 2 hours core + 30-60 min optional
Audience: [Target level]
Prerequisites: [Required knowledge]
Value Proposition: [Why this matters]
```

---

## Phase 2: Topic Extraction (15-20 min)

### Checklist: Mining Existing Courses
- [ ] Identified source courses
- [ ] Listed all relevant topics from each course
- [ ] Categorized topics as Essential/Optional/Advanced
- [ ] Identified redundancies across courses
- [ ] Noted which topics need adaptation

### Process
1. **Review source courses:** Read course.adoc and module outlines
2. **Extract topics:** Create bullet list from each course
3. **Categorize:** Essential (required for goal), Optional (nice-to-have), Advanced (homework)
4. **Map to goal:** How does each topic contribute to the end deliverable?

### Output Format
```markdown
## Source Courses
- [Course Name 1](link) - Topics: X, Y, Z
- [Course Name 2](link) - Topics: A, B, C

## Topic Categories

### Essential (Core Path - 120 min)
- [ ] Topic 1 (from Course A, Lesson 3) - 10 min
- [ ] Topic 2 (from Course B, Lesson 5) - 15 min
- [ ] Topic 3 (new, adapted from C) - 12 min

### Optional (Practice - 30 min)
- [ ] Topic 4 (from Course A, Lesson 7) - 15 min

### Advanced (Homework - 60 min)
- [ ] Topic 5 (from Course D, Lesson 2) - 20 min
```

**Reference:** See [HOW-TO-BUILD-WORKSHOPS.md](../../../docs/workshops/HOW-TO-BUILD-WORKSHOPS.md#phase-2-deconstruct-existing-course-2-hours) for detailed topic extraction process.

---

## Phase 3: Structure Building (20-30 min)

### Checklist: Workshop Architecture
- [ ] Defined building blocks (each module = one transformation)
- [ ] Applied Learn → Do → Verify pattern to each block
- [ ] Calculated timing (target: 120 min mandatory)
- [ ] Identified optional practice points
- [ ] Planned homework extensions
- [ ] Named each building block explicitly

### Structure Template

Apply the workshop pattern from [HOW-TO-BUILD-WORKSHOPS.md](../../../docs/workshops/HOW-TO-BUILD-WORKSHOPS.md#structural-framework):

```
Module 1: Setup & Introduction (15-20 min)
├── 1-workshop-overview (goal, motivation)
├── 2-environment-setup (Aura/Codespaces/Sandbox)
└── 3-tool-overview (mechanics source of truth)

Module 2: Building Block 1 - [Transformation Name] (20-30 min)
├── 1-concept (3-5 min theory)
├── 2-challenge (7-12 min hands-on)
├── 3-validation (3-5 min proof + SQL comparison)
└── 4-optional-practice (5-15 min, :optional: true)

Module 3: Building Block 2 - [Transformation Name] (20-30 min)
├── [Repeat Learn → Do → Verify pattern]

Module N: Final Integration (15-20 min)
├── 1-build-final-project (combine all blocks)
└── 2-knowledge-check (quiz)
```

### Building Block Naming
Each block should have a clear completion marker:
- Building Block 1: "Products exist in the graph" ✓
- Building Block 2: "Customer→Order path complete" ✓
- Building Block 3: "Customer→Order→Product path complete" ✓

### Output
Create module breakdown with:
- Module name and duration
- Learning objectives
- Building block description
- Lessons with timing

---

## Phase 4: Outline Creation (15-20 min)

### Checklist: Detailed Outline
- [ ] Every lesson has title, type, order, duration
- [ ] Concept → Challenge → Validation pattern clear
- [ ] SQL comparisons planned for each validation
- [ ] Optional lessons marked
- [ ] Verification points identified
- [ ] Snapshot points identified
- [ ] Homework lessons separated

### Outline Format
```markdown
# Workshop: [Title]

**Goal:** [Concrete deliverable]
**Duration:** 2 hours core + 30-60 min optional
**Environment:** [Aura/Codespaces/Sandbox - with justification]

## Module 1: Setup (20 min)

### 1. Workshop Overview
- **Type:** lesson
- **Duration:** 5 min
- **Content:** Goal introduction, motivation, module preview
- **Reference:** Adapt from [source course/lesson](link)

### 2. Environment Setup
- **Type:** lesson
- **Duration:** 10 min
- **Environment:** [Aura/Codespaces/Sandbox]
- **Why this environment:** [Justification]
- **Content:** Setup instructions, verification

### 3. Tool Overview
- **Type:** lesson
- **Duration:** 5 min
- **Content:** Comprehensive tool mechanics (SOURCE OF TRUTH)
- **Reference:** Adapt from [source](link)

## Module 2: Building Block 1 - [Name] (25 min core + 5 min optional)

### 1. [Concept Name]
- **Type:** lesson
- **Duration:** 5 min
- **Content:** Theory, examples with workshop data
- **Reference:** Adapt from [source](link)

### 2. [Challenge Name]
- **Type:** challenge
- **Duration:** 12 min
- **Content:** Hands-on task, automated verification
- **Verification:** verify.cypher checks [what]
- **Snapshot:** module2-lesson2.zip
- **Building Block:** "Description" ✓

### 3. [Validation Name]
- **Type:** lesson
- **Duration:** 8 min
- **Content:** Query what was built, SQL comparison
- **SQL vs Cypher:** [What comparison to show]

### 4. [Optional Practice]
- **Type:** lesson
- **Duration:** 5 min
- **Optional:** true
- **Content:** Query practice, business questions

[Repeat for additional modules...]

## Homework Extensions

### Module 2 Extended
1a. [Advanced Topic]
- **Duration:** 20 min
- **Content:** Deep dive into [concept]
```

### Validation
Check outline against targets:
```
Mandatory lessons total: ___ min (target: 120 min)
Optional lessons total: ___ min (target: 30-60 min)
Homework total: ___ min (target: 60 min)
```

**Reference:** See [workshop-importing course.adoc](../../asciidoc/courses/workshop-importing/course.adoc) for example structure.

---

## Phase 5: Environment Selection

### Decision Matrix

| Workshop Type | Environment | Reason |
|---------------|-------------|--------|
| Visual modeling (Data Importer) | **Aura** | GUI tools required |
| Dashboard building | **Aura** | Dashboards tool |
| Pure Cypher practice | **GraphAcademy Sandbox** | Seamless, in-browser |
| Application development | **Codespaces** | Full dev environment |
| API building | **Codespaces** | Code editor + terminal |

### Checklist: Environment Choice
- [ ] Environment matches primary workshop activities
- [ ] Justification documented ("Why Aura/Codespaces/Sandbox")
- [ ] Fallback option considered
- [ ] Setup time included in Module 1
- [ ] Cost implications understood (Aura Free, Codespaces free tier)

**Reference:** See [HOW-TO-BUILD-WORKSHOPS.md](../../../docs/workshops/HOW-TO-BUILD-WORKSHOPS.md#environment-selection) for detailed guidance.

---

## Phase 6: Skeleton Structure Creation

### Checklist: Folder Structure
- [ ] Main course folder created
- [ ] Module folders created (numbered)
- [ ] Lesson folders created (numbered with slugs)
- [ ] Homework folder created (if needed)
- [ ] Snapshots folder created
- [ ] Data folder created
- [ ] README.md created
- [ ] CONTENT_GUIDELINES.md copied

### File Structure to Create
```
workshop-[name]/
├── course.adoc
├── README.md
├── CONTENT_GUIDELINES.md
├── modules/
│   ├── 1-setup/
│   │   ├── module.adoc
│   │   └── lessons/
│   │       ├── 1-overview/
│   │       │   └── lesson.adoc
│   │       ├── 2-setup/
│   │       │   └── lesson.adoc
│   │       └── 3-tool-overview/
│   │           └── lesson.adoc
│   ├── 2-building-block-1/
│   │   ├── module.adoc
│   │   └── lessons/
│   │       ├── 1-concept/
│   │       │   └── lesson.adoc
│   │       ├── 2-challenge/
│   │       │   ├── lesson.adoc
│   │       │   ├── verify.cypher
│   │       │   ├── solution.cypher
│   │       │   └── questions/
│   │       │       └── verify.adoc
│   │       ├── 3-validation/
│   │       │   └── lesson.adoc
│   │       └── 4-optional-practice/
│   │           └── lesson.adoc
│   └── [additional modules...]
├── homework/
│   └── 2-building-block-1/
│       └── lessons/
│           └── 1a-advanced-topic/
│               └── lesson.adoc
├── snapshots/
│   ├── module2-lesson2.zip
│   └── [additional snapshots...]
└── data/
    └── [data files]
```

### Commands to Execute
```bash
# Create main structure
mkdir -p workshop-[name]/{modules,homework,snapshots,data}

# Copy guidelines
cp CONTENT_GUIDELINES.md workshop-[name]/

# Create module folders (example for 3 modules)
for i in 1 2 3; do
  mkdir -p workshop-[name]/modules/$i-[slug]/lessons
done

# Create lesson placeholders
# (Continue based on outline)
```

### Skeleton Files

**course.adoc template:**
```asciidoc
= Workshop: [Title]
:categories: [category]
:status: active
:duration: 2 hours
:caption: [Short description]

== Course Description

[Detailed description]

**By the end of this workshop, you will have built:** [Concrete deliverable]

== Prerequisites

* [Prerequisite 1]
* [Prerequisite 2]

== Duration

* **Core path:** 2 hours
* **With optional lessons:** 2.5-3 hours
* **With homework:** +1 hour

link:./modules/1-setup/[Start Workshop →,role=btn]
```

**module.adoc template:**
```asciidoc
= [Module Title]
:order: 1

[Brief description]

By the end of this module, you will:

* [Outcome 1]
* [Outcome 2]
* [Outcome 3]

link:./1-first-lesson/[Ready? Let's go →, role=btn]
```

**lesson.adoc template:**
```asciidoc
= [Lesson Title]
:type: lesson|challenge|quiz
:order: 1
:duration: 10

[Content goes here]

read::Continue[]

[.summary]
== Summary

* [Key point 1]
* [Key point 2]
```

---

## Final Output

### Workshop Plan Document
Create `WORKSHOP-PLAN.md` with:
1. Goal statement
2. Module structure with timing
3. Building block progression
4. Topic mapping (source course → workshop lesson)
5. Environment choice with justification
6. Next steps (ready for authoring)

### Checklist: Plan Complete
- [ ] Goal is concrete and measurable
- [ ] Timing target met (2 hours ± 10 min)
- [ ] Building blocks explicitly named
- [ ] Learn → Do → Verify pattern applied throughout
- [ ] Optional lessons identified
- [ ] Homework separated
- [ ] Environment selected and justified
- [ ] Folder structure created
- [ ] Skeleton files created
- [ ] Ready to hand off to authoring skill

---

## Handoff to Authoring

When plan is approved, provide:

```markdown
## Workshop Ready for Authoring

**Workshop:** [Name]
**Folder:** `asciidoc/courses/workshop-[slug]/`
**Plan:** [Link to WORKSHOP-PLAN.md]
**Modules:** [Count] modules, [Count] lessons
**Status:** ✓ Structure created, ready for content authoring

**Next Step:** Use `workshop-authoring-coordinator` skill to begin creating lesson content.
```

---

## References

- [HOW-TO-BUILD-WORKSHOPS.md](../../../docs/workshops/HOW-TO-BUILD-WORKSHOPS.md) - Complete methodology
- [workshop-importing](../../asciidoc/courses/workshop-importing/) - Example workshop
- [CONTENT_GUIDELINES.md](../../asciidoc/courses/workshop-importing/CONTENT_GUIDELINES.md) - Style guide
- [create-new-workshop.mdc](../.cursor/create-new-workshop.mdc) - Original cursor rule
- [how-we-teach course](../../asciidoc/courses/how-we-teach/) - Pedagogical principles
