import { Router } from "express";
import mongoose from "mongoose";
import Room from "../models/Room.js";
import User from "../models/User.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();
router.get("/", protect, async (req, res) => {
  const rooms = await Room.find({ members: req.user._id }).populate("members", "name email").sort({ updatedAt: -1 });
  res.json({ rooms });
});
router.post("/", protect, async (req, res) => {
  const { name, memberIds = [] } = req.body;
  if (!name?.trim()) return res.status(400).json({ message: "Room name is required" });
  const ids = [...new Set([String(req.user._id), ...memberIds.map(String)])];
  if (ids.some(id => !mongoose.isValidObjectId(id))) return res.status(400).json({ message: "Invalid member ID" });
  const count = await User.countDocuments({ _id: { $in: ids } });
  if (count !== ids.length) return res.status(400).json({ message: "One or more users do not exist" });
  const room = await Room.create({ name: name.trim(), members: ids, createdBy: req.user._id, type: "group" });
  res.status(201).json({ room });
});

router.post("/direct/:userId", protect, async (req, res) => {
  const otherId = req.params.userId;
  if (!mongoose.isValidObjectId(otherId) || String(req.user._id) === otherId)
    return res.status(400).json({ message: "Choose another valid user" });
  const other = await User.findById(otherId);
  if (!other) return res.status(404).json({ message: "User not found" });
  const members = [String(req.user._id), otherId].sort();
  let room = await Room.findOne({ type: "direct", members: { $all: members, $size: 2 } });
  if (!room) {
    room = await Room.create({
      name: `${req.user.name} & ${other.name}`,
      type: "direct", members, createdBy: req.user._id
    });
  }
  room = await room.populate("members", "name email");
  res.json({ room });
});

router.post("/:roomId/kick", protect, adminOnly, async (req, res) => {
  const { userId } = req.body;
  const room = await Room.findById(req.params.roomId);
  if (!room) return res.status(404).json({ message: "Room not found" });
  room.members = room.members.filter(id => String(id) !== String(userId));
  if (!room.kickedUsers.some(id => String(id) === String(userId))) room.kickedUsers.push(userId);
  await room.save();
  req.app.get("io").to(String(userId)).emit("room:kicked", { roomId: String(room._id), message: "You were removed from a chat room." });
  req.app.get("io").in(String(userId)).socketsLeave(String(room._id));
  res.json({ message: "User removed from room" });
});
export default router;
