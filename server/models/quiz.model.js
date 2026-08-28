import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: String,

    timeLimit: {
      type: Number, // minutes
      default: 0,
    },

    attemptsAllowed: {
      type: Number,
      default: 1,
    },

    passPercentage: {
      type: Number,
      default: 40,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Quiz = mongoose.model("Quiz", quizSchema);
export default Quiz;