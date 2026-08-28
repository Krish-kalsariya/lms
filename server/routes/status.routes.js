import express from "express";
import { getStatus, getStatusPage } from "../controllers/status.controller.js";

const router = express.Router();

// JSON API endpoint
router.get("/api", getStatus);

// HTML Status Page
router.get("/", getStatusPage);

export default router;
