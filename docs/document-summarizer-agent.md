# Document Summarizer Agent – How to Build It

This guide explains how to build an agent that **accepts images, PDFs, and other documents** and **returns a summary**, using your current stack (React frontend, Motia backend, Groq LLM).

---

## 1. High-Level Flow

```
User uploads file(s) → Frontend sends to API → Backend detects type → Extract/describe content → LLM summarizes → Return summary to user
```

- **Images**: Use a **vision-capable LLM** (e.g. Groq with a vision model) to describe or summarize the image.
- **PDFs / Office docs**: **Extract text** with a library, then send the text to the **same text LLM** you use today for summarization.

---

## 2. What You Need to Add

| Layer | What to add |
|-------|---------------------|
| **Frontend** | File picker / drag-drop, support multiple types (images, PDF, docx, etc.), send files to backend (e.g. base64 or `multipart/form-data`). |
| **Backend** | New API step (e.g. `POST /chat/document` or extend `/chat`) that: (1) accepts file(s), (2) detects type, (3) extracts text or uses vision, (4) calls LLM to summarize. |
| **Libraries** | PDF text extraction, optional Office doc extraction, and optionally a vision-capable model for images. |

---

## 3. Frontend: Accepting Files

**Supported types (examples):**

- **Images**: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- **PDF**: `application/pdf`
- **Documents**: `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (docx), plain text, etc.

**Ways to send to backend:**

1. **Base64 in JSON**  
   - Read file with `FileReader`, convert to base64, send in body:  
     `{ message: "...", attachments: [{ type: "pdf", name: "doc.pdf", content: "base64..." }] }`  
   - Simple, works well for small/medium files. Enforce a max size (e.g. 5–10 MB) and validate type.

2. **Multipart form data**  
   - `FormData`: append `message` and one or more `files`.  
   - Backend parses multipart (e.g. with a middleware or built-in parser).  
   - Better for larger files; you can still impose size limits.

**UX ideas:**

- Drag-and-drop zone + “Choose files” button.
- Show list of selected files with name and type; allow remove.
- Optional short text “message” (e.g. “Summarize this” or “Focus on the financial section”).
- Disable send until at least one file (or message) is present; show loading while the summarizer runs.

---

## 4. Backend: Processing by Document Type

### 4.1 PDF

- Use a Node library to **extract text** from the PDF buffer.
- Examples:
  - **`pdf-parse`** (popular, simple API)
  - **`pdfjs-dist`** (Mozilla’s PDF.js – more control, heavier)
- Input: PDF buffer (from request body or multipart).  
- Output: string of text.  
- If the PDF is scanned (image-only), you get no text; then treat it like an image (see below) by converting PDF pages to images and using vision.

### 4.2 Office / text documents

- **DOCX**: e.g. **`mammoth`** – extracts plain text (and optionally HTML).  
- **Plain text**: use as-is (optionally normalize encoding).  
- **Other formats** (xlsx, etc.): add parsers as needed (e.g. `xlsx` for Excel) and extract text or table content to a string.

### 4.3 Images

- **Option A – Vision API**: Send the image (base64 or URL) to a **vision-capable model** (e.g. Groq’s vision model or OpenAI GPT-4V).  
  - Request: “Describe this image in detail” or “Summarize the content of this image.”  
  - Use that description as the “content” you then summarize or return.
- **Option B – OCR**: Use **Tesseract** (or similar) to get text from the image, then summarize the text with your existing text LLM.  
  - Better when the image is mostly text (screenshots, scanned docs).

**Recommendation:** Use a vision model for images (and for scanned PDFs if you render pages to images); use text extraction + your current LLM for PDFs and office docs.

---

## 5. Backend: One Possible Shape (Motia API Step)

- **Route**: e.g. `POST /chat/document` or `POST /chat` with optional attachments.
- **Request body (example with base64):**
  - `message`: optional user instruction (e.g. “Summarize”, “Focus on X”).
  - `attachments`: array of `{ type: "pdf" | "image" | "docx", name: string, content: string }` where `content` is base64.
- **Handler logic (pseudo):**
  1. Validate size and type (e.g. allow only pdf, image/*, docx).
  2. For each attachment:
     - **PDF**: Extract text with `pdf-parse` (or images for vision if no text).
     - **Image**: Call vision API with base64 image; get description/summary.
     - **Docx**: Extract text with `mammoth`.
  3. Combine: optional `message` + “Document content: …” (extracted text or vision output).
  4. Call your existing Groq text completion with a system prompt like: “You are a summarizer. Given the following document content (and optional user instruction), provide a clear, concise summary.”
  5. Return `{ reply: "<summary>" }` (and optionally per-attachment summaries if you want).

**Large or long-running jobs:**  
If processing can be slow (big PDFs, many pages), you can:
- Keep a **synchronous** endpoint with a timeout and size limit, or
- Use an **Event Step**: API step stores file/content (or reference) in state, emits to an event; event step does extraction + LLM and then stores result (e.g. in state or stream) so the client can poll or subscribe. Your existing Motia patterns (state, events) fit this.

---

## 6. LLM Usage Summary

| Input type | How you get “content” | Then |
|------------|------------------------|------|
| PDF (with text) | `pdf-parse` → text | Send text to Groq text model with “summarize” prompt |
| PDF (scan/image) | Render pages to images → vision API | Use vision model output as content; optionally summarize again with text model |
| Image | Vision API (or OCR) | Use description as summary or send to text model for shorter summary |
| DOCX / text | `mammoth` or raw text | Send text to Groq text model with “summarize” prompt |

Use a **single system prompt** for summarization so behavior is consistent: e.g. “Summarize the following document. If the user added an instruction, follow it. Reply in plain text, no markdown.”

---

## 7. Libraries to Add (Backend)

```bash
# In backend/
npm install pdf-parse mammoth
# Optional: for vision (if Groq vision model is used, you might only need fetch; else add SDK for the provider you choose)
```

- **pdf-parse**: extract text from PDF buffer.  
- **mammoth**: extract text from docx buffer.  
- **Vision**: Groq/OpenAI vision endpoints often accept base64 image in JSON; check their latest API docs.

---

## 8. Security and Limits

- **Validate file types** using allowed MIME types and/or magic bytes; reject everything else.
- **Limit file size** (e.g. 10 MB per file, 20 MB total per request) to avoid DoS and timeouts.
- **Limit number of files** per request (e.g. 5).
- **Do not** execute or interpret file content as code; only extract text or send to vision/LLM APIs.
- Prefer **short-lived storage** for raw bytes (e.g. in-memory or temp file deleted after processing); avoid storing unnecessary PII in state.

---

## 9. Minimal Implementation Order

1. **Backend**
   - Add `pdf-parse` and `mammoth`.
   - Create a new API step (e.g. `document-summarizer.step.ts`) with body: `message` (optional) + `attachments` (array of `{ type, name, content }`).
   - In handler: branch on `type`, extract text (or call vision for images), then call Groq with a summarization prompt; return `{ reply }`.
2. **Frontend**
   - Add file input (and optionally drag-drop), restrict to allowed types/sizes.
   - Build request with `message` + base64 `attachments`, call new endpoint.
   - Show the returned summary in the same chat UI (e.g. as assistant message).

After that you can add: multiple files, vision for images, async processing via Event Step, and clearer error messages (e.g. “Unsupported file type”, “File too large”).

---

## 10. Summary

- **Frontend**: File picker + optional message; send files as base64 or multipart; enforce type and size limits.
- **Backend**: One API step (or extended chat step) that accepts files, detects type, extracts text (PDF, docx) or uses vision (images), then runs your existing Groq text (or vision) model with a summarization prompt.
- **Libraries**: `pdf-parse`, `mammoth`, and a vision-capable model/API for images (and optionally for scanned PDFs).

This gives you a single agent-style endpoint that accepts “all types of docs” (images, PDFs, Word, etc.) and returns a summary, consistent with your current Motia + React + Groq setup.
