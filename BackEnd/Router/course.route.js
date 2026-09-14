import express from "express";

import {verifyAccessToken,
    isAdmin
} from "../Middlewares/authMiddleware.js";

import {
    getCourseDetail,
    createCourse,
    updateCourse,
    getAllCourses,
    deleteCourse,
    assignCourseToInstructor
} from "../Controller/courseController.js";

import { validate }
    from "../Middlewares/validate.js";

import CourseSchema
    from "../Schema/CourseSchema.js";


export const courseRoute =
    express.Router();


courseRoute.get(
    "/view",
    verifyAccessToken,
    getAllCourses
);


courseRoute.post(
    "/create",
    verifyAccessToken,
    isAdmin,
    createCourse
);


courseRoute.put(
    "/update/:id",
    verifyAccessToken,
    isAdmin,
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
     getCourseDetail);
courseRoute.post(
    "/assign-course",
    assignCourseToInstructor)