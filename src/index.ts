/**
 * Cloudflare AI-Powered Intelligent Assistant
 * Main Worker entrypoint with Workers AI integration
 */

import { ConversationState } from './conversation-state';

export { ConversationState };

interface Env {
  AI: any;
  CONVERSATIONS: DurableObjectNamespace;
  ALLOWED_ORIGINS?: string;
}

interface ChatRequest {
  message: string;
  conversationId?: string;
  userId?: string;
  systemPrompt?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': env.ALLOWED_ORIGINS || '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Route handling
    if (path === '/api/chat' && request.method === 'POST') {
      return handleChat(request, env);
    }

    if (path === '/api/history' && request.method === 'GET') {
      return handleGetHistory(request, env);
    }

    if (path === '/api/clear' && request.method === 'POST') {
      return handleClearHistory(request, env);
    }

    if (path === '/api/health') {
      return jsonResponse({ status: 'healthy', timestamp: Date.now() });
    }

    // Serve static files or return 404
    return jsonResponse({ error: 'Not found' }, 404);
  },
};

/**
 * Handle chat requests - main AI interaction endpoint
 */
async function handleChat(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json() as ChatRequest;
    const { message, conversationId = 'default', userId = 'anonymous', systemPrompt } = body;

    if (!message || typeof message !== 'string') {
      return jsonResponse({ error: 'Message is required and must be a string' }, 400);
    }

    // Get Durable Object instance for this conversation
    const conversationIdObj = env.CONVERSATIONS.idFromName(conversationId);
    const conversationStub = env.CONVERSATIONS.get(conversationIdObj);

    // Get conversation context
    const contextResponse = await conversationStub.fetch(
      new Request('http://internal/get-context')
    );
    const { context } = await contextResponse.json() as { context: Array<{ role: string; content: string }> };

    // Build messages for AI with system prompt
    const defaultSystemPrompt = `You are a helpful, friendly, and intelligent AI assistant. You have access to conversation history and can provide contextual responses. Be concise but informative. If you don't know something, admit it honestly.`;

    const messages = [
      { role: 'system', content: systemPrompt || defaultSystemPrompt },
      ...context,
      { role: 'user', content: message }
    ];

    // Call Workers AI with Llama 3.3
    const aiResponse = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
      messages,
      max_tokens: 1024,
      temperature: 0.7,
      top_p: 0.9,
    });

    const assistantMessage = aiResponse.response || 'I apologize, but I could not generate a response.';

    // Store user message and assistant response in conversation history
    await conversationStub.fetch(
      new Request('http://internal/add-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'user', content: message, userId }),
      })
    );

    await conversationStub.fetch(
      new Request('http://internal/add-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'assistant', content: assistantMessage, userId }),
      })
    );

    return jsonResponse({
      response: assistantMessage,
      conversationId,
      timestamp: Date.now(),
    });

  } catch (error) {
    console.error('Chat error:', error);
    return jsonResponse({
      error: 'Failed to process chat request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
}

/**
 * Get conversation history
 */
async function handleGetHistory(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const conversationId = url.searchParams.get('conversationId') || 'default';
    const limit = url.searchParams.get('limit') || '20';

    const conversationIdObj = env.CONVERSATIONS.idFromName(conversationId);
    const conversationStub = env.CONVERSATIONS.get(conversationIdObj);

    const response = await conversationStub.fetch(
      new Request(`http://internal/get-history?limit=${limit}`)
    );

    return new Response(response.body, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': env.ALLOWED_ORIGINS || '*',
      },
    });

  } catch (error) {
    return jsonResponse({
      error: 'Failed to retrieve history',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
}

/**
 * Clear conversation history
 */
async function handleClearHistory(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json() as { conversationId?: string };
    const conversationId = body.conversationId || 'default';

    const conversationIdObj = env.CONVERSATIONS.idFromName(conversationId);
    const conversationStub = env.CONVERSATIONS.get(conversationIdObj);

    const response = await conversationStub.fetch(
      new Request('http://internal/clear-history', { method: 'POST' })
    );

    return new Response(response.body, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': env.ALLOWED_ORIGINS || '*',
      },
    });

  } catch (error) {
    return jsonResponse({
      error: 'Failed to clear history',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
}

/**
 * Helper function to create JSON responses
 */
function jsonResponse(data: any, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
