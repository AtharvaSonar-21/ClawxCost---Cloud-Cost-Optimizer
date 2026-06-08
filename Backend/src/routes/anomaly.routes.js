import express from "express";
import {
  getIncidents,
  getIncidentsSummary,
  acknowledgeIncident,
  triggerDetection,
} from "../controllers/anomaly.controller.js";

const router = express.Router();

router.get("/", getIncidents);
router.get("/summary", getIncidentsSummary);
router.post("/detect", triggerDetection);
router.patch("/:id/acknowledge", acknowledgeIncident);

export default router;
