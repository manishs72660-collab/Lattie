import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
import { env } from "../config/env.js";
import { auth } from "../middleware/auth.js";
import { limit } from "../middleware/rateLimit.js";

const router = Router();
const sign = (u) => jwt.sign({ id: String(u._id), email: u.email }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
const publicUser = (u) => ({ id: String(u._id), name: u.name, email: u.email });

router.post("/register", limit("register", 10, 3600, (r) => r.ip), async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name?.trim() || !email?.includes("@") || (password || "").length < 6)
    return res.status(400).json({ error: "Enter a name, a valid email and a password of 6+ characters" });
  if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ error: "This email is already registered" });
  const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
  res.status(201).json({ token: sign(user), user: publicUser(user) });
});

router.post("/login", limit("login", 20, 900, (r) => r.ip), async (req, res) => {
  const { email, password } = req.body || {};
  const user = await User.findOne({ email: (email || "").toLowerCase() }).select("+password");
  if (!user || !(await bcrypt.compare(password || "", user.password))) return res.status(401).json({ error: "Wrong email or password" });
  res.json({ token: sign(user), user: publicUser(user) });
});

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(401).json({ error: "Account not found" });
  res.json({ user: publicUser(user) });
});

export default router;
