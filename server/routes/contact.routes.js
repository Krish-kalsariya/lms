import express from "express";
import {
  createContactMessage,
  getAllContactMessages,
} from "../controllers/contact.controller.js";
import { isAuthenticated, isInstructor } from "../middlewares/auth.js";

const router = express.Router();

// PUBLIC: Contact Us form
router.post("/", createContactMessage);

// INSTRUCTOR: View messages
router.get(
  "/messages",
  isAuthenticated,
  isInstructor,
  getAllContactMessages
);

export default router;
