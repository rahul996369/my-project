import type { ApiRouteConfig, Handlers } from 'motia';
import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { z } from 'zod';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse') as (buffer: Buffer) => Promise<{ text: string }>;

const UPLOAD_DIR = path.join(os.tmpdir(), 'motia-pdf-uploads');
const MIN_EXTRACTED_TEXT_LENGTH = 10;

const bodySchema = z.object({
  uploadId: z.string().min(1, 'uploadId is required'),
  message: z.string().optional(),
});

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'DocumentSummarizer',
  path: '/chat/summarize-pdf',
  method: 'POST',
  description: 'Summarize a PDF document using Groq LLM (uses GROQ_API_KEY)',
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

export const handler: Handlers['DocumentSummarizer'] = async (req) => {
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

  const { uploadId, message } = parsed.data;

  // Restrict to UUID-like format to avoid path traversal
  if (!/^[a-f0-9-]{36}$/i.test(uploadId)) {
    return {
      status: 400,
      body: { error: 'Invalid uploadId.' },
    };
  }

  const filePath = path.join(UPLOAD_DIR, `${uploadId}.pdf`);

  let buffer: Buffer;
  try {
    buffer = await fs.readFile(filePath);
  } catch (err) {
    const code = err && typeof (err as NodeJS.ErrnoException).code === 'string' ? (err as NodeJS.ErrnoException).code : '';
    if (code === 'ENOENT') {
      return {
        status: 400,
        body: { error: 'Upload not found or expired. Please upload the PDF again.' },
      };
    }
    throw err;
  }

  try {
    const data = await pdfParse(buffer);
    const text = (data?.text ?? '').trim();
    if (text.length < MIN_EXTRACTED_TEXT_LENGTH) {
      return {
        status: 400,
        body: {
          error:
            'Could not extract enough text from the PDF. It might be scanned or image-only; try a text-based PDF.',
        },
      };
    }

    const userContent =
      (message?.trim().length ?? 0) > 0
        ? `${message!.trim()}\n\nDocument content:\n${text}`
        : `Summarize the following document.\n\nDocument content:\n${text}`;

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
              'You must respond with a valid JSON object only. Use this exact format: {"reply": "your answer here"}. Put your entire summary as the value of the "reply" key. Use plain text only inside the reply—do not use markdown (no **, no #, no bullet lists). Escape any quotes inside the reply. Provide a clear, concise summary of the document.',
          },
          { role: 'user', content: userContent },
        ],
        max_tokens: 1024,
      }),
    });

    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as {
        error?: { message?: string };
      };
      return {
        status: 502,
        body: { error: err?.error?.message ?? `Groq error: ${res.status}` },
      };
    }

    const groqData = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const rawContent =
      groqData.choices?.[0]?.message?.content?.trim() ??
      'No response from the assistant.';

    let reply: string;
    try {
      const parsedReply = JSON.parse(rawContent) as { reply?: string };
      reply =
        typeof parsedReply.reply === 'string' ? parsedReply.reply : rawContent;
    } catch {
      reply = rawContent;
    }

    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { reply },
    };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Failed to process PDF.';
    return {
      status: 502,
      body: { error: errorMessage },
    };
  } finally {
    await fs.unlink(filePath).catch(() => {});
  }
};
