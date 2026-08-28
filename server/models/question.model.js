import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },

    question: {
      type: String,
      required: true,
    },

    options: {
      type: [String],
      validate: v => v.length === 4,
      required: true,
    },

    correctAnswer: {
      type: Number, // 0-3
      required: true,
    },

    explanation: String,
  },
  { timestamps: true }
);
const Question = mongoose.model("Question", questionSchema);  
export default Question;