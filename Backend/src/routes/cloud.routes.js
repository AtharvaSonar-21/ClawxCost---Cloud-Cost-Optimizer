import express from "express";
import {
  listConnections,
  connectCloudAccount,
  disconnectCloudAccount,
  syncCloudConnection,
} from "../controllers/cloud.controller.js";

const router = express.Router();

router.get("/connections", listConnections);
router.post("/connect", connectCloudAccount);
router.post("/connections/:id/sync", syncCloudConnection);
router.delete("/connections/:id", disconnectCloudAccount);

export default router;
