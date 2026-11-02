import bcrypt from "bcrypt";
import User from "../Model/usersModel.js";
import toSafeUser from "../utils/toSafeUser.js";
import sendEmail from "../utils/sendEmail.js";
import Course from "../Model/courseModel.js"
import { clearCourseCache } from "../Middlewares/cacheMiddleware.js";

export const register = async (req, res) => {
    try {
        const {
            emailAddress,
            password,
            phone,
            role,
            status,
            passwordResetToken,
            passwordResetExpires,
            ...otherData
        } = req.body;

        const sanitizedEmail = emailAddress ? emailAddress.toLowerCase().trim() : "";
        const sanitizedPhone = phone ? phone.trim() : "";

        const existingUser = await User.findOne({
            $or: [
                { emailAddress : sanitizedEmail },
                { phone : sanitizedPhone }
            ]
        });

        if (existingUser) {
            const field =
                existingUser.emailAddress === sanitizedEmail
                    ? "Email"
                    : "Phone";
            return res.status(400).json({
                message: `${field} already exists`
            });
        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const newUser = await User.create({
            ...otherData,
            emailAddress : sanitizedEmail,
            phone : sanitizedPhone ,
            password: hashedPassword,
        });

        return res.status(201).json({
            message: "User registered successfully",
            data: toSafeUser(newUser)
        });

    } catch (error) {
        console.log(error);
       if(error.code === 11000){
          const duplicateField=Object.keys(error.keyValue)[0]
          return res.status(400).json({
             message: `${duplicateField ==='emailAddress' ? 'Email' : 'phone'} is already taken.`
          })
       }
        return res.status(500).json({
            message: "Server error"
        });
    }
};


export const viewUser = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip =(page - 1) * limit;
        const [users ,totalUsers ]= await Promise.all([
            User.find()
                .select("-password")
                .sort({ createdAt : -1})
                .skip(skip)
                .limit(limit),
            User.countDocuments()
        ])
        const totalPages = Math.ceil(totalUsers / limit);

        return res.status(200).json({
            message : "All users fetched successfully",
            pagination :{
                totalRecords : totalUsers,
                currentPage : page,
                totalPages : totalPages,
                perPage :limit,
                hasNextPage : page < totalPages,
                hasPrevPage : page > 1
            },
              data : users
        });

    } catch (error) {
        console.error("View User Pagination Error :",error.message)
        return res.status(500).json({
            message: "Server error while fetching global user directory registry "
        });
    }
};


export const updateUser = async (req, res) => {
    try {
        const { id } =req.params;
        const { fullName, phone, birthDate, gender, academicBackground, selectSupportType } = req.body;

        const safeUpdateData = { fullName, phone, birthDate, gender, academicBackground, selectSupportType };

        const updatedUser =
            await User.findOneAndUpdate(id,
                { $set: safeUpdateData},
                {
                    new: true,
                    runValidators: true
                }
            ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({
                message: "Phone number not found"
            });
        }

        return res.status(200).json({
            message: "Successfully updated",
            data: updatedUser
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error"
        });
    }
};


export const getAllStudents = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit ;
        const [students, totalStudents] = await Promise.all([
            User.find({ role: "student" })
                .select("-password")
                .sort({ createdAt: -1})
                .skip(skip)
                .limit(limit),
            User.countDocuments({ role:"student"})    

        ])
        const totalPages = Math.ceil(totalStudents / limit)
        
        return res.status(200).json({
            message: "Students fetched successfully",
            pagination:{
                totalRecords:totalStudents,
                currentPage: page,
                totalPages:totalPages,
                perPage:limit,
                hasNextPage:page < totalPages,
                hasPrevPage:page > 1
            },
            data: students
        });

    } catch (error) {
        console.error("getAllStudents paginated error:",error)
        return res.status(500).json({
            message: error.message || "Server error while gathering student records."
        });
    }
};

export const getAllInstructors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip =(page - 1) * limit;

    const [instructors ,totalInstructors] = await Promise.all([
        User.find({ role: "instructor" })
            .select("-password")
            .sort({createdAt: -1})
            .skip(skip)
            .limit(limit)
            .lean(),
        User.countDocuments({ role :"instructor"})
    ]) 
    
    const instructorsWithCounts = await Promise.all(
      instructors.map(async (instructor) => {
        
        const count = await Course.countDocuments({ instructorId: instructor._id });
        return {
          ...instructor,
          courseCount: count,
        };
      })
    );
    const totalPages = Math.ceil(totalInstructors /limit)
    return res.status(200).json({
         message:"Instructors fetched successfully",
         pagination: {
            totalRecords: totalInstructors,
            currentPage:page,
            totalPages:totalPages,
            perPage:limit,
            hasNextPage:page<totalPages,
            hasPrevPage:page > 1
         } ,
         data: instructorsWithCounts
        });
  } catch (error) {
    console.error("getAllInstructors paginated error:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const registerUserByAdmin = async (req, res) => {
    try {
        const {
            emailAddress,
            phone,
            role,
            passwordResetToken,
            passwordResetExpires,
            selectSupportType, // Pull this out to intercept the enum mismatch
            ...otherData
        } = req.body;

        const allowedRoles = ["instructor", "student"];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                message: "Role must be instructor or student"
            });
        }

        const existUser = await User.findOne({
            $or: [
                { emailAddress: emailAddress.toLowerCase().trim() },
                { phone: phone }
            ]
        });
        
        if (existUser) {
            return res.status(400).json({ message: "User with this email or phone already exists" });
        } 

        const structuredSupportType = Array.isArray(selectSupportType) 
            ? selectSupportType 
            : selectSupportType ? [selectSupportType] : ["Online"];

               const tempPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        
        const newUser = await User.create({
            emailAddress: emailAddress.toLowerCase().trim(),
            phone,
            password: hashedPassword,
            role,
            selectSupportType: structuredSupportType,
            ...otherData
        });

        // 🌟 THE INBOX REPAIR: Build a professional HTML layout template
        const emailSubject = "Welcome to Bright Tech Academy - Your Account Credentials";
        const emailText = `Hello, Your account has been successfully created. Your temporary password is: ${tempPassword}. Please log in and update your password immediately.`;
        
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #780d31; border-radius: 8px; max-width: 500px; margin: 0 auto;">
            <h2 style="color: #780d31; margin-top: 0;">Welcome to Bright Tech Academy!</h2>
            <p>Hello <strong>${otherData.fullName || 'User'}</strong>,</p>
            <p>Your portal account profile has been successfully configured as an <strong>${role.toUpperCase()}</strong>.</p>
            <p>Use these temporary automated credentials to access your classroom dashboard:</p>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 15px 0; border: 1px solid #eef2f7;">
              <p style="margin: 4px 0;"><strong>Portal Login:</strong> <a href="http://localhost:5173/login" style="color: #007bff;">Click Here to Login</a></p>
              <p style="margin: 4px 0;"><strong>Username / Email:</strong> ${emailAddress}</p>
              <p style="margin: 4px 0;"><strong>Temporary Password:</strong> <code style="font-size: 1.1rem; color: #dc3545; background: #fff; padding: 2px 6px; border: 1px solid #ddd; border-radius: 4px; font-weight: bold;">${tempPassword}</code></p>
            </div>
            <p style="color: #6c757d; font-size: 0.85rem; font-style: italic;">⚠️ For account security, please update this temporary password immediately inside your Settings page upon your first login.</p>
          </div>
        `;

        try {
            // 🌟 FIXED: Passed 'emailHtml' as the 4th argument so your sendEmail helper uses it
            await sendEmail(emailAddress, emailSubject, emailText, emailHtml);
        } catch (mailError) {
            console.error("⚠️ Background SMTP Delivery Failure:", mailError.message);
        }

        console.log(`🔑 DEV ACCESS KEY: Temporary password for ${emailAddress} is: ${tempPassword}`);

        return res.status(201).json({
            message: "User registered successfully and temporary password sent via email",
            user: { _id: newUser._id, emailAddress, role }
        });


    } catch (error) {
        console.error("Staff Registration Failure:", error.message);

        if(error.code === 11000){
          return res.status(400).json({
            message:"A concurrent request completed first.This email or phone already exists."
          })
        }
        return res.status(500).json({ message: error.message });
    }
};



export const getStudent = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select(
            "-password -passwordResetToken -passwordResetExpires"
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user.role !== "student") {
            return res.status(403).json({
                message: "Access denied. Student only."
            });
        }

        return res.status(200).json({
            message: "Student found",
            user: toSafeUser(user)
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Server error"
        });
    }
};
export const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params; 
        const { status } = req.body; // Expecting "active", "blocked", or "finished"

        // Match the lowercase enum array
        const allowedStatuses = ["active", "blocked", "finished","left"];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid status value. Must be active, blocked, or finished."
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { status: status },
            { new: true, runValidators: true }
        ).select("-password -passwordResetToken -passwordResetExpires");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            message: `User status successfully updated to ${status}`,
            user: toSafeUser(updatedUser)
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
export const updateInstructorStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updatedUser = await User.findByIdAndUpdate(id, { status }, { new: true });
        if (!updatedUser) return res.status(404).json({ message: "Instructor not found" });

        // 🔥 PLACE IT HERE: Wipes out the stale memory cache lines instantly!
        clearCourseCache(); 

        return res.status(200).json({ message: "Status updated successfully!", data: updatedUser });
    } catch (error) { return res.status(500).json({ message: error.message }); }
};

// 🌟 3. INSIDE YOUR UPDATE PROFILE CONTROLLER
export const updateInstructorProfile = async (req, res) => {
    try {
        const { id } = req.params;

        const updatedUser = await User.findByIdAndUpdate(id, { $set: req.body }, { new: true });
        
        // 🔥 PLACE IT HERE: Ensures the cache resets so the frontend table displays edited names/phones!
        clearCourseCache(); 

        return res.status(200).json({ message: "Profile updated successfully!", data: updatedUser });
    } catch (error) { return res.status(500).json({ message: error.message }); }
};

// 🌟 4. INSIDE YOUR DELETE CONTROLLER
export const deleteInstructor = async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);

        // 🔥 PLACE IT HERE: Removes the deleted instructor records from RAM immediately
        clearCourseCache(); 

        return res.status(200).json({ message: "Instructor deleted successfully." });
    } catch (error) { return res.status(500).json({ message: error.message }); }
};
