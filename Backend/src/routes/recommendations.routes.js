import express from "express";
import {
  getRecommendations,
  getRecommendationSummary,
  applyRecommendation,
  triggerGeneration,
} from "../controllers/recommendations.controller.js";

const router = express.Router();

router.get("/", getRecommendations);
router.get("/summary", getRecommendationSummary);
router.get("/generate", triggerGeneration);
router.patch("/:id/apply", applyRecommendation);

export default router;
