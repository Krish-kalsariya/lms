import mongoose from "mongoose";

const lectureProgressSchema = new mongoose.Schema({
  lectureId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lecture",
  },
  viewed: {
    type: Boolean,
    default: false,
  },
});

const courseProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    completed: {
      type: Boolean,
      default: false,
    },
    lectureProgress: [lectureProgressSchema],
  },
  { timestamps: true }
);

const CourseProgress = mongoose.model("CourseProgress", courseProgressSchema);
export default CourseProgress;