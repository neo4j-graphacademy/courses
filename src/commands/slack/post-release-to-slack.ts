/**
 * Post course release promo to Slack using an AsciiDoc template.
 * Loads the template with course attributes, renders it through the AsciiDoc processor,
 * then converts the output to Slack-friendly text and posts to each channel in the config.
 *
 * Usage:
 *   SLACK_BOT_TOKEN=... [SLACK_CONFIG=release] ts-node .../post-release-to-slack.ts [course_slug ...]
 * If no args, reads COURSE_PATHS from env. Config: config/promo/{SLACK_CONFIG}.json (slack.channels).
 */

import path from "path";
import { readFileSync, existsSync } from "fs";
import { config } from "dotenv";
import { WebClient } from "@slack/web-api";

import striptags from "striptags";
import he from "he";

import { loadFile, convert } from "../../modules/asciidoc";
import {
  ASCIIDOC_DIRECTORY,
  ATTRIBUTE_CAPTION,
  ATTRIBUTE_CATEGORIES,
  ATTRIBUTE_KEY_POINTS,
} from "../../constants";
import { courseOverviewPath, courseBannerPath } from "../../utils";

config({ path: process.env.ENV_FILE ?? ".env" });

interface CourseMetadata {
  title: string;
  caption: string;
  link: string;
  bannerPath?: string;
  keyPoints: string;
  categories: string;
}

function readCourseMetadata(
  courseAdocPath: string,
  baseUrl: string = "https://graphacademy.neo4j.com",
): CourseMetadata {
  const resolved = path.isAbsolute(courseAdocPath)
    ? courseAdocPath
    : path.resolve(process.cwd(), courseAdocPath);

  const file = loadFile(resolved, { parse_header_only: true });

  const title = (file.getTitle() as string) ?? "Untitled course";
  const caption = file.getAttribute(ATTRIBUTE_CAPTION, null) ?? "";
  const categories = file.getAttribute(ATTRIBUTE_CATEGORIES, "") ?? "";

  let keyPoints = file.getAttribute(ATTRIBUTE_KEY_POINTS, null);
  if (Array.isArray(keyPoints)) {
    keyPoints = keyPoints.join(", ");
  }
  const keyPointsStr = keyPoints ?? "";

  const slug = path.basename(path.dirname(resolved));
  const link = `${baseUrl.replace(/\/$/, "")}/courses/${slug}`;
  const bannerPath = courseBannerPath(slug);

  return {
    title,
    caption,
    link,
    bannerPath: existsSync(bannerPath) ? bannerPath : undefined,
    keyPoints: keyPointsStr,
    categories,
  };
}

function resolveCoursePath(slugOrPath: string): string {
  if (path.isAbsolute(slugOrPath)) {
    return slugOrPath;
  }
  const hasPathSep = slugOrPath.includes(path.sep) || slugOrPath.includes("/");
  if (!hasPathSep && !slugOrPath.endsWith(".adoc")) {
    return courseOverviewPath(slugOrPath);
  }
  return path.resolve(process.cwd(), slugOrPath);
}

/**
 * Render the AsciiDoc template with course metadata. Title is merged from the
 * course document's getTitle() (as doctitle); other attributes are set from meta.
 * Converts HTML output to Slack-friendly text.
 */
function renderTemplate(templatePath: string, meta: CourseMetadata): string {
  const doc = loadFile(templatePath, {
    attributes: {
      doctitle: meta.title,
      caption: meta.caption,
      "course-link": meta.link,
      "key-points": meta.keyPoints,
      categories: meta.categories,
    },
  });
  const html = convert(doc) as string;
  return htmlToSlackText(html);
}

/**
 * Decode HTML entities using a robust library implementation.
 */
function decodeHtmlEntities(value: string): string {
  return he.decode(value);
}

/**
 * Convert HTML from AsciiDoc render to Slack mrkdwn.
 * Slack does not accept HTML; it uses *bold*, _italic_, and <url|text> for links.
 */
function htmlToSlackText(html: string): string {
  let text = html;
  text = text.replace(
    /<a\s+href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi,
    (_match, url: string, label: string) => {
      const plain = decodeHtmlEntities(striptags(label)).trim();
      return `<${url.trim()}|${plain}>`;
    },
  );
  // Convert basic formatting tags to Slack equivalents before stripping remaining tags.
  text = text.replace(/<(strong|b)>([^<]*)<\/\1>/gi, "*$2*");
  text = text.replace(/<(em|i)>([^<]*)<\/\1>/gi, "_$2_");
  // Remove any remaining HTML tags in a robust way.
  text = striptags(text);
  // Decode any HTML entities into plain text.
  text = decodeHtmlEntities(text);
  return text.replace(/\n{3,}/g, "\n\n").trim();
}

/** Slack channel IDs are C... (public) or G... (private). Names do not start with C or G. */
function looksLikeChannelId(channel: string): boolean {
  const c = channel.trim();
  return c.length > 0 && (c.startsWith("C") || c.startsWith("G"));
}

/**
 * Resolve channel name to ID using conversations.list (needs channels:read scope).
 * Returns the original string if it already looks like an ID or resolution fails.
 */
async function resolveChannelId(
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
  } while (cursor);
  return channel;
}

/**
 * Upload the course banner image to the channel using Slack's external file upload flow:
 * getUploadURLExternal → POST file to upload_url → completeUploadExternal.
 * The SDK handles getUploadURLExternal and completeUploadExternal; we still POST the binary to the upload URL.
 */
async function uploadBannerToChannel(
  channelId: string,
  bannerPath: string,
  web: WebClient,
): Promise<void> {
  const buf = readFileSync(bannerPath);
  const length = buf.length;
  const filename = "banner.png";

  const getResult = await web.files.getUploadURLExternal({ filename, length });
  if (!getResult.ok || !getResult.upload_url || !getResult.file_id) {
    throw new Error(
      `Slack getUploadURLExternal error: ${getResult.error ?? "missing upload_url or file_id"}`,
    );
  }
  const { upload_url, file_id } = getResult;

  const uploadRes = await fetch(upload_url, {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
    },
    body: new Uint8Array(buf),
  });
  if (!uploadRes.ok) {
    const t = await uploadRes.text();
    throw new Error(`Slack file upload error ${uploadRes.status}: ${t}`);
  }

  const completeOpts = {
    files: [{ id: file_id, title: filename }] as [
      { id: string; title: string },
      ...Array<{ id: string; title: string }>,
    ],
    ...(channelId &&
      looksLikeChannelId(channelId) && { channel_id: channelId }),
  };
  const completeResult = await web.files.completeUploadExternal(completeOpts);
  if (!completeResult.ok) {
    throw new Error(
      `Slack completeUploadExternal error: ${completeResult.error ?? "unknown"}`,
    );
  }
}

async function postToSlack(
  channel: string,
  text: string,
  web: WebClient,
  courseLink?: string,
  bannerPath?: string,
): Promise<void> {
  const result = await web.chat.postMessage({
    channel,
    text,
    unfurl_links: false,
    unfurl_media: false,
    ...(courseLink && {
      attachments: [
        {
          title: "Take the course",
          title_link: courseLink,
        },
      ],
    }),
  });
  if (!result.ok) {
    throw new Error(
      `Slack API error: ${(result as { error?: string }).error ?? "unknown"}`,
    );
  }
  // Banner upload disabled for now. Set to true to upload course banner.png to the channel.
  const uploadBannerEnabled = false;
  if (uploadBannerEnabled && bannerPath) {
    const channelId = await resolveChannelId(channel, web);
    await uploadBannerToChannel(channelId, bannerPath, web);
  }
}

function loadConfig(configName: string): string[] {
  const safeName = configName.replace(/[^a-z0-9_.-]/gi, "") || "release";
  const configPath = path.join(
    process.cwd(),
    "config",
    "promo",
    `${safeName}.json`,
  );
  if (!existsSync(configPath)) {
    return [];
  }
  const raw = readFileSync(configPath, "utf-8");
  const parsed = JSON.parse(raw) as Record<string, unknown>;
  const channels =
    parsed?.slack &&
    typeof parsed.slack === "object" &&
    Array.isArray((parsed.slack as { channels?: unknown }).channels)
      ? (parsed.slack as { channels: string[] }).channels
      : Array.isArray(parsed?.channels)
        ? (parsed.channels as string[])
        : [];
  return channels.map((c) => String(c).trim());
}

function getTemplatePath(configName: string): string {
  const safeName = configName.replace(/[^a-z0-9_.-]/gi, "") || "release";
  const templatePath = path.join(
    ASCIIDOC_DIRECTORY,
    "shared",
    "release",
    `${safeName}.adoc`,
  );
  if (!existsSync(templatePath)) {
    throw new Error(
      `Template not found: ${templatePath}. Create asciidoc/shared/release/{SLACK_CONFIG}.adoc (e.g. release.adoc).`,
    );
  }
  return templatePath;
}

async function main(): Promise<void> {
  const apiKey = process.env.SLACK_BOT_TOKEN;
  const configName = process.env.SLACK_CONFIG ?? "release";

  if (!apiKey) {
    console.error("SLACK_BOT_TOKEN is required (set in .env or environment).");
    process.exit(1);
  }

  const web = new WebClient(apiKey);
  const channels = loadConfig(configName);
  if (channels.length === 0) {
    console.error(
      `No channels found. Create config/promo/${configName}.json with a "slack.channels" array.`,
    );
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
      "Provide course slug(s) or path(s) as arguments, or set COURSE_PATHS.",
    );
    process.exit(1);
  }

  const baseUrl =
    process.env.GRAPHACADEMY_BASE_URL ?? "https://graphacademy.neo4j.com";
  const templatePath = getTemplatePath(configName);

  for (const coursePath of paths) {
    const resolved = resolveCoursePath(coursePath);
    const meta = readCourseMetadata(resolved, baseUrl);
    const text = renderTemplate(templatePath, meta);

    for (const channel of channels) {
      await postToSlack(channel, text, web, meta.link, meta.bannerPath);
      console.log(`Posted to #${channel.replace(/^#/, "")} for: ${meta.title}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
