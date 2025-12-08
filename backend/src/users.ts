// backend/src/users.ts
import { Router, Request, Response } from "express";
import { User } from "./models/User";

const router = Router();

/**
 * GET /api/detectives
 * Returns all users (treated as detectives) in the shape needed by frontend.
 */
router.get("/detectives", async (req: Request, res: Response) => {
  try {
    const users = await User.find().lean();

    const detectives = users.map((u: any) => {
      const id = String(u._id);
      const name: string = u.name ?? "Unknown Detective";

      // ✅ use charAt(0) instead of [0] to avoid TS "possibly undefined"
      const initials =
        name
          .split(" ")
          .filter(Boolean)
          .map((part: string) => part.charAt(0).toUpperCase())
          .join("")
          .slice(0, 2) || "DT";

      const badgeId =
        u.badgeId || `DET-${id.slice(-4).toUpperCase()}`;

      const rating = typeof u.rating === "number" ? u.rating : 4.5;

      return {
        id,
        name,
        badgeId,
        avatarInitials: initials,
        rating,
      };
    });

    res.json(detectives);
  } catch (err) {
    console.error("Error in GET /api/detectives:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
