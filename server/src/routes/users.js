import { Router } from "express";
import User from "../models/User.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();
router.get("/", protect, async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user._id } }).select("name email avatar role lastSeen").sort("name");
  res.json({ users });
});
router.get("/online", protect, (req, res) => {
  const onlineIds = req.app.get("onlineUsers");
  res.json({ online: [...onlineIds].filter(([id]) => id !== String(req.user._id)).map(([id, sockets]) => ({ id, sockets })) });
});
router.get("/admin/all", protect, adminOnly, async (_req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json({ users });
});
router.post("/admin/warn/:userId", protect, adminOnly, async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.userId, { $inc: { warningCount: 1 } }, { new: true }).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  req.app.get("io").to(String(user._id)).emit("moderation:warning", { message: "An administrator has issued a warning." });
  res.json({ message: "Warning sent", user });
});
export default router;
