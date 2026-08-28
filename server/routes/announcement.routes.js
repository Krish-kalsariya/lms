import express from "express";
import {
  createAnnouncement,
  getAllAnnouncements,
  getInstructorAnnouncements,
  deleteAnnouncement,
  updateAnnouncement,
  togglePinAnnouncement,
  markAnnouncementsSeen,
  getUnreadAnnouncementStatus,
} from "../controllers/announcement.controller.js";

import { isAuthenticated, isInstructor } from "../middlewares/auth.js";

const router = express.Router();

/* Instructor */
router.post("/", isAuthenticated, isInstructor, createAnnouncement);
router.get("/instructor", isAuthenticated, isInstructor, getInstructorAnnouncements);
router.put("/:id", isAuthenticated, isInstructor, updateAnnouncement);
router.delete("/:id", isAuthenticated, isInstructor, deleteAnnouncement);
router.patch("/:id/pin", isAuthenticated, isInstructor, togglePinAnnouncement);

/* Student / Shared */
router.get("/", isAuthenticated, getAllAnnouncements);
router.post("/mark-seen", isAuthenticated, markAnnouncementsSeen);
router.get("/unread-status", isAuthenticated, getUnreadAnnouncementStatus);

export default router;
