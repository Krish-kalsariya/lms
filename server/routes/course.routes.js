import express from "express";
import {
  createCourse,
  searchCourse,
  getPublishedCourse,
  getDraftCourses,
  publishCourse,
  getCreatorCourses,
  editCourse,
  getCourseById,
  createLecture,
  getCourseLecture,
  editLecture,
  removeLeacture,
  getLectureById,
  tooglepublishCourse,
  deleteCourse,
  getInstructorDashboardStats,
  enrollCourse,
  getEnrolledCourses,
  getEnrolledStudents,

  // ❤️ NEW CONTROLLERS (will add next step)
  saveCourse,
  unsaveCourse,
} from "../controllers/course.controller.js";

import { isAuthenticated, isInstructor } from "../middlewares/auth.js";
import upload from "../utils/multer.js";

const router = express.Router();

// ================= COURSE ROUTES =================

// create course
router.post("/create", isAuthenticated, upload.single("courseThumbnail"), createCourse);

// search course
router.get("/search", isAuthenticated, searchCourse);

// published courses (student)
router.get("/published-courses", getPublishedCourse);

// ================= ❤️ SAVE / UNSAVE COURSE =================

// save course (student)
router.post("/:courseId/save", isAuthenticated, saveCourse);

// unsave course (student)
router.delete("/:courseId/unsave", isAuthenticated, unsaveCourse);

// ================= INSTRUCTOR ROUTES =================

router.get("/instructor/drafts", isAuthenticated, getDraftCourses);
router.patch("/publish/:courseId", isAuthenticated, publishCourse);

router.get("/creator", isAuthenticated, getCreatorCourses);

router.put("/:courseId", isAuthenticated, upload.single("courseThumbnail"), editCourse);

// MUST COME FIRST
router.get("/enrolled", isAuthenticated, getEnrolledCourses);

// ================= INSTRUCTOR DASHBOARD =================

router.get(
  "/instructor/dashboard",
  isAuthenticated,
  isInstructor,
  getInstructorDashboardStats
);

// get course by id
router.get("/:courseId", getCourseById);

// enroll course
router.post("/:courseId/enroll", isAuthenticated, enrollCourse);

// delete course
router.delete("/:courseId", isAuthenticated, deleteCourse);

// ================= LECTURE ROUTES =================

router.post("/:courseId/lecture", isAuthenticated, upload.single("video"), createLecture);

router.get("/:courseId/lecture", getCourseLecture);

router.put(
  "/:courseId/lecture/:lectureId",
  isAuthenticated,
  upload.single("video"),
  editLecture
);

router.delete("/lecture/:lectureId", isAuthenticated, removeLeacture);

router.get("/:courseId/lecture/:lectureId", isAuthenticated, getLectureById);

// toggle publish
router.patch("/:courseId", isAuthenticated, tooglepublishCourse);

router.get(
  "/:courseId/enrolled-students",
  isAuthenticated,
  isInstructor,
  getEnrolledStudents
);

export default router;