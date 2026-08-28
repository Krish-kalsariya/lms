import express from "express"
import {
  getCourseProgress,
  updateLectureProgress,
  markAsCompleted,
  markAsInCompleted
} from "../controllers/courseProgress.controller.js";

import { isAuthenticated } from "../middlewares/auth.js"
const router = express.Router()

//getCourseProgress
router.get("/:courseId" , isAuthenticated , getCourseProgress);

//updateLectureProgress
router.post("/:courseId/lecture/:lectureId/view" , isAuthenticated , updateLectureProgress)

// //markAsCompleted
// router.post("/:courseId/complete" , isAuthenticated , markAsCompleted)

// //markAsInCompleted
// router.post("/:courseId/incomplete" , isAuthenticated ,  markAsInCompleted)

export default router;

//aapde aama student no progress instructor side display karavanu che 