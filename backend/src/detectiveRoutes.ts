// backend/src/detectivesRoutes.ts
import { Router, Request, Response } from "express";
import { User } from "./models/User";

const router = Router();

// safer helper for initials
function getInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .map((part: string) => part.charAt(0).toUpperCase()) // <-- charAt(0) instead of [0]
      .join("")
      .slice(0, 2) || "DT"
  );
}

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

      const avatarInitials = getInitials(name);
      const badgeId =
        u.badgeId || `DET-${id.slice(-4).toUpperCase()}`;
      const rating = typeof u.rating === "number" ? u.rating : 4.5;

      return {
        id,
        name,
        badgeId,
        avatarInitials,
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
