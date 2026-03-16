/**
 * List user GIDs for a workspace or project (to use as assignee in config/promo/release.json etc).
 *
 * Usage:
 *   ASANA_API_KEY=... npm run asana:list-assignees -- <workspace_gid>
 *   ASANA_API_KEY=... npm run asana:list-assignees -- --project <project_gid>
 *
 * With a project GID, fetches the project to get the workspace then lists workspace users.
 * Optional: filter by name with --search "partial name"
 */

import { config } from "dotenv";

config({ path: process.env.ENV_FILE ?? ".env" });

const ASANA_API_BASE = "https://app.asana.com/api/1.0";

interface AsanaUser {
  gid: string;
  name: string;
  email?: string;
  resource_type: string;
}

async function getWorkspaceFromProject(
  projectGid: string,
  apiKey: string,
): Promise<string> {
  const res = await fetch(`${ASANA_API_BASE}/projects/${projectGid}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Asana API error ${res.status}: ${text}`);
  }
  const json = (await res.json()) as {
    data?: { workspace?: { gid: string; name: string } };
  };
  const workspace = json.data?.workspace;
  if (!workspace?.gid) {
    throw new Error("Project has no workspace");
  }
  return workspace.gid;
}

async function listUsers(
  workspaceGid: string,
  apiKey: string,
  search?: string,
): Promise<AsanaUser[]> {
  const users: AsanaUser[] = [];
  let offset: string | undefined;

  do {
    const params = new URLSearchParams();
    params.set("opt_fields", "name,email");
    if (offset) {
      params.set("offset", offset);
    }
    const url = `${ASANA_API_BASE}/workspaces/${workspaceGid}/users?${params}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Asana API error ${res.status}: ${text}`);
    }
    const json = (await res.json()) as {
      data?: AsanaUser[];
      next_page?: { offset?: string | null };
    };
    users.push(...(json.data ?? []));
    offset = json.next_page?.offset ?? undefined;
  } while (offset);

  let filteredUsers = users;
  if (search?.trim()) {
    const q = search.trim().toLowerCase();
    filteredUsers = filteredUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        (u.email && u.email.toLowerCase().includes(q)),
    );
  }
  return filteredUsers;
}

function printUsers(users: AsanaUser[]): void {
  if (users.length === 0) {
    console.log("No users found.");
    return;
  }

  const nameWidth = Math.max(...users.map((u) => u.name.length), 4);
  const emailWidth = Math.max(
    ...users.map((u) => (u.email ?? "").length),
    5,
  );
  const gidWidth = Math.max(...users.map((u) => u.gid.length), 3);

  console.log(
    `${"Name".padEnd(nameWidth)}  ${"Email".padEnd(emailWidth)}  ${"GID".padEnd(gidWidth)}`,
  );
  console.log(
    `${"-".repeat(nameWidth)}  ${"-".repeat(emailWidth)}  ${"-".repeat(gidWidth)}`,
  );

  for (const u of users) {
    console.log(
      `${u.name.padEnd(nameWidth)}  ${(u.email ?? "").padEnd(emailWidth)}  ${u.gid.padEnd(gidWidth)}`,
    );
  }

  console.log("");
  console.log(
    'Use a GID as "assignee" in config/promo/release.json (asana.destinations).',
  );
}

async function main(): Promise<void> {
  const apiKey = process.env.ASANA_API_KEY;
  if (!apiKey) {
    console.error("ASANA_API_KEY is required (set in .env or environment).");
    process.exit(1);
  }

  const args = process.argv.slice(2);
  let workspaceGid: string | null = null;
  let projectGid: string | null = null;
  let search: string | null = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--project" && args[i + 1]) {
      projectGid = args[++i].trim();
    } else if (args[i] === "--search" && args[i + 1]) {
      search = args[++i].trim();
    } else if (!args[i].startsWith("--")) {
      workspaceGid = args[i].trim();
    }
  }

  if (projectGid && !workspaceGid) {
    workspaceGid = await getWorkspaceFromProject(projectGid, apiKey);
  }

  if (!workspaceGid) {
    console.error("Usage: npm run asana:list-assignees -- <workspace_gid>");
    console.error(
      "   or: npm run asana:list-assignees -- --project <project_gid>",
    );
    console.error("Optional: --search \"partial name\" to filter by name or email.");
    process.exit(1);
  }

  const users = await listUsers(workspaceGid, apiKey, search ?? undefined);
  printUsers(users);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
