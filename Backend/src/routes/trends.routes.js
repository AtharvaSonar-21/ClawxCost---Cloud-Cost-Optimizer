import express from "express";
import { getTrendAnalysis } from "../controllers/trends.controller.js";

const router = express.Router();

router.get("/analyze", getTrendAnalysis);

export default router;
