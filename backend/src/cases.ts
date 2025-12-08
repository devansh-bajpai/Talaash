// import { Router, Request, Response } from "express";
// import { Case } from "./models/Case";
// import { User } from "./models/User";
// import { Types } from "mongoose";

// const router = Router();

// // Helper: map Mongo document to frontend CaseFile DTO
// function mapCaseToDTO(c: any) {
//   const id = String(c._id);
//   const reportedAt =
//     c.reportedAt instanceof Date
//       ? c.reportedAt.toISOString()
//       : new Date().toISOString();
//   const lastUpdatedAt =
//     c.lastUpdatedAt instanceof Date
//       ? c.lastUpdatedAt.toISOString()
//       : reportedAt;

//   return {
//     id,
//     caseNumber: c.caseNumber || `CASE-${id.slice(-6).toUpperCase()}`,
//     title: c.title || "Untitled case",
//     type: c.type || "General",
//     area: c.area || "Unknown",
//     status: c.status || "pending",

//     reportedAt,
//     lastUpdatedAt,

//     summary: c.summary || "",
//     location: c.location || "",
//     victim: c.victim || "",
//     suspects: Array.isArray(c.suspects) ? c.suspects : [],

//     assignedDetectiveId: c.assignedDetectiveId
//       ? String(c.assignedDetectiveId)
//       : null,

//     images: Array.isArray(c.images) ? c.images : [],
//     timeline: Array.isArray(c.timeline)
//       ? c.timeline.map((e: any) => ({
//           id: `${id}-${String(e._id || e.time || Math.random())}`,
//           time:
//             e.time instanceof Date
//               ? e.time.toISOString()
//               : new Date().toISOString(),
//           title: e.title || "",
//           description: e.description || "",
//         }))
//       : [],

//     notes: Array.isArray(c.notes) ? c.notes : [],
//     evidence: Array.isArray(c.evidence) ? c.evidence : [],
//   };
// }

// /**
//  * GET /api/cases/unassigned?limit=5
//  * Returns top {limit} unassigned cases (no assignedDetectiveId).
//  */
// router.get("/cases/unassigned", async (req: Request, res: Response) => {
//   try {
//     const limit = Number(req.query.limit) || 5;

//     const docs = await Case.find({
//       $or: [
//         { assignedDetectiveId: null },
//         { assignedDetectiveId: { $exists: false } },
//       ],
//     })
//       .sort({ reportedAt: -1, createdAt: -1 })
//       .limit(limit)
//       .lean();

//     const result = docs.map(mapCaseToDTO);
//     res.json(result);
//   } catch (err) {
//     console.error("Error in GET /api/cases/unassigned:", err);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// /**
//  * POST /api/cases/auto-assign
//  * Body: { limit?: number }
//  * Assigns top {limit} unassigned cases to detectives with least workload.
//  */
// router.post("/cases/auto-assign", async (req: Request, res: Response) => {
//   try {
//     const limit = Number(req.body?.limit) || 5;

//     const detectives = await User.find().lean();
//     if (!detectives.length) {
//       return res
//         .status(400)
//         .json({ message: "No detectives (users) found" });
//     }

//     const unassignedCases = await Case.find({
//       $or: [
//         { assignedDetectiveId: null },
//         { assignedDetectiveId: { $exists: false } },
//       ],
//     })
//       .sort({ reportedAt: -1, createdAt: -1 })
//       .limit(limit);

//     if (!unassignedCases.length) {
//       return res.json([]);
//     }

//     // Workload: open cases (status != solved) per detective
//     const openAssigned = await Case.find({
//       assignedDetectiveId: { $ne: null },
//       status: { $ne: "solved" },
//     }).lean();

//     const workload: Record<string, number> = {};
//     for (const d of detectives) {
//       workload[String(d._id)] = 0;
//     }

//     for (const doc of openAssigned) {
//       const c: any = doc; // <- fix TS complaint
//       const id = String(c.assignedDetectiveId);
//       if (workload[id] != null) workload[id] += 1;
//     }

//     // Assign each unassigned case to detective with least workload
//     for (const doc of unassignedCases) {
//       const c: any = doc; // treat as any while mutating

//       let chosen: any = null;
//       let minWork = Infinity;

//       for (const d of detectives) {
//         const id = String(d._id);
//         const w = workload[id] ?? 0;
//         if (w < minWork) {
//           minWork = w;
//           chosen = d;
//         }
//       }

//       if (chosen) {
//         c.assignedDetectiveId = new Types.ObjectId(chosen._id);
//         c.lastUpdatedAt = new Date();
//         const chosenId = String(chosen._id);
//         workload[chosenId] = (workload[chosenId] ?? 0) + 1;
//         await c.save();
//       }
//     }

//     const updated = unassignedCases.map((c) => mapCaseToDTO(c.toObject()));
//     res.json(updated);
//   } catch (err) {
//     console.error("Error in POST /api/cases/auto-assign:", err);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// export default router;

// backend/src/cases.ts
import { Router, Request, Response } from "express";
import { Case, ICase } from "./models/Case";
import { User } from "./models/User";

const router = Router();

/** Map raw DB case to the frontend CaseFile shape */
function mapCaseToDTO(c: ICase) {
  const id = String(c._id);

  // map your status (RUNNING / RESOLVED / etc.) to FE statuses
  const statusRaw = (c.status || "").toUpperCase();
  let status: "pending" | "unsolved" | "solved" = "pending";
  if (statusRaw === "RESOLVED" || statusRaw === "CLOSED") status = "solved";
  else if (statusRaw === "UNRESOLVED") status = "unsolved";

  const reportedAt = c.createdAt
    ? c.createdAt.toISOString()
    : new Date().toISOString();
  const lastUpdatedAt = c.updatedAt
    ? c.updatedAt.toISOString()
    : reportedAt;

  return {
    id,
    caseNumber: c.caseId || `CASE-${id.slice(-6).toUpperCase()}`,
    title: c.title,
    type: c.crimeType || "General",
    area: c.source || "Unknown",

    status,

    reportedAt,
    lastUpdatedAt,

    summary: c.description || "",
    location: c.source || "",
    victim: "",
    suspects: [],

    // 🔴 IMPORTANT: expose assignedTo as assignedDetectiveId for FE
    assignedDetectiveId: c.assignedTo || null,

    images: [],
    timeline: [],
    notes: [],
    evidence: [],
  };
}

/**
 * GET /api/cases/unassigned?limit=5
 * Returns top {limit} unassigned cases (assignedTo is null/empty).
 */
router.get("/cases/unassigned", async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 5;

    const docs = await Case.find({
      $or: [
        { assignedTo: null },
        { assignedTo: { $exists: false } },
        { assignedTo: "" },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(limit);

    const result = docs.map(mapCaseToDTO);
    res.json(result);
  } catch (err) {
    console.error("Error in GET /api/cases/unassigned:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * POST /api/cases/auto-assign
 * Body: { limit?: number }
 * Assigns top {limit} unassigned cases to detectives with least workload.
 * Workload = count of open (non-resolved) cases assigned to each detective.
 */
router.post("/cases/auto-assign", async (req: Request, res: Response) => {
  try {
    const limit = Number(req.body?.limit) || 5;

    // all users are detectives, as you said
    const detectives = await User.find().lean();
    if (!detectives.length) {
      return res
        .status(400)
        .json({ message: "No detectives (users) found" });
    }

    // get unassigned cases
    const unassignedCases = await Case.find({
      $or: [
        { assignedTo: null },
        { assignedTo: { $exists: false } },
        { assignedTo: "" },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(limit);

    if (!unassignedCases.length) {
      return res.json([]);
    }

    // open (non-resolved) cases currently assigned
    const openAssigned = await Case.find({
      assignedTo: { $nin: [null, ""] },
      status: { $ne: "RESOLVED" },
    }).lean();

    // workload per detective (key: user._id string)
    const workload: Record<string, number> = {};
    for (const d of detectives) {
      workload[String(d._id)] = 0;
    }

    for (const c of openAssigned) {
      const key = String(c.assignedTo);
      if (workload[key] != null) {
        workload[key] += 1;
      }
    }

    // assign each unassigned case to detective with fewest open cases
    for (const doc of unassignedCases) {
      const c: any = doc;

      let chosen: any = null;
      let minWork = Infinity;

      for (const d of detectives) {
        const key = String(d._id);
        const w = workload[key] ?? 0;
        if (w < minWork) {
          minWork = w;
          chosen = d;
        }
      }

      if (chosen) {
        const chosenId = String(chosen._id);

        // 🔴 IMPORTANT: write user _id into assignedTo
        c.assignedTo = chosenId;

        // keep your existing status; or ensure RUNNING here if you like
        // c.status = c.status || "RUNNING";

        await c.save();
        workload[chosenId] = (workload[chosenId] ?? 0) + 1;
      }
    }

    const updated = unassignedCases.map((c) => mapCaseToDTO(c));
    res.json(updated);
  } catch (err) {
    console.error("Error in POST /api/cases/auto-assign:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
