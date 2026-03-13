# Course Structural Review: aura-agents

Final structural review per `.cursor/review-course.mdc`. **Re-run:** verified all checklist items.

---

## Lesson checklist

| Check | Status | Notes |
|-------|--------|--------|
| Aura console links point to `https://console.neo4j.io/graphacademy` | N/A | No explicit console URLs in lessons; all references are plain text "Aura Console". If you add links later, use that URL. |
| Each `lesson.adoc` has `:type:` | Pass | All 11 lessons have `:type: lesson` or `:type: challenge`. |
| Each `lesson.adoc` has `:order:` matching folder name | Pass | 1-agents-overview→1, 2-create-with-ai→2, 1-cypher-template→1, 2-create-your-own-cypher-tool→2, 3-text2cypher→3, 4-text2cypher-challenge→4, 5-bp-create-from-scratch→5, 6-create-from-scratch→6, 1-publishing-agent→1, 2-connect-mcp→2, 3-next-steps→3. |
| Lesson includes all files in its `questions/` folder (or only existing refs) | Pass | All `include::questions/*.adoc` refer to existing files. No broken includes. |

---

## Module checklist

| Check | Status | Notes |
|-------|--------|--------|
| Each `module.adoc` has accurate overview | Pass | Module 1: intro + create with AI. Module 2: inspect tools, add tools, build from scratch. Module 3: publish, MCP, connect to Cursor. |
| Each `module.adoc` has `:order:` matching folder | Pass | 1-introduction→1, 2-design-implement→2, 3-publish→3. |

---

## Course checklist

| Check | Status | Notes |
|-------|--------|--------|
| Course outline reflects module overviews | Pass | "What you will learn" and description align with the three modules. |
| `illustration.svg` in course folder | Pass | Present. |
| `banner.png` in course folder | Pass | Present. |
| `course.adoc` has `:caption:` | Pass | "Learn to build and publish agentic systems in Neo4j Aura". |
| `course.adoc` has `:key-points:` (3–5 items) | Pass | Four key points. |
| "What you will learn" section and list accurate | Pass | Bullets match course content. |
| "This course includes" section | Pass | 3 modules, 11 lessons, 5 challenges, quizzes. |

---

## Last lesson

| Check | Status | Notes |
|-------|--------|--------|
| Last lesson not optional; has action (quiz or Mark as Read) | Pass | 3-next-steps has `read::Mark as completed[]`. |

---

## Summary

All checklist items pass. One QA fix applied: **3-text2cypher/questions/1-text2cypher.adoc** — question title changed from "When to Use Text2Cypher" to "Choosing the Right Tool" so it does not duplicate the lesson heading (QA requires question titles not to appear as headings in the lesson). `COURSES=aura-agents npm run test:qa` — 282 tests passed.
