import mongoose from "mongoose";

// function DBConnect() {
//     mongoose
//         .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/StudentManagement")
//         .then(() => console.log("MongoDB connected successfully"))
//         .catch((error) => {
//             console.error("MongoDB connection error:", error.message);
//         });
// }

// export default DBConnect;


const DBConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB Atlas connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:");
        console.error(error.message);
        process.exit(1);
    }
};

export default DBConnect;