import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISimilaritySearch extends Document {
  detectiveId: string;       // who made the search
  description: string;       // text from the textarea
  caseId?: string;           // optional case link
  createdAt: Date;
  updatedAt: Date;
}

const similaritySearchSchema = new Schema<ISimilaritySearch>(
  {
    detectiveId: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    caseId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
  }
);

export const SimilaritySearch: Model<ISimilaritySearch> =
  mongoose.models.SimilaritySearch ||
  mongoose.model<ISimilaritySearch>("SimilaritySearch", similaritySearchSchema);