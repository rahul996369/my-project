/**
 * Express route for PDF upload. Saves file to temp dir and returns uploadId.
 * This runs in the main process so the request body (multipart) is never passed to the step process.
 */
import express from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { randomUUID } from 'node:crypto';

const UPLOAD_DIR = path.join(os.tmpdir(), 'motia-pdf-uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

try {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
} catch (_) {}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, _file, cb) => cb(null, `${randomUUID()}.pdf`),
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

export function getUploadDir() {
  return UPLOAD_DIR;
}

export function createUploadRoute() {
  const router = express.Router();
  router.post(
    '/api/upload-pdf',
    upload.single('file'),
    (req, res) => {
      if (!req.file) {
        return res.status(400).json({ error: 'No PDF file provided' });
      }
      const uploadId = path.basename(req.file.filename, '.pdf');
      res.json({ uploadId });
    },
    (err, _req, res, _next) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'PDF is too large. Maximum size is 10 MB.' });
        }
        return res.status(400).json({ error: err.message });
      }
      if (err) {
        return res.status(400).json({ error: err.message || 'Upload failed' });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  );
  return router;
}
