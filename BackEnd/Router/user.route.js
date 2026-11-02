import express from "express";

import {register,viewUser,updateUser,getAllStudents,getAllInstructors,registerUserByAdmin,getStudent
,updateUserStatus,updateInstructorStatus,updateInstructorProfile,deleteInstructor} from "../Controller/userController.js";

import {verifyAccessToken, isAdmin, isStudent} from "../Middlewares/authMiddleware.js";

import userSchema from "../Schema/userSchema.js";
import {getAdminOverviewStats} from "../Controller/adminController.js" 
import { submitAssignment,getMyAssignments } from "../Controller/assignmentController.js";
import { validate }from "../Middlewares/validate.js";


export const userRoute =
    express.Router();


userRoute.post(
    "/register",
    validate(userSchema),
    register
);


userRoute.get(
    "/view",
    verifyAccessToken,
    isAdmin,
    viewUser
);


userRoute.put(
    "/update/:id",
    verifyAccessToken,
    isAdmin,
    updateUser
);


userRoute.get(
    "/students-list",
    verifyAccessToken,
    isAdmin,
    getAllStudents
);
userRoute.get(
    "/instructors-list",
    verifyAccessToken,
    isAdmin,
    getAllInstructors
);

userRoute.post(
    "/register-staff",
    verifyAccessToken,
    isAdmin,
    registerUserByAdmin
);

userRoute.get(
    "/student",
    verifyAccessToken,
    isStudent,
    getStudent
);
userRoute.patch(
    "/user/status/:id",
    verifyAccessToken,
    isAdmin,
    updateUserStatus);
userRoute.post(
        "/student/submit-assignment",
        verifyAccessToken,
        submitAssignment);
 userRoute.get(
        "/student/my-assignments",
        verifyAccessToken,
        isStudent,
        getMyAssignments)

 userRoute.get(
    "/overview-stats",
     verifyAccessToken, 
     isAdmin, 
     getAdminOverviewStats);
userRoute.patch(
    "/instructor/status/:id", 
    verifyAccessToken,
     isAdmin,
     updateInstructorStatus);
userRoute.put(
    "/update/:id", 
    verifyAccessToken, 
    isAdmin, 
    updateInstructorProfile);
userRoute.delete(
    "/delete/:id",
     verifyAccessToken, 
     isAdmin,
      deleteInstructor);
