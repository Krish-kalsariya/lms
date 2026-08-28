import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "instructor"],
      default: "student",
    },
    status: {
      type: String,
      enum: ["active", "deactive"],
      default: "active",
    },

    // ✅ Already enrolled courses
    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],

    // ❤️ SAVED / FAVORITE COURSES (NEW)
    savedCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],

    lastAnnouncementSeenAt: {
      type: Date,
      default: null,
    },
    
    photo: {
      url: {
        type: String,
        default:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSmOd0z9UiVAQM5g4c9zJm621hq6OuJosBSCRHNIszckw&s",
      },
      publicId: {
        type: String,
        default: null,
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: String,
    otpExpiry: Date,
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
