/**
 * Shared Linear API utilities: issue creation and label management.
 * Uses the official @linear/sdk.
 */

import { LinearClient } from "@linear/sdk";
import { config } from "dotenv";

config({ path: process.env.ENV_FILE ?? ".env" });

export function createLinearClient(): LinearClient {
  const apiKey = process.env.LINEAR_API_KEY;
  if (!apiKey) {
    throw new Error("LINEAR_API_KEY is required (set in .env or environment).");
  }
  return new LinearClient({ apiKey });
}

interface CreateIssueParams {
  teamId: string;
  title: string;
  description: string;
  labelIds: string[];
  /** ISO date string YYYY-MM-DD */
  dueDate: string;
  stateId?: string;
}

interface CreatedIssue {
  id: string;
  url: string;
  title: string;
}

/**
 * Fetch all labels for a team.
 * Filters server-side by team to avoid loading the entire workspace label set.
 */
export async function fetchTeamLabels(
  teamId: string,
  client: LinearClient,
): Promise<Array<{ id: string; name: string; parentId: string | undefined }>> {
  const connection = await client.issueLabels({
    filter: { team: { id: { eq: teamId } } },
  } as Parameters<typeof client.issueLabels>[0]);

  return connection.nodes.map((l) => ({
    id: l.id,
    name: l.name,
    parentId: l.parentId ?? undefined,
  }));
}

/**
 * Return the ID of a child label (e.g. "blank-sandbox" under "usecase").
 * Creates the label if it does not already exist.
 */
export async function ensureChildLabel(
  teamId: string,
  parentName: string,
  childName: string,
  client: LinearClient,
): Promise<string> {
  const labels = await fetchTeamLabels(teamId, client);

  const parent = labels.find((l) => l.name === parentName && !l.parentId);
  if (!parent) {
    throw new Error(`Parent label "${parentName}" not found in team ${teamId}`);
  }

  const existing = labels.find(
    (l) => l.name === childName && l.parentId === parent.id,
  );
  if (existing) return existing.id;

  const payload = await client.createIssueLabel({
    teamId,
    name: childName,
    parentId: parent.id,
  });

  const id = payload.issueLabelId;
  if (!id) {
    throw new Error(`Failed to create label "${childName}"`);
  }
  return id;
}

/**
 * Return the ID of the Backlog workflow state for a team.
 * Throws if no state with type "backlog" is found.
 */
export async function fetchBacklogStateId(
  teamId: string,
  client: LinearClient,
): Promise<string> {
  const team = await client.team(teamId);
  const states = await team.states();
  const backlog = states.nodes.find(
    (s) => s.type.toLowerCase() === "backlog",
  );
  if (!backlog) {
    throw new Error(`No backlog state found for team ${teamId}`);
  }
  return backlog.id;
}

/** Create a Linear issue and return its id and URL. */
export async function createIssue(
  params: CreateIssueParams,
  client: LinearClient,
): Promise<CreatedIssue> {
  const payload = await client.createIssue({
    teamId: params.teamId,
    title: params.title,
    description: params.description,
    labelIds: params.labelIds,
    dueDate: params.dueDate,
    ...(params.stateId ? { stateId: params.stateId } : {}),
  });

  const issue = await payload.issue;
  if (!issue) {
    throw new Error(`Failed to create issue "${params.title}"`);
  }
  return { id: issue.id, url: issue.url, title: issue.title };
}

/**
 * Find a Linear project by exact name (course slug), or create it on the team.
 * Caches results by slug for a single run.
 */
export async function findOrCreateProject(
  linear: LinearClient,
  teamId: string,
  projectSlug: string,
  description: string,
  cache: Map<string, string>,
): Promise<string | undefined> {
  if (cache.has(projectSlug)) return cache.get(projectSlug);

  const existing = await linear.projects({
    filter: { name: { eq: projectSlug } },
  });

  if (existing.nodes.length > 0) {
    const id = existing.nodes[0].id;
    console.log(`   📁 Found project: "${projectSlug}"`);
    cache.set(projectSlug, id);
    return id;
  }

  const payload = await linear.createProject({
    name: projectSlug,
    description,
    teamIds: [teamId],
  });

  if (payload.success) {
    const project = await payload.project;
    if (project) {
      console.log(`   📁 Created project: "${projectSlug}"`);
      cache.set(projectSlug, project.id);
      return project.id;
    }
  }

  console.warn(`   ⚠️  Could not find or create project for "${projectSlug}"`);
  return undefined;
}
