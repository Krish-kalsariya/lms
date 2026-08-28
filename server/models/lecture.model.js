import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    videoInfo: {
      videoUrl: {
        type: String,
        required: true,
      },
      publicId: {
        type: String,
        required: true,
      },
      duration: {
        type: Number, // ✅ seconds
        default: 0,
      },
    },

    isPreviewFree: {
      type: Boolean,
      default: false,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
  },
  { timestamps: true }
);

const Lecture = mongoose.model("Lecture", lectureSchema);
export default Lecture;