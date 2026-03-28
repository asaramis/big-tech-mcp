#!/bin/bash

# Big Technology Podcast MCP Setup Script

echo "🎙️  Big Technology Podcast MCP Server Setup"
echo "==========================================="
echo ""

# Check if transcripts.json exists
if [ ! -f "transcripts.json" ]; then
    echo "❌ Error: transcripts.json not found!"
    echo "Please copy your transcripts.json file to this directory."
    exit 1
fi

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed!"
    echo "Please install Node.js 18 or higher."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js version 18 or higher is required!"
    echo "Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Failed to build TypeScript"
    exit 1
fi

echo "✅ Build completed"
echo ""

# Count episodes in transcripts.json
EPISODE_COUNT=$(node -e "console.log(JSON.parse(require('fs').readFileSync('transcripts.json', 'utf-8')).length)")
echo "📊 Found $EPISODE_COUNT episodes in transcripts.json"
echo ""

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. For local use with Claude Desktop, add to your config:"
echo "   {"big-tech-transcripts": {"command": "node", "args": ["$(pwd)/dist/index.js"]}}"
echo ""
echo "2. For Claude Code CLI, run:"
echo "   claude mcp add -t stdio big-tech-transcripts "node $(pwd)/dist/index.js""
echo ""
echo "3. For hosted deployment, run:"
echo "   npm run start:sse"
echo ""