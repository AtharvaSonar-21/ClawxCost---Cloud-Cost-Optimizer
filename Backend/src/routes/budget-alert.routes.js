import express from "express";
import {
  getBudgetConfig,
  updateBudgetConfig,
  getBudgetStatus,
  getBudgetAlerts,
} from "../controllers/budget-alert.controller.js";

const router = express.Router();

router.get("/config", getBudgetConfig);
router.put("/config", updateBudgetConfig);
router.get("/status", getBudgetStatus);
router.get("/alerts", getBudgetAlerts);

export default router;
