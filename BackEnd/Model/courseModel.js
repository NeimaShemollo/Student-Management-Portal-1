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
            trim: true,
            index:true
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
        image:{
            type:String,
            required:true,
            default: "uploads/default-placeholder.png"
        },

        modules: [
            {
                title: { type: String, required: true }, 
                lessons: [
                    {
                        name: { type: String, required: true }, 
                        type: { type: String, enum: ["video", "reading", "quiz"], default: "video" },
                        duration: { type: String }, 
                        contentUrl: { type: String } 
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
