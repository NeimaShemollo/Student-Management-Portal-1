import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
    {
        courseName: {
            type: String,
            required: true,
            trim: true
        },

        courseCode: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true
        },
        coursePrice: {
            type: Number,
            required: true,
            default: 0
        },

        description: {
            type: String
        },

        courseDuration: {
            type: String,
            required: true
        },

        instructorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        batchNumber: {
            type: String,
            required: true
        },

        programType: {
            type: String,
            required: true
        },

        // 🌟 ADDED THIS FOR YOUR CLASSROOM LESSONS:
        modules: [
            {
                title: { type: String, required: true }, // e.g., "Module 1: Introduction"
                lessons: [
                    {
                        name: { type: String, required: true }, // e.g., "Getting Started"
                        type: { type: String, enum: ["video", "reading", "quiz"], default: "video" },
                        duration: { type: String }, // e.g., "15 mins"
                        contentUrl: { type: String } // Streaming link or file path
                    }
                ]
            }
        ]
    },
    {
        timestamps: true
    }
);

const Course = mongoose.model("Course", courseSchema);

export default Course;
