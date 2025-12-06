import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import { connectDB } from "./db";
import { createUser, findUserByEmail, findUserById } from "./userService";
import casesRouter from "./cases";
import detectiveRouter from "./routes/detectiveRoutes";  // ⭐ ROUTER IMPORT

dotenv.config();

const app = express();

/* ---------------- GLOBAL MIDDLEWARE ---------------- */
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Manual headers (optional but safe)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

/* ---------------- CONNECT TO DB ---------------- */
connectDB();

const JWT_SECRET = process.env.JWT_SECRET as string;

/* ---------------- SIGNUP ---------------- */
app.post("/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await createUser(name, email, password);

    const token = jwt.sign({ id: user._id }, JWT_SECRET);
    res.json({ message: "Signup successful", token });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/* ---------------- LOGIN ---------------- */
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await findUserByEmail(email);
  if (!user) return res.status(404).json({ error: "User not found" });

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) return res.status(401).json({ error: "Invalid password" });

  const token = jwt.sign({ id: user._id }, JWT_SECRET);
  res.json({ message: "Login successful", token });
});

/* ---------------- AUTH MIDDLEWARE ---------------- */
function authMiddleware(req: any, res: any, next: any) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

/* ---------------- PROTECTED: CURRENT USER ---------------- */
app.get("/me", authMiddleware, async (req: any, res) => {
  const user = await findUserById(req.userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
  });
});

/* ---------------- NEW API ROUTES ---------------- */
app.use("/api", casesRouter);
app.use("/api", detectiveRouter);

/* ----------------------------------------------------- */

/* ---------------- SERVER ---------------- */
app.listen(8000, () => {
  console.log("Server running on port http://localhost:8000");
});