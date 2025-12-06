import { Request, Response } from "express";
import { Case, CaseStatus } from "../models/Case";

export async function getMyCases(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const detectiveId = user.id as string;

    const status = (req.query.status as string) || undefined;

    const filter: any = {
      assignedTo: detectiveId, // ✅ make sure your Case schema uses assignedTo
    };

    if (status) {
      const allowedStatuses: CaseStatus[] = ["PENDING", "RUNNING", "COMPLETED"];
      if (!allowedStatuses.includes(status as CaseStatus)) {
        return res.status(400).json({ message: "Invalid status filter" });
      }
      filter.status = status;
    }

    const cases = await Case.find(filter)
      .sort({ updatedAt: -1 })
      .limit(50)
      .lean();

    res.json({ cases });
  } catch (error) {
    console.error("Error in getMyCases:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// detective can mark their own case as completed (or change status)
export async function updateMyCaseStatus(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const detectiveId = user.id as string;
    const { caseId } = req.params;
    const { status } = req.body as { status?: CaseStatus };

    const allowedStatuses: CaseStatus[] = ["PENDING", "RUNNING", "COMPLETED"];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    if (!caseId) {
      return res.status(400).json({ message: "caseId is required" });
    }
    const existing = await Case.findOne({ caseId, assignedTo: detectiveId });
    if (!existing) {
      return res
        .status(404)
        .json({ message: "Case not found or not assigned to you" });
    }

    existing.status = status;
    await existing.save();

    return res.json({
      message: "Case status updated",
      case: {
        caseId: existing.caseId,
        status: existing.status,
        updatedAt: existing.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error in updateMyCaseStatus:", error);
    res.status(500).json({ message: "Server error" });
  }
}
