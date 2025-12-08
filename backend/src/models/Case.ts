import mongoose, { Schema, Document, Model } from "mongoose";

export type CaseStatus = "PENDING" | "RUNNING" | "COMPLETED";

export interface ICase extends Document {
  caseId: string;          // human-readable case code
  title: string;           // short case name
  description: string;     // detailed report
  source: string;          // source station / department
  assignedTo?: string;     // detective ID
  status: CaseStatus;      // case stage

  // NEW FIELDS
  crimeType?: string;      // e.g. "robbery", "fraud", "homicide"
  weapons?: string[];      // e.g. ["gun", "knife"]
  
  createdAt: Date;
  updatedAt: Date;
}

const caseSchema = new Schema<ICase>(
  {
    caseId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    source: {
      type: String,
      required: true,
    },

    assignedTo: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["PENDING", "RUNNING", "COMPLETED"],
      default: "PENDING",
    },

    // NEW FIELDS
    crimeType: {
      type: String,
      default: null,
      trim: true,
    },

    weapons: {
      type: [String],  // array of strings
      default: [],
    },
  },
  {
    timestamps: true, // auto adds createdAt, updatedAt
  }
);

export const Case: Model<ICase> =
  mongoose.models.Case || mongoose.model<ICase>("Case", caseSchema);