import Course from "../Model/courseModel.js";
import User from "../Model/usersModel.js";
import { clearCourseCache } from "../Middlewares/cacheMiddleware.js";
export const createCourse = async (req, res) => {
    try {
        // 1. Destructure the exact keys coming from the frontend ManageCourses.jsx file
        const { 
            title, 
            code, 
            price, 
            description, 
            duration, 
            instructorId, 
            batchNumber, 
            programType 
        } = req.body;

        // 2. Validate thumbnail image arrival
        if (!req.file) {
            return res.status(400).json({ message: "Please upload a course thumbnail image." });
        }
        const imagePath = req.file.path.replace(/\\/g, "/");

        // 3. Avoid Mongoose CastError crash if selector dropdown is blank ""
        const validatedInstructor = instructorId && instructorId !== "null" && instructorId !== "" 
            ? instructorId 
            : undefined;

        // 4. Create document matching your Schema properties perfectly (with proper commas!)
        const newCourse = await Course.create({
            courseName: title,
            courseCode: code,
            coursePrice: Number(price), 
            description: description,
            courseDuration: duration,
            instructorId: validatedInstructor,
            batchNumber: batchNumber,     
            programType: programType,  
            image: imagePath              
        });

        clearCourseCache();

        return res.status(201).json({
            message: "Course created successfully!",
            data: newCourse
        });

    } catch (error) {
        console.error("Backend Course Creation Error:", error.message);
        
        // Handle unique courseCode collisions cleanly
        if (error.code === 11000) {
            return res.status(400).json({ message: "A course with this Course Code already exists." });
        }
        
        return res.status(500).json({ message: error.message });
    }
};




export const getAllCourses = async (req, res) => {
    try {
        const courses =
            await Course.find()
                .populate(
                    "instructorId",
                    "fullName emailAddress"
                );

        return res.status(200).json({
            data: courses
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};



export const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Destructure the exact keys coming from the frontend FormData payload
        const { 
            title, 
            code, 
            price, 
            description, 
            duration, 
            instructorId, 
            batchNumber, 
            programType 
        } = req.body;

        // 2. Build the update payload map to align frontend data with schema properties
        const updateData = {
            courseName: title,
            courseCode: code,
            coursePrice: price ? Number(price) : undefined,
            description: description,
            courseDuration: duration, // 🌟 ALIGNMENT FIX: Maps 'duration' -> 'courseDuration'
            batchNumber: batchNumber,
            programType: programType
        };

        // 3. Clear or update optional instructor references safely
        if (instructorId === "" || instructorId === "null") {
            updateData.instructorId = null;
        } else if (instructorId) {
            updateData.instructorId = instructorId;
        }

        // 4. Check if the user selected a new course thumbnail image file during edit
        if (req.file) {
            updateData.image = req.file.path.replace(/\\/g, "/");
        }

        // 5. Send the structured updateData to your cluster instead of raw req.body
        const updatedCourse = await Course.findByIdAndUpdate(
            id,
            { $set: updateData },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedCourse) {
            return res.status(404).json({
                message: "Course not found."
            });
        }

        clearCourseCache();

        return res.status(200).json({
            message: "Course updated successfully!",
            data: updatedCourse
        });

    } catch (error) {
        console.error("Backend Course Update Error:", error.message);
        return res.status(500).json({
            message: error.message
        });
    }
};



export const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedCourse =
            await Course.findByIdAndDelete(id);

        if (!deletedCourse) {
            return res.status(404).json({
                message: "Course not found."
            });
        }

        clearCourseCache();

        return res.status(200).json({
            message:
                "Course deleted successfully!"
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};


export const getCourseDetail = async (req, res) => {
    try {
        const { courseId } = req.params;

        // Find the course and populate the instructor details if needed
        const course = await Course.findById(courseId).populate("instructorId", "fullName emailAddress");

        if (!course) {
            return res.status(404).json({
                message: "Course program structure not found."
            });
        }

        return res.status(200).json({
            data: course
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

export const assignCourseToInstructor = async (req, res) => {
  try {
    const { instructorId, courseId } = req.body;

    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    
    const instructor = await User.findById(instructorId);
    if (!instructor || instructor.role !== "instructor") {
      return res.status(404).json({ message: "Instructor not found or invalid role" });
    }
    course.instructorId = instructorId; 
    await course.save();
    clearCourseCache();
    res.status(200).json({
      message: "Course successfully assigned to instructor",
      data: course
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal server error" });
  }
}


export const uploadLessonMaterial = async (req, res) => {
    try {
        const { courseId, moduleTitle, lessonName, lessonType, duration } = req.body;

        // 1. Verify a file was sent by the client form
        if (!req.file) {
            return res.status(400).json({ message: "Please select an asset file to attach to this lesson." });
        }

        const savedMaterialPath = req.file.path.replace(/\\/g, "/");

        // 2. Locate the course document registry
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Target course program not found." });
        }

        // 3. Find or push the module title category container
        let targetModule = course.modules.find(m => m.title.toLowerCase() === moduleTitle.trim().toLowerCase());
        if (!targetModule) {
            course.modules.push({ title: moduleTitle.trim(), lessons: [] });
            targetModule = course.modules[course.modules.length - 1];
        }

        // 4. 🌟 MATCHES SCHEMA ENUM: Append the lesson into the module tracking node array
        targetModule.lessons.push({
            name: lessonName,
            type: lessonType, // 💡 Maps exactly to: "video", "reading", or "quiz"
            duration: duration || "N/A",
            contentUrl: savedMaterialPath // Storing file path pointer string locally
        });

        await course.save();

        // 🔥 CACHE PURGE: Clears RAM memory buffers instantly so students view updates immediately
        clearCourseCache();

        return res.status(200).json({
            success: true,
            message: "Course content material synchronized successfully!",
            data: course
        });

    } catch (error) {
        console.error("Material Upload Sync Failure:", error.message);
        return res.status(500).json({ message: error.message });
    }
};





