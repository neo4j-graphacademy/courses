# Repetitive Tasks Report: Aura Agents Course

Review of the aura-agents course for repeated content, procedures, and concepts that could be consolidated or cross-referenced to reduce redundancy.

---

## 1. High repetition (consider consolidating or cross-referencing)

### 1.1 "Click **Update agent**" to persist changes

**Occurrences:** 6+ lessons and 1 quiz

| Location | Context |
|----------|--------|
| 1-cypher-template | (Not explicitly; first use is in 2-create-your-own-cypher-tool) |
| 2-create-your-own-cypher-tool | After saving your tool, click **Update agent** to apply your changes |
| 4-text2cypher-challenge | Save and click **Update agent**, then run the same question again |
| 5-bp-create-from-scratch | Delete tools section; Edit tools (implicit); "Click **Update agent** to persist the change" |
| 6-create-from-scratch | Step 4; Step 5 "Then click **Update agent** and test" |
| 1-publishing-agent | Step 6 in numbered list: Click **Update agent** |
| 5-bp questions/3-configuration-methods.adoc | Full explanation of why Update agent is required |

**Recommendation:** Teach the rule once (e.g. in 5-bp "Edit tools" or in 1-cypher-template as a callout). In later lessons, use a short reminder: "Click **Update agent** to save (as in the Design an Agent lesson)" instead of re-explaining. Keep the quiz as-is for reinforcement.

---

### 1.2 Check your project role (Project → Users + same two images)

**Occurrences:** 2 lessons with identical block

| Location | Content |
|----------|--------|
| 1-agents-overview | [NOTE] "To check your role, go to **Project** → **Users**..." + image::project-users-menu.png + "Your role is listed in the **Project role** column..." + image::project-users-list.png |
| 1-publishing-agent | Same NOTE text, same two images, under "Enable external access" |

**Recommendation:** Use the block only in 1-agents-overview. In 1-publishing-agent, replace with: "To check your role, see the Introduction to Aura Agents lesson (Project → Users). Changing access settings requires **Project Admin**." Then keep the numbered steps and single image (configure-agent-menu) for the External/MCP steps. This removes duplicate text and duplicate images.

---

### 1.3 "Can you write the complete Cypher right now with only `$parameter` slots?"

**Occurrences:** 4 lessons + 2 quiz hints/solutions

| Location | How it appears |
|----------|----------------|
| 3-text2cypher | Full sentence: "A useful test: can you write the complete Cypher right now, with only `$parameter` slots for variable values? If the MATCH pattern..." |
| 5-bp-create-from-scratch | Question types section: "Apply this test to each question type: can you write the complete Cypher query right now, with only `$parameter` slots for variable values?" |
| 6-create-from-scratch | NOTE "Use a Cypher Template when you can write the complete Cypher now, with only `$parameter` slots..." |
| 5-bp questions/1-tool-selection.adoc | Hint: "Apply the test: can you write the full Cypher now with only `$parameter` slots for values?" |
| 3-text2cypher questions/1-text2cypher.adoc | Solution references same idea |

**Recommendation:** Treat 5-bp as the canonical "design" lesson where the test is defined. In 3-text2cypher, use a forward reference: "Apply the test from the Design an Agent lesson: can you write the complete Cypher right now with only `$parameter` slots?" and keep one full explanation in 5-bp. In 6-create-from-scratch, keep the NOTE short and point to 5-bp for the full test. Quiz hints can stay as brief reminders.

---

### 1.4 Node labels and relationship types (schema in Text2Cypher description)

**Occurrences:** 6+ lessons and 1 quiz

| Location | How it appears |
|----------|----------------|
| 3-text2cypher | TIP "The description can also include additional information about the schema, such as the relevant node labels and relationship types" |
| 5-bp-create-from-scratch | "For your Text2Cypher fallback, the description must also include schema context. List the node labels and relationship types so the LLM generates valid Cypher instead of hallucinating relationship names" + sample block |
| 6-create-from-scratch | Instructions: "list the node labels and relationship types in your graph"; Step 3: "include your graph's node labels and relationship types"; "Give the tool a name... and a description that lists your node labels and relationship types" |
| 4-text2cypher-challenge | Step 2 checklist: "Does it use the correct node labels and relationship types"; Step 3: "add or clarify the schema: list node labels and relationship types" |
| 2-create-with-ai | "If the Cypher references a relationship that does not exist... the tool description is missing schema context" |
| 5-bp questions/2-tool-description.adoc | Distractor and solution about node labels and relationship types |

**Recommendation:** Define the rule once in 5-bp (Tool descriptions section) and in 3-text2cypher (as the Text2Cypher-specific application). In 6-create-from-scratch and 4-text2cypher-challenge, use short reminders: "Include node labels and relationship types in the description (see Design an Agent / Using Text2Cypher)." Avoid repeating the full "so the LLM generates valid Cypher" sentence in every lesson.

---

### 1.5 Navigation: **Data Services** → **Agents** (and **Create Agent**)

**Occurrences:** 4 lessons with same or similar path

| Location | Exact phrase |
|----------|----------------|
| 2-create-with-ai | "Open the Aura Console → **Data Services** → **Agents** → **Create Agent** → **Create with AI**" |
| 2-create-your-own-cypher-tool | "Open that agent in the Aura Console (**Data Services** → **Agents** → select your agent)" |
| 4-text2cypher-challenge | "Open the agent in the Aura Console (**Data Services** → **Agents** → select your agent)" |
| 6-create-from-scratch | "Go to Aura Console → **Data Services** → **Agents** → **Create Agent** → **Create from scratch**" |

**Recommendation:** Accept as necessary repetition for procedural lessons. Optionally add a single line in 1-agents-overview: "Agents are under **Data Services** → **Agents** in the Aura Console," so later lessons can say "Open your agent (Data Services → Agents)" without spelling out the full path every time.

---

## 2. Medium repetition (acceptable but could be tightened)

### 2.1 **Add Tool** → **Cypher Template** + add-tool-menu image

**Occurrences:** 1-cypher-template, 2-create-your-own-cypher-tool (uses ../1-cypher-template image), 5-bp-create-from-scratch, 6-create-from-scratch.

**Recommendation:** First occurrence (1-cypher-template) is the main reference. Later lessons can say "Click **Add Tool** → **Cypher Template** (see Creating Cypher Template tools)" and reuse the same image path or a single shared reference to avoid caption drift.

---

### 2.2 Expand the **Thought** section to inspect reasoning

**Occurrences:** 3-text2cypher, 2-create-your-own-cypher-tool, 4-text2cypher-challenge, 6-create-from-scratch (twice).

**Recommendation:** Introduce "Expand the **Thought** section" once (e.g. in 2-create-with-ai "Trace through the query" or in 1-agents-overview when mentioning reasoning). Later lessons: "Expand the **Thought** section to see which tool was used and the generated Cypher." No need to re-explain what Thought contains in every challenge.

---

### 2.3 Project Admin: who can create / edit / delete agents

**Occurrences:** 1-agents-overview (text + NOTE + WARNING), 2-create-with-ai (Before you start), 1-publishing-agent (table + NOTE + summary), 5-bp (one sentence), 2-project-permissions quiz.

**Recommendation:** Keep the table and one clear statement in 1-agents-overview. In 1-publishing-agent, keep the table for "Enable external access" context but trim the NOTE to: "Changing agent access requires **Project Admin**. To check your role, see Introduction to Aura Agents." In 2-create-with-ai, "Be a **Project Admin**" is enough. Avoid repeating the full "only project admins can create, edit, or delete" in every module.

---

### 2.4 Northwind: loading script and "if you use Northwind" examples

**Occurrences:** Northwind appears in 8 files. Full "how to load Northwind" (download script, Tools → Query, run script, Database information panel) in 2-create-with-ai NOTE. "If you are using Northwind" / example prompts in 2-create-with-ai, 2-create-your-own-cypher-tool, 4-text2cypher-challenge, 6-create-from-scratch.

**Recommendation:** Keep the single "how to load Northwind" NOTE in 2-create-with-ai. In other lessons, use: "If you use Northwind, try [question]. Otherwise adapt to your graph." Avoid re-describing the load steps. Optional: add a short "Using the Northwind dataset" note in course.adoc or module 1 that points to the create-with-ai NOTE so challenges can say "See the Northwind setup in Create your first agent."

---

## 3. Low repetition (fine to leave as-is)

- **Preview panel:** Described in 1-agents-overview and 2-create-with-ai; later lessons refer to "preview panel" or "open the preview." No change needed.
- **Organization settings / GenAI + Aura Agent:** Now stated in 1-agents-overview and referenced in 2-create-with-ai. Sufficient.
- **"In the next lesson / challenge / Module X":** Standard summary wording; keep for flow.
- **Tool description best practices** (what it returns, when to use it): Core to 5-bp and quiz; brief mentions in 2-create-your-own-cypher-tool and 2-connect-mcp are appropriate.

---

## 4. Summary table

| Repetition type | Severity | Suggested action |
|-----------------|----------|------------------|
| Update agent | High | Teach once; use short reminder + link in later lessons |
| Check your role (Project → Users + 2 images) | High | Keep full block only in 1-agents-overview; 1-publishing-agent references it |
| "$parameter" / "can you write the complete Cypher" test | High | Canonical definition in 5-bp; 3-text2cypher and 6-reference it |
| Node labels and relationship types in Text2Cypher | High | Define once in 5-bp and 3-text2cypher; others use short reminder + reference |
| Data Services → Agents path | Medium | Optional: one sentence in 1-agents-overview; others shorten path wording |
| Add Tool → Cypher Template + image | Medium | First full mention + image in 1-cypher-template; others reference |
| Expand Thought section | Medium | Explain once; others use one short sentence |
| Project Admin | Medium | One full explanation + table in 1-agents-overview; others minimal |
| Northwind load + examples | Medium | One load NOTE in 2-create-with-ai; others "if Northwind, try X" only |

---

## 5. Files to touch if you apply changes

- **1-agents-overview:** Keep "Check your role" block and "Update agent" concept if you introduce it here; add optional "Data Services → Agents" sentence.
- **1-publishing-agent:** Replace duplicate "Check your role" NOTE + two images with a reference to 1-agents-overview.
- **3-text2cypher:** Add forward reference to 5-bp for the "can you write the complete Cypher" test; keep schema TIP but avoid repeating 5-bp wording.
- **5-bp-create-from-scratch:** Treat as canonical for "Update agent," the Cypher test, and Text2Cypher schema (node labels and relationship types).
- **6-create-from-scratch:** Shorten NOTE on Cypher Template vs Text2Cypher; shorten schema reminders to "include node labels and relationship types (see Design an Agent)."
- **4-text2cypher-challenge:** Shorten Step 3 to a reminder + reference.
- **2-create-your-own-cypher-tool, 2-create-with-ai:** Use "Click **Update agent** (as in …)" or similar where applicable; avoid re-teaching the test or schema.

No changes to quiz content are required beyond keeping hints/solutions as brief reminders; the 3-configuration-methods question is a good single place that explains "Update agent" in full.

---

## 6. Applied changes (summary)

The following edits were made to reduce repetition:

- **1-publishing-agent:** Replaced the duplicate "Check your role" NOTE and two images with a short reference to the Introduction to Aura Agents lesson. Added navigation path to step 1 (Data Services → Agents). Added "(see the Design an Agent lesson in Module 2)" after "Click **Update agent**".
- **1-agents-overview:** Added "Agents are under **Data Services** → **Agents** in the Aura Console" after the manual agent creation sentence.
- **5-bp-create-from-scratch:** Added explicit rule in Edit tools: "After any change to tools (add, edit, or delete), click **Update agent** to save. The agent keeps using the previous configuration until you do." Question types now references "the test from the Using Text2Cypher lesson".
- **3-text2cypher:** TIP shortened to one sentence plus reference to Design an Agent. "Expand the **Thought** section" wording tightened to "to see which tool was used and the generated Cypher and results".
- **6-create-from-scratch:** Step 3 Text2Cypher intro and "Give the tool a name" sentence now reference the Design an Agent lesson for node labels/relationship types. NOTE "Cypher Template vs. Text2Cypher" shortened to reference the Design an Agent lesson. Removed redundant "Listing the schema inside the description gives Text2Cypher..." sentence. Step 4 and Step 5 "Update agent" now include "(see the Design an Agent lesson)". Instructions in Step 1 reference Design an Agent for schema.
- **2-create-your-own-cypher-tool:** Kept "Click **Update agent** to apply your changes" without forward reference (lesson runs before Design an Agent).
- **4-text2cypher-challenge:** Step 3 schema step references "the Using Text2Cypher lesson". Update agent step kept as "to apply your changes" (no forward reference to Design an Agent).
