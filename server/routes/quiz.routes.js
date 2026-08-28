import express from "express";
import {
  createQuiz,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  publishQuiz,
  getQuizByCourseInstructor,
  getQuizForStudent,
  submitQuiz,
  getQuizResultsInstructor,
  getMyQuizResult,
} from "../controllers/quiz.controller.js";

import { isAuthenticated, isInstructor } from "../middlewares/auth.js";

const router = express.Router();

/* ===== INSTRUCTOR ===== */
router.post("/course/:courseId", isAuthenticated, isInstructor, createQuiz);
router.get("/course/:courseId", isAuthenticated, isInstructor, getQuizByCourseInstructor);
router.post("/:quizId/question", isAuthenticated, isInstructor, addQuestion);
router.put("/question/:questionId", isAuthenticated, isInstructor, updateQuestion);
router.delete("/question/:questionId", isAuthenticated, isInstructor, deleteQuestion);
router.patch("/:quizId/publish", isAuthenticated, isInstructor, publishQuiz);
router.get("/:quizId/results", isAuthenticated, isInstructor, getQuizResultsInstructor);

/* ===== STUDENT ===== */
router.get("/course/:courseId/student", isAuthenticated, getQuizForStudent);
router.post("/:quizId/submit", isAuthenticated, submitQuiz);
router.get("/:quizId/my-result", isAuthenticated, getMyQuizResult);

export default router;
