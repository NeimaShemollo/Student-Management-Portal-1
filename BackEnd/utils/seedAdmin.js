import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "../Model/usersModel.js"; // adjust path to match your project structure

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/your-db-name";

const ADMIN_DATA = {
    fullName: process.env.ADMIN_NAME || "Super Admin",
    emailAddress: process.env.ADMIN_EMAIL || "admin@gmail.com",
    phone: process.env.ADMIN_PHONE || "0000000000",
    birthDate: process.env.ADMIN_BIRTHDATE || "1990-01-01",
    gender: "male",
    academicBackground: "N/A",
    selectSupportType: ["none"],
    password: process.env.ADMIN_PASSWORD || "Admin@1234",
    role: "admin",
    status: "active"
};

const seedAdmin = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");

        const existingAdmin = await User.findOne({ emailAddress: ADMIN_DATA.emailAddress });

        if (existingAdmin) {
            console.log(`Admin already exists: ${existingAdmin.emailAddress}`);
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(ADMIN_DATA.password, 10);

        const admin = new User({
            ...ADMIN_DATA,
            password: hashedPassword
        });

        await admin.save();

        console.log("Admin user created successfully:");
        console.log(`  Email:    ${ADMIN_DATA.emailAddress}`);
        console.log(`  Password: ${ADMIN_DATA.password} (change this after first login)`);

        process.exit(0);
    } catch (error) {
        console.error("Error seeding admin user:", error.message);
        process.exit(1);
    }
};

seedAdmin();