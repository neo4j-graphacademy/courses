/**
 * Post course release metadata from course.adoc to Asana.
 * Used when a PR with a label (e.g. Release, Draft, Enhancement) is merged.
 *
 * Destinations are read from config/promo/{ASANA_CONFIG}.json (asana.destinations), or from
 * ASANA_DESTINATIONS env. Set ASANA_CONFIG to the config base name (default "release").
 * Each destination: project, section?, assignee?, name? (metadata).
 * Use `npm run asana:list-sections -- <project_gid>` and `npm run asana:list-assignees -- --project <project_gid>` to find GIDs.
 *
 * Usage:
 *   ASANA_API_KEY=... [ASANA_CONFIG=release] ts-node .../post-release-to-asana.ts [course_slug ...]
 * Pass course slugs (e.g. aura-agents) or full paths to course.adoc. If no args, reads COURSE_PATHS from env.
 */

import path from "path";
import { readFileSync, existsSync } from "fs";
import { config } from "dotenv";

import {
  type CourseMetadata,
  readCourseMetadata,
  resolveCoursePath,
} from "../release/course-metadata";

config({ path: process.env.ENV_FILE ?? ".env" });

const ASANA_API_BASE = "https://app.asana.com/api/1.0";

export type { CourseMetadata };

/** Board, optional section, optional assignee, and optional name (metadata) per destination. */
export interface AsanaDestination {
  project: string;
  section?: string;
  assignee?: string | null;
  name?: string;
}

function formatNotes(meta: CourseMetadata): string {
  const parts: string[] = [];
  if (meta.caption) parts.push(meta.caption);
  if (meta.link) parts.push(`\nLink: ${meta.link}`);
  if (meta.keyPoints) parts.push(`\nKey points: ${meta.keyPoints}`);
  if (meta.categories) parts.push(`\nCategories: ${meta.categories}`);
  return parts.join("\n").trim();
}

export { readCourseMetadata } from "../release/course-metadata";

/**
 * Create one Asana task per destination with the course metadata (each task can
 * have its own board, section, and assignee).
 */
export async function postCourseMetadataToAsana(
  metadata: CourseMetadata,
  destinations: AsanaDestination[],
  apiKey: string,
): Promise<void> {
  if (destinations.length === 0) {
    console.warn("No Asana destinations provided, skipping.");
    return;
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14);
  const year = dueDate.getFullYear();
  const month = String(dueDate.getMonth() + 1).padStart(2, "0");
  const day = String(dueDate.getDate()).padStart(2, "0");
  const dueOn = `${year}-${month}-${day}`;

  for (const d of destinations) {
    const project = d.project.trim();
    const membership: { project: string; section?: string } = { project };
    if (d.section?.trim()) {
      membership.section = d.section.trim();
    }

    const data: Record<string, unknown> = {
      name: metadata.title,
      notes: formatNotes(metadata),
      projects: [project],
      memberships: [membership],
      due_on: dueOn,
    };
    if (d.assignee?.trim()) {
      data.assignee = d.assignee.trim();
    }

    const res = await fetch(`${ASANA_API_BASE}/tasks`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Asana API error ${res.status}: ${text}`);
    }

    const json = (await res.json()) as {
      data?: { gid?: string; permalink_url?: string };
    };
    const taskUrl = json.data?.permalink_url ?? json.data?.gid ?? "created";
    const label = d.name ? ` (${d.name})` : "";
    console.log(`Created Asana task${label}: ${taskUrl}`);
  }
}

function parseDestinationItem(
  item: unknown,
  i: number,
): AsanaDestination {
  if (item === null || typeof item !== "object" || !("project" in item)) {
    throw new Error(
      `Destination[${i}] must be an object with "project" (and optional "section", "assignee", "name")`,
    );
  }
  const o = item as Record<string, unknown>;
  const project = String(o.project);
  const section = o.section;
  const assignee = o.assignee;
  const name = o.name;
  return {
    project,
    ...(section !== undefined &&
      section !== null && { section: String(section) }),
    ...(assignee !== undefined &&
      assignee !== null && { assignee: String(assignee) }),
    ...(name !== undefined && name !== null && { name: String(name) }),
  };
}

function parseDestinations(raw: string): AsanaDestination[] {
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error("ASANA_DESTINATIONS must be a JSON array");
  }
  return parsed.map((item, i) => parseDestinationItem(item, i));
}

/** Load destinations from config/promo/{configName}.json (asana.destinations or top-level destinations). */
function loadDestinationsFromConfig(
  configName: string = "release",
): AsanaDestination[] | null {
  const safeName = configName.replace(/[^a-z0-9_.-]/gi, "") || "release";
  const configPath = path.join(process.cwd(), "config", "promo", `${safeName}.json`);
  if (!existsSync(configPath)) {
    return null;
  }
  const raw = readFileSync(configPath, "utf-8");
  const parsed = JSON.parse(raw) as Record<string, unknown>;
  const arr =
    parsed?.asana && typeof parsed.asana === "object" && Array.isArray((parsed.asana as { destinations?: unknown }).destinations)
      ? (parsed.asana as { destinations: unknown[] }).destinations
      : Array.isArray(parsed?.destinations)
        ? parsed.destinations
        : null;
  if (!arr || arr.length === 0) {
    return null;
  }
  return arr.map((item: unknown, i: number) => parseDestinationItem(item, i));
}

async function main(): Promise<void> {
  const apiKey = process.env.ASANA_API_KEY;
  const destinationsEnv = process.env.ASANA_DESTINATIONS ?? "";
  const configName = process.env.ASANA_CONFIG ?? "release";

  if (!apiKey) {
    console.error("ASANA_API_KEY is required.");
    process.exit(1);
  }

  let destinations: AsanaDestination[];
  try {
    if (destinationsEnv.trim()) {
      destinations = parseDestinations(destinationsEnv);
    } else {
      const fromConfig = loadDestinationsFromConfig(configName);
      if (!fromConfig || fromConfig.length === 0) {
        console.error(
          `No destinations found. Set ASANA_DESTINATIONS or create config/promo/${configName}.json with an "asana.destinations" array.`,
        );
        process.exit(1);
      }
      destinations = fromConfig;
    }
  } catch (e) {
    console.error("Invalid destinations config:", e);
    process.exit(1);
  }

  let paths: string[] = process.argv
    .slice(2)
    .filter((p) => !p.startsWith("--"));

  if (paths.length === 0 && process.env.COURSE_PATHS) {
    paths = process.env.COURSE_PATHS.split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  if (paths.length === 0) {
    console.error(
      "Provide course slug(s) (e.g. aura-agents) or path(s) as arguments, or set COURSE_PATHS.",
    );
    process.exit(1);
  }

  const baseUrl =
    process.env.GRAPHACADEMY_BASE_URL ?? "https://graphacademy.neo4j.com";

  for (const coursePath of paths) {
    const resolved = resolveCoursePath(coursePath);
    const metadata = readCourseMetadata(resolved, baseUrl);
    await postCourseMetadataToAsana(metadata, destinations, apiKey);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
