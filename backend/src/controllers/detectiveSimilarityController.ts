import { Request, Response } from "express";
import {
  SimilaritySearch,
  ISimilarityResult,
  ISimilaritySearch,
} from "../models/SimilaritySearch";
import { Case } from "../models/Case";

export async function createSimilaritySearch(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const detectiveId = user.id as string;

    const { description, caseId } = req.body as {
      description?: string;
      caseId?: string;
    };

    if (!description || description.trim().length < 10) {
      return res.status(400).json({
        message:
          "Please provide a case description of at least 10 characters for similarity search.",
      });
    }

    const sampleCases = await Case.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    const results: ISimilarityResult[] = sampleCases.map((c, index) => ({
      caseId: c._id.toString(),
      title: c.title,
      similarity: 0.9 - index * 0.1,
    }));

    // 👇 This is fine *once the model/interface is correct*
    const search = (await SimilaritySearch.create({
      detectiveId,
      caseId, // caseId is already optional, no need for ternary
      description: description.trim(),
      results,
    })) as ISimilaritySearch;

    return res.status(201).json({
      searchId: search._id,
      results: search.results,
    });
  } catch (error) {
    console.error("Error in createSimilaritySearch:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
