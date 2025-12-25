import mongoose  from "mongoose";

const courseSchema = new mongoose.Schema({
    courseTitle: {
        type: String,
        required: true, 
    },
    subtitle: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    category: {
        type: String,
        required: true, 
    },
    courseLevel: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'], 
    },
    courseprice:{
        type: Number,
    },
    courseThumbnail: {
        type: String,
    },
    enrolledStudents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    lectures: [{
            type: mongoose.Schema.Types.String,
            required: true,
 } 
],
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    ispublished: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

const Course = mongoose.model("Course", courseSchema);
