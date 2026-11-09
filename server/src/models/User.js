import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 60 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  avatar: { type: String, default: "" },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  warningCount: { type: Number, default: 0 },
  lastSeen: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
