import mongoose from "mongoose";
import dns from "dns"; 

dns.setServers(["1.1.1.1", "8.8.8.8"]); // Fixes local network ETIMEOUT issues

import dotenv from "dotenv";
dotenv.config();

const COURSE_DATA = [
  {
    // 🌟 FULLY COMPATIBLE DATA MAP FOR BOTH USER AND ADMIN FIELDS:
    courseName: "Full-Stack Web Development",
    title: "Full-Stack Web Development", // Fixes Admin Dashboard Table
    
    coursePrice: 499,
    price: 499, // Fixes Admin Dashboard Table
    
    courseCode: "FSWD-101",
    description: "Master React, Node.js, Express, and MongoDB to build complex full-stack web applications from scratch.",
    courseDuration: "12 Weeks",
    batchNumber: "B-2026-FS",
    programType: "Hybrid",
    image: "uploads/default-placeholder.png",
    status: "active",
    isPublished: true,
    isDeleted: false
  },
  {
    courseName: "Python Programming Masters",
    title: "Python Programming Masters",
    
    coursePrice: 299,
    price: 299,
    
    courseCode: "PY-202",
    description: "Learn Python from complete scratch. Covers basic script workflows, object-oriented concepts, and core data engineering algorithms.",
    courseDuration: "8 Weeks",
    batchNumber: "B-2026-PY",
    programType: "Online",
    image: "uploads/default-placeholder.png",
    status: "active",
    isPublished: true,
    isDeleted: false
  },
  {
    courseName: "Professional Video Editing",
    title: "Professional Video Editing",
    
    coursePrice: 349,
    price: 349,
    
    courseCode: "VE-303",
    description: "Master timeline stitching, cinematic audio tracks grading, color transitions editing cuts, and motion graphics styling configurations.",
    courseDuration: "6 Weeks",
    batchNumber: "B-2026-VE",
    programType: "In-Person",
    image: "uploads/default-placeholder.png",
    status: "active",
    isPublished: true,
    isDeleted: false
  },
  {
    courseName: "Advanced Digital Marketing",
    title: "Advanced Digital Marketing",
    
    coursePrice: 199,
    price: 199,
    
    courseCode: "DM-404",
    description: "Boost business models tracking streams using Search Engine Optimization (SEO), programmatic ad analytics, and social media outreach campaign builds.",
    courseDuration: "4 Weeks",
    batchNumber: "B-2026-DM",
    programType: "Online",
    image: "uploads/default-placeholder.png",
    status: "active",
    isPublished: true,
    isDeleted: false
  }
];



// 🌟 FIXED: Unified into a single functional entry track
const seedCourses = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB Atlas for catalog tracking...");

    // Get direct access to the raw MongoDB 'courses' collection
    const coursesCollection = mongoose.connection.collection("courses");

    for (const item of COURSE_DATA) {
      // Direct raw query check
      const existing = await coursesCollection.findOne({ courseCode: item.courseCode });
      
      if (!existing) {
        // Add timestamps manually since we are bypassing Mongoose models
        await coursesCollection.insertOne({
          ...item,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log(`Successfully added course: ${item.courseName}`);
      } else {
        console.log(`Course code ${item.courseCode} already exists, skipping.`);
      }
    }

    console.log("All custom program courses have been cleanly loaded into your catalog database!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed error dump:", error.message);
    process.exit(1);
  }
};

seedCourses();
