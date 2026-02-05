# PDF summarizer – steps (frontend + backend)

Summary of what was implemented and how to run it.

---

## Backend steps

1. **Install dependency**
   - In `backend/`: `npm install pdf-parse`

2. **New API step**
   - File: `backend/src/chat/document-summarizer.step.ts`
   - **Route**: `POST /chat/summarize-pdf`
   - **Body**: `{ pdfBase64: string, message?: string }`
   - **Flow**:
     - Validate body (Zod).
     - Enforce max PDF size (~10 MB base64).
     - Decode base64 → Buffer.
     - Extract text with `PDFParse` from `pdf-parse`.
     - If too little text (e.g. scanned PDF), return 400 with a clear error.
     - Build user content: optional `message` + “Document content: …” (extracted text).
     - Call Groq with a “summarize” system prompt.
     - Return `{ reply: string }` (same shape as existing chat).

3. **Generate Motia types**
   - In `backend/`: `npx motia generate-types`

4. **Run backend**
   - `npm run dev` in `backend/`
   - Ensure `GROQ_API_KEY` is set in the environment.

---

## Frontend steps

1. **New API usage**
   - In `frontend/src/services/chatApi.ts`:
     - Add `SummarizePdfRequest` and `SummarizePdfResponse` (or reuse `ChatResponse`).
     - Add `summarizePdf` mutation calling `POST /chat/summarize-pdf` with `{ pdfBase64, message? }`.
     - Export `useSummarizePdfMutation`.

2. **Chat UI**
   - In `frontend/src/components/Chat.tsx`:
     - State: `selectedPdf: File | null`.
     - Hidden `<input type="file" accept=".pdf,application/pdf" />` and an “Attach PDF” button that triggers it.
     - On file select: set `selectedPdf`, optionally show file name and a “Remove” control.
     - Max size check (e.g. 10 MB); show error in chat if exceeded.
     - **Send behaviour**:
       - If `selectedPdf` is set: read file as base64 (e.g. `FileReader.readAsDataURL`, then strip data URL prefix), call `summarizePdf({ pdfBase64, message: input.trim() || undefined })`, show user message like “📎 filename.pdf” (+ optional instruction), then show assistant `reply` as the summary.
       - Else: keep existing text chat (current `processChat`).
     - Clear `selectedPdf` after send.
     - Send button enabled when there is either text or a selected PDF.

3. **Run frontend**
   - `npm run dev` in `frontend/`
   - Point API base URL to your backend (e.g. via `frontend/src/config/env.ts`).

---

## Flow at a glance

| Step | Where | What |
|------|--------|------|
| 1 | Frontend | User attaches a PDF (and optionally types an instruction). |
| 2 | Frontend | On Send: read PDF as base64, call `POST /chat/summarize-pdf` with `{ pdfBase64, message? }`. |
| 3 | Backend | Validate request, decode base64, extract text with `pdf-parse`. |
| 4 | Backend | Call Groq with “summarize this document” (+ optional user instruction). |
| 5 | Backend | Return `{ reply: "<summary>" }`. |
| 6 | Frontend | Show summary as the next assistant message in the chat. |

---

## Limits and errors

- **Max PDF size**: ~10 MB (enforced on frontend and backend).
- **Scanned/image-only PDFs**: Backend returns a 400 explaining that text could not be extracted.
- **Invalid base64 or non-PDF**: Backend returns 400 with a short error message; frontend can show it in chat.
