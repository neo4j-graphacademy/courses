/* eslint-disable */
import { LinearClient } from "@linear/sdk";
import initNeo4j, { close, read } from "../modules/neo4j";
import { findOrCreateProject } from "./linear/linear-utils";
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
MATCH (u:User)-[:PROVIDED_FEEDBACK]->(f:NegativeFeedback)-[:FOR_LESSON]->(l:Lesson)
WHERE f.createdAt >= datetime() - duration('P30D') AND l.status = 'active'
  AND (l.updatedAt IS NULL OR f.createdAt >= l.updatedAt)
  AND f.additional IS NOT NULL AND trim(f.additional) <> ''
  AND NOT toLower(f.additional) CONTAINS 'sandbox'
  AND NOT toLower(f.additional) CONTAINS 'connection'
  AND NOT toLower(f.additional) CONTAINS 'timeout'

WITH *, split(u.email, '@') AS emailParts

WITH l, f,
    left(emailParts[0], 2) + '***' + right(emailParts[0], 2) + '@' + emailParts[1] AS emailDomain,
    exists { (u)-[:HAS_ENROLMENT]->()-[:COMPLETED_LESSON]->(l) } AS completed

WITH l,
    COUNT { (pf:PositiveFeedback)-[:FOR_LESSON]->(l) WHERE pf.createdAt >= datetime() - duration('P30D') } AS positive,
    COUNT (f) AS negative,
    collect({
      feedbackId: coalesce(f.id, elementId(f)),
      reason: f.reason,
      additional: f.additional,
      emailDomain: emailDomain,
      completed: completed,
      createdAt: toString(f.createdAt)
    }) AS reasons

//WHERE positive + negative >= 5
WITH l, positive, negative, reasons,
     toFloat(negative) / (positive + negative) * 100 AS negativePercentage
ORDER BY negativePercentage DESC
LIMIT 5
MATCH (c:Course)-[:HAS_MODULE]->(m:Module)-[:HAS_LESSON]->(l)

RETURN l.title AS lessonTitle, l.id AS lessonId, c.title AS courseTitle, c.slug AS courseSlug,
       m.title AS moduleTitle, m.slug AS moduleSlug, l.slug AS lessonSlug, positive, negative, round(negativePercentage, 1) AS negativePercent,
       reasons
`;

interface FeedbackReason {
  feedbackId: string;
  reason: string;
  additional: string | null;
  emailDomain: string;
  completed: boolean;
  createdAt: string;
}

interface LessonFeedback {
  lessonTitle: string;
  lessonId: string;
  courseTitle: string;
  courseSlug: string;
  moduleTitle: string;
  moduleSlug: string;
  lessonSlug: string;
  positive: number;
  negative: number;
  negativePercent: number;
  reasons: FeedbackReason[];
}

function formatTitle(row: LessonFeedback): string {
  return `Lesson feedback: "${row.lessonTitle}" — ${row.negativePercent}% negative (last 30 days)`;
}

function formatDescription(row: LessonFeedback): string {
  const lessonUrl = `https://graphacademy.neo4j.com/courses/${row.courseSlug}/${row.moduleSlug}/${row.lessonSlug}`;
  const adminBase = `https://graphacademy.neo4j.com/api/v1/feedback`;

  const tableRows = row.reasons.map((r) => {
    const additional = (r.additional?.trim() ?? "")
      .replace(/\\/g, "\\\\")
      .replace(/\|/g, "\\|")
      .replace(/\n+/g, " ");
    const date = r.createdAt ? r.createdAt.slice(0, 10) : "—";
    return `| \`${r.emailDomain}\` | ${date} | ${r.reason || "—"} | ${additional} | ${r.completed ? "Y" : "N"} | ([view](${adminBase}/${r.feedbackId})) |`;
  });

  return [
    `## Lesson Feedback Summary`,
    ``,
    `* **Lesson**: ${row.courseTitle} → ${row.moduleTitle} → [${row.lessonTitle}](${lessonUrl})`,
    `* **Feedback**: ${row.positive} positive, ${row.negative} negative (${row.negativePercent}%)`,
    ``,
    `## Recent feedback`,
    ``,
    `| User | Date | Reason | Additional | Completed | |`,
    `|---|---|---|---|:---:|---|`,
    ...tableRows,
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

const dryRun = process.argv.includes("--dry-run");

async function run(): Promise<void> {
  const start = Date.now();

  if (dryRun) console.log("🧪 Dry run — no issues will be created\n");

  await initNeo4j(NEO4J_HOST, NEO4J_USERNAME, NEO4J_PASSWORD);
  console.log(`🔍 Running feedback triage query...`);

  const result = await read(CYPHER);
  await close();

  const rows: LessonFeedback[] = result.records.map(
    (record) => record.toObject() as LessonFeedback,
  );

  console.log(`📊 Found ${rows.length} lessons with high negative feedback`);

  if (rows.length === 0) {
    console.log("✅ Nothing to triage");
    return;
  }

  if (dryRun) {
    for (const row of rows) {
      console.log(`\n${"─".repeat(60)}`);
      console.log(`TITLE: ${formatTitle(row)}`);
      console.log(`\n${formatDescription(row)}`);
    }
    console.log(`\n${"─".repeat(60)}`);
    console.log(`\n🧪 ${rows.length} issue(s) would be created`);
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
        `⏭️  Skipping "${row.lessonTitle}" — open issue already exists (${existing.nodes[0].identifier})`,
      );
      skipped++;
      continue;
    }

    const projectId = await findOrCreateProject(
      linear,
      team.id,
      row.courseSlug,
      row.courseTitle,
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
        `✅ Created ${issue?.identifier}: "${row.lessonTitle}" (${row.negativePercent}% negative)`,
      );
      created++;
    } else {
      console.log(`❌ Failed to create issue for "${row.lessonTitle}"`);
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
