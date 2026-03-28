# Big Technology Podcast MCP - Complete Setup Guide

## ✅ What You Have

Your MCP server is **fully built and tested** with 488 episodes of Big Technology Podcast transcripts ready to search!

## 🚀 Quick Start Options

### Option 1: Use with Claude Desktop (Recommended)

1. **Copy the config path:**
   ```bash
   pwd
   # Copy the output - you'll need this path
   ```

2. **Edit Claude Desktop config:**
   - On Mac: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - On Windows: `%APPDATA%\Claude\claude_desktop_config.json`

3. **Add this configuration:**
   ```json
   {
     "mcpServers": {
       "big-tech-transcripts": {
         "command": "node",
         "args": ["/workspace/big-tech-mcp/dist/index.js"],
         "env": {
           "BIG_TECH_TRANSCRIPTS_PATH": "/workspace/big-tech-mcp/transcripts.json"
         }
       }
     }
   }
   ```
   *(Replace `/workspace/big-tech-mcp` with your actual path from step 1)*

4. **Restart Claude Desktop**

5. **Test it!** Ask Claude:
   - "Search Big Technology Podcast for episodes about AI regulation"
   - "What has been said about OpenAI on Big Technology?"
   - "List recent episodes"

### Option 2: Use with Claude Code CLI

If you're using the Claude Code CLI, run:

```bash
cd /workspace/big-tech-mcp
claude mcp add -t stdio big-tech-transcripts "node $(pwd)/dist/index.js"
```

Then restart Claude Code.

### Option 3: Deploy as Remote Server

For hosting on Render.com or similar:

1. **Push to GitHub:**
   ```bash
   cd big-tech-mcp
   git init
   git add .
   git commit -m "Initial commit - Big Technology Podcast MCP"
   git remote add origin <your-github-repo>
   git push -u origin main
   ```

2. **Deploy on Render:**
   - Connect your GitHub repo
   - Use the included `render.yaml` configuration
   - Render will automatically build and deploy

3. **Connect from Claude.ai:**
   - Settings → Connectors → Add custom connector
   - Enter: `https://your-app.onrender.com/mcp`

## 🎯 Available Tools

Once connected, Claude will have access to these tools:

1. **search_transcripts** - Search across all 488 episodes
2. **get_episode** - Get full transcript of a specific episode
3. **list_episodes** - Browse all available episodes
4. **get_recent_episodes** - See the latest episodes

## 💡 Example Queries

Try asking Claude:

- "Search Big Technology Podcast for discussions about AI safety"
- "What has Mark Warner said on Big Technology Podcast?"
- "Find episodes about Meta and social media regulation"
- "What are the recent episodes about?"
- "Search for insights on antitrust enforcement"
- "Get the episode about OpenAI's superapp ambitions"

## 🔧 Troubleshooting

### Server won't start
- Make sure Node.js 18+ is installed: `node -v`
- Rebuild if needed: `npm run build`

### Claude can't find the server
- Check the path in your config is absolute (not relative)
- Make sure Claude Desktop is restarted
- Check Claude Desktop logs for errors

### No search results
- The transcripts might not contain those exact terms
- Try different keywords or broader searches
- Use `list_episodes` to see what's available

## 📁 Project Structure

```
big-tech-mcp/
├── dist/                 # Compiled JavaScript (built from src/)
├── src/
│   ├── index.ts         # Main MCP server
│   ├── loader.ts        # Transcript loading
│   └── search.ts        # Search functionality
├── transcripts.json     # Your 488 podcast episodes
├── package.json
├── tsconfig.json
└── README.md
```

## 🔄 Updating Transcripts

When you get new podcast transcripts:

1. Replace `transcripts.json` with the updated file
2. Restart the MCP server (or restart Claude Desktop)
3. The new episodes will be automatically indexed

## 📊 Stats

- **Episodes:** 488
- **Searchable Fields:** Title, content, description
- **Search Engine:** FlexSearch (fast full-text search)
- **Response Time:** < 100ms for most queries

## 🆘 Getting Help

If you encounter issues:

1. Check the logs in your terminal
2. Verify `transcripts.json` is valid JSON
3. Test the server: `node test-local.js`
4. Check Claude Desktop logs

---

**You're all set! 🎉**

Your Big Technology Podcast transcripts are now searchable directly from Claude. Start exploring the archive!