/* eslint-disable */
import { LinearClient } from "@linear/sdk";
import initNeo4j, { close, read } from "../modules/neo4j";
import {
  NEO4J_HOST,
  NEO4J_USERNAME,
  NEO4J_PASSWORD,
  LINEAR_API_KEY,
  LINEAR_TEAM_KEY,
} from "../constants";

if (!NEO4J_HOST || !NEO4J_USERNAME || !NEO4J_PASSWORD) {
  throw new Error("Neo4j credentials not defined");
}
if (!LINEAR_API_KEY) {
  throw new Error("LINEAR_API_KEY is not defined");
}

const CYPHER = `
MATCH (f:NegativeFeedback)-[:FOR_LESSON]->(l:Lesson)
WHERE f.createdAt >= datetime() - duration('P30D') AND l.status = 'active'
  AND (l.updatedAt IS NULL OR f.createdAt >= l.updatedAt)

WITH l,
    COUNT { (pf:PositiveFeedback)-[:FOR_LESSON]->(l) WHERE pf.createdAt >= datetime() - duration('P30D') } AS positive,
    COUNT (*) AS negative,
    collect({reason: f.reason, additional: f.additional}) AS reasons

WHERE positive + negative >= 5
WITH l, positive, negative, reasons,
     toFloat(negative) / (positive + negative) * 100 AS negativePercentage
ORDER BY negativePercentage DESC
LIMIT 5
MATCH (c:Course)-[:HAS_MODULE]->(m:Module)-[:HAS_LESSON]->(l)

RETURN l.title AS lesson, l.id AS lessonId, c.title AS course, c.slug AS courseSlug,
       m.title AS module, positive, negative, round(negativePercentage, 1) AS negativePercent,
       reasons
`;

interface FeedbackReason {
  reason: string;
  additional: string | null;
}

interface LessonFeedback {
  lesson: string;
  lessonId: string;
  course: string;
  courseSlug: string;
  module: string;
  positive: number;
  negative: number;
  negativePercent: number;
  reasons: FeedbackReason[];
}

function formatTitle(row: LessonFeedback): string {
  return `Lesson feedback: "${row.lesson}" — ${row.negativePercent}% negative (last 30 days)`;
}

function formatDescription(row: LessonFeedback): string {
  const url = `https://graphacademy.neo4j.com/courses/${row.courseSlug}/`;

  const reasonLines = row.reasons.map((r) => {
    const lines = [`- **${r.reason || "No reason given"}**`];
    if (r.additional?.trim()) {
      lines.push(`  > ${r.additional.trim()}`);
    }
    return lines.join("\n");
  });

  return [
    `## Lesson Feedback Summary`,
    ``,
    `| | |`,
    `|---|---|`,
    `| **Lesson** | ${row.course} → ${row.module} → [${row.lesson}](${url}) |`,
    `| **Feedback** | ${row.positive} positive, ${row.negative} negative (${row.negativePercent}%) |`,
    ``,
    `## Recent feedback`,
    ``,
    ...reasonLines,
    ``,
  ].join("\n");
}

// Find the "feedback" label nested under the "course" group label
async function resolveFeedbackLabel(
  linear: LinearClient,
  teamId: string,
): Promise<string | undefined> {
  const labels = await linear.issueLabels({
    filter: { team: { id: { eq: teamId } } },
  });

  console.log(labels.nodes);

  const feedbackLabels = labels.nodes.filter(
    (l) => l.name.toLowerCase() === "feedback",
  );

  if (feedbackLabels.length === 0) {
    console.warn('⚠️  No "feedback" label found in team');
    return undefined;
  }

  // If there's only one, use it; otherwise find the one parented under "course"
  if (feedbackLabels.length === 1) return feedbackLabels[0].id;

  for (const label of feedbackLabels) {
    const parent = await label.parent;
    if (parent?.name.toLowerCase() === "course") return label.id;
  }

  return feedbackLabels[0].id;
}

// Find an existing project by name, or create one associated with the team
async function findOrCreateProject(
  linear: LinearClient,
  teamId: string,
  courseName: string,
  cache: Map<string, string>,
): Promise<string | undefined> {
  if (cache.has(courseName)) return cache.get(courseName);

  const existing = await linear.projects({
    filter: { name: { eq: courseName } },
  });

  console.log(existing.nodes);

  if (existing.nodes.length > 0) {
    const id = existing.nodes[0].id;
    console.log(`   📁 Found project: "${courseName}"`);
    cache.set(courseName, id);
    return id;
  }

  const payload = await linear.createProject({
    name: courseName,
    teamIds: [teamId],
  });

  if (payload.success) {
    const project = await payload.project;
    if (project) {
      console.log(`   📁 Created project: "${courseName}"`);
      cache.set(courseName, project.id);
      return project.id;
    }
  }

  console.warn(`   ⚠️  Could not find or create project for "${courseName}"`);
  return undefined;
}

async function run(): Promise<void> {
  const start = Date.now();

  await initNeo4j(NEO4J_HOST, NEO4J_USERNAME, NEO4J_PASSWORD);
  console.log(`🔍 Running feedback triage query...`);

  const result = await read(CYPHER);
  await close();

  const rows: LessonFeedback[] = result.records.map((record) => ({
    lesson: record.get("lesson"),
    lessonId: record.get("lessonId"),
    course: record.get("course"),
    courseSlug: record.get("courseSlug"),
    module: record.get("module"),
    positive: record.get("positive"),
    negative: record.get("negative"),
    negativePercent: record.get("negativePercent"),
    reasons: record.get("reasons"),
  }));

  console.log(`📊 Found ${rows.length} lessons with high negative feedback`);

  if (rows.length === 0) {
    console.log("✅ Nothing to triage");
    return;
  }

  const linear = new LinearClient({ apiKey: LINEAR_API_KEY });

  // Resolve team by key
  const teams = await linear.teams();
  const team = teams.nodes.find((t) => t.key === LINEAR_TEAM_KEY);
  if (!team) {
    throw new Error(
      `Linear team with key "${LINEAR_TEAM_KEY}" not found. Available: ${teams.nodes.map((t) => t.key).join(", ")}`,
    );
  }
  console.log(`📋 Using Linear team: ${team.name} (${team.key})`);

  // Find the triage/backlog state to file issues into
  const states = await team.states();
  const triageState =
    states.nodes.find((s) => s.name.toLowerCase() === "triage") ||
    states.nodes.find((s) => s.type === "triage") ||
    states.nodes.find((s) => s.name.toLowerCase() === "backlog") ||
    states.nodes.find((s) => s.type === "backlog");

  if (triageState) {
    console.log(`📌 Filing into state: ${triageState.name}`);
  }

  // Resolve the "feedback" label (nested under "course" group)
  const feedbackLabelId = await resolveFeedbackLabel(linear, team.id);
  if (feedbackLabelId) {
    console.log(`🏷️  Using "feedback" label`);
  }

  const projectCache = new Map<string, string>();
  let created = 0;
  let skipped = 0;

  for (const row of rows) {
    // Avoid duplicates: search for open issues that contain this lessonId in their description
    const existing = await linear.issues({
      filter: {
        team: { id: { eq: team.id } },
        description: { contains: `lessonId: ${row.lessonId}` },
        state: { type: { nin: ["completed", "cancelled"] } },
      },
    });

    if (existing.nodes.length > 0) {
      console.log(
        `⏭️  Skipping "${row.lesson}" — open issue already exists (${existing.nodes[0].identifier})`,
      );
      skipped++;
      continue;
    }

    const projectId = await findOrCreateProject(
      linear,
      team.id,
      row.course,
      projectCache,
    );

    const payload = await linear.createIssue({
      teamId: team.id,
      title: formatTitle(row),
      description: formatDescription(row),
      ...(triageState ? { stateId: triageState.id } : {}),
      ...(feedbackLabelId ? { labelIds: [feedbackLabelId] } : {}),
      ...(projectId ? { projectId } : {}),
    });

    if (payload.success) {
      const issue = await payload.issue;
      console.log(
        `✅ Created ${issue?.identifier}: "${row.lesson}" (${row.negativePercent}% negative)`,
      );
      created++;
    } else {
      console.log(`❌ Failed to create issue for "${row.lesson}"`);
    }
  }

  const elapsed = Date.now() - start;
  console.log(
    `\n⌚️ Done in ${elapsed}ms — ${created} created, ${skipped} skipped`,
  );
}

run().catch((e) => {
  console.error(`❌ Error: ${e.message}`);
  console.error(e.stack);
  process.exit(1);
});
