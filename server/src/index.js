import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { Server } from "socket.io";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";
import Room from "./models/Room.js";
import Message from "./models/Message.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import roomRoutes from "./routes/rooms.js";
import messageRoutes from "./routes/messages.js";
import uploadRoutes from "./routes/uploads.js";
import jwt from "jsonwebtoken";

const app = express();
const server = http.createServer(app);
const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";
const io = new Server(server, { cors: { origin: allowedOrigin, methods: ["GET", "POST"] } });
const onlineUsers = new Map();
app.set("io", io);
app.set("onlineUsers", onlineUsers);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: allowedOrigin }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "Cloud Chat API" }));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/uploads", uploadRoutes);

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);
    if (!user) return next(new Error("Unauthorized"));
    socket.user = user;
    next();
  } catch { next(new Error("Unauthorized")); }
});

io.on("connection", (socket) => {
  const userId = String(socket.user._id);
  socket.join(userId);
  const sockets = onlineUsers.get(userId) || new Set();
  sockets.add(socket.id);
  onlineUsers.set(userId, sockets);
  io.emit("presence:update", [...onlineUsers.keys()]);

  socket.on("room:join", async ({ roomId } = {}) => {
    try {
      const room = await Room.findById(roomId);
      if (!room || !room.members.some(id => String(id) === userId) ||
          room.kickedUsers.some(id => String(id) === userId)) {
        socket.emit("room:error", { message: "You cannot join this room." }); return;
      }
      socket.join(String(room._id));
    } catch { socket.emit("room:error", { message: "Could not join room." }); }
  });

  socket.on("message:send", async (payload = {}) => {
    try {
      const { roomId, text = "", attachment = null } = payload;
      if ((!String(text).trim() && !attachment) || String(text).length > 5000) return;
      const room = await Room.findById(roomId);
      if (!room || !room.members.some(id => String(id) === userId) ||
          room.kickedUsers.some(id => String(id) === userId)) {
        socket.emit("room:error", { message: "You are not allowed to send to this room." }); return;
      }
      const message = await Message.create({
        room: room._id, sender: socket.user._id, text: String(text).trim(),
        attachment: attachment || undefined, readBy: [socket.user._id]
      });
      await Room.updateOne({ _id: room._id }, { $set: { updatedAt: new Date() } });
      const populated = await message.populate("sender", "name avatar");
      io.to(String(room._id)).emit("message:new", populated);
    } catch { socket.emit("room:error", { message: "Message could not be sent." }); }
  });

  socket.on("typing:start", ({ roomId } = {}) => socket.to(String(roomId)).emit("typing:update", { roomId, user: socket.user.name, typing: true }));
  socket.on("typing:stop", ({ roomId } = {}) => socket.to(String(roomId)).emit("typing:update", { roomId, user: socket.user.name, typing: false }));

  socket.on("disconnect", async () => {
    const active = onlineUsers.get(userId);
    active?.delete(socket.id);
    if (!active?.size) {
      onlineUsers.delete(userId);
      await User.updateOne({ _id: userId }, { lastSeen: new Date() });
    }
    io.emit("presence:update", [...onlineUsers.keys()]);
  });
});

const port = process.env.PORT || 5000;
connectDB().then(() => server.listen(port, () => console.log(`Cloud Chat API listening on ${port}`)))
  .catch(err => { console.error(err); process.exit(1); });
