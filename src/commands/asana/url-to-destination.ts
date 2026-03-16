/**
 * Parse an Asana project URL and optional section/assignee names into a
 * destination object for release.json (or draft.json etc).
 *
 * Usage:
 *   ASANA_API_KEY=... npm run asana:url-to-destination -- --url "https://app.asana.com/.../project/123/list/456" --section "Marquee Assets in Production" --assignee "Greg Posten"
 *
 * Or with a short name for the destination (used as "name" in config):
 *   ... --name "Marquee Production"
 *
 * Outputs the destination JSON and, if section or assignee were not found,
 * lists available sections and/or users so you can pick the right one.
 */

import { config } from "dotenv";

config({ path: process.env.ENV_FILE ?? ".env" });

const ASANA_API_BASE = "https://app.asana.com/api/1.0";

interface AsanaSection {
  gid: string;
  name: string;
  resource_type: string;
}

interface AsanaUser {
  gid: string;
  name: string;
  email?: string;
  resource_type: string;
}

function parseProjectGidFromUrl(url: string): string | null {
  const match = url.match(/\/project\/(\d+)/);
  return match ? match[1] : null;
}

async function fetchProject(
  projectGid: string,
  apiKey: string,
): Promise<{ workspaceGid: string; projectName: string }> {
  const res = await fetch(`${ASANA_API_BASE}/projects/${projectGid}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Asana API error ${res.status}: ${text}`);
  }
  const json = (await res.json()) as {
    data?: {
      gid: string;
      name: string;
      workspace?: { gid: string; name: string };
    };
  };
  const data = json.data;
  if (!data?.workspace?.gid) {
    throw new Error("Project has no workspace");
  }
  return {
    workspaceGid: data.workspace.gid,
    projectName: data.name ?? projectGid,
  };
}

async function fetchSections(
  projectGid: string,
  apiKey: string,
): Promise<AsanaSection[]> {
  const sections: AsanaSection[] = [];
  let url: string | null = `${ASANA_API_BASE}/projects/${projectGid}/sections`;

  while (url) {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Asana API error ${res.status}: ${text}`);
    }
    const json = (await res.json()) as {
      data?: AsanaSection[];
      next_page?: { uri?: string | null };
    };
    if (json.data) {
      sections.push(...json.data);
    }
    url = json.next_page?.uri ?? null;
  }

  return sections;
}

async function fetchUsers(
  workspaceGid: string,
  apiKey: string,
): Promise<AsanaUser[]> {
  const users: AsanaUser[] = [];
  const params = new URLSearchParams();
  params.set("opt_fields", "name,email");
  let url: string | null = `${ASANA_API_BASE}/workspaces/${workspaceGid}/users?${params}`;

  while (url) {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Asana API error ${res.status}: ${text}`);
    }
    const json = (await res.json()) as {
      data?: AsanaUser[];
      next_page?: { uri?: string | null };
    };
    if (json.data) {
      users.push(...json.data);
    }
    url = json.next_page?.uri ?? null;
  }

  return users;
}

function findSectionByName(
  sections: AsanaSection[],
  sectionName: string,
): AsanaSection | null {
  const q = sectionName.trim().toLowerCase();
  if (!q) return null;
  const exact = sections.find((s) => s.name.toLowerCase() === q);
  if (exact) return exact;
  const contains = sections.find((s) => s.name.toLowerCase().includes(q));
  return contains ?? null;
}

function findUserByName(
  users: AsanaUser[],
  assigneeName: string,
): AsanaUser | null {
  const q = assigneeName.trim().toLowerCase();
  if (!q) return null;
  const exact = users.find((u) => u.name.toLowerCase() === q);
  if (exact) return exact;
  const contains = users.find(
    (u) =>
      u.name.toLowerCase().includes(q) ||
      (u.email && u.email.toLowerCase().includes(q)),
  );
  return contains ?? null;
}

function parseArgs(): {
  url: string;
  section: string;
  assignee: string;
  name: string;
} {
  const args = process.argv.slice(2);
  let url = "";
  let section = "";
  let assignee = "";
  let name = "";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--url" && args[i + 1]) {
      url = args[++i].trim();
    } else if (args[i] === "--section" && args[i + 1]) {
      section = args[++i].trim();
    } else if (args[i] === "--assignee" && args[i + 1]) {
      assignee = args[++i].trim();
    } else if (args[i] === "--name" && args[i + 1]) {
      name = args[++i].trim();
    }
  }

  return { url, section, assignee, name };
}

async function main(): Promise<void> {
  const apiKey = process.env.ASANA_API_KEY;
  if (!apiKey) {
    console.error("ASANA_API_KEY is required (set in .env or environment).");
    process.exit(1);
  }

  const {
    url,
    section: sectionName,
    assignee: assigneeName,
    name: destName,
  } = parseArgs();

  if (!url) {
    console.error(
      'Usage: npm run asana:url-to-destination -- --url "<asana_project_url>" [--section "Section name"] [--assignee "Person name"] [--name "Destination label"]',
    );
    console.error("");
    console.error("Example:");
    console.error(
      '  npm run asana:url-to-destination -- --url "https://app.asana.com/1/200109678723468/project/1211853693432549/list/1211854278859853" --section "Marquee Assets in Production" --assignee "Greg Posten" --name "Marquee Production"',
    );
    process.exit(1);
  }

  const projectGid = parseProjectGidFromUrl(url);
  if (!projectGid) {
    console.error(
      "Could not parse project GID from URL. Expected a URL containing /project/<gid>/",
    );
    process.exit(1);
  }

  const { workspaceGid, projectName } = await fetchProject(projectGid, apiKey);
  const sections = await fetchSections(projectGid, apiKey);
  const users = await fetchUsers(workspaceGid, apiKey);

  const section = sectionName ? findSectionByName(sections, sectionName) : null;
  const user = assigneeName ? findUserByName(users, assigneeName) : null;

  if (sectionName && !section) {
    console.error(`Section not found: "${sectionName}"`);
    console.error("");
    console.error("Available sections:");
    for (const s of sections) {
      console.error(`  ${s.name.padEnd(40)}  gid: ${s.gid}`);
    }
    console.error("");
  }

  if (assigneeName && !user) {
    console.error(`Assignee not found: "${assigneeName}"`);
    console.error("");
    console.error("Available users (first 20):");
    for (const u of users.slice(0, 20)) {
      console.error(`  ${u.name.padEnd(30)}  gid: ${u.gid}`);
    }
    if (users.length > 20) {
      console.error(
        `  ... and ${users.length - 20} more. Use a more specific name or run asana:list-assignees.`,
      );
    }
    console.error("");
  }

  const destination: Record<string, string | null> = {
    project: projectGid,
    section: section?.gid ?? null,
    assignee: user?.gid ?? null,
  };
  if (destName) {
    destination.name = destName;
  } else if (projectName && section?.name) {
    destination.name = `${projectName} > ${section.name}`;
  } else if (section?.name) {
    destination.name = section.name;
  } else if (projectName) {
    destination.name = projectName;
  }

  const clean: Record<string, string> = {};
  for (const [k, v] of Object.entries(destination)) {
    if (v != null && v !== "") {
      clean[k] = v;
    }
  }

  console.log("Project:", projectName, "(" + projectGid + ")");
  if (section) {
    console.log("Section:", section.name, "(" + section.gid + ")");
  } else if (sectionName) {
    console.log("Section: (not found – see list above)");
  }
  if (user) {
    console.log("Assignee:", user.name, "(" + user.gid + ")");
  } else if (assigneeName) {
    console.log("Assignee: (not found – see list above)");
  }
  console.log("");
  console.log("Destination for release.json / draft.json:");
  console.log("");
  console.log(JSON.stringify(clean, null, 2));
  console.log("");
  console.log("Single line (for pasting into a destinations array):");
  console.log(JSON.stringify(clean));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
