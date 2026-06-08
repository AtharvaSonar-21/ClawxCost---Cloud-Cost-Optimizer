import express from "express";
import { createBilling } from "../controllers/billing.controller.js";
import { uploadBillingFile } from "../controllers/billingUpload.controller.js";
import upload from "../middleware/fileUpload.middleware.js";

const router = express.Router();

router.post("/", createBilling);
router.post("/upload", upload.single("file"), uploadBillingFile);

export default router;