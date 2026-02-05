# PDF Summarizer – How It Works (Step by Step)

This document explains the end-to-end flow from when a user attaches a PDF in the chat until they see the summary.

---

## Why Two Phases? (Upload Then Summarize)

The backend runs your summarizer logic in a **separate child process**. On Windows, the command line passed to that process has a strict length limit (~8k characters). Sending the whole PDF (e.g. as base64) in the request body would make that payload huge and cause `spawn ENAMETOOLONG`. So we split into:

1. **Upload** – PDF is sent once as a file and stored on disk; the server returns a small **upload ID**.
2. **Summarize** – Only the **upload ID** (and optional message) is sent to the step, so the payload stays small and the child process can run without hitting the limit.

---

## Step-by-Step Flow

### 1. User selects a PDF in the chat

- **Where:** Frontend – `Chat.tsx`
- **What happens:**
  - User clicks the PDF (file) button or uses the hidden file input.
  - `handlePdfSelect` runs and sets `selectedPdf` to the chosen `File`.
  - The UI shows the file name and a remove (X) button.
  - User can optionally type a message (e.g. “Focus on the conclusion”).

---

### 2. User clicks Send

- **Where:** Frontend – `Chat.tsx` → `handleSend`
- **What happens:**
  - If there is a selected PDF, the code checks file size (max 10 MB), then:
    1. Calls **upload** to send the file.
    2. Then calls **summarize** with the returned `uploadId` (and optional message).

---

### 3. Upload request: PDF → server, server → temp file

- **Where:** Frontend `chatApi.uploadPdf` → Backend `POST /api/upload-pdf`
- **Frontend:**
  - Builds `FormData`, appends the file under the key `"file"`.
  - Sends `POST /api/upload-pdf` with that body (no JSON; multipart).
- **Backend:** `src/upload-pdf.js`
  - **Multer** receives the multipart request and saves the file to disk:
    - Directory: `os.tmpdir()/motia-pdf-uploads/` (e.g. `C:\Users\...\AppData\Local\Temp\motia-pdf-uploads\`).
    - Filename: `{uuid}.pdf` (e.g. `a1b2c3d4-e5f6-...pdf`).
  - Validates: only PDF, max 10 MB.
  - Responds with JSON: `{ uploadId: "<uuid>" }` (the UUID without `.pdf`).
- **Important:** This route is a normal Express route in the **main** process. The big file never goes into any “step payload,” so it never hits the Windows command-line limit.

---

### 4. Summarize request: only uploadId + optional message

- **Where:** Frontend `chatApi.summarizePdf` → Backend Motia step `POST /chat/summarize-pdf`
- **Frontend:**
  - Sends JSON: `{ uploadId: "<uuid>", message?: "Focus on the conclusion" }`.
  - Request body is small (dozens of characters).
- **Backend:** Motia runs the **DocumentSummarizer** step in a **child process** and passes this small body → no `ENAMETOOLONG`.

---

### 5. Step handler: read file, extract text, call LLM

- **Where:** Backend – `src/chat/document-summarizer.step.ts`
- **What happens (in order):**

| Step | Action |
|------|--------|
| 5.1 | Validate body (Zod): `uploadId` required, `message` optional. |
| 5.2 | Validate `uploadId` format (UUID) to avoid path traversal. |
| 5.3 | Build file path: `os.tmpdir()/motia-pdf-uploads/{uploadId}.pdf` (same directory as upload). |
| 5.4 | **Read** the PDF from disk: `fs.readFile(filePath)` → `Buffer`. If file is missing (e.g. expired), return 400 “Upload not found or expired”. |
| 5.5 | **Extract text** with `pdf-parse` (v1): `pdfParse(buffer)` → `{ text }`. If too little text (e.g. scanned PDF), return 400. |
| 5.6 | Build the prompt: optional user `message` + “Document content: …” (extracted text). |
| 5.7 | **Call Groq** (same as simple chat): system prompt “summarize and reply as JSON `{ "reply": "..." }`”, user content = that prompt. |
| 5.8 | Parse Groq’s response and return `{ reply: "<summary>" }` with status 200. |
| 5.9 | In a **finally** block, **delete** the temp file: `fs.unlink(filePath)` so uploads don’t pile up. |

---

### 6. Frontend shows the summary

- **Where:** Frontend – `Chat.tsx`
- **What happens:**
  - `summarizePdf` returns `{ reply }`.
  - The reply is pushed as an assistant message and the user sees the summary in the chat.
  - If upload or summarize fails, the error message from the backend (e.g. “PDF is too large”, “Upload not found”) is shown as an assistant message.

---

## Diagram (high level)

```
┌─────────────┐    1. Select PDF + optional message
│   User      │    2. Click Send
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────┐
│  Frontend (Chat.tsx)                                              │
│  • handleSend: if selectedPdf → uploadPdf(file) then              │
│               summarizePdf({ uploadId, message })                  │
└──────┬──────────────────────────────────────────────────────────┘
       │
       │  POST /api/upload-pdf (FormData: file)
       ▼
┌─────────────────────────────────────────────────────────────────┐
│  Backend – Main process (upload-pdf.js)                          │
│  • Multer saves file → os.tmpdir()/motia-pdf-uploads/{uuid}.pdf  │
│  • Response: { uploadId: "uuid" }                                 │
└──────┬──────────────────────────────────────────────────────────┘
       │
       │  POST /chat/summarize-pdf (JSON: { uploadId, message? })
       ▼
┌─────────────────────────────────────────────────────────────────┐
│  Backend – Child process (document-summarizer.step.ts)           │
│  • Read file from .../motia-pdf-uploads/{uploadId}.pdf            │
│  • pdf-parse(buffer) → text                                       │
│  • Groq LLM → summary                                             │
│  • Delete temp file (finally)                                     │
│  • Response: { reply: "..." }                                     │
└──────┬──────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────┐
│   User      │    Sees summary (or error) in chat
└─────────────┘
```

---

## Files involved

| File | Role |
|------|------|
| `frontend/src/components/Chat.tsx` | File picker, Send logic, calls upload then summarize, shows messages. |
| `frontend/src/services/chatApi.ts` | `uploadPdf` (FormData → `/api/upload-pdf`), `summarizePdf` (JSON → `/chat/summarize-pdf`). |
| `backend/src/upload-pdf.js` | Express route: receive multipart PDF, save to temp dir, return `uploadId`. |
| `backend/motia.config.ts` | Mounts the upload router with `app.use(createUploadRoute())`. |
| `backend/src/chat/document-summarizer.step.ts` | Motia step: read PDF by `uploadId`, extract text, call Groq, return summary, delete temp file. |

---

## Summary

1. **Upload** sends the PDF as a file to `/api/upload-pdf`; the server saves it under a UUID and returns **uploadId**.
2. **Summarize** sends only **uploadId** (and optional message) to the Motia step so the child process gets a small payload and avoids `ENAMETOOLONG`.
3. The step reads the PDF from the same temp directory, extracts text, calls the LLM, returns the summary, and then deletes the temp file.
