// backend/src/models/Case.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ICase extends Document {
  caseId: string;          // "CASE-2025-001"
  title: string;
  description: string;
  source: string;          // e.g. "Station Alpha"
  assignedTo?: string | null; // user _id as string, or null if unassigned
  status: string;          // e.g. "RUNNING", "RESOLVED"
  crimeType: string;       // e.g. "Robbery"
  weapons: string[];       // array of weapon names/strings

  // timestamps added automatically by mongoose
  createdAt?: Date;
  updatedAt?: Date;
}

const CaseSchema = new Schema<ICase>(
  {
    caseId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    source: { type: String, default: "" },
    assignedTo: { type: String, default: null },
    status: { type: String, default: "RUNNING" },
    crimeType: { type: String, default: "General" },
    weapons: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Case =
  (mongoose.models.Case as mongoose.Model<ICase>) ||
  mongoose.model<ICase>("Case", CaseSchema);
