import PDFDocument from "pdfkit";
import Course from "../models/course.model.js";
import CourseProgress from "../models/courseProgress.model.js";
import User from "../models/user.model.js";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import fs from "fs";

// ---- Required for correct path in ES modules ----
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate certificate
export const generateCertificate = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id || req.userId || req.user?._id;

    // ---------- VALIDATION ----------
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: "User not authenticated" 
      });
    }

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid course ID format. Please provide a valid course ID." 
      });
    }

    // ---------- FIND PROGRESS WITH REAL COURSE DATA ----------
    const progress = await CourseProgress.findOne({
      courseId: courseId,
      userId: userId
    }).populate({
      path: "courseId",
      select: "courseTitle courseCode description instructor duration level"
    });

    if (!progress) {
      return res.status(404).json({ 
        success: false,
        message: "No enrollment found for this course. Please enroll first." 
      });
    }

    // ---------- CHECK COMPLETION ----------
    const viewedLectures = progress.lectureProgress?.filter(l => l.viewed) || [];
    const totalLectures = progress.lectureProgress?.length || 0;
    const allViewed = viewedLectures.length === totalLectures && totalLectures > 0;

    if (!allViewed) {
      return res.status(403).json({
        success: false,
        message: "Course not completed yet",
        completed: viewedLectures.length,
        total: totalLectures,
        percentage: Math.round(
          (viewedLectures.length / (totalLectures || 1)) * 100
        )
      });
    }

    // Mark as completed if not already
    if (!progress.completed) {
      progress.completed = true;
      progress.completedAt = new Date();
      await progress.save();
    }

    // ---------- GET REAL COURSE DETAILS ----------
    const course = progress.courseId;
    if (!course) {
      return res.status(404).json({ 
        success: false,
        message: "Course details not found" 
      });
    }

    // ---------- GET REAL USER DETAILS ----------
    const user = await User.findById(userId).select(
      "name firstName lastName email"
    );

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // ---------- FORMAT STUDENT NAME ----------
    let studentName = "";
    if (user.name) {
      studentName = user.name;
    } else if (user.firstName || user.lastName) {
      studentName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    } else {
      studentName = user.email?.split("@")[0] || "Student";
    }

    // ---------- GET REAL COURSE ID ----------
    const realCourseId = course._id.toString();
    const courseCode = course.courseCode || "";

    // ================= PDF SETUP =================
    const doc = new PDFDocument({
      size: "A4",
      margin: 0,
      layout: "landscape",
      info: {
        Title: `Certificate of Completion - ${course.courseTitle}`,
        Author: "Brainera Academy",
        Subject: "Course Completion Certificate",
        Keywords: `certificate, ${course.courseTitle}, completion, Brainera`,
        Creator: "Brainera Certificate Generator"
      }
    });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Certificate_${studentName.replace(/[^a-zA-Z0-9]/g, "_")}_${course.courseTitle.replace(/[^a-zA-Z0-9]/g, "_")}.pdf"`
    );

    doc.pipe(res);
    const { width, height } = doc.page;

    // ================= BACKGROUND =================
    doc.rect(0, 0, width, height).fill("#FDF6E3");
    doc.rect(0, 0, width, height / 2)
      .fillOpacity(0.15)
      .fill("#D4AF37");
    doc.fillOpacity(1);

    // ================= FRAMES =================
    doc.lineWidth(6)
      .strokeColor("#D4AF37")
      .roundedRect(30, 30, width - 60, height - 60, 15)
      .stroke();

    doc.lineWidth(3)
      .strokeColor("#8B4513")
      .roundedRect(45, 45, width - 90, height - 90, 12)
      .stroke();

    // ================= CORNERS =================
    const corner = (x, y) => {
      doc.lineWidth(2)
        .strokeColor("#D4AF37")
        .moveTo(x, y - 30)
        .lineTo(x, y)
        .lineTo(x + 30, y)
        .stroke();
    };

    corner(45, 45);
    corner(width - 45, 45);
    corner(45, height - 45);
    corner(width - 45, height - 45);

    // ================= BRAINERA LOGO (TOP CENTER) - EXACTLY AS YOUR ORIGINAL =================
    const logoPath = path.join(
      __dirname,
      "../../client/src/assets/Brainera-logo.png"
    );

    try {
      if (fs.existsSync(logoPath)) {
        // Your original logo placement - exactly as you had it
        doc.image(logoPath, width / 2 - 60, 50, {
          width: 120
        });
      } else {
        throw new Error("Logo file not found");
      }
    } catch (err) {
      // Fallback if logo fails - exactly as your original
      doc.circle(width / 2, 90, 35)
        .fill("#FFF8E1")
        .stroke("#D4AF37");

      doc.font("Helvetica-Bold")
        .fontSize(28)
        .fillColor("#8B4513")
        .text("B", width / 2 - 8, 75);
    }

    // ================= TITLE =================
    doc.font("Times-BoldItalic")
      .fontSize(44)
      .fillColor("#2C1810")
      .text("Certificate of Completion", 0, 140, { align: "center" });

    doc.lineWidth(2)
      .moveTo(width / 2 - 160, 185)
      .lineTo(width / 2 + 160, 185)
      .stroke("#D4AF37");

    // ================= SUBTITLE =================
    doc.font("Times-Italic")
      .fontSize(18)
      .fillColor("#5D4037")
      .text("This is proudly presented to", 0, 210, {
        align: "center"
      });

    // ================= STUDENT NAME =================
    doc.font("Times-BoldItalic")
      .fontSize(40)
      .fillColor("#1A237E")
      .text(studentName.toUpperCase(), 0, 250, {
        align: "center"
      });

    // ================= COURSE BOX =================
    doc.roundedRect(width / 2 - 230, 300, 460, 70, 10)
      .fill("#FFF3C4")
      .stroke("#D4AF37");

    // Format course title (handle long titles)
    let displayTitle = course.courseTitle;
    if (displayTitle.length > 40) {
      displayTitle = displayTitle.substring(0, 37) + "...";
    }

    doc.font("Times-BoldItalic")
      .fontSize(24)
      .fillColor("#1A237E")
      .text(`"${displayTitle}"`, 0, 320, {
        align: "center"
      });

    // ===== REMOVED: Formatted Course ID from top section =====
    // Now only showing course code if available (not the ID)
    if (courseCode) {
      doc.font("Helvetica")
        .fontSize(11)
        .fillColor("#8B4513")
        .text(`Course Code: ${courseCode}`, 0, 375, {
          align: "center"
        });
    }

    // Add course details if available
    if (course.level || course.duration) {
      const details = [];
      if (course.level) details.push(`Level: ${course.level}`);
      if (course.duration) details.push(`Duration: ${course.duration}`);
      
      const detailsY = courseCode ? 390 : 375;
      doc.font("Helvetica")
        .fontSize(10)
        .fillColor("#8B4513")
        .text(details.join(" • "), 0, detailsY, {
          align: "center"
        });
    }

    // ================= QUOTE =================
    let quoteY = 415;
    if (courseCode && (course.level || course.duration)) quoteY = 430;
    else if (courseCode || (course.level || course.duration)) quoteY = 415;
    
    doc.font("Times-Italic")
      .fontSize(16)
      .fillColor("#795548")
      .text(
        "Education is the most powerful weapon which you can use to change the world.",
        0,
        quoteY,
        { align: "center" }
      );

    doc.font("Times-Italic")
      .fontSize(14)
      .text("- Brainera Team", 0, quoteY + 30, { align: "center" });

    // ================= DETAILS SECTION =================
    const detailsY = height - 100;

    // Draw lines
    doc.lineWidth(1.5).strokeColor("#5D4037");
    doc.moveTo(width / 4 - 100, detailsY - 5)
      .lineTo(width / 4 + 100, detailsY - 5)
      .stroke();
    doc.moveTo(width / 2 - 100, detailsY - 5)
      .lineTo(width / 2 + 100, detailsY - 5)
      .stroke();
    doc.moveTo((3 * width) / 4 - 100, detailsY - 5)
      .lineTo((3 * width) / 4 + 100, detailsY - 5)
      .stroke();

    // Headers
    doc.font("Times-Italic")
      .fontSize(12)
      .fillColor("#5D4037")
      .text("DATE ISSUED", width / 4 - 100, detailsY, {
        align: "center",
        width: 200
      });

    doc.text("COURSE ID", width / 2 - 100, detailsY, {
      align: "center",
      width: 200
    });

    doc.text("PLATFORM", (3 * width) / 4 - 100, detailsY, {
      align: "center",
      width: 200
    });

    // Values
    const issueDate = progress.completedAt || new Date();
    const formattedDate = issueDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    doc.font("Times-Italic")
      .fontSize(14)
      .fillColor("#2C1810")
      .text(formattedDate, width / 4 - 100, detailsY + 20, {
        align: "center",
        width: 200
      });

    // Show REAL Course ID (full version in details section) - THIS IS THE ONLY PLACE COURSE ID APPEARS
    doc.font("Times-Italic")
      .fontSize(12)
      .fillColor("#2C1810")
      .text(realCourseId, width / 2 - 100, detailsY + 20, {
        align: "center",
        width: 200
      });

    doc.font("Times-Italic")
      .fontSize(14)
      .fillColor("#2C1810")
      .text("Brainera Academy", (3 * width) / 4 - 100, detailsY + 20, {
        align: "center",
        width: 200
      });

    // ================= FOOTER =================
    doc.lineWidth(2)
      .strokeColor("#D4AF37")
      .moveTo(80, height - 50)
      .lineTo(width - 80, height - 50)
      .stroke();

    // Finalize PDF
    doc.end();

  } catch (error) {
    // Check for specific MongoDB errors
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID format",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to generate certificate",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};