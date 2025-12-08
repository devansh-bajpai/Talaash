import { Request, Response, NextFunction } from "express";

// TEMP: In real app this comes from JWT
export function fakeDetectiveAuth(req: Request, _res: Response, next: NextFunction) {
  // attach a demo detective id on the request
  (req as any).user = {
    id: "det-001",
    role: "DETECTIVE",
  };
  next();
}