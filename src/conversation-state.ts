/**
 * ConversationState Durable Object
 * Manages conversation history and context for each user session
 */
export class ConversationState {
  private state: DurableObjectState;
  private messages: Array<{ role: string; content: string; timestamp: number }>;
  private metadata: {
    userId: string;
    createdAt: number;
    lastActivityAt: number;
  };

  constructor(state: DurableObjectState) {
    this.state = state;
    this.messages = [];
    this.metadata = {
      userId: '',
      createdAt: Date.now(),
      lastActivityAt: Date.now()
    };
  }

  async fetch(request: Request): Promise<Response> {
    // Initialize state from storage
    await this.initializeState();

    const url = new URL(request.url);
    const path = url.pathname;

    // Handle CORS
    if (request.method === 'OPTIONS') {
      return this.corsResponse();
    }

    try {
      switch (path) {
        case '/add-message':
          return await this.handleAddMessage(request);
        case '/get-history':
          return await this.handleGetHistory(request);
        case '/clear-history':
          return await this.handleClearHistory(request);
        case '/get-context':
          return await this.handleGetContext(request);
        default:
          return this.jsonResponse({ error: 'Not found' }, 404);
      }
    } catch (error) {
      return this.jsonResponse({
        error: 'Internal error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 500);
    }
  }

  private async initializeState() {
    const storedMessages = await this.state.storage.get<Array<{ role: string; content: string; timestamp: number }>>('messages');
    const storedMetadata = await this.state.storage.get<typeof this.metadata>('metadata');

    if (storedMessages) {
      this.messages = storedMessages;
    }
    if (storedMetadata) {
      this.metadata = storedMetadata;
    }
  }

  private async handleAddMessage(request: Request): Promise<Response> {
    const { role, content, userId } = await request.json() as { role: string; content: string; userId?: string };

    if (!role || !content) {
      return this.jsonResponse({ error: 'Missing role or content' }, 400);
    }

    // Update userId if provided
    if (userId && !this.metadata.userId) {
      this.metadata.userId = userId;
    }

    // Add message to history
    const message = { role, content, timestamp: Date.now() };
    this.messages.push(message);
    this.metadata.lastActivityAt = Date.now();

    // Limit conversation history to last 50 messages to manage memory
    if (this.messages.length > 50) {
      this.messages = this.messages.slice(-50);
    }

    // Persist to storage
    await this.state.storage.put('messages', this.messages);
    await this.state.storage.put('metadata', this.metadata);

    return this.jsonResponse({
      success: true,
      messageCount: this.messages.length
    });
  }

  private async handleGetHistory(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');

    const recentMessages = this.messages.slice(-limit);

    return this.jsonResponse({
      messages: recentMessages,
      metadata: this.metadata,
      totalMessages: this.messages.length
    });
  }

  private async handleClearHistory(request: Request): Promise<Response> {
    this.messages = [];
    this.metadata.lastActivityAt = Date.now();

    await this.state.storage.put('messages', this.messages);
    await this.state.storage.put('metadata', this.metadata);

    return this.jsonResponse({ success: true });
  }

  private async handleGetContext(request: Request): Promise<Response> {
    // Return a condensed context for the AI (last 10 messages)
    const contextMessages = this.messages.slice(-10).map(m => ({
      role: m.role,
      content: m.content
    }));

    return this.jsonResponse({
      context: contextMessages,
      messageCount: this.messages.length
    });
  }

  private jsonResponse(data: any, status: number = 200): Response {
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

  private corsResponse(): Response {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }
}
