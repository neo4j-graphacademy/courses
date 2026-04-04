/**
 * Request sandbox capacity increases and create Linear issues for each
 * practitioner workshop in the event series.
 *
 * Reads all courses tagged with `practitioner:N` in their :categories:
 * attribute, orders them by day number, and for each:
 *   - Creates a Linear issue (events > practitioner + usecase label)
 *   - Posts a /workshop command to the #sandbox-experience Slack channel
 *
 * Usage:
 *   ts-node src/commands/events/practitioner.ts --region EMEA --start-date 2026-03-24
 *   ts-node src/commands/events/practitioner.ts --region EMEA --start-date 2026-03-24 --dry-run
 *   ts-node src/commands/events/practitioner.ts --region EMEA --start-date 2026-03-24 --dry-run slack
 *   ts-node src/commands/events/practitioner.ts --region EMEA --start-date 2026-03-24 --dry-run linear
 *   ts-node src/commands/events/practitioner.ts --region EMEA --start-date 2026-03-24 --slack-channel C1234567
 *
 * Regions and their UTC start times:
 *   APAC  → 03:00 UTC
 *   EMEA  → 09:00 UTC
 *   AMER  → 15:00 UTC
 */

import path from "path";
import { readdirSync, existsSync } from "fs";
import { config } from "dotenv";
// import { WebClient } from "@slack/web-api";
import { parseArgs } from "../utils";
// import { postMessage } from "../slack/slack-utils";
import {
  createLinearClient,
  createIssue,
  ensureChildLabel,
  fetchBacklogStateId,
} from "../linear/linear-utils";
import { readCourseMetadata } from "../release/course-metadata";
import { COURSE_DIRECTORY } from "../../constants";

config({ path: process.env.ENV_FILE ?? ".env" });

// ─── Constants ────────────────────────────────────────────────────────────────

const GRAPHACADEMY_BASE_URL =
  process.env.GRAPHACADEMY_BASE_URL ?? "https://graphacademy.neo4j.com";

const LINEAR_TEAM_ID = "aa9fcf36-7fe5-4c32-bfa5-c2f0613a7f6d";
const LINEAR_PRACTITIONER_LABEL_ID = "9eace261-4baa-4e49-a9d0-d4f30baa6ab1";

const SLACK_SANDBOX_CHANNEL = "CS18NPY77";
const SANDBOX_CAPACITY = 30;

const REGION_START_HOUR: Record<string, number> = {
  APAC: 3,
  EMEA: 9,
  AMER: 15,
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface PractitionerCourse {
  slug: string;
  title: string;
  usecase: string;
  practitionerDay: number;
  durationHours: number;
  link: string;
}

// ─── Course discovery ─────────────────────────────────────────────────────────

function loadPractitionerCourses(): PractitionerCourse[] {
  const courses: PractitionerCourse[] = [];

  for (const entry of readdirSync(COURSE_DIRECTORY, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const adocPath = path.join(COURSE_DIRECTORY, entry.name, "course.adoc");
    if (!existsSync(adocPath)) continue;

    const meta = readCourseMetadata(adocPath, GRAPHACADEMY_BASE_URL);
    if (meta.practitionerDay === null) continue;

    courses.push({
      slug: meta.slug,
      title: meta.title,
      usecase: meta.usecase,
      practitionerDay: meta.practitionerDay,
      durationHours: meta.durationHours,
      link: meta.link,
    });
  }

  return courses.sort((a, b) => a.practitionerDay - b.practitionerDay);
}

// ─── Date / time helpers ──────────────────────────────────────────────────────

function addDays(dateStr: string, days: number): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return date;
}

function formatDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDateTime(date: Date, hour: number): string {
  return `${formatDate(date)} ${String(hour).padStart(2, "0")}:00`;
}

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

// ─── Per-workshop processing ──────────────────────────────────────────────────

async function processWorkshop(
  course: PractitionerCourse,
  eventDate: Date,
  windowStart: string,
  windowEnd: string,
  region: string,
  linearClient: ReturnType<typeof createLinearClient>,
  backlogStateId: string,
  dryRunLinear: boolean,
): Promise<string[]> {
  const displayDate = formatDisplayDate(eventDate);
  const isoDate = formatDate(eventDate);
  const refRegion = region.toLowerCase();
  const refMonth = isoDate.slice(0, 7); // YYYY-MM
  const courseUrl = `${course.link}/?ref=practitioner-${refRegion}-${refMonth}`;
  const issueTitle = `${course.title} - ${region} ${displayDate}`;
  const slackMessage = `/workshop ${course.usecase} ${SANDBOX_CAPACITY} ${windowStart} ${windowEnd}`;

  // ── Linear issue ────────────────────────────────────────────────────────────
  console.log(`  Linear: ${issueTitle}`);
  console.log(`          ${courseUrl}`);

  if (!dryRunLinear) {
    const usecaseLabelId = await ensureChildLabel(
      LINEAR_TEAM_ID,
      "usecase",
      course.usecase,
      linearClient,
    );

    const issue = await createIssue(
      {
        teamId: LINEAR_TEAM_ID,
        title: issueTitle,
        description: courseUrl,
        labelIds: [LINEAR_PRACTITIONER_LABEL_ID, usecaseLabelId],
        dueDate: isoDate,
        stateId: backlogStateId,
      },
      linearClient,
    );

    console.log(`          → ${issue.url}`);
  }

  const slackHeader = `[Practitioner] ${course.title} in ${region} on ${displayDate}:`;
  console.log(`  Slack:  ${slackHeader}`);
  console.log(`          ${slackMessage}`);

  return [slackHeader, slackMessage];
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  const region = args.get("region")?.toUpperCase();
  const startDate = args.get("start-date");
  // const slackChannel = args.get("slack-channel") ?? SLACK_SANDBOX_CHANNEL;

  // --dry-run          → skip both
  // --dry-run slack    → skip Slack only
  // --dry-run linear   → skip Linear only
  const dryRunValue = args.get("dry-run");
  const dryRunLinear = dryRunValue === "linear" || dryRunValue === "true";
  // const dryRunSlack = dryRunValue === "slack" || dryRunValue === "true";

  if (!region || !(region in REGION_START_HOUR)) {
    console.error(
      `--region is required. Valid values: ${Object.keys(REGION_START_HOUR).join(", ")}`,
    );
    process.exit(1);
  }

  if (!startDate || !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    console.error(
      "--start-date is required in YYYY-MM-DD format (e.g. 2026-03-24)",
    );
    process.exit(1);
  }

  const linearClient = dryRunLinear ? null : createLinearClient();
  const backlogStateId = dryRunLinear
    ? ""
    : await fetchBacklogStateId(LINEAR_TEAM_ID, linearClient!);

  // const slackToken = process.env.SLACK_BOT_TOKEN;
  // if (!dryRunSlack && !slackToken) {
  //   console.error("SLACK_BOT_TOKEN is required (set in .env or environment).");
  //   process.exit(1);
  // }
  // const slackClient = dryRunSlack ? null : new WebClient(slackToken!);

  const startHour = REGION_START_HOUR[region];

  if (dryRunLinear) {
    console.log(`(dry run — skipping Linear)\n`);
  }

  const courses = loadPractitionerCourses();
  if (courses.length === 0) {
    console.error("No practitioner courses found.");
    process.exit(1);
  }

  console.log(`\nPractitioner workshops — ${region} starting ${startDate}\n`);

  // Group courses by day so same-day workshops share the same time window.
  const byDay = new Map<number, PractitionerCourse[]>();
  for (const course of courses) {
    const group = byDay.get(course.practitionerDay) ?? [];
    group.push(course);
    byDay.set(course.practitionerDay, group);
  }

  const slackMessages: string[] = [];

  for (const [day, dayCourses] of Array.from(byDay.entries()).sort(
    ([a], [b]) => a - b,
  )) {
    const eventDate = addDays(startDate, day - 1);
    const totalHours = dayCourses.reduce((sum, c) => sum + c.durationHours, 0);
    const windowStart = formatDateTime(eventDate, startHour);
    const windowEnd = formatDateTime(eventDate, startHour + totalHours);

    for (const course of dayCourses) {
      console.log(`Day ${day}: ${course.title}`);
      const messages = await processWorkshop(
        course,
        eventDate,
        windowStart,
        windowEnd,
        region,
        linearClient!,
        backlogStateId,
        dryRunLinear,
      );
      slackMessages.push(...messages);
      console.log();
    }
  }

  console.log("─".repeat(60));
  console.log("Slack messages to send:");
  console.log("─".repeat(60));
  for (const message of slackMessages) {
    console.log(message);
    // await postMessage(slackChannel, message, slackClient!);
  }
  console.log("─".repeat(60));
  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
