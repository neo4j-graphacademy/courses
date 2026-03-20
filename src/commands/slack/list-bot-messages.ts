/**
 * List messages posted by this bot in a Slack channel.
 * Uses auth.test to identify the bot, then filters conversations.history for its messages.
 *
 * Usage:
 *   SLACK_BOT_TOKEN=... ts-node src/commands/slack/list-bot-messages.ts --channel <ID> [options]
 *   SLACK_BOT_TOKEN=... npm run slack:list-messages -- --channel C01234ABCD
 *
 * Options:
 *   --channel <ID>        Channel ID (e.g. C01234ABCD) — find it in Slack by right-clicking the channel → View channel details
 *   --limit <n>       Number of recent messages to fetch (default: 5)
 *   --search <text>   Filter messages whose text contains this string (case-insensitive)
 *
 * Output columns:
 *   Timestamp   The message ts value — pass this to slack:delete-message to delete it
 *   Date        Human-readable local date/time
 *   Preview     First 80 characters of the message text
 */

import { config } from "dotenv";
import { WebClient } from "@slack/web-api";
import { parseArgs } from "./slack-utils";

config({ path: process.env.ENV_FILE ?? ".env" });

const PREVIEW_WIDTH = 80;

function formatDate(ts: string): string {
  const ms = parseFloat(ts) * 1000;
  return new Date(ms).toLocaleString();
}

function preview(text: string): string {
  const flat = text.replace(/\n+/g, " ").trim();
  return flat.length > PREVIEW_WIDTH
    ? flat.slice(0, PREVIEW_WIDTH - 1) + "…"
    : flat;
}

async function listBotMessages(
  channel: string,
  limit: number,
  search: string | undefined,
  web: WebClient,
): Promise<void> {
  const auth = await web.auth.test();
  if (!auth.ok || !auth.bot_id) {
    throw new Error(
      "Could not identify bot from SLACK_BOT_TOKEN (auth.test failed).",
    );
  }
  const botId = auth.bot_id as string;

  let result: Awaited<ReturnType<typeof web.conversations.history>>;
  try {
    result = await web.conversations.history({ channel, limit });
  } catch (err: unknown) {
    const code = (err as { data?: { error?: string } }).data?.error;
    if (code === "channel_not_found") {
      throw new Error(
        `Channel "${channel}" not found. Pass the channel ID (e.g. C01234ABCD), not the name.\n` +
          "Find it in Slack: right-click the channel → View channel details.",
      );
    }
    throw err;
  }

  const collected = (result.messages ?? [])
    .filter((msg) => (msg as { bot_id?: string }).bot_id === botId)
    .filter(
      (msg) =>
        !search ||
        (msg.text ?? "").toLowerCase().includes(search.toLowerCase()),
    )
    .map((msg) => ({ ts: msg.ts ?? "", text: (msg.text ?? "").trim() }));

  if (collected.length === 0) {
    console.log("No bot messages found in the last", limit, "messages.");
    return;
  }

  const tsWidth = "Timestamp".length;
  const dateWidth = Math.max(
    ...collected.map((m) => formatDate(m.ts).length),
    "Date".length,
  );

  console.log(
    `${"Timestamp".padEnd(tsWidth)}  ${"Date".padEnd(dateWidth)}  Preview`,
  );
  console.log(
    `${"-".repeat(tsWidth)}  ${"-".repeat(dateWidth)}  ${"-".repeat(PREVIEW_WIDTH)}`,
  );
  for (const msg of collected) {
    const date = formatDate(msg.ts).padEnd(dateWidth);
    console.log(`${msg.ts.padEnd(tsWidth)}  ${date}  ${preview(msg.text)}`);
  }

  console.log("");
  console.log(`Channel: ${channel}  Bot ID: ${botId}`);
  console.log("");
  console.log(
    `To delete: npm run slack:delete-message -- --channel ${channel} --ts <timestamp>`,
  );
}

async function main(): Promise<void> {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) {
    console.error("SLACK_BOT_TOKEN is required (set in .env or environment).");
    process.exit(1);
  }

  const args = parseArgs(process.argv.slice(2));
  const channel = args.get("channel");
  if (!channel) {
    console.error(
      "Usage: npm run slack:list-messages -- --channel <ID> [--limit <n>] [--search <text>]",
    );
    process.exit(1);
  }

  const limit = parseInt(args.get("limit") ?? "5", 10);
  const search = args.get("search");

  const web = new WebClient(token);
  await listBotMessages(channel, limit, search, web);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
