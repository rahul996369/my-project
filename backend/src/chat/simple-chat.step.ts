import type { ApiRouteConfig, Handlers } from 'motia';
import { z } from 'zod';

const bodySchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
});

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'SimpleChat',
  path: '/chat',
  method: 'POST',
  description: 'Chat with Groq LLM (uses GROQ_API_KEY)',
  bodySchema,
  emits: [],
  flows: ['chat-flow'],
  responseSchema: {
    200: z.object({ reply: z.string() }),
    400: z.object({ error: z.string() }),
    502: z.object({ error: z.string() }),
  },
};

const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions';

export const handler: Handlers['SimpleChat'] = async (req) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return {
      status: 502,
      body: { error: 'GROQ_API_KEY is not set' },
    };
  }

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return {
      status: 400,
      body: { error: parsed.error.issues[0]?.message ?? 'Invalid request' },
    };
  }

  const { message } = parsed.data;

  const res = await fetch(GROQ_CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content:
            'You must respond with a valid JSON object only. Use this exact format: {"reply": "your answer here"}. Put your entire answer as the value of the "reply" key. Use plain text only inside the reply—do not use markdown (no **, no #, no bullet lists). Escape any quotes inside the reply.',
        },
        { role: 'user', content: message },
      ],
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
    return {
      status: 502,
      body: { error: err?.error?.message ?? `Groq error: ${res.status}` },
    };
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const rawContent =
    data.choices?.[0]?.message?.content?.trim() ?? 'No response from the assistant.';

  // If the LLM returned JSON like {"reply": "..."}, parse it and use that
  let reply: string;
  try {
    const parsed = JSON.parse(rawContent) as { reply?: string };
    reply = typeof parsed.reply === 'string' ? parsed.reply : rawContent;
  } catch {
    reply = rawContent;
  }

  return {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: { reply },
  };
};
