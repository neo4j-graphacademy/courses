/**
 * Shared Slack utilities: channel ID resolution helpers.
 */

import { WebClient } from "@slack/web-api";

/** Slack channel IDs are C... (public) or G... (private). Names do not start with C or G. */
export function looksLikeChannelId(channel: string): boolean {
  const c = channel.trim();
  return c.length > 0 && (c.startsWith("C") || c.startsWith("G"));
}

/**
 * Resolve a channel name to its Slack ID using conversations.list (needs channels:read scope).
 * Returns the original string if it already looks like an ID or resolution fails.
 */
/** Milliseconds to wait between paginated Slack API calls to stay within rate limits. */
const PAGE_DELAY_MS = 1000;

export async function resolveChannelId(
  channel: string,
  web: WebClient,
): Promise<string> {
  const name = channel.replace(/^#/, "").trim();
  if (looksLikeChannelId(name)) {
    return name;
  }
  let cursor: string | undefined;
  do {
    const result = await web.conversations.list({
      types: "public_channel,private_channel",
      limit: 200,
      cursor,
    });
    if (!result.ok || !result.channels) {
      return channel;
    }
    const match = result.channels.find(
      (ch) => ch.name === name || ch.name === channel,
    );
    if (match?.id) return match.id;
    cursor = result.response_metadata?.next_cursor;
    if (cursor) await sleep(PAGE_DELAY_MS);
  } while (cursor);
  return channel;
}

/** Pause execution for a given number of milliseconds. */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Parse --key value or --key=value pairs from process.argv.
 * Returns a map of key → value (without the -- prefix).
 */
export function parseArgs(argv: string[]): Map<string, string> {
  const args = new Map<string, string>();
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const eqIdx = arg.indexOf("=");
      if (eqIdx !== -1) {
        args.set(arg.slice(2, eqIdx), arg.slice(eqIdx + 1));
      } else {
        const next = argv[i + 1];
        if (next !== undefined && !next.startsWith("--")) {
          args.set(arg.slice(2), next);
          i++;
        } else {
          args.set(arg.slice(2), "true");
        }
      }
    }
  }
  return args;
}
