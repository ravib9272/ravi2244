import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  type: { type: String, enum: ["group", "direct"], default: "group" },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  kickedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true });

roomSchema.index({ members: 1, updatedAt: -1 });
export default mongoose.model("Room", roomSchema);
