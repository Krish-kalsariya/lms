import Course from "../models/course.model.js";
import Review from "../models/review.model.js";
import CourseProgress from "../models/courseProgress.model.js";

// Add review
export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { courseId } = req.params;
    const userId = req.user.id || req.id;

    // Basic validation
    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Rating and comment are required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // Get course with populated lectures
    const course = await Course.findById(courseId)
      .populate("lectures", "_id")
      .select("enrolledStudents lectures averageRating totalReviews courseTitle");

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // 1. CHECK ENROLLMENT
    const isEnrolled = course.enrolledStudents?.includes(userId);
    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: "You need to enroll in this course first",
      });
    }

    // 2. CHECK IF ALREADY REVIEWED
    const existingReview = await Review.findOne({
      course: courseId,
      user: userId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this course",
        review: existingReview,
      });
    }

    // 3. CHECK COURSE COMPLETION - 100% REQUIRED
    const userProgress = await CourseProgress.findOne({
      userId: userId,
      courseId: courseId
    }).lean(); // Use .lean() for better performance

    let completionPercentage = 0;
    let completedLectures = 0;
    const totalLectures = course.lectures?.length || 0;

    if (!userProgress) {
      return res.status(403).json({
        success: false,
        message: "Start watching the course to track your progress",
        completed: 0,
        total: totalLectures,
        percentage: 0,
        requirement: 100,
      });
    }

    // Calculate completion from lectureProgress array
    if (userProgress.lectureProgress && Array.isArray(userProgress.lectureProgress)) {
      completedLectures = userProgress.lectureProgress
        .filter(lp => lp.viewed === true)
        .length || 0;
      
      completionPercentage = totalLectures > 0
        ? Math.round((completedLectures / totalLectures) * 100)
        : 0;
    } else {
      completionPercentage = 0;
    }

    // REQUIRE 100% COMPLETION FOR REVIEW
    if (completionPercentage < 100) {
      const remainingLectures = totalLectures - completedLectures;
      
      return res.status(403).json({
        success: false,
        message: `Complete all lectures to review this course. ${remainingLectures} more to go.`,
        completed: completedLectures,
        total: totalLectures,
        percentage: completionPercentage,
        requirement: 100,
        remaining: remainingLectures,
        // Additional debug info
        progressExists: !!userProgress,
        lectureProgressCount: userProgress.lectureProgress?.length || 0,
        isCompleted: completionPercentage >= 100,
      });
    }

    // 4. CREATE REVIEW
    const review = new Review({
      user: userId,
      course: courseId,
      rating: Number(rating),
      comment: comment.trim(),
    });

    await review.save();

    // 5. UPDATE COURSE RATING STATS
    const allReviews = await Review.find({ course: courseId });
    const totalReviews = allReviews.length;

    const averageRating = totalReviews > 0
      ? allReviews.reduce((sum, rev) => sum + rev.rating, 0) / totalReviews
      : 0;

    await Course.findByIdAndUpdate(
      courseId,
      {
        averageRating: parseFloat(averageRating.toFixed(1)),
        totalReviews: totalReviews,
      },
      { new: true }
    );

    // 6. RETURN POPULATED REVIEW
    const populatedReview = await Review.findById(review._id).populate(
      "user",
      "name email avatar"
    );

    res.status(201).json({
      success: true,
      message: "Review submitted successfully!",
      review: populatedReview,
      courseStats: {
        averageRating: parseFloat(averageRating.toFixed(1)),
        totalReviews: totalReviews,
      },
      completionInfo: {
        completed: completedLectures,
        total: totalLectures,
        percentage: completionPercentage,
        isCompleted: true
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to submit review",
    });
  }
};

// Get course reviews
export const getCourseReviews = async (req, res) => {
  try {
    const { courseId } = req.params;

    const reviews = await Review.find({ course: courseId })
      .populate("user", "name email avatar")
      .sort({ createdAt: -1 });

    const course = await Course.findById(courseId).select(
      "averageRating totalReviews courseTitle"
    );

    res.status(200).json({
      success: true,
      reviews,
      courseTitle: course?.courseTitle,
      averageRating: course?.averageRating || 0,
      totalReviews: course?.totalReviews || 0,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update review
export const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { reviewId } = req.params;
    const userId = req.user.id;

    const review = await Review.findOne({
      _id: reviewId,
      user: userId,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found or unauthorized",
      });
    }

    // Update fields
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment.trim();

    await review.save();

    // Update course rating
    const reviews = await Review.find({ course: review.course });
    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((acc, item) => acc + item.rating, 0) / totalReviews
        : 0;

    await Course.findByIdAndUpdate(
      review.course,
      {
        averageRating: parseFloat(averageRating.toFixed(1)),
        totalReviews: totalReviews,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review,
      courseStats: {
        averageRating: parseFloat(averageRating.toFixed(1)),
        totalReviews: totalReviews,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete review
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    const review = await Review.findOneAndDelete({
      _id: reviewId,
      user: userId,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found or unauthorized",
      });
    }

    // Update course rating
    const reviews = await Review.find({ course: review.course });
    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((acc, item) => acc + item.rating, 0) / totalReviews
        : 0;

    await Course.findByIdAndUpdate(
      review.course,
      {
        averageRating: parseFloat(averageRating.toFixed(1)),
        totalReviews: totalReviews,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
      review: null,
      courseStats: {
        averageRating: parseFloat(averageRating.toFixed(1)),
        totalReviews: totalReviews,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Check user review status
export const checkUserReview = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id || req.id;

    // Check if user has reviewed
    const review = await Review.findOne({
      course: courseId,
      user: userId,
    }).populate("user", "name email avatar");

    // Get course with lectures for accurate count
    const course = await Course.findById(courseId)
      .populate("lectures", "_id")
      .select("lectures enrolledStudents");
    
    const totalLectures = course?.lectures?.length || 0;

    // Get user progress
    const userProgress = await CourseProgress.findOne({
      userId: userId,
      courseId: courseId,
    });

    let completedLectures = 0;
    let completionPercentage = 0;

    if (userProgress && userProgress.lectureProgress) {
      completedLectures = userProgress.lectureProgress
        .filter(lp => lp.viewed === true)
        .length || 0;
      
      completionPercentage = totalLectures > 0
        ? Math.round((completedLectures / totalLectures) * 100)
        : 0;
    }

    const isCompleted = completionPercentage >= 100;
    const canReview = isCompleted && !review;

    res.status(200).json({
      success: true,
      hasReviewed: !!review,
      review: review || null,
      completionStatus: {
        completed: completedLectures,
        total: totalLectures,
        percentage: completionPercentage,
        isCompleted: isCompleted,
      },
      canReview: canReview,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};