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
  resendOtp,
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

router.get("/test-email", async (req, res) => {
  try {
    const { sendEmail } = await import("../utils/nodemailer.js");
    await sendEmail({
      to: process.env.EMAIL_USER || "error22.prof@gmail.com",
      subject: "Test Diagnostic Email",
      html: "<p>Test email from Render server</p>",
    });
    return res.json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || String(error),
      code: error.code,
      command: error.command,
      envUser: Boolean(process.env.EMAIL_USER),
      envPass: Boolean(process.env.EMAIL_PASS),
    });
  }
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
router.post("/resend-otp", resendOtp);

/* Forget password */
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);

/* CHANGE PASSWORD */
router.put("/change-password", isAuthenticated, changePassword);

export default router;