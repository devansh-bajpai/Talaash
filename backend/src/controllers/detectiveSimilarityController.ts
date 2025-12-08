import { Request, Response } from "express";
import { SimilaritySearch } from "../models/SimilaritySearch";

export async function createSimilaritySearch(req: Request, res: Response) {
  try {
    // if you have auth, user will be set by auth middleware
    const user = (req as any).user;
    const detectiveId = user?.id || "demo-detective"; // fallback for now

    const { description, caseId } = req.body as {
      description?: string;
      caseId?: string;
    };

    if (!description || !description.trim()) {
      return res.status(400).json({ message: "description is required" });
    }

    const search = await SimilaritySearch.create({
      detectiveId,
      description: description.trim(),
      caseId: caseId || undefined,
    });

    return res.status(201).json({
      message: "Similarity search saved",
      search,
    });
  } catch (error) {
    console.error("Error in createSimilaritySearch:", error);
    return res.status(500).json({ message: "Server error" });
  }
}