// backend/src/db.ts
import mongoose from "mongoose";

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;

  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("❌ MONGO_URI is undefined. Available env keys:", Object.keys(process.env));
    throw new Error("MONGO_URI not set in environment");
  }

  await mongoose.connect(uri);
  isConnected = true;
  console.log("✅ Connected to MongoDB");
}
