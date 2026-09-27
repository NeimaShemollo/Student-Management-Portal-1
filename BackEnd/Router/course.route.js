import express from "express";
import multer from "multer"; 
import {courseCacheGate} from "../Middlewares/cacheMiddleware.js"
import {
    verifyAccessToken,
    isAdmin
} from "../Middlewares/authMiddleware.js";

import {
    getCourseDetail,
    createCourse,
    updateCourse,
    getAllCourses,
    deleteCourse,
    assignCourseToInstructor,
    uploadLessonMaterial
} from "../Controller/courseController.js";

import { validate } from "../Middlewares/validate.js";
import CourseSchema from "../Schema/CourseSchema.js";

export const courseRoute = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); 
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); 
    }
});

const upload = multer({ storage: storage });

// Public view route
courseRoute.get(
    "/view",
    courseCacheGate,
    getAllCourses
);

// 2. FIXED: Combined authorization, file processing, and creation logic together safely
courseRoute.post(
    "/create",
    verifyAccessToken,              // Step A: Check if logged in
    isAdmin,                        // Step B: Check if they are an admin
    upload.single("image"),         // Step C: Intercept and upload the image file to /uploads
    createCourse                    // Step D: Execute controller and save to MongoDB
);

courseRoute.put(
    "/update/:id",
    verifyAccessToken,
    isAdmin,
    upload.single("image"),
    updateCourse
);

courseRoute.delete(
    "/delete/:id",
    verifyAccessToken,
    isAdmin,
    deleteCourse
);

courseRoute.get(
    "/detail/:courseId",
    verifyAccessToken, 
    getCourseDetail
);

courseRoute.post(
    "/assign-course",
    assignCourseToInstructor
);
courseRoute.post(
    "/courses/upload-material", 
    verifyAccessToken, 
    isAdmin, 
    upload.single("materialFile"),
    uploadLessonMaterial
);
