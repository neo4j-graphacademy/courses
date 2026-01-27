/**
 * Tools for fetching and caching Neo4j documentation
 */

import fetch from "isomorphic-fetch";
import { JSDOM } from "jsdom";

// Cache for storing downloaded pages
const pageCache: Map<string, PageContent> = new Map();

// Cache for manuals list
let manualsCache: Manual[] | null = null;

export interface Manual {
  loc: string;
  lastmod: string;
  name?: string;
}

export interface Page {
  loc: string;
  lastmod: string;
}

export interface PageContent {
  url: string;
  title: string;
  content: string;
  cached_at: string;
  from_cache?: boolean;
}

/**
 * Extract sitemap locations from a sitemap index XML
 */
async function getSitemaps(url: string): Promise<Manual[]> {
  const response = await fetch(url);
  const text = await response.text();
  const sitemapDicts: Manual[] = [];

  // Match sitemap entries - using multiline matching
  const sitemapMatches = text.match(/<sitemap>[\s\S]*?<\/sitemap>/g);

  if (sitemapMatches) {
    for (const sitemapEntry of sitemapMatches) {
      const locMatch = sitemapEntry.match(/<loc>(.*?)<\/loc>/);
      const lastmodMatch = sitemapEntry.match(/<lastmod>(.*?)<\/lastmod>/);

      if (locMatch && lastmodMatch) {
        sitemapDicts.push({
          loc: locMatch[1].trim(),
          lastmod: lastmodMatch[1].trim(),
        });
      }
    }
  }

  return sitemapDicts;
}

/**
 * Extract page URLs from a sitemap XML
 */
async function getPagesFromSitemap(sitemapUrl: string): Promise<Page[]> {
  const response = await fetch(sitemapUrl);
  const text = await response.text();
  const pageDicts: Page[] = [];

  // Match URL entries - using multiline matching
  const urlMatches = text.match(/<url>[\s\S]*?<\/url>/g);

  if (urlMatches) {
    for (const urlEntry of urlMatches) {
      const locMatch = urlEntry.match(/<loc>(.*?)<\/loc>/);
      const lastmodMatch = urlEntry.match(/<lastmod>(.*?)<\/lastmod>/);

      if (locMatch && lastmodMatch) {
        pageDicts.push({
          loc: locMatch[1].trim(),
          lastmod: lastmodMatch[1].trim(),
        });
      }
    }
  }

  return pageDicts;
}

/**
 * Get page content from URL, extract content via .doc CSS selector,
 * and strip HTML tags. Cache the result.
 */
async function getPageContent(url: string): Promise<PageContent> {
  // Check if page is already cached
  if (pageCache.has(url)) {
    const cached = pageCache.get(url)!;
    return { ...cached, from_cache: true };
  }

  // Fetch the page
  const response = await fetch(url);
  const html = await response.text();
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Get title
  const titleTag = document.querySelector("title");
  const title = titleTag
    ? titleTag.textContent?.trim() || "No title"
    : "No title";

  // Find content using .doc CSS selector
  const docElement = document.querySelector(".doc");

  let content: string;
  if (docElement) {
    // Strip HTML tags and get text content
    content = docElement.textContent?.trim() || "No content found";
  } else {
    content = "No content found with .doc selector";
  }

  // Cache the result
  const result: PageContent = {
    url,
    title,
    content,
    cached_at: new Date().toISOString(),
  };
  pageCache.set(url, result);

  return result;
}

/**
 * Get the list of all Neo4j documentation manuals with caching
 */
export async function getManualsList(): Promise<Manual[]> {
  if (manualsCache !== null) {
    return manualsCache;
  }

  const sitemapIndexUrl = "https://neo4j.com/docs/sitemap_index.xml";
  const manuals = await getSitemaps(sitemapIndexUrl);

  // Extract manual names from URLs for easier reference
  for (const manual of manuals) {
    // Extract manual name from URL like 'https://neo4j.com/docs/cypher-manual/current/sitemap.xml'
    const urlParts = manual.loc.split("/");
    if (urlParts.length >= 5) {
      manual.name = urlParts[4]; // e.g., 'cypher-manual'
    }
  }

  manualsCache = manuals;
  return manuals;
}

/**
 * List all pages from a specific Neo4j documentation manual's sitemap
 */
export async function listManualPages(manualName: string): Promise<Page[]> {
  const sitemapUrl = `https://neo4j.com/docs/${manualName}/current/sitemap.xml`;
  return await getPagesFromSitemap(sitemapUrl);
}

/**
 * Read content from a specific Neo4j documentation page
 */
export async function readPage(url: string): Promise<PageContent> {
  return await getPageContent(url);
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  const cacheSize =
    Array.from(pageCache.values()).reduce(
      (sum, page) => sum + JSON.stringify(page).length,
      0
    ) /
    (1024 * 1024);

  return {
    total_cached_pages: pageCache.size,
    cached_page_urls: Array.from(pageCache.keys()),
    manuals_cached: manualsCache !== null,
    total_manuals: manualsCache?.length || 0,
    cache_size_mb: cacheSize,
  };
}

/**
 * Clear all cached data
 */
export function clearCache() {
  const pageCount = pageCache.size;
  const manualCount = manualsCache?.length || 0;

  pageCache.clear();
  manualsCache = null;

  return {
    status: "success",
    message: `Cleared ${pageCount} cached pages and ${manualCount} manuals`,
  };
}
