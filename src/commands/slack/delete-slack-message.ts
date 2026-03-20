/**
 * Delete a message posted by the bot in a Slack channel.
 * The timestamp (ts) can be found by running slack:list-messages first.
 *
 * Usage:
 *   SLACK_BOT_TOKEN=... ts-node src/commands/slack/delete-slack-message.ts --channel <name|ID> --ts <timestamp>
 *   SLACK_BOT_TOKEN=... npm run slack:delete-message -- --channel graphacademy --ts 1234567890.123456
 *
 * Options:
 *   --channel <name|ID>   Channel where the message was posted (required)
 *   --ts <timestamp>      Message timestamp shown by slack:list-messages (required)
 *   --dry-run             Print what would be deleted without actually deleting it
 */

import { config } from "dotenv";
import { WebClient } from "@slack/web-api";
import { resolveChannelId, parseArgs } from "./slack-utils";

config({ path: process.env.ENV_FILE ?? ".env" });

async function deleteMessage(
  channelInput: string,
  ts: string,
  dryRun: boolean,
  web: WebClient,
): Promise<void> {
  const channelId = await resolveChannelId(channelInput, web);

  if (dryRun) {
    console.log("[dry-run] Would delete message:");
    console.log(`  Channel:   ${channelInput} (${channelId})`);
    console.log(`  Timestamp: ${ts}`);
    return;
  }

  const result = await web.chat.delete({ channel: channelId, ts });
  if (!result.ok) {
    throw new Error(
      `chat.delete failed: ${(result as { error?: string }).error ?? "unknown"}`,
    );
  }

  console.log(`Deleted message ${ts} from ${channelInput} (${channelId}).`);
}

async function main(): Promise<void> {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) {
    console.error("SLACK_BOT_TOKEN is required (set in .env or environment).");
    process.exit(1);
  }

  const args = parseArgs(process.argv.slice(2));
  const channelInput = args.get("channel");
  const ts = args.get("ts");

  if (!channelInput || !ts) {
    console.error(
      "Usage: npm run slack:delete-message -- --channel <name|ID> --ts <timestamp> [--dry-run]",
    );
    console.error("");
    console.error(
      "  Find timestamps by running: npm run slack:list-messages -- --channel <name|ID>",
    );
    process.exit(1);
  }

  const dryRun = args.get("dry-run") === "true";
  const web = new WebClient(token);
  await deleteMessage(channelInput, ts, dryRun, web);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
