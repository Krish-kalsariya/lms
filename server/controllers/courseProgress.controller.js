// import CourseProgress from "../models/courseProgress.model.js";
// import Course from "../models/course.model.js";

// /* ================= GET COURSE PROGRESS ================= */
// export const getCourseProgress = async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     const userId = req.id;

//     const course = await Course.findById(courseId).populate("lectures");
//     if (!course) {
//       return res.status(404).json({ message: "Course not found" });
//     }

//     let courseProgress = await CourseProgress.findOne({ courseId, userId });

//     if (!courseProgress) {
//       return res.status(200).json({
//         data: {
//           courseDetails: course,
//           progress: [],
//           completed: false,
//         },
//       });
//     }

//     return res.status(200).json({
//       data: {
//         courseDetails: course,
//         progress: courseProgress.lectureProgress,
//         completed: courseProgress.completed,
//       },
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Failed to fetch progress" });
//   }
// };

// /* ================= UPDATE LECTURE PROGRESS ================= */
// export const updateLectureProgress = async (req, res) => {
//   try {
//     const { courseId, lectureId } = req.params;
//     const userId = req.id;

//     // 1️⃣ Get or create progress
//     let courseProgress = await CourseProgress.findOne({ courseId, userId });

//     if (!courseProgress) {
//       courseProgress = new CourseProgress({
//         userId,
//         courseId,
//         lectureProgress: [],
//         completed: false,
//       });
//     }

//     // 2️⃣ Find lecture index SAFELY
//     const index = courseProgress.lectureProgress.findIndex(
//       (l) => String(l.lectureId) === String(lectureId)
//     );

//     // 3️⃣ Mark lecture viewed
//     if (index !== -1) {
//       courseProgress.lectureProgress[index].viewed = true;
//     } else {
//       courseProgress.lectureProgress.push({
//         lectureId,
//         viewed: true,
//       });
//     }

//     // 4️⃣ Fetch course lectures
//     const course = await Course.findById(courseId).select("lectures");

//     if (!course || !course.lectures) {
//       return res.status(404).json({ message: "Course lectures not found" });
//     }

//     // 5️⃣ Calculate completion
//     const viewedCount = courseProgress.lectureProgress.filter(
//       (l) => l.viewed
//     ).length;

//     // 6️⃣ Completion flag
//     courseProgress.completed = viewedCount >= course.lectures.length;

//     // 7️⃣ SAVE TO DB (THIS WAS FAILING BEFORE)
//     await courseProgress.save();

//     res.status(200).json({
//       message: "Lecture progress updated successfully",
//       completed: courseProgress.completed,
//     });
//   } catch (error) {
//     console.error("Progress update error:", error);
//     res.status(500).json({
//       message: "Failed to update progress",
//     });
//   }
// };

// /* ================= MARK COMPLETE ================= */
// export const markAsCompleted = async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     const userId = req.id;

//     const courseProgress = await CourseProgress.findOne({ courseId, userId });
//     if (!courseProgress) {
//       return res.status(404).json({ message: "Course progress not found" });
//     }

//     courseProgress.lectureProgress.forEach((lp) => (lp.viewed = true));
//     courseProgress.completed = true;

//     await courseProgress.save();

//     res.status(200).json({ message: "Course marked as completed" });
//   } catch (error) {
//     console.log(error);
//   }
// };

// /* ================= MARK INCOMPLETE ================= */
// export const markAsInCompleted = async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     const userId = req.id;

//     const courseProgress = await CourseProgress.findOne({ courseId, userId });
//     if (!courseProgress) {
//       return res.status(404).json({ message: "Course progress not found" });
//     }

//     courseProgress.lectureProgress.forEach((lp) => (lp.viewed = false));
//     courseProgress.completed = false;

//     await courseProgress.save();

//     res.status(200).json({ message: "Course marked as incomplete" });
//   } catch (error) {
//     console.log(error);
//   }
// };


import CourseProgress from "../models/courseProgress.model.js";
import Course from "../models/course.model.js";

/* ================= GET COURSE PROGRESS ================= */
export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id || req.user?.id;

    // Get course with lectures
    const course = await Course.findById(courseId)
      .populate("lectures", "_id title")
      .select("lectures enrolledStudents");

    if (!course) {
      return res.status(404).json({ 
        success: false,
        message: "Course not found" 
      });
    }

    // Check if user is enrolled
    const isEnrolled = course.enrolledStudents?.includes(userId);
    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: "You are not enrolled in this course",
      });
    }

    // Get or create progress
    let courseProgress = await CourseProgress.findOne({ 
      userId, 
      courseId 
    });

    if (!courseProgress) {
      // Return empty progress for enrolled users
      return res.status(200).json({
        success: true,
        data: {
          progress: [],
          completedLectures: [],
          completedCount: 0,
          totalLectures: course.lectures?.length || 0,
          percentage: 0,
          isCourseCompleted: false,
          courseTitle: course.courseTitle,
        },
      });
    }

    // Calculate completion stats
    const totalLectures = course.lectures?.length || 0;
    const completedLectures = courseProgress.lectureProgress
      ?.filter(lp => lp.viewed)
      .map(lp => lp.lectureId) || [];
    
    const completedCount = completedLectures.length;
    const percentage = totalLectures > 0 
      ? Math.round((completedCount / totalLectures) * 100)
      : 0;
    
    const isCourseCompleted = percentage >= 100;

    return res.status(200).json({
      success: true,
      data: {
        progress: courseProgress.lectureProgress || [],
        completedLectures,
        completedCount,
        totalLectures,
        percentage,
        isCourseCompleted,
        courseTitle: course.courseTitle,
        lastUpdated: courseProgress.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch progress" 
    });
  }
};

/* ================= UPDATE LECTURE PROGRESS ================= */
export const updateLectureProgress = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const userId = req.id || req.user?.id;

    // Get course to verify enrollment and get lecture count
    const course = await Course.findById(courseId)
      .select("lectures enrolledStudents");

    if (!course) {
      return res.status(404).json({ 
        success: false,
        message: "Course not found" 
      });
    }

    // Check enrollment
    const isEnrolled = course.enrolledStudents?.includes(userId);
    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: "You are not enrolled in this course",
      });
    }

    // 1️⃣ Get or create progress
    let courseProgress = await CourseProgress.findOne({ 
      userId, 
      courseId 
    });

    if (!courseProgress) {
      courseProgress = new CourseProgress({
        userId,
        courseId,
        lectureProgress: [],
        completed: false,
      });
    }

    // 2️⃣ Find lecture index
    const lectureIndex = courseProgress.lectureProgress.findIndex(
      (lp) => String(lp.lectureId) === String(lectureId)
    );

    // 3️⃣ Update or add lecture progress
    if (lectureIndex !== -1) {
      // Already exists, update viewed status
      if (!courseProgress.lectureProgress[lectureIndex].viewed) {
        courseProgress.lectureProgress[lectureIndex].viewed = true;
        courseProgress.lectureProgress[lectureIndex].lastViewed = new Date();
      }
    } else {
      // Add new lecture progress
      courseProgress.lectureProgress.push({
        lectureId,
        viewed: true,
        lastViewed: new Date(),
      });
    }

    // 4️⃣ Calculate completion
    const totalLectures = course.lectures?.length || 0;
    const viewedCount = courseProgress.lectureProgress.filter(
      (lp) => lp.viewed
    ).length;

    // Update completion status
    const percentage = totalLectures > 0 
      ? Math.round((viewedCount / totalLectures) * 100)
      : 0;
    
    courseProgress.completed = percentage >= 100;
    courseProgress.lastUpdated = new Date();

    // 5️⃣ Save to database
    await courseProgress.save();

    // 6️⃣ Return detailed response
    const completedLectures = courseProgress.lectureProgress
      .filter(lp => lp.viewed)
      .map(lp => lp.lectureId);

    res.status(200).json({
      success: true,
      message: "Lecture progress updated successfully",
      data: {
        completed: courseProgress.completed,
        progress: {
          viewedCount,
          totalLectures,
          percentage,
          isCourseCompleted: percentage >= 100,
          completedLectures,
          remainingLectures: totalLectures - viewedCount,
        },
        timestamp: courseProgress.lastUpdated,
      },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update progress",
      error: error.message,
    });
  }
};

/* ================= GET COMPLETION STATUS FOR REVIEW ================= */
export const getCompletionStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id || req.user?.id;

    // Get course
    const course = await Course.findById(courseId)
      .populate("lectures", "_id")
      .select("lectures enrolledStudents");

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check enrollment
    const isEnrolled = course.enrolledStudents?.includes(userId);
    if (!isEnrolled) {
      return res.status(200).json({
        success: true,
        canReview: false,
        reason: "not_enrolled",
        message: "You need to enroll in the course first",
      });
    }

    // Get progress
    const courseProgress = await CourseProgress.findOne({
      userId,
      courseId,
    });

    const totalLectures = course.lectures?.length || 0;
    
    if (!courseProgress || !courseProgress.lectureProgress) {
      return res.status(200).json({
        success: true,
        canReview: false,
        reason: "no_progress",
        message: "Start watching lectures to track progress",
        stats: {
          completed: 0,
          total: totalLectures,
          percentage: 0,
          isCompleted: false,
        },
      });
    }

    // Calculate stats
    const completedLectures = courseProgress.lectureProgress
      .filter(lp => lp.viewed)
      .map(lp => lp.lectureId);
    
    const completedCount = completedLectures.length;
    const percentage = totalLectures > 0 
      ? Math.round((completedCount / totalLectures) * 100)
      : 0;
    
    const isCompleted = percentage >= 100;
    const canReview = isCompleted;

    return res.status(200).json({
      success: true,
      canReview,
      reason: canReview ? "can_review" : (isEnrolled ? "incomplete" : "not_enrolled"),
      message: canReview 
        ? "Course completed! You can now submit a review." 
        : `Complete ${100 - percentage}% more to review (${completedCount}/${totalLectures} lectures)`,
      stats: {
        completed: completedCount,
        total: totalLectures,
        percentage,
        isCompleted,
        remainingLectures: totalLectures - completedCount,
        requirement: 100, // Required percentage for review
      },
      progressDetails: {
        completedLectures,
        lastUpdated: courseProgress.updatedAt,
      },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get completion status",
    });
  }
};

/* ================= MARK COMPLETE ================= */
export const markAsCompleted = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id || req.user?.id;

    // Get course
    const course = await Course.findById(courseId).select("lectures");
    if (!course) {
      return res.status(404).json({ 
        success: false,
        message: "Course not found" 
      });
    }

    // Get or create progress
    let courseProgress = await CourseProgress.findOne({ 
      userId, 
      courseId 
    });

    if (!courseProgress) {
      courseProgress = new CourseProgress({
        userId,
        courseId,
        lectureProgress: [],
        completed: true,
      });
    }

    // Mark all lectures as viewed
    const totalLectures = course.lectures?.length || 0;
    courseProgress.lectureProgress = course.lectures?.map(lecture => ({
      lectureId: lecture._id,
      viewed: true,
      lastViewed: new Date(),
    })) || [];

    courseProgress.completed = true;
    courseProgress.lastUpdated = new Date();

    await courseProgress.save();

    res.status(200).json({
      success: true,
      message: "Course marked as completed",
      data: {
        completed: true,
        totalLectures,
        percentage: 100,
        isCourseCompleted: true,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to mark course as completed",
    });
  }
};

/* ================= MARK INCOMPLETE ================= */
export const markAsInCompleted = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id || req.user?.id;

    const courseProgress = await CourseProgress.findOne({ 
      userId, 
      courseId 
    });

    if (!courseProgress) {
      return res.status(404).json({ 
        success: false,
        message: "Course progress not found" 
      });
    }

    // Reset all lectures to not viewed
    courseProgress.lectureProgress.forEach((lp) => {
      lp.viewed = false;
      lp.lastViewed = null;
    });
    
    courseProgress.completed = false;
    courseProgress.lastUpdated = new Date();

    await courseProgress.save();

    res.status(200).json({
      success: true,
      message: "Course marked as incomplete",
      data: {
        completed: false,
        percentage: 0,
        isCourseCompleted: false,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to mark course as incomplete",
    });
  }
};

/* ================= GET USER'S COMPLETED LECTURES ================= */
export const getCompletedLectures = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id || req.user?.id;

    const courseProgress = await CourseProgress.findOne({
      userId,
      courseId,
    });

    if (!courseProgress) {
      return res.status(200).json({
        success: true,
        completedLectures: [],
        total: 0,
      });
    }

    const completedLectures = courseProgress.lectureProgress
      .filter(lp => lp.viewed)
      .map(lp => lp.lectureId);

    res.status(200).json({
      success: true,
      completedLectures,
      total: completedLectures.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get completed lectures",
    });
  }
};

