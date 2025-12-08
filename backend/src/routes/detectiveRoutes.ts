import { Router } from "express";
import { fakeDetectiveAuth } from "../middleware/fakeAuth";
import { getMyCases, updateMyCaseStatus, } from "../controllers/detectiveCasesController";
import { createSimilaritySearch } from "../controllers/detectiveSimilarityController";
import {
  getMyRequests,
  createRequest,
} from "../controllers/detectiveRequestController";

const router = Router();

router.use(fakeDetectiveAuth);

router.get("/my-cases", getMyCases);
router.patch("/my-cases/:caseId/status", updateMyCaseStatus);
router.post("/similarity-search", createSimilaritySearch);
router.get("/requests", getMyRequests);
router.post("/requests", createRequest);
router.post(
    "/similarity-search",
    createSimilaritySearch
  );

export default router;