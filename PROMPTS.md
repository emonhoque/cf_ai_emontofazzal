# AI Prompts Used in Development

This document contains the prompts I used with Claude Code (Anthropic) to build this project.

## Initial Prompt

I started by asking Claude to help build the assignment:

```
Build a type of AI-powered application on Cloudflare that includes:
- LLM (using Llama 3.3 on Workers AI)
- Workflow/coordination (using Workflows, Workers or Durable Objects)
- User input via chat
- Memory or state
Repository must be prefixed with cf_ai_ and include README.md and PROMPTS.md
```

## Main Development Prompts

### Setting up the project structure

```
Create a Cloudflare Workers project with TypeScript that uses:
- Llama 3.3 on Workers AI
- Durable Objects for conversation state
- A chat interface
Set up package.json, wrangler.toml, and tsconfig.json
```

### Building the Durable Object

```
Implement a Durable Object that stores conversation history with messages (role, content, timestamp).
It should have methods to add messages, get history, clear history, and get context for the AI.
Limit to 50 messages and persist to storage.
```

### Creating the Worker API

```
Create the main Worker with these endpoints:
- /api/chat - sends messages to Llama 3.3 and saves to conversation history
- /api/history - retrieves past messages
- /api/clear - clears the conversation
- /api/health - health check

Use @cf/meta/llama-3.3-70b-instruct-fp8-fast model with temperature 0.7
```

### Building the UI

```
Create a chat interface in HTML/CSS/JavaScript with:
- Modern purple gradient design
- Chat bubbles for user and AI
- Auto-scrolling
- Loading indicator
- History and Clear buttons
- Responsive for mobile
- Works with both localhost and production
```

### Documentation

```
Write a comprehensive README with:
- Project overview
- Architecture explanation
- Setup and deployment instructions
- API documentation with examples
- Troubleshooting section
```

### Fixing dates

```
Update package.json and wrangler.toml to use latest versions as of November 2025
Update compatibility dates to 2025-11-14
```

## How I Used AI

I built this entire project using Claude Code. I gave it high-level requirements and it generated all the code. I asked it to:

- Set up the TypeScript project structure
- Implement the Durable Objects for state management
- Create the Worker API with Workers AI integration
- Build the chat UI
- Write documentation

The AI helped me understand how to:
- Use Durable Objects for persistent conversation state
- Integrate Workers AI without needing API keys
- Structure a Cloudflare Workers project properly
- Handle CORS and API routing

## What I Learned

- Durable Objects are great for managing conversational state
- Workers AI makes it easy to add LLM capabilities without external APIs
- The Cloudflare edge network provides low latency globally
- TypeScript helps catch errors early in serverless development

## Tools Used

- **Claude Code** (Claude Sonnet 4.5) - for all code generation and documentation
- **Node.js 18+** - runtime
- **Wrangler** - Cloudflare CLI
- **TypeScript** - type safety
