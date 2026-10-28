import { Router } from "express";
import multer from "multer";
import { randomUUID } from "crypto";
import { auth } from "../middleware/auth.js";
import { limit } from "../middleware/rateLimit.js";
import { ingestDocument } from "../ingestion/ingest.js";
import { env } from "../config/env.js";
import { createDocument, deleteDocumentData, getDocument, listDocuments } from "../utils/documentStore.js";
import { deleteOriginal, uploadOriginal } from "../utils/cloudinary.js";

const router = Router();
router.use(auth);

const ALLOWED = [".pdf", ".txt", ".md"];
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.MAX_FILE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = ALLOWED.some((ext) => file.originalname.toLowerCase().endsWith(ext));
    cb(ok ? null : new Error("Only PDF, TXT and MD files are supported"), ok);
  },
});

router.get("/", async (req, res) => {
  res.json({ documents: await listDocuments(req.user.id) });
});

router.post("/upload", limit("upload", 10, 3600), (req, res, next) => {
  upload.single("file")(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        error: error.code === "LIMIT_FILE_SIZE" ? `File is larger than ${env.MAX_FILE_MB} MB` : error.message,
      });
    }
    next();
  });
}, async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Choose a file to upload" });

  const docId = randomUUID();
  let uploaded;
  try {
    uploaded = await uploadOriginal(req.file.buffer, docId);
    const document = await createDocument({
      docId,
      userId: req.user.id,
      name: req.file.originalname,
      size: req.file.size,
      cloudinaryPublicId: uploaded.public_id,
    });
    res.status(202).json({ document });
    void ingestDocument({
      docId,
      userId: req.user.id,
      buffer: req.file.buffer,
      mimetype: req.file.mimetype,
      filename: req.file.originalname,
    });
  } catch (error) {
    if (uploaded?.public_id) {
      try {
        await deleteOriginal(uploaded.public_id);
      } catch (cleanupError) {
        console.error("Could not clean up failed upload:", cleanupError);
      }
    }
    console.error("Document upload failed:", error);
    res.status(502).json({ error: "Could not store the uploaded document. Check Qdrant and Cloudinary configuration." });
  }
});

router.delete("/:id", async (req, res) => {
  const document = await getDocument(req.user.id, req.params.id);
  if (!document) return res.status(404).json({ error: "Document not found" });
  await deleteDocumentData(req.user.id, req.params.id);
  await deleteOriginal(document.cloudinaryPublicId);
  res.json({ ok: true });
});

export default router;
