#!/usr/bin/env node
/**
 * MCP Server for Neo4j Documentation
 * Provides tools to browse and read Neo4j documentation with caching
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio";
import * as z from "zod/v4";
import {
  getManualsList,
  listManualPages,
  readPage,
  getCacheStats,
  clearCache,
} from "./tools/neo4j-docs";

/**
 * Create and configure the MCP server
 */
const server = new McpServer({
  name: "neo4j-docs",
  version: "1.0.0",
});

// Register the manuals resource
server.registerResource(
  "Neo4j Documentation Manuals",
  "neo4j://manuals",
  {
    description:
      "List of all available Neo4j documentation manuals from the sitemap index",
    mimeType: "application/json",
  },
  async () => {
    const manuals = await getManualsList();
    return {
      contents: [
        {
          uri: "neo4j://manuals",
          mimeType: "application/json",
          text: JSON.stringify(manuals, null, 2),
        },
      ],
    };
  }
);

// Register list_manual_pages tool
server.registerTool(
  "list_manual_pages",
  {
    description:
      "Load all pages from a specific Neo4j documentation manual's sitemap",
    inputSchema: {
      manual_name: z
        .string()
        .describe(
          "The name of the manual (e.g., 'cypher-manual', 'python-manual', 'graph-data-science')"
        ),
    },
  },
  async ({ manual_name }) => {
    try {
      const pages = await listManualPages(manual_name);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(pages, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              [{ error: `Failed to load sitemap: ${error}` }],
              null,
              2
            ),
          },
        ],
        isError: true,
      };
    }
  }
);

// Register read_page tool
server.registerTool(
  "read_page",
  {
    description:
      "Load and read content from a specific Neo4j documentation page. Extracts content using the .doc CSS selector and strips HTML tags. Pages are cached automatically after first load.",
    inputSchema: {
      url: z
        .string()
        .describe("The full URL of the documentation page to read"),
    },
  },
  async ({ url }) => {
    try {
      const result = await readPage(url);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                error: `Failed to load page: ${error}`,
                url,
              },
              null,
              2
            ),
          },
        ],
        isError: true,
      };
    }
  }
);

// Register get_cache_stats tool
server.registerTool(
  "get_cache_stats",
  {
    description: "Get statistics about the cache",
  },
  async () => {
    const stats = getCacheStats();
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(stats, null, 2),
        },
      ],
    };
  }
);

// Register clear_cache tool
server.registerTool(
  "clear_cache",
  {
    description: "Clear all cached data from memory (pages and manuals)",
  },
  async () => {
    const result = clearCache();
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }
);

/**
 * Main function to start the server
 */
async function main() {
  const transport = new StdioServerTransport();

  await server.connect(transport);

  console.error("Neo4j Documentation MCP Server running on stdio");

  // Handle graceful shutdown
  process.on("SIGINT", async () => {
    await server.close();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
