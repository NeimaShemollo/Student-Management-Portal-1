import "dotenv/config"; // 1. THIS MUST BE THE FIRST LINE
import dns from "dns"; 
dns.setServers(["1.1.1.1", "8.8.8.8"]); // Fixes the ETIMEOUT issue

import express from "express";
import cors from "cors";
import DBConnect from "./Config/dbConfig.js"; // 2. Safe to import now!
import cookieParser from "cookie-parser";

import { userRoute } from "./Router/user.route.js";
import { authRoute } from "./Router/auth.route.js";
import { courseRoute } from "./Router/course.route.js";
import { paymentRoute } from "./Router/payment.route.js";

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

// Routes
app.use("/api/user", userRoute);
app.use("/api/auth", authRoute);
app.use("/uploads", express.static("uploads"));
app.use("/api/course", courseRoute);
app.use("/api/payment", paymentRoute);

// Error handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        message: err.message || "Internal Server Error"
    });
});

// Start DB connection, then boot up Express server
// Start DB connection, then boot up Express server
const startServer = async () => {
    console.log("Initializing database connection...");
    
    await DBConnect(); 
    
    app.listen(port, () => {
        console.log(`Server is listening on port ${port}`);
    });
};

startServer();

