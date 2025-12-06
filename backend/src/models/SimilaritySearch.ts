import mongoose, { Schema, Document } from "mongoose";

export interface ISimilarityResult {
  caseId: string;
  title: string;
  similarity: number; // 0–1
}

export interface ISimilaritySearch extends Document {
  detectiveId: string;
  caseId?: string;
  description: string;
  createdAt: Date;
  results: ISimilarityResult[];
}

const similarityResultSchema = new Schema<ISimilarityResult>(
  {
    caseId: { type: String, required: true },
    title: { type: String, required: true },
    similarity: { type: Number, required: true },
  },
  { _id: false }
);

const similaritySearchSchema = new Schema<ISimilaritySearch>(
  {
    detectiveId: { type: String, required: true },
    caseId: { type: String },
    description: { type: String, required: true },
    results: [similarityResultSchema],
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const SimilaritySearch = mongoose.model<ISimilaritySearch>(
  "SimilaritySearch",
  similaritySearchSchema
);