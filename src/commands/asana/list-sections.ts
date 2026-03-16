/**
 * List section GIDs for an Asana project (board).
 * Use these GIDs in ASANA_DESTINATIONS when posting release tasks.
 *
 * Usage:
 *   ASANA_API_KEY=... ts-node src/commands/asana/list-sections.ts <project_gid>
 *   ASANA_API_KEY=... npm run asana:list-sections -- <project_gid>
 *
 * Example:
 *   npm run asana:list-sections -- 1208974749704120
 */

import { config } from "dotenv";

config({ path: process.env.ENV_FILE ?? ".env" });

const ASANA_API_BASE = "https://app.asana.com/api/1.0";

interface AsanaSection {
  gid: string;
  name: string;
  resource_type: string;
}

async function listSections(projectGid: string, apiKey: string): Promise<void> {
  const res = await fetch(
    `${ASANA_API_BASE}/projects/${projectGid}/sections`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Asana API error ${res.status}: ${text}`);
  }

  const json = (await res.json()) as { data?: AsanaSection[] };
  const sections = json.data ?? [];

  if (sections.length === 0) {
    console.log("No sections found for this project.");
    return;
  }

  const nameWidth = Math.max(
    ...sections.map((s) => s.name.length),
    "Section".length,
  );
  const gidWidth = Math.max(
    ...sections.map((s) => s.gid.length),
    "GID".length,
  );

  console.log(
    `${"Section".padEnd(nameWidth)}  ${"GID".padEnd(gidWidth)}`,
  );
  console.log(`${"-".repeat(nameWidth)}  ${"-".repeat(gidWidth)}`);

  for (const section of sections) {
    console.log(
      `${section.name.padEnd(nameWidth)}  ${section.gid.padEnd(gidWidth)}`,
    );
  }

  console.log("");
  console.log(
    "Use in ASANA_DESTINATIONS: {\"project\":\"<project_gid>\",\"section\":\"<section_gid>\"}",
  );
}

async function main(): Promise<void> {
  const apiKey = process.env.ASANA_API_KEY;
  if (!apiKey) {
    console.error("ASANA_API_KEY is required (set in .env or environment).");
    process.exit(1);
  }

  const projectGid = process.argv[2]?.trim();
  if (!projectGid) {
    console.error("Usage: npm run asana:list-sections -- <project_gid>");
    console.error(
      "  project_gid = Asana project (board) GID, e.g. from the project URL.",
    );
    process.exit(1);
  }

  await listSections(projectGid, apiKey);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
