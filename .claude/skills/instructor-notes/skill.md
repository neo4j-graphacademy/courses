---
name: instructor-notes
description: Write instructor notes (instructor.adoc) for a workshop. Use when a workshop needs a facilitator guide covering session overview, prerequisites, learning objectives, preparation checklist, and a timed outline plan with delivery guidance.
allowed-tools: Read, Write, Glob, Grep, Bash
---

# Instructor Notes Skill

**Purpose:** Generate a complete `instructor.adoc` facilitator guide for a GraphAcademy workshop.

**When to use:** A workshop is ready to deliver and needs instructor notes. The course content (module.adoc, lesson.adoc files) must exist before writing instructor notes.

**Output:** `asciidoc/courses/[course-slug]/instructor.adoc`

---

## What instructor notes contain

Every instructor.adoc has these sections, in this order:

1. **Title and URL** — workshop name + course link
2. **Introduction** — what the workshop is, format, session length, audience
3. **Prerequisites** — instructor knowledge + participant requirements
4. **Learning objectives** — what participants leave knowing
5. **Preparation** — what to know, what to set up, what to do before delivery
6. **Outline plan** — per-module timing and facilitation guidance
7. *(Optional)* **Common issues** — table of likely problems and resolutions
8. *(Optional)* **Resources** — links to slides, notes, Google Drive, external docs

---

## Phase 1: Read the course

Read these files before writing anything:

```
MUST READ:
- asciidoc/courses/[slug]/course.adoc         (duration, usecase, description, prerequisites)
- asciidoc/courses/[slug]/WORKSHOP-PLAN.md    (if it exists — timing, design decisions)
- asciidoc/courses/[slug]/modules/*/module.adoc   (all module overviews)
- asciidoc/courses/[slug]/modules/*/lessons/*/lesson.adoc  (all lesson content, types, durations)
```

Extract from your reading:

| Item | Where to find it |
|------|-----------------|
| Workshop name | course.adoc title |
| Total duration | `:duration:` attribute in course.adoc |
| Audience | Prerequisites section in course.adoc |
| Usecase/environment | `:usecase:` attribute (`blank-sandbox`, `recommendations`, etc.) |
| Module count and names | module.adoc files |
| Lesson types | `:type:` in each lesson.adoc (lesson, challenge, conversation, quiz) |
| Lesson durations | `:duration:` in each lesson.adoc |
| Optional lessons | `:optional: true` in lesson.adoc |
| Has Codespace | Look for `codespaces` or `{repository}` references in lesson content |
| Has conversation lessons | `:type: conversation` lessons |
| Has challenges | `:type: challenge` lessons with verify.cypher |

---

## Phase 2: Determine the structure

**Session length:**
- Look at `:duration:` in course.adoc and sum lesson durations
- Add ~15 min for setup/welcome that is not in lesson content
- Round to the nearest 30 min for the session estimate

**Environment type determines preparation steps:**

| Usecase | What participants need | What instructor must test |
|---------|----------------------|--------------------------|
| `blank-sandbox` | GraphAcademy account only | Sandbox provisions correctly on enrolment |
| `recommendations` / named dataset | GraphAcademy account only | Dataset is pre-loaded |
| Codespace present | GitHub account | Codespace opens, `.env` populates |
| GenAI / LLM content | API key (OpenAI or other) | API key works, test environment script passes |
| Aura required | Aura account | Instance creation works, import completes |

**Lesson type → delivery mode:**

| Lesson type | How to deliver |
|-------------|---------------|
| `lesson` with `[.slide]` markers | Present as slides to the group |
| `lesson` without slides | Participants read individually; instructor circulates |
| `challenge` | Participants work independently; instructor circulates |
| `conversation` | Participants interact with AI; instructor circulates and time-boxes |
| `quiz` | Participants complete individually |

---

## Phase 3: Write the instructor.adoc

Create `asciidoc/courses/[slug]/instructor.adoc` using this template:

```asciidoc
= [Workshop Name]: Facilitators Guide

https://graphacademy.neo4j.com/courses/[slug]/[graphacademy.neo4j.com/courses/[slug]/]

== Introduction

[2–3 sentences: what this workshop is, who it is for, how long it runs, whether it is online/in-person.]

== Prerequisites

=== For the instructor

What you should know before delivering this workshop:

* link:[Course 1]
* link:[Course 2]

You should complete the workshop yourself before delivering it[, including running through the Codespace environment and testing any API keys].

=== For participants

* [Requirement 1 — e.g. A GitHub account (for GitHub Codespaces)]
* [Requirement 2 — e.g. Basic programming experience]
* [Requirement 3 — e.g. An OpenAI API key]

[No prior Neo4j knowledge required. / Assumes basic familiarity with X.]

== Learning objectives

By the end of this workshop, participants will:

* [Objective 1]
* [Objective 2]
* [Objective N]

== Preparation

What you should know:

* link:[GraphAcademy course 1]
* link:[GraphAcademy course 2]

What you will need:

* A link:https://graphacademy.neo4j.com[GraphAcademy] account
* [Additional accounts/tools if needed]

What you will need to do:

. Complete the workshop before delivering it
. [Environment-specific preparation step]
. Delete your previous enrolment to the workshop (so you see the same view as the participants)
. Run the workshop!

== Outline plan

(All timings are estimates and adaptable)

=== [Section name] ([N] min)

*[Bold: one-line description of what happens in this section]*

[Facilitation guidance — what to say, what to watch for, what to demo, when to let participants work alone.]

=== Close

[Standard close pattern — see rules below]

== Common issues

[Only include if there are environment-specific failure modes worth documenting]

[cols="1,2",options="header"]
|===
| Issue | Resolution
| [Issue] | [Resolution]
|===

== Resources

[Only include if there are external resources: slides, notes, Google Drive, MCP server URL, etc.]

* [Resource 1]
* [Resource 2]
```

---

## Rules for each section

### Title and URL

- Format: `= [Workshop Full Name]: Facilitators Guide`
- URL goes on the very next line, as a bare link (not a callout block)
- Use `https://graphacademy.neo4j.com/courses/[slug]/` — no surrounding text

### Introduction

- 2–4 sentences only
- State: what the workshop covers, who it is for, typical session length
- State the format if relevant (online/in-person/either)
- Do NOT restate the learning objectives here

### Prerequisites — For the instructor

- List 3–6 GraphAcademy courses the instructor should have completed
- Link each one: `* https://graphacademy.neo4j.com/courses/[slug]/[[Course Name]^]`
- Add one sentence about what specifically to test/verify before the session (Codespace, API keys, sandbox)
- For workshops with Codespaces: "You should complete the workshop yourself before delivering it, including running through the Codespace environment and verifying the environment script passes."

### Prerequisites — For participants

- List only what participants genuinely need to bring; do NOT list things GraphAcademy provides
- Standard: GitHub account (if Codespace), API key (if GenAI), programming experience (if code challenges)
- End with whether prior Neo4j knowledge is required

### Learning objectives

- Write as past tense: "By the end of this workshop, participants will:"
- 4–8 bullet points
- Use concrete verbs: "Understand", "Know how to", "Be able to", "Have built"
- Cover the full arc: concepts → hands-on → deliverable

### Preparation

Three subsections in order:

**"What you should know:"** — prerequisite courses (same list as instructor prerequisites, abbreviated)

**"What you will need:"** — accounts and tools. Always include:
- A GraphAcademy account (always first)
- GitHub account if Codespace
- API key and provider account if GenAI
- Aura account if Aura is used

**"What you will need to do:"** — numbered task list. Always include:
1. "Complete the workshop before delivering it" (always first)
2. Environment-specific setup (create Codespace, test API key, verify sandbox)
3. Any slides or resource preparation
4. "Delete your previous enrolment to the workshop (so you see the same view as the participants)"
5. "Run the workshop!"

### Outline plan

- Start section with: `(All timings are estimates and adaptable)`
- Each section uses `===` heading, not `====`
- Time estimate in parentheses on the heading line: `=== Introduction (10 min)`
- Bold one-liner immediately after heading: `*What happens in this section*`
- Then facilitation notes as prose (2–6 sentences) or a table for lesson-by-lesson guidance

**Opening section (always first):**
```asciidoc
=== Welcome and setup (10–15 min)

*Get everyone enrolled and into their environment before the content starts.*

Ask participants to:

. Go to the course URL and enrol
. [Environment setup step — open Codespace / create Aura instance / etc.]

[Optional starter activity: ask the group a question to gauge prior knowledge, e.g. "What do you know about graph databases?"]
```

**Content sections:**
- One `===` section per workshop module (or per logical block if modules are short)
- State what type of delivery (present slides / hands-on / conversation / etc.)
- Call out what to emphasise, common misconceptions, when to demo vs. let them do it
- If a module has conversation or challenge lessons: tell the instructor to circulate and time-box
- If there is a "try it now" or verification step: list the expected outcome

**Closing section (always last in outline):**
```asciidoc
=== Close

Return to the introduction slides and remind participants they retain access to the course indefinitely.

Run a Q&A session.

Suggest GraphAcademy courses for continued learning:

* link:[Next course 1]
* link:[Next course 2]
```

### Common issues

Include this section if:
- The workshop uses Codespaces (auth issues, free tier limits)
- The workshop uses API keys (rate limits, wrong key format)
- The workshop uses Aura (instance creation failures, free vs. pro limits)
- The workshop has a complex import step that frequently fails

Format as a two-column table:

```asciidoc
[cols="1,2",options="header"]
|===
| Issue | Resolution

| [Issue description — brief]
| [Step-by-step resolution]

|===
```

### Resources

Only include if there are external resources beyond the course itself. Common resources:
- Google Drive folder with slides, notes, facilitator guide
- Repository URL (for Codespace workshops)
- MCP server URL (for AI-powered workshops)
- External documentation links

---

## Facilitation guidance by lesson type

Write notes for each lesson type that appears in the workshop:

**Slide-based lessons (`[.slide]` markers):**
> Present these to the group. Use the GraphAcademy course as the slides, or create a separate slide deck. Don't rush — these lessons carry the conceptual load.

**Read-only lessons (no slides):**
> Participants can read individually at their own pace. Circulate and answer questions. Time-box to the `:duration:` value.

**Conversation lessons (`:type: conversation`):**
> The AI drives this interaction. Your role is to circulate, look at what participants are building, and time-box. Always give a visible time limit: "Spend about [N] minutes here — you can continue during the hack/practice session."

**Challenge lessons (`:type: challenge`):**
> Participants work independently. Avoid giving the answer immediately — ask "What have you tried?" first. Point to the hint before the solution. Verify success by checking the automated verification feedback, not by eyeballing the query.

**Quiz lessons (`:type: quiz`):**
> Participants complete individually. You can use the results to gauge how the group is tracking. Don't read the answers aloud — the solution text in each question is sufficient.

---

## Timing guidance

Build the outline plan timing from the lesson durations:

- Sum all `:duration:` values in the module
- Add 20–30% for facilitation overhead (questions, transition, pacing variance)
- Optional lessons: note they add to total but are not in the core path
- Round each section to the nearest 5 minutes for the estimate

Total session time = sum of all sections + 15 min welcome/setup + 10 min close

State the session estimate clearly in the Introduction as a range: "90 minutes to 2 hours" or "2–4 hours".

---

## Examples

### Good introduction (workshop-modeling)

> The Modeling and Importing Data into Neo4j Workshop teaches graph data modeling fundamentals and hands-on data import using a real-world dataset. Participants build a product recommendation engine while learning how to identify nodes, relationships, and properties. The workshop is suitable for 2-hour sessions and works online or in person.

### Good facilitation note (workshop-genai)

> **What is Generative AI (30–60 min)**
> 
> Present the slides as a group. The key concept is grounding: RAG reduces hallucination by providing the LLM with external context at query time. GraphRAG extends this by using graph traversal to retrieve richer, connected context.
> 
> After the theory slides, move participants into the Codespace environment. Do not proceed until everyone has run `test_environment.py` and seen a success response. This is the most common failure point of the session — budget 10–15 minutes for environment setup.

### Good common issues table entry

```asciidoc
| Codespace won't open
| Check the participant has a GitHub account and is signed in. The free monthly Codespace allowance must not be exhausted. If it is, participants can clone the repo and run locally instead.
```

---

## References

- `asciidoc/courses/workshop-fundamentals/instructor.adoc` — canonical simple format
- `asciidoc/courses/workshop-modeling/instructor.adoc` — detailed format with quick reference table and checkpoints
- `asciidoc/courses/workshop-genai/instructor.adoc` — GenAI/Codespace format with API key guidance
- `asciidoc/courses/workshop-hackers/instructor.adoc` — MCP server + hack session format
- `asciidoc/courses/workshop-gds/instructor.adoc` — long workshop format with sandbox pool guidance
