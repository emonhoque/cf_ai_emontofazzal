# cf_ai_intelligent-assistant

AI chat assistant built on Cloudflare's platform using Llama 3.3, with conversation memory powered by Durable Objects.

## Live Demo
- **Chat UI**: https://cf-ai-assistant-76b.pages.dev
## What it does

This is a chat application where you can have conversations with Llama 3.3. The conversations are saved using Cloudflare Durable Objects, so when you refresh the page your chat history is still there. Everything runs on Cloudflare's edge network.

## Tech Stack

- **Workers AI** - runs Llama 3.3 70B model
- **Cloudflare Workers** - API backend
- **Durable Objects** - stores conversation history (up to 50 messages per session)
- **Cloudflare Pages** - hosts the chat UI

## Running Locally

Install dependencies:
```bash
npm install
```

Start the Worker API (runs on port 8787):
```bash
npm run dev
```

The Pages dev command has issues with Durable Objects locally, so just serve the HTML with Python:
```bash
cd public
python -m http.server 8788
```

Then open http://localhost:8788 in your browser.

## Deploying

### Auto-Deploy with GitHub Actions (Recommended)

The project auto-deploys on every push to `main` branch.

**Setup:**

1. Get your Cloudflare API Token:
   - Go to https://dash.cloudflare.com/profile/api-tokens
   - Create a token with "Edit Cloudflare Workers" permissions

2. Add the token to GitHub:
   - Go to your repo Settings → Secrets and variables → Actions
   - Create a new secret named `CLOUDFLARE_API_TOKEN`
   - Paste your API token

3. On first deployment, create the Pages project manually:
   ```bash
   npx wrangler login
   npx wrangler pages project create cf-ai-assistant --production-branch=main
   ```

4. Commit and push to `main` - it will auto-deploy!

### Manual Deploy

First login to Cloudflare:
```bash
npx wrangler login
```

Deploy the Worker:
```bash
npm run deploy
```

Create and deploy the Pages project:
```bash
npx wrangler pages project create cf-ai-assistant --production-branch=main
npx wrangler pages deploy public --project-name=cf-ai-assistant
```

After deploying, update the Worker URL in `public/index.html` (line 349) to match your deployed Worker URL, then redeploy Pages.

## API Endpoints

### POST /api/chat
Send a message to the AI.

```json
{
  "message": "What is Cloudflare?",
  "conversationId": "default",
  "userId": "user123"
}
```

Returns the AI's response along with conversation ID and timestamp.

### GET /api/history
Get conversation history.

Query params: `conversationId` (default: "default"), `limit` (default: 20)

### POST /api/clear
Clear conversation history.

```json
{
  "conversationId": "default"
}
```

### GET /api/health
Health check - returns status and timestamp.

## Project Structure

```
src/
  index.ts              - Worker API with AI integration
  conversation-state.ts - Durable Object for state management
public/
  index.html           - Chat interface
wrangler.toml          - Cloudflare configuration
```

## How it Works

1. User sends a message through the chat UI
2. Worker API receives the message and fetches conversation context from the Durable Object
3. Context + new message is sent to Llama 3.3 via Workers AI
4. AI response is saved to Durable Object along with the user's message
5. Response is returned to the UI

The Durable Object keeps the last 10 messages as context for the AI, so it can have coherent multi-turn conversations.

## Customization

**Change the AI model** - Edit `src/index.ts` line 69. See available models at https://developers.cloudflare.com/workers-ai/models/

**Adjust system prompt** - Edit `src/index.ts` line 66

**Change message limit** - Edit `src/conversation-state.ts` line 72 (currently 50 messages)

**Modify UI styling** - All styles are in `public/index.html`

## Notes

- Workers AI charges apply even in local development (it connects to Cloudflare's API)
- Free tier includes 10,000 AI requests/day
- The Durable Object migration uses `new_sqlite_classes` for free tier compatibility
- Conversation history persists across deployments

## Troubleshooting

**"AI binding not found"** - Check `wrangler.toml` has the `[ai]` binding

**Durable Objects error on deploy** - Make sure `wrangler.toml` uses `new_sqlite_classes` in the migration (not `new_classes`)

**CORS errors** - The Worker has `Access-Control-Allow-Origin: *` set for all responses

**Pages can't find Worker** - Update the `API_BASE` URL in `public/index.html` to match your deployed Worker

## License

MIT - see LICENSE file

---

Built for Cloudflare AI assignment. See PROMPTS.md for details on AI-assisted development.
