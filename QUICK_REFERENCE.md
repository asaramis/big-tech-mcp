# Big Technology Podcast MCP - Quick Reference Card

## 🎯 What This Does

Lets you search and query your 488 Big Technology Podcast transcripts directly from Claude using natural language.

## ⚡ Quick Start (Choose One)

### Claude Desktop
1. Edit config: `~/Library/Application Support/Claude/claude_desktop_config.json`
2. Add:
```json
{
  "mcpServers": {
    "big-tech-transcripts": {
      "command": "node",
      "args": ["/workspace/big-tech-mcp/dist/index.js"]
    }
  }
}
```
3. Restart Claude Desktop

### Claude Code CLI
```bash
claude mcp add -t stdio big-tech-transcripts "node /workspace/big-tech-mcp/dist/index.js"
```

### Deploy to Render.com
1. Push `big-tech-mcp/` to GitHub
2. Connect to Render.com
3. Use included `render.yaml` config
4. Connect from Claude.ai: Settings → Connectors → Add custom connector

## 💬 Example Queries

**Search for topics:**
```
"Search Big Technology Podcast for episodes about AI safety"
"Find discussions on Meta and content moderation"
"What has been said about antitrust enforcement?"
```

**Get specific episodes:**
```
"Get the episode with Mark Warner"
"Show me the transcript about OpenAI's superapp"
```

**Browse episodes:**
```
"List recent episodes"
"What are the latest episodes about?"
"Show all available episodes"
```

## 🔧 Commands

**Build:**
```bash
cd big-tech-mcp
npm run build
```

**Test:**
```bash
node test-local.js
```

**Run locally:**
```bash
npm start
```

**Run as server:**
```bash
npm run start:sse
```

## 📊 Status

- **Episodes:** 488 ✅
- **Server:** Built and tested ✅
- **Search:** FlexSearch indexed ✅

## 🆘 Troubleshooting

**Server won't start?**
- Check Node.js version: `node -v` (needs 18+)
- Rebuild: `npm run build`

**Claude can't connect?**
- Use absolute paths in config (not relative)
- Restart Claude Desktop
- Check Claude logs

**No results?**
- Try broader search terms
- Use `list_episodes` to see what's available
- Check if transcripts contain those terms

## 📁 Key Files

- `dist/index.js` - The MCP server
- `transcripts.json` - Your podcast data (488 episodes)
- `SETUP_GUIDE.md` - Full setup instructions
- `README.md` - Complete documentation

---

**Ready to use! Start searching your podcast archive with Claude. 🎙️**