import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = Router();
const makeToken = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN || "7d"
});
const publicUser = (u) => ({
  id: u._id, name: u.name, email: u.email, avatar: u.avatar,
  role: u.role, warningCount: u.warningCount
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !/^\S+@\S+\.\S+$/.test(email))
      return res.status(400).json({ message: "Enter a valid name and email" });
    if (typeof password !== "string" || password.length < 8)
      return res.status(400).json({ message: "Password must contain at least 8 characters" });
    if (await User.exists({ email: email.toLowerCase() }))
      return res.status(409).json({ message: "An account with this email already exists" });
    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({ name: name.trim(), email, password: hash });
    res.status(201).json({ token: makeToken(user), user: publicUser(user) });
  } catch (e) { res.status(500).json({ message: "Could not create account" }); }
});

router.post("/login", async (req, res) => {
  try {
    const email = String(req.body.email || "").toLowerCase().trim();
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await bcrypt.compare(req.body.password || "", user.password)))
      return res.status(401).json({ message: "Incorrect email or password" });
    res.json({ token: makeToken(user), user: publicUser(user) });
  } catch { res.status(500).json({ message: "Login failed" }); }
});

router.get("/me", protect, (req, res) => res.json({ user: publicUser(req.user) }));
export default router;
