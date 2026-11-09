import { Router } from "express";
import Message from "../models/Message.js";
import Room from "../models/Room.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.get("/:roomId", protect, async (req, res) => {
  const room = await Room.findById(req.params.roomId);
  if (!room) return res.status(404).json({ message: "Room not found" });
  const member = room.members.some(id => String(id) === String(req.user._id));
  if (!member) return res.status(403).json({ message: "You are not a member of this room" });
  const messages = await Message.find({ room: room._id })
    .populate("sender", "name avatar").sort({ createdAt: 1 }).limit(200);
  res.json({ messages });
});
export default router;
