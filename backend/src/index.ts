// backend/src/index.ts
import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createUser, findUserByEmail, findUserById } from "./users";

const app = express();

const PORT = process.env.PORT || 8000;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key-change-me";

app.use(express.json());

// Allow frontend at localhost:3000
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: false,
  })
);

// Simple health check
app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "TS backend is running" });
});

// SIGNUP
app.post("/auth/signup", async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body as {
      name?: string;
      email?: string;
      password?: string;
    };

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    await createUser(name, email, password);

    return res
      .status(201)
      .json({ message: "User created successfully" });
  } catch (err: any) {
    if (err.message === "Email already registered") {
      return res.status(400).json({ message: err.message });
    }
    console.error("Signup error:", err);
    return res
      .status(500)
      .json({ message: "Something went wrong on signup" });
  }
});

// LOGIN
app.post("/auth/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = findUserByEmail(email);
    if (!user) {
      return res
        .status(401)
        .json({ message: "Incorrect email or password" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res
        .status(401)
        .json({ message: "Incorrect email or password" });
    }

    const token = jwt.sign({ sub: String(user.id) }, JWT_SECRET, {
      expiresIn: "60m",
    });

    return res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    return res
      .status(500)
      .json({ message: "Something went wrong on login" });
  }
});

// GET CURRENT USER
app.get("/me", (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const token = authHeader.split(" ")[1];

    const payload = jwt.verify(token as string, JWT_SECRET) as { sub?: string };

    

    const userId = payload.sub ? Number(payload.sub) : undefined;

    if (!userId) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const user = findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    console.error("ME error:", err);
    return res.status(401).json({ message: "Invalid token" });
  }
});

app.listen(PORT, () => {
  console.log(`Auth backend listening on http://localhost:${PORT}`);
});
