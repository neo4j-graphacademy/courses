/**
 * Shared Slack utilities: channel ID resolution and message posting.
 */

import { WebClient } from "@slack/web-api";

export { parseArgs } from "../utils";

/** Slack channel IDs are C... (public) or G... (private). Names do not start with C or G. */
export function looksLikeChannelId(channel: string): boolean {
  const c = channel.trim();
  return c.length > 0 && (c.startsWith("C") || c.startsWith("G"));
}

/** Milliseconds to wait between paginated Slack API calls to stay within rate limits. */
const PAGE_DELAY_MS = 1000;

/**
 * Resolve a channel name to its Slack ID using conversations.list (needs channels:read scope).
 * Returns the original string if it already looks like an ID or resolution fails.
 */
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

/**
 * Post a plain-text message to a Slack channel.
 * Throws if the API returns an error.
 */
export async function postMessage(
  channel: string,
  text: string,
  web: WebClient,
): Promise<void> {
  const result = await web.chat.postMessage({
    channel,
    text,
    unfurl_links: false,
    unfurl_media: false,
  });
  if (!result.ok) {
    throw new Error(
      `Slack API error posting to ${channel}: ${(result as { error?: string }).error ?? "unknown"}`,
    );
  }
}

/** Pause execution for a given number of milliseconds. */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
