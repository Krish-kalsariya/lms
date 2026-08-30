import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import passport from "passport";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";
import fs from "fs";
import { sendEmail } from "../utils/nodemailer.js"
import otpGenerator from 'otp-generator';

const generateOtpEmailTemplate = (otp, title) => {
  const logoUrl = "https://res.cloudinary.com/drm3tsks4/image/upload/v1788099003/lms_assets/gntrt6dsksgw4sy209kx.png";
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Logo -->
        <table border="0" cellpadding="0" cellspacing="0" align="center" style="margin-bottom: 24px;">
          <tr>
            <td style="vertical-align: middle; padding-right: 10px;">
              <img src="${logoUrl}" alt="Logo" width="42" height="42" style="display: block; border: 0; outline: none; border-radius: 8px;" />
            </td>
            <td style="vertical-align: middle; font-size: 26px; font-weight: 800; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; letter-spacing: -0.5px; line-height: 42px;">
              <span style="color: #00c2ff;">Brain</span><span style="color: #a855f7;">era</span>
            </td>
          </tr>
        </table>
        
        <!-- Main Card -->
        <table border="0" cellpadding="0" cellspacing="0" style="max-width: 480px; width: 100%; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);">
          <tr>
            <td style="padding: 40px 32px; text-align: center;">
              <!-- Header -->
              <h3 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">${title}</h3>
              <p style="margin: 0 0 32px 0; font-size: 15px; line-height: 1.5; color: #64748b;">
                Use the following verification code to secure your account.
              </p>
              
              <!-- OTP Box -->
              <table border="0" cellpadding="0" cellspacing="0" align="center" style="margin-bottom: 32px;">
                <tr>
                  <td align="center" style="background-color: #f5f3ff; border: 1px solid #ddd6fe; padding: 18px 36px; border-radius: 12px;">
                    <span style="font-size: 32px; font-weight: 800; color: #7c3aed; font-family: 'Courier New', Courier, monospace; letter-spacing: 6px; margin-right: -6px;">${otp}</span>
                  </td>
                </tr>
              </table>
              
              <!-- Notice -->
              <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #64748b;">
                This code is valid for <span style="color: #ef4444; font-weight: 600;">5 minutes</span>.<br>
                If you did not request this, please ignore this email.
              </p>
            </td>
          </tr>
        </table>
        
        <!-- Footer -->
        <table border="0" cellpadding="0" cellspacing="0" style="max-width: 480px; width: 100%; margin-top: 32px; text-align: center;">
          <tr>
            <td style="font-size: 12px; color: #94a3b8; line-height: 1.5;">
              &copy; 2026 Brainera LMS. All rights reserved.<br>
              Empowering learners worldwide.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

const generateWelcomeEmailTemplate = (name) => {
  const logoUrl = "https://res.cloudinary.com/drm3tsks4/image/upload/v1788099003/lms_assets/gntrt6dsksgw4sy209kx.png";
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Brainera</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Logo -->
        <table border="0" cellpadding="0" cellspacing="0" align="center" style="margin-bottom: 24px;">
          <tr>
            <td style="vertical-align: middle; padding-right: 10px;">
              <img src="${logoUrl}" alt="Logo" width="42" height="42" style="display: block; border: 0; outline: none; border-radius: 8px;" />
            </td>
            <td style="vertical-align: middle; font-size: 26px; font-weight: 800; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; letter-spacing: -0.5px; line-height: 42px;">
              <span style="color: #00c2ff;">Brain</span><span style="color: #a855f7;">era</span>
            </td>
          </tr>
        </table>
        
        <!-- Main Card -->
        <table border="0" cellpadding="0" cellspacing="0" style="max-width: 480px; width: 100%; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);">
          <tr>
            <td style="padding: 40px 32px; text-align: center;">
              <!-- Welcome Icon -->
              <table border="0" cellpadding="0" cellspacing="0" align="center" style="margin-bottom: 24px;">
                <tr>
                  <td align="center" style="background-color: #ecfdf5; padding: 16px; border-radius: 50%;">
                    <img src="https://img.icons8.com/isometric-line/64/10b981/checked-user-male.png" width="40" height="40" alt="Success" style="display: block; border: 0;" />
                  </td>
                </tr>
              </table>

              <!-- Header -->
              <h3 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">Welcome, ${name}!</h3>
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #4b5563;">
                Your email has been verified successfully. We are excited to have you join our learning community!
              </p>
              
              <!-- Action Button -->
              <table border="0" cellpadding="0" cellspacing="0" align="center" style="margin-bottom: 24px;">
                <tr>
                  <td align="center" style="background-color: #7c3aed; border-radius: 12px;">
                    <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/login" target="_blank" style="display: inline-block; padding: 14px 30px; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 12px;">
                      Login to Your Dashboard
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #6b7280;">
                Start exploring our curated courses, track your progress, and build your skills today.
              </p>
            </td>
          </tr>
        </table>
        
        <!-- Footer -->
        <table border="0" cellpadding="0" cellspacing="0" style="max-width: 480px; width: 100%; margin-top: 32px; text-align: center;">
          <tr>
            <td style="font-size: 12px; color: #94a3b8; line-height: 1.5;">
              &copy; 2026 Brainera LMS. All rights reserved.<br>
              Empowering learners worldwide.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

/* REGISTER */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    const existingUser = await User.findOne({ email: cleanEmail });

    // If already verified
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User already exists. Please login.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const generateOTP = () => {
      return otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
        digits: true,
      });
    };

    const otp = generateOTP();

    let user;

    // If user exists but not verified resend OTP
    if (existingUser && !existingUser.isVerified) {
      existingUser.name = cleanName;
      existingUser.password = hashedPassword;
      existingUser.otp = otp;
      existingUser.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
      await existingUser.save();
      user = existingUser;
    } else {
      // Create new user
      user = await User.create({
        name: cleanName,
        email: cleanEmail,
        password: hashedPassword,
        otp,
        otpExpiry: Date.now() + 5 * 60 * 1000, // 5 minutes
        isVerified: false,
      });
    }

    console.log("\n========================================");
    console.log(`🔑 [REGISTER OTP GENERATED]: ${otp} for ${cleanEmail}`);
    console.log("========================================\n");

    // SEND OTP EMAIL (Non-blocking so cloud SMTP port blocks/timeouts never crash registration)
    sendEmail({
      to: cleanEmail,
      subject: "Verify Your Email - OTP",
      html: generateOtpEmailTemplate(otp, "Verify Your Email"),
    }).catch((emailErr) => {
      console.error(`⚠️ Failed to send OTP email to ${cleanEmail}:`, emailErr.message || emailErr);
    });

    // DELETE UNVERIFIED USER AFTER 5 MINUTES
    setTimeout(async () => {
      try {
        const existingUser = await User.findById(user._id);
        if (existingUser && !existingUser.isVerified) {
          await User.findByIdAndDelete(user._id);
        }
      } catch (err) {
        console.error("Cleanup unverified user error:", err);
      }
    }, 5 * 60 * 1000); // 5 minutes 

    return res.status(201).json({
      success: true,
      message: "OTP sent to your email. Please verify.",
      otp,
    });

  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Registration failed.",
    });
  }
};

/* VERIFY OTP */
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found or OTP expired",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User already verified.",
      });
    }

    if (user.otp !== cleanOtp || user.otpExpiry < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP.",
      });
    }

    // VERIFY USER
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // SEND WELCOME EMAIL AFTER VERIFY (Non-blocking)
    sendEmail({
      to: user.email,
      subject: "Welcome to Brainera",
      html: generateWelcomeEmailTemplate(user.name),
    }).catch((err) => {
      console.error("Welcome email background send error:", err.message || err);
    });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully.",
    });

  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "OTP verification failed.",
    });
  }
};

/* RESEND OTP */
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found or OTP expired",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User already exists. Please login.",
      });
    }

    const generateOTP = () => {
      return otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
        digits: true,
      });
    };

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
    await user.save();

    console.log("\n========================================");
    console.log(`🔑 [RESEND OTP GENERATED]: ${otp} for ${cleanEmail}`);
    console.log("========================================\n");

    // Send OTP email in background (non-blocking)
    sendEmail({
      to: cleanEmail,
      subject: "Verify Your Email - Resent OTP",
      html: generateOtpEmailTemplate(otp, "Email Verification (Resent OTP)"),
    }).catch((emailErr) => {
      console.error(`⚠️ Resend OTP email error for ${cleanEmail}:`, emailErr.message || emailErr);
    });

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully. Please check your email.",
      otp,
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to resend OTP.",
    });
  }
};


/* LOGIN */
export const login = (req, res, next) => {
  if (req.body && req.body.email) {
    req.body.email = req.body.email.trim().toLowerCase();
  }
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: info?.message || "Invalid email or password",
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Please verify your email OTP before logging in.",
      });
    }

    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.status(200).json({
        success: true,
        message: `Welcome back, ${user.name}`,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          photoUrl: user.photo?.url,
        },
      });
    });
  })(req, res, next);
};

/* FORGOT PASSWORD - SEND OTP */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const generateOTP = () => {
      return otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
        digits: true,
      });
    };
    
    const otp = generateOTP();

    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
    await user.save();

    console.log("\n========================================");
    console.log(`🔑 [FORGOT PASSWORD OTP GENERATED]: ${otp} for ${cleanEmail}`);
    console.log("========================================\n");

    // Send OTP email in background (non-blocking)
    sendEmail({
      to: cleanEmail,
      subject: "Password Reset OTP",
      html: generateOtpEmailTemplate(otp, "Password Reset Verification"),
    }).catch((emailErr) => {
      console.error(`⚠️ Password reset email send error for ${cleanEmail}:`, emailErr.message || emailErr);
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email",
      otp,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send OTP",
    });
  }
};


/* VERIFY RESET OTP & UPDATE PASSWORD */
export const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP verified",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
};

/* RESET PASSWORD */
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Password reset failed",
    });
  }
};


/* LOGOUT (Destroy session) */
export const logout = (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);

    req.session.destroy((err) => {
      if (err) return next(err);

      // Clear cookies store in browser
      res.clearCookie("connect.sid");

      return res.status(200).json({
        success: true,
        message: "Logged out successfully."
      });
    });
  });
};

/* GET USER PROFILE */

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    .populate("savedCourses");
   

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        photoUrl: user.photo?.url,
        enrolledCourses : user.enrolledCourses,
        savedCourses: user.savedCourses,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};


/* UPDATE USER PROFILE */
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    // update name
    if (req.body.name) user.name = req.body.name;

    // update photo
    if (req.file) {
      // delete old image
      if (user.photo?.publicId) {
        await deleteMediaFromCloudinary(user.photo.publicId);
      }

      // upload new image
      const result = await uploadMedia(req.file.path);

      user.photo = {
        url: result.secure_url,
        publicId: result.public_id,
      };

      //delete file from local uploads folder
      fs.unlink(req.file.path, (err) => {
        if (err) {
        }
      });
    }

    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        photoUrl: user.photo?.url,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Profile update failed",
    });
  }
};

/* CHANGE PASSWORD (Logged-in User) */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New passwords do not match",
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Prevent reusing same password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from old password",
      });
    }

    // Hash & save new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to change password",
    });
  }
};

// Get all students with their enrolled courses
export const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .populate("enrolledCourses", "courseTitle"); 

    // Add photoUrl to each student
    const studentsWithPhotoUrl = students.map(student => ({
      ...student.toObject(),
      photoUrl: student.photo?.url || null,
    }));

    res.status(200).json({
      success: true,
      students: studentsWithPhotoUrl,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch students",
    });
  }
};


// Change student status
export const changeStudentStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["active", "deactive"].includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }

  try {
    const student = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    //If deactivated, destroy all sessions (IMPORTANT)
    if (status === "deactive") {
      req.sessionStore?.all((err, sessions) => {
        if (!sessions) return;

        for (const sid in sessions) {
          if (sessions[sid]?.passport?.user === id) {
            req.sessionStore.destroy(sid, () => {});
          }
        }
      });
    }

    res.json({
      success: true,
      message: `Student status updated to ${status}`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};