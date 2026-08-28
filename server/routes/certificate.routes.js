import express from "express";
import { generateCertificate } from "../controllers/certificate.controller.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.get(
"/:courseId",isAuthenticated,generateCertificate
);

export default router;
