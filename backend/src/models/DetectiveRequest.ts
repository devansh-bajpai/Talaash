import mongoose, { Schema, Document } from "mongoose";

export type RequestStatus = "PENDING" | "RESOLVED" | "REJECTED";

export interface IDetectiveRequest extends Document {
  fromDetectiveId: string;
  toStationId: string;
  caseId?: string;
  subject: string;
  message: string;
  status: RequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

const detectiveRequestSchema = new Schema<IDetectiveRequest>(
  {
    fromDetectiveId: { type: String, required: true },
    toStationId: { type: String, required: true },
    caseId: { type: String },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["PENDING", "RESOLVED", "REJECTED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

export const DetectiveRequest = mongoose.model<IDetectiveRequest>(
  "DetectiveRequest",
  detectiveRequestSchema
);