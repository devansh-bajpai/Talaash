import { Request, Response } from "express";
import {
  DetectiveRequest,
  IDetectiveRequest,
  RequestStatus,
} from "../models/DetectiveRequest";

/**
 * GET /api/detective/requests
 * Returns all requests created by the current detective.
 */
export async function getMyRequests(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const detectiveId = user.id as string;

    // optional status filter: ?status=PENDING
    const status = (req.query.status as string) || undefined;
    const filter: Partial<IDetectiveRequest> = {
      fromDetectiveId: detectiveId,
    };

    if (status) {
      const allowedStatuses: RequestStatus[] = [
        "PENDING",
        "RESOLVED",
        "REJECTED",
      ];
      if (!allowedStatuses.includes(status as RequestStatus)) {
        return res.status(400).json({ message: "Invalid status filter" });
      }
      (filter as any).status = status;
    }

    const requests = await DetectiveRequest.find(filter as any)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return res.json({ requests });
  } catch (error) {
    console.error("Error in getMyRequests:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

/**
 * POST /api/detective/requests
 * Body: { toStationId, caseId?, subject, message }
 */
export async function createRequest(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const detectiveId = user.id as string;

    const { toStationId, caseId, subject, message } = req.body as {
      toStationId?: string;
      caseId?: string;
      subject?: string;
      message?: string;
    };

    if (!toStationId || !subject || !message) {
      return res.status(400).json({
        message:
          "toStationId, subject, and message are required fields for a request.",
      });
    }

    const newRequest = await DetectiveRequest.create({
      fromDetectiveId: detectiveId,
      toStationId,
      caseId: caseId ?? undefined,
      subject: subject.trim(),
      message: message.trim(),
      status: "PENDING",
    });

    return res.status(201).json({ request: newRequest });
  } catch (error) {
    console.error("Error in createRequest:", error);
    return res.status(500).json({ message: "Server error" });
  }
}