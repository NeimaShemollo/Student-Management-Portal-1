import mongoose from "mongoose";

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
