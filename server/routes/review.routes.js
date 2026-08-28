import express from "express";
import {
  addReview,
  getCourseReviews,
  updateReview,
  deleteReview,
  checkUserReview 
} from "../controllers/review.controller.js";
import { isAuthenticated } from "../middlewares/auth.js";
import Review from "../models/review.model.js"; // ADD THIS LINE!

const router = express.Router();

// Add review for a course
router.post("/:courseId", isAuthenticated, addReview);

// Get all reviews for a course
router.get("/course/:courseId", getCourseReviews);

// Update a review
router.put("/:reviewId", isAuthenticated, updateReview);

// Delete a review
router.delete("/:reviewId", isAuthenticated, deleteReview);

// Check if user has reviewed a course
router.get("/check/:courseId", isAuthenticated, checkUserReview); 

export default router;