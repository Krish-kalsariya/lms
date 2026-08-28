import express from "express";
import {
  register,
  login,
  logout,
  getUserProfile,
  updateProfile,
  getAllStudents,
  changeStudentStatus,
  verifyOtp,
  forgotPassword,
  resetPassword,
  verifyResetOtp,
  changePassword
} from "../controllers/user.controller.js";

import { isAuthenticated, isInstructor } from "../middlewares/auth.js";
import upload from "../utils/multer.js";
const router = express.Router();

router.get("/me", (req, res) => {
  if (req.isAuthenticated()) {
    return res.json({ user: req.user });
  }
  res.status(401).json({ message: "Not logged in" });
});

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/profile", isAuthenticated, getUserProfile);

//update profile
router.put("/profile/update", isAuthenticated, upload.single("photo"), updateProfile);

router.get("/students", isAuthenticated, isInstructor, getAllStudents);

router.patch("/:id/status", isAuthenticated, isInstructor, changeStudentStatus);

/* VERIFY OTP */
router.post("/verify-otp", verifyOtp);

/* Forget password */
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);

/* CHANGE PASSWORD */
router.put("/change-password", isAuthenticated, changePassword);

export default router;