// Quick test script to verify the MCP server works locally
import { spawn } from 'child_process';
import { readFileSync } from 'fs';

console.log('🎙️  Testing Big Technology Podcast MCP Server\n');

// Check if transcripts.json exists
try {
  const data = JSON.parse(readFileSync('./transcripts.json', 'utf-8'));
  console.log(`✅ Found ${data.length} episodes in transcripts.json`);
} catch (error) {
  console.error('❌ Error reading transcripts.json:', error.message);
  process.exit(1);
}

// Test the server can start
console.log('\n🚀 Starting MCP server...\n');

const server = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: { ...process.env, NODE_ENV: 'test' }
});

let output = '';

server.stderr.on('data', (data) => {
  output += data.toString();
  process.stderr.write(data);
});

setTimeout(() => {
  if (output.includes('MCP Server running')) {
    console.log('\n✅ Server started successfully!');
    console.log('✅ All tests passed!\n');
    console.log('The MCP server is ready to use with Claude.');
    server.kill();
    process.exit(0);
  } else {
    console.error('\n❌ Server did not start properly');
    server.kill();
    process.exit(1);
  }
}, 3000);

server.on('error', (error) => {
  console.error('❌ Server error:', error.message);
  process.exit(1);
});