import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import passport from "passport";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";
import fs from "fs";
import { sendEmail } from "../utils/nodemailer.js"
import otpGenerator from 'otp-generator';

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

    const existingUser = await User.findOne({ email });

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
      existingUser.otp = otp;
      existingUser.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
      await existingUser.save();
      user = existingUser;
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        otp,
        otpExpiry: Date.now() + 5 * 60 * 1000, // 5 minutes
        isVerified: false,
      });
    }

    // SEND OTP EMAIL
    await sendEmail({
      to: email,
      subject: "Verify Your Email - OTP",
      html: `
        <h2>Email Verification</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP is valid for 5 minutes.</p>
      `,
    });

    // DELETE UNVERIFIED USER AFTER 5 MINUTES
    setTimeout(async () => {
      const existingUser = await User.findById(user._id);
      if (existingUser && !existingUser.isVerified) {
        await User.findByIdAndDelete(user._id);
        //console.log(`Unverified user ${existingUser.email} deleted after 5 minutes`);
      }
    }, 5 * 60 * 1000); // 5 minutes 

    return res.status(201).json({
      success: true,
      message: "OTP sent to your email. Please verify.",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Registration failed.",
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

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User already verified.",
      });
    }

    if (user.otp !== otp || user.otpExpiry < Date.now()) {
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

    // SEND WELCOME EMAIL AFTER VERIFY
    await sendEmail({
      to: user.email,
      subject: "Welcome to Brainera ",
      html: `
        <h2>Welcome ${user.name} </h2>
        <p>Your email has been verified successfully.</p>
        <p>You can now login and start learning </p>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully.",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "OTP verification failed.",
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

    const user = await User.findOne({ email });

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

    await sendEmail({
      to: email,
      subject: "Verify Your Email - Resent OTP",
      html: `
        <h2>Email Verification</h2>
        <p>Your new OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP is valid for 5 minutes.</p>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully. Please check your email.",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to resend OTP.",
    });
  }
};


/* LOGIN */
export const login = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: info?.message || "Login failed",
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

    const user = await User.findOne({ email });

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

    await sendEmail({
      to: user.email,
      subject: "Password Reset OTP",
      html: `
        <h2>Password Reset</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>Valid for 5 minutes</p>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
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