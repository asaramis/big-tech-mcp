#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import express, { Request, Response } from "express";
import { randomUUID } from "crypto";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import { loadTranscripts } from "./loader.js";
import {
  initializeIndex,
  searchTranscripts,
  getEpisode,
  listEpisodes,
  getRecentEpisodes,
} from "./search.js";

const PORT = parseInt(process.env.PORT || "3000", 10);
const MODE = process.env.MCP_MODE || "stdio"; // "stdio" for local, "sse" for remote

// Get the directory path for serving static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create the MCP server
function createMCPServer() {
  const server = new Server(
    {
      name: "big-tech-transcripts",
      version: "1.0.0",
      icons: [
        {
          src: "https://big-tech-mcp.onrender.com/icon.png",
          mimeType: "image/png",
          sizes: ["512x512"],
        },
      ],
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Define available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "search_transcripts",
        description:
          "Search across all Big Technology Podcast transcripts for tech insights and news. " +
          "Returns relevant excerpts from episodes with titles and dates. " +
          "Use this to find what tech leaders and experts have said about specific topics " +
          "like AI, regulation, big tech companies, social media, privacy, antitrust, etc.",
        inputSchema: {
          type: "object" as const,
          properties: {
            query: {
              type: "string",
              description:
                "The search query - use keywords related to the tech topic you want insights on",
            },
            limit: {
              type: "number",
              description: "Maximum number of results to return (default: 10)",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "get_episode",
        description:
          "Get the full transcript for a specific episode by title. " +
          "Use this when you want to dive deeper into a specific episode conversation.",
        inputSchema: {
          type: "object" as const,
          properties: {
            title: {
              type: "string",
              description:
                "The episode title or partial title (e.g., 'Mark Warner', 'OpenAI')",
            },
          },
          required: ["title"],
        },
      },
      {
        name: "list_episodes",
        description:
          "List all available episodes in the Big Technology Podcast archive. " +
          "Use this to see what topics and guests are available to search.",
        inputSchema: {
          type: "object" as const,
          properties: {},
          required: [],
        },
      },
      {
        name: "get_recent_episodes",
        description:
          "Get the most recent episodes from the Big Technology Podcast. " +
          "Use this to see the latest tech news and discussions.",
        inputSchema: {
          type: "object" as const,
          properties: {
            limit: {
              type: "number",
              description: "Number of recent episodes to return (default: 10)",
            },
          },
          required: [],
        },
      },
    ],
  }));

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case "search_transcripts": {
          const query = (args as { query: string; limit?: number }).query;
          const limit = (args as { query: string; limit?: number }).limit || 10;

          const results = await searchTranscripts(query, limit);

          if (results.length === 0) {
            return {
              content: [
                {
                  type: "text" as const,
                  text: `No results found for "${query}". Try different keywords.`,
                },
              ],
            };
          }

          const formattedResults = results
            .map(
              (r, i) =>
                `## ${i + 1}. ${r.title}\n**Date:** ${r.date}\n**URL:** ${r.url}\n\n${r.snippet}\n`
            )
            .join("\n---\n\n");

          return {
            content: [
              {
                type: "text" as const,
                text: `Found ${results.length} relevant episodes for "${query}":\n\n${formattedResults}`,
              },
            ],
          };
        }

        case "get_episode": {
          const title = (args as { title: string }).title;
          const episode = getEpisode(title);

          if (!episode) {
            const allEpisodes = listEpisodes();
            const suggestions = allEpisodes
              .filter((e) =>
                e.toLowerCase().includes(title.toLowerCase().split(" ")[0])
              )
              .slice(0, 5);

            return {
              content: [
                {
                  type: "text" as const,
                  text: `Episode with title "${title}" not found.${
                    suggestions.length > 0
                      ? ` Did you mean:\n${suggestions.map((s) => `- ${s}`).join("\n")}`
                      : ""
                  }`,
                },
              ],
            };
          }

          // Return full transcript (may be long)
          return {
            content: [
              {
                type: "text" as const,
                text: `# ${episode.title}\n\n**Date:** ${episode.date}\n**URL:** ${episode.url}\n\n**Description:** ${episode.description}\n\n---\n\n${episode.content}`,
              },
            ],
          };
        }

        case "list_episodes": {
          const episodes = listEpisodes();

          return {
            content: [
              {
                type: "text" as const,
                text: `# Available Episodes (${episodes.length} total)\n\n${episodes.map((e) => `- ${e}`).join("\n")}`,
              },
            ],
          };
        }

        case "get_recent_episodes": {
          const limit = (args as { limit?: number }).limit || 10;
          const recentEpisodes = getRecentEpisodes(limit);

          const formatted = recentEpisodes
            .map(
              (e, i) =>
                `## ${i + 1}. ${e.title}\n**Date:** ${e.date}\n**URL:** ${e.url}\n\n${e.description || "No description available"}\n`
            )
            .join("\n---\n\n");

          return {
            content: [
              {
                type: "text" as const,
                text: `# Recent Episodes (${recentEpisodes.length} episodes)\n\n${formatted}`,
              },
            ],
          };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}

// Run in stdio mode (local)
async function runStdio() {
  console.error("Starting Big Technology Podcast MCP Server (stdio mode)...");

  const episodes = await loadTranscripts();
  initializeIndex(episodes);

  const server = createMCPServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("MCP Server running. Waiting for requests...");
}

// Run in HTTP mode (remote/hosted) using Streamable HTTP transport
async function runHTTP() {
  console.error("Starting Big Technology Podcast MCP Server (HTTP mode)...");

  const episodes = await loadTranscripts();
  initializeIndex(episodes);

  const app = express();
  app.use(express.json());

  // Serve static files (icon, etc.)
  app.use(express.static(join(__dirname, "..", "public")));

  // Track transports by session ID
  const transports = new Map<string, StreamableHTTPServerTransport>();

  // Health check endpoint
  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", episodes: episodes.length });
  });

  app.get("/", (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      episodes: episodes.length,
      endpoints: {
        mcp: "/mcp",
        health: "/health",
      },
    });
  });

  // Main MCP endpoint - handles all MCP communication
  app.post("/mcp", async (req: Request, res: Response) => {
    console.error(`MCP request received`);

    // Check for existing session
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    let transport = sessionId ? transports.get(sessionId) : undefined;

    if (!transport) {
      // Create new transport for new sessions
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
      });

      // Connect the MCP server to this transport
      const server = createMCPServer();
      await server.connect(transport);

      // Clean up on close
      transport.onclose = () => {
        if (transport?.sessionId) {
          transports.delete(transport.sessionId);
          console.error(`Session closed: ${transport.sessionId}`);
        }
      };
    }

    // Handle the request
    await transport.handleRequest(req, res, req.body);

    // Store transport by session ID AFTER handleRequest
    if (transport.sessionId && !transports.has(transport.sessionId)) {
      transports.set(transport.sessionId, transport);
      console.error(`New session stored: ${transport.sessionId}`);
    }
  });

  // Handle GET requests to /mcp for SSE streams
  app.get("/mcp", async (req: Request, res: Response) => {
    console.error(`SSE connection request received`);

    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    const transport = sessionId ? transports.get(sessionId) : undefined;

    if (!transport) {
      res.status(400).json({
        error: "No session found. Send POST to /mcp first.",
      });
      return;
    }

    await transport.handleRequest(req, res);
  });

  // Handle DELETE for session cleanup
  app.delete("/mcp", async (req: Request, res: Response) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;

    if (sessionId) {
      const transport = transports.get(sessionId);
      if (transport) {
        await transport.close();
        transports.delete(sessionId);
      }
    }

    res.status(200).json({ ok: true });
  });

  app.listen(PORT, () => {
    console.error(`MCP Server listening on http://localhost:${PORT}`);
    console.error(`MCP endpoint: http://localhost:${PORT}/mcp`);
  });
}

// Main entry point
async function main() {
  if (MODE === "sse" || MODE === "http") {
    await runHTTP();
  } else {
    await runStdio();
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});