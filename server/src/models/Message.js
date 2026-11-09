import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true, index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, default: "", maxlength: 5000 },
  attachment: {
    url: String, name: String, mimeType: String, size: Number
  },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true });

messageSchema.index({ room: 1, createdAt: -1 });
export default mongoose.model("Message", messageSchema);
