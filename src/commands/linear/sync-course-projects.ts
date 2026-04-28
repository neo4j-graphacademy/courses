/**
 * Ensure every draft or active GraphAcademy course has a matching Linear project (slug = project name).
 *
 * Usage:
 *   ts-node src/commands/linear/sync-course-projects.ts
 *   ts-node src/commands/linear/sync-course-projects.ts --dry-run
 *
 * Requires LINEAR_API_KEY and uses LINEAR_TEAM_KEY (default GRAC) from the environment.
 */

import { readdir } from "fs/promises";
import { existsSync } from "fs";

import {
  ATTRIBUTE_STATUS,
  COURSE_DIRECTORY,
  DEFAULT_COURSE_STATUS,
  LINEAR_TEAM_KEY,
} from "../../constants";
import { loadFile } from "../../modules/asciidoc";
import { courseOverviewPath } from "../../utils";
import { readCourseMetadata } from "../release/course-metadata";
import { createLinearClient, findOrCreateProject } from "./linear-utils";

const dryRun = process.argv.includes("--dry-run");

/** Linear projects that are not represented as folders under `asciidoc/courses/`. */
const EXTRA_LINEAR_PROJECTS: Record<string, string> = {
  "neo4j-certification": "Neo4j Certification",
  "gds-certification": "Neo4j Graph Data Science Certification",
  "genai-certification": "Neo4j GenAI Certification",
};

const GRAPHACADEMY_BASE = "https://graphacademy.neo4j.com";

function graphAcademyCourseUrl(slug: string): string {
  const url = new URL(GRAPHACADEMY_BASE);
  url.pathname = `/courses/${encodeURIComponent(slug)}/`;
  return url.href;
}

function getLinearProjectPayload(slug: string): {
  title: string;
  description: string;
} {
  const extraTitle = EXTRA_LINEAR_PROJECTS[slug];
  if (extraTitle !== undefined) {
    const link = graphAcademyCourseUrl(slug);
    return { title: extraTitle, description: `${extraTitle}\n\n${link}` };
  }
  const meta = readCourseMetadata(courseOverviewPath(slug));
  return {
    title: meta.title,
    description: `${meta.title}\n\n${meta.link}`,
  };
}

function isDraftOrActive(slug: string): boolean {
  const file = loadFile(courseOverviewPath(slug), { parse_header_only: true });
  const raw = file.getAttribute(ATTRIBUTE_STATUS, DEFAULT_COURSE_STATUS);
  const status = String(raw ?? DEFAULT_COURSE_STATUS)
    .toLowerCase()
    .trim();
  return status === "draft" || status === "active";
}

async function main(): Promise<void> {
  const allSlugs = (await readdir(COURSE_DIRECTORY))
    .filter((s) => existsSync(courseOverviewPath(s)))
    .sort((a, b) => a.localeCompare(b));

  const courseSlugs = allSlugs.filter(isDraftOrActive);
  const skippedByStatus = allSlugs.length - courseSlugs.length;
  const slugs = Array.from(
    new Set([...courseSlugs, ...Object.keys(EXTRA_LINEAR_PROJECTS)]),
  ).sort((a, b) => a.localeCompare(b));

  console.log(
    `${courseSlugs.length} draft/active courses (${skippedByStatus} skipped: other status) + ${Object.keys(EXTRA_LINEAR_PROJECTS).length} certification project(s) → ${slugs.length} Linear project(s)\n`,
  );

  if (dryRun) {
    for (const slug of slugs) {
      const { title } = getLinearProjectPayload(slug);
      console.log(`[dry-run] Would ensure Linear project "${slug}" — ${title}`);
    }
    console.log(`\n🧪 Dry run — no Linear API calls`);
    return;
  }

  const linear = createLinearClient();
  const teams = await linear.teams();
  const team = teams.nodes.find((t) => t.key === LINEAR_TEAM_KEY);
  if (!team) {
    throw new Error(
      `Linear team with key "${LINEAR_TEAM_KEY}" not found. Available: ${teams.nodes.map((t) => t.key).join(", ")}`,
    );
  }
  console.log(`Using Linear team: ${team.name} (${team.key})\n`);

  const cache = new Map<string, string>();
  let createdOrFound = 0;
  let failed = 0;

  for (const slug of slugs) {
    const { description } = getLinearProjectPayload(slug);

    process.stdout.write(`• ${slug} …\n`);
    const id = await findOrCreateProject(
      linear,
      team.id,
      slug,
      description,
      cache,
    );
    if (id) createdOrFound++;
    else failed++;
  }

  console.log(
    `\nDone — ${createdOrFound} project(s) found or created, ${failed} failed`,
  );
}

main().catch((err: Error) => {
  console.error(err.message);
  console.error(err.stack);
  process.exit(1);
});
