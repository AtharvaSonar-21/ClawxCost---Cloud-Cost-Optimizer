import express from "express";
import { getSummary, estimateCost } from "../controllers/analytics.controller.js";
import {
  getSummary as getConsolidatedSummary,
  getTrends,
  getIncidents,
  getRecommendations,
  getComprehensive,
} from "../controllers/analytics-consolidated.controller.js";

const router = express.Router();

// Original summary endpoint
router.get("/summary", getSummary);
router.post("/estimate", estimateCost);

// Consolidated analytics endpoints
router.get("/cost-summary", getConsolidatedSummary);
router.get("/trends", getTrends);
router.get("/incidents", getIncidents);
router.get("/recommendations", getRecommendations);
router.get("/comprehensive", getComprehensive);

export default router;
