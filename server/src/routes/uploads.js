import { Router } from "express";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { protect } from "../middleware/auth.js";
import crypto from "crypto";

const router = Router();
router.post("/presign", protect, async (req, res) => {
  const { fileName, contentType, size } = req.body;
  if (!fileName || !contentType || !Number.isFinite(size) || size > 10 * 1024 * 1024 || size <= 0)
    return res.status(400).json({ message: "Choose a file smaller than 10 MB" });
  if (!process.env.AWS_S3_BUCKET || !process.env.AWS_REGION)
    return res.status(503).json({ message: "Cloud uploads are not configured. Use local development or configure S3." });
  const safeName = String(fileName).replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
  const key = `chat/${req.user._id}/${crypto.randomUUID()}-${safeName}`;
  const s3 = new S3Client({ region: process.env.AWS_REGION });
  const command = new PutObjectCommand({ Bucket: process.env.AWS_S3_BUCKET, Key: key, ContentType: contentType });
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
  res.json({ uploadUrl, key, fileUrl: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}` });
});
export default router;
