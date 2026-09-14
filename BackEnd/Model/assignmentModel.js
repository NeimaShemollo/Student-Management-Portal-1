import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true
    },
    title: {
      type: String,
      required: true // e.g., "Assignment 1: React Basics"
    },
    repoUrl: {
      type: String,
      trim: true // e.g., GitHub link submitted by student
    },
    notes: {
      type: String // Optional student remarks
    },
    status: {
      type: String,
      enum: ["pending", "graded"],
      default: "pending"
    },
    grade: {
      type: String,
      default: "—" // e.g., "85/100" once graded by instructor
    },
    feedback: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

const Assignment = mongoose.model("Assignment", assignmentSchema);
export default Assignment;
