# Big Technology Podcast MCP

Search 488 episodes of [Big Technology Podcast](https://bigtechnology.fm/) transcripts directly from Claude. Get instant access to tech insights, news, and commentary from Alex Kantrowitz and his guests.

**Created by Ranjan Roy, co-host of Big Technology Podcast** 🎙️

## ✨ What's Included

This repository contains **everything you need**:
- ✅ Complete MCP server code
- ✅ **488 podcast transcripts** (13.9MB)
- ✅ Full documentation and setup guides
- ✅ Ready to use immediately!

No need to source transcripts separately - they're included with permission.

## Quick Start

### Option 1: Local Setup (Claude Desktop / Claude Code CLI)

1. **Clone and install:**
   ```bash
   git clone https://github.com/ranjanroy/big-tech-mcp.git
   cd big-tech-mcp
   npm install
   npm run build
   ```

2. **You're done!** The transcripts are already included.

3. **For Claude Desktop:**
   - Open Claude Desktop settings
   - Go to **Settings → Connectors → Add custom connector**
   - Add a local connector pointing to your installation
   - Or add to your `claude_desktop_config.json`:
   ```json
   {
     "mcpServers": {
       "big-tech-transcripts": {
         "command": "node",
         "args": ["/path/to/big-tech-mcp/dist/index.js"],
         "env": {
           "BIG_TECH_TRANSCRIPTS_PATH": "/path/to/transcripts.json"
         }
       }
     }
   }
   ```

4. **For Claude Code CLI:**
   ```bash
   # From the big-tech-mcp directory
   claude mcp add -t stdio big-tech-transcripts "node dist/index.js"
   ```
   Then restart Claude Code.

### Option 2: Remote Server (Hosting)

1. **Set up for hosted deployment:**
   ```bash
   # Copy transcripts to the project
   cp ../transcripts.json ./
   
   # Build the project
   npm install
   npm run build
   
   # Run in server mode
   npm run start:sse
   ```

2. **Deploy to Render.com (or similar):**
   - The included `render.yaml` provides configuration
   - Set `MCP_MODE=sse` environment variable
   - Upload `transcripts.json` to your server

3. **Connect from Claude.ai:**
   - Go to **Settings → Connectors → Add custom connector**
   - Enter your server URL: `https://your-server.com/mcp`
   - Click **Add** and enable the connector

### Option 3: ChatGPT

1. Deploy as a remote server (Option 2 above)
2. Go to **Settings → Apps → Enable Developer Mode**
3. Click **Create App**
4. Add a name and paste the URL: `https://your-server.com/mcp`
5. Save and start using it!

---

## What You Can Ask

Once connected, try asking Claude things like:

- "What has been said about AI regulation on Big Technology Podcast?"
- "Search for episodes about OpenAI and Microsoft"
- "What are the latest discussions on antitrust and big tech?"
- "Find episodes featuring Mark Warner or other politicians"
- "What do tech leaders say about content moderation?"
- "Search for insights on the future of social media"

## Available Tools

| Tool | Description |
| --- | --- |
| `search_transcripts` | Search all 488 episodes by topic/keyword |
| `get_episode` | Get full transcript for a specific episode by title |
| `list_episodes` | List all available episodes with dates |
| `get_recent_episodes` | Get the most recent episodes |

## How It Works

The server loads your `transcripts.json` file, indexes the episodes using FlexSearch for fast full-text search, and exposes four MCP tools that Claude can use to search and retrieve content.

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run locally (stdio mode)
npm start

# Run as HTTP server
npm run start:sse

# Development mode (build + run)
npm run dev
```

## Project Structure

```
big-tech-mcp/
├── src/
│   ├── index.ts      # Main server and MCP tool definitions
│   ├── loader.ts     # Transcript loading and processing
│   └── search.ts     # FlexSearch indexing and search logic
├── public/           # Static files (icons, etc.)
├── transcripts.json  # Your podcast transcripts (not included)
├── package.json
├── tsconfig.json
└── README.md
```

## Transcript File Format

The server expects a JSON file with this structure:

```json
[
  {
    "podcast_title": "Big Technology Podcast",
    "episode_title": "Episode Title Here",
    "date": "2025-01-15",
    "episode_description": "Description here",
    "full_transcript": "Full transcript text...",
    "url": "https://podscripts.co/podcasts/...",
    "scraped_at": "2025-01-15T12:00:00Z"
  }
]
```

## Environment Variables

- `BIG_TECH_TRANSCRIPTS_PATH`: Path to your transcripts.json file (local mode)
- `MCP_MODE`: Set to `sse` for HTTP server mode, omit for stdio mode
- `PORT`: Port for HTTP server (default: 3000)

## Legal & Copyright

**Transcripts Included with Permission**

This repository includes 488 podcast transcripts from the Big Technology Podcast. These transcripts are shared with permission as Ranjan Roy is a co-host of the show.

**Usage:**
- ✅ Personal use and research
- ✅ Building AI tools and applications
- ✅ Sharing and forking this repository
- ℹ️ Transcripts remain property of Big Technology / Alex Kantrowitz

## Credits

- **Podcast:** [Big Technology Podcast](https://bigtechnology.fm/) by Alex Kantrowitz
- **Co-host & MCP Creator:** Ranjan Roy
- **MCP Server Code:** MIT License (open source)
- **Transcripts:** Included with permission
- **Built with:** [Model Context Protocol](https://modelcontextprotocol.io/)
- **Inspired by:** [akshayvkt/lenny-mcp](https://github.com/akshayvkt/lenny-mcp)

## License

**Code:** MIT License - See LICENSE for details

**Transcripts:** Included with permission from Big Technology Podcast. Property of Alex Kantrowitz / Big Technology.