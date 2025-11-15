# Example Usage

This document provides example code snippets for interacting with the AI Assistant API.

## JavaScript/TypeScript Examples

### Basic Chat Request

```javascript
async function sendMessage(message) {
  const response = await fetch('http://localhost:8787/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: message,
      conversationId: 'my-conversation',
      userId: 'user123'
    })
  });

  const data = await response.json();
  console.log('AI Response:', data.response);
  return data;
}

// Usage
sendMessage('What is the capital of France?');
```

### Multi-turn Conversation

```javascript
async function havingConversation() {
  const conversationId = 'demo-conversation';

  // First message
  let response = await fetch('http://localhost:8787/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'My name is Alice',
      conversationId
    })
  });
  console.log(await response.json());

  // Second message - AI remembers context
  response = await fetch('http://localhost:8787/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'What is my name?',
      conversationId
    })
  });
  console.log(await response.json());
  // Expected: AI will respond with "Alice"
}
```

### Get Conversation History

```javascript
async function getHistory(conversationId = 'default') {
  const response = await fetch(
    `http://localhost:8787/api/history?conversationId=${conversationId}&limit=10`
  );

  const data = await response.json();
  console.log('Messages:', data.messages);
  console.log('Total:', data.totalMessages);
  return data;
}

// Usage
getHistory('my-conversation');
```

### Clear Conversation

```javascript
async function clearConversation(conversationId = 'default') {
  const response = await fetch('http://localhost:8787/api/clear', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversationId })
  });

  const data = await response.json();
  console.log('Cleared:', data.success);
}

// Usage
clearConversation('my-conversation');
```

### Custom System Prompt

```javascript
async function chatWithCustomPrompt() {
  const response = await fetch('http://localhost:8787/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Tell me a joke',
      systemPrompt: 'You are a comedian who only tells dad jokes.',
      conversationId: 'comedy-session'
    })
  });

  const data = await response.json();
  console.log(data.response);
}
```

## cURL Examples

### Send a Chat Message

```bash
curl -X POST http://localhost:8787/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, who are you?",
    "conversationId": "test-conversation",
    "userId": "user123"
  }'
```

### Get History

```bash
curl "http://localhost:8787/api/history?conversationId=test-conversation&limit=20"
```

### Clear Conversation

```bash
curl -X POST http://localhost:8787/api/clear \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "test-conversation"
  }'
```

### Health Check

```bash
curl http://localhost:8787/api/health
```

## Python Examples

### Basic Chat

```python
import requests

def send_message(message, conversation_id="default"):
    url = "http://localhost:8787/api/chat"
    payload = {
        "message": message,
        "conversationId": conversation_id,
        "userId": "python-user"
    }

    response = requests.post(url, json=payload)
    data = response.json()

    print(f"AI: {data['response']}")
    return data

# Usage
send_message("What is machine learning?")
```

### Conversation Loop

```python
import requests

def chat_loop(conversation_id="python-session"):
    url = "http://localhost:8787/api/chat"

    print("Chat with AI (type 'quit' to exit)")

    while True:
        user_input = input("You: ")

        if user_input.lower() == 'quit':
            break

        response = requests.post(url, json={
            "message": user_input,
            "conversationId": conversation_id
        })

        data = response.json()
        print(f"AI: {data['response']}\n")

# Start the loop
chat_loop()
```

## Node.js with Axios

```javascript
const axios = require('axios');

const API_BASE = 'http://localhost:8787';

async function chat(message, conversationId = 'default') {
  try {
    const response = await axios.post(`${API_BASE}/api/chat`, {
      message,
      conversationId,
      userId: 'node-user'
    });

    return response.data;
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}

async function getHistory(conversationId = 'default', limit = 20) {
  try {
    const response = await axios.get(`${API_BASE}/api/history`, {
      params: { conversationId, limit }
    });

    return response.data;
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}

// Example usage
(async () => {
  const result = await chat('Tell me about Cloudflare Workers');
  console.log('AI Response:', result.response);

  const history = await getHistory('default', 5);
  console.log('Recent messages:', history.messages.length);
})();
```

## Testing Different Personalities

```javascript
const personalities = {
  helpful: "You are a helpful and professional assistant.",
  creative: "You are a creative writer who uses vivid imagery and metaphors.",
  technical: "You are a technical expert who provides detailed, precise answers.",
  casual: "You are a casual, friendly chat buddy who uses simple language."
};

async function chatWithPersonality(message, personality) {
  const response = await fetch('http://localhost:8787/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      systemPrompt: personalities[personality],
      conversationId: `${personality}-chat`
    })
  });

  const data = await response.json();
  console.log(`[${personality}]:`, data.response);
}

// Compare different personalities
const question = "What is artificial intelligence?";
chatWithPersonality(question, 'helpful');
chatWithPersonality(question, 'creative');
chatWithPersonality(question, 'technical');
chatWithPersonality(question, 'casual');
```

## Integration with Frontend Frameworks

### React Hook Example

```jsx
import { useState, useEffect } from 'react';

function useAIChat(conversationId = 'default') {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHistory();
  }, [conversationId]);

  async function loadHistory() {
    const response = await fetch(
      `http://localhost:8787/api/history?conversationId=${conversationId}`
    );
    const data = await response.json();
    setMessages(data.messages);
  }

  async function sendMessage(message) {
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8787/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, conversationId })
      });

      const data = await response.json();

      // Add both user and AI messages
      setMessages(prev => [
        ...prev,
        { role: 'user', content: message, timestamp: Date.now() },
        { role: 'assistant', content: data.response, timestamp: Date.now() }
      ]);

      return data.response;
    } finally {
      setLoading(false);
    }
  }

  async function clearChat() {
    await fetch('http://localhost:8787/api/clear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId })
    });

    setMessages([]);
  }

  return { messages, loading, sendMessage, clearChat };
}

// Usage in component
function ChatComponent() {
  const { messages, loading, sendMessage } = useAIChat('my-chat');

  return (
    <div>
      {messages.map((msg, i) => (
        <div key={i}>{msg.role}: {msg.content}</div>
      ))}
      <button onClick={() => sendMessage('Hello!')} disabled={loading}>
        Send
      </button>
    </div>
  );
}
```

## Error Handling

```javascript
async function robustChatRequest(message) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    const response = await fetch('http://localhost:8787/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Request failed');
    }

    return await response.json();

  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Request timeout');
    } else {
      console.error('Request failed:', error.message);
    }
    throw error;
  }
}
```

---

For more examples and use cases, see the [README.md](README.md) documentation.
