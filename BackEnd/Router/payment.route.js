import express from "express";

import { verifyAccessToken,
    isAdmin
} from "../Middlewares/authMiddleware.js";

import {
    getStudentCourses,
    getMyStatus,
    studentSubmitPayment,
    reviewPayment,
    getAllPayments,
    getMyPayments
} from "../Controller/paymentController.js";

import {
    PaymentSchema
} from "../Schema/PaymentSchema.js";

import { validate }
    from "../Middlewares/validate.js";


export const paymentRoute =
    express.Router();


paymentRoute.post(
    "/submit",
    verifyAccessToken,
    validate(PaymentSchema),
    studentSubmitPayment
);


paymentRoute.put(
    "/review/:id",
    verifyAccessToken,
    isAdmin,
    reviewPayment
);

paymentRoute.get(
    "/my-payments",
    verifyAccessToken,
    getMyPayments
);

paymentRoute.get(
    "/",
    verifyAccessToken,
    isAdmin,
    getAllPayments
);

paymentRoute.get(
    "/my-status", 
    verifyAccessToken, 
    getMyStatus);
paymentRoute.get(
    "/student/my-courses", 
    verifyAccessToken, 
    getStudentCourses)