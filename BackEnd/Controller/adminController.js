import Payment from "../Model/paymentModel.js";
import User from "../Model/usersModel.js";
import Course from "../Model/courseModel.js";

export const getAdminOverviewStats = async (req, res) => {
    try {
        // 1. Gather live telemetry metric counters
        const totalStudents = await User.countDocuments({ role: "student" });
        const totalInstructors = await User.countDocuments({ role: "instructor" });
        const activeCourses = await Course.countDocuments();

        // 2. Aggregate monthly income tracking for the Admin Chart Curve
        const revenueAggregate = await Payment.aggregate([
            { $match: { status: "completed" } },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    monthlyTotal: { $sum: "$amountPaid" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        const monthsMap = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        // Match numbers to strings or populate baseline zeroes if the cluster is fresh
        const liveRevenueCurve = monthsMap.map((month, index) => {
            const match = revenueAggregate.find(item => item._id === (index + 1));
            return {
                name: month,
                Earnings: match ? match.monthlyTotal : 0
            };
        }).slice(0, new Date().getMonth() + 1); // Crop array to the current calendar month

        return res.status(200).json({
            success: true,
            counters: { totalStudents, totalInstructors, activeCourses },
            chartData: liveRevenueCurve
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
