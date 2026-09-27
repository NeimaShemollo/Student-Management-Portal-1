import { z } from "zod";

const CourseSchema = z.object({
    courseName: z
        .string({
            required_error: "Course name is required"
        })
        .trim()
        .min(2, {
            message:
                "Course name must be at least 2 characters long"
        }),

    courseCode: z
        .string({
            required_error: "Course code is required"
        })
        .trim()
        .min(2, {
            message:
                "Course code must be at least 2 characters long"
        })
        .toUpperCase(),

    description: z
        .string()
        .optional(),

    credits: z
        .coerce
        .number({
            required_error: "Credits are required"
        })
        .positive({
            message:
                "Credits must be a positive number"
        }),

    // instructorId: z
    //     .string({
    //         required_error:
    //             "Instructor ID is required"
    //     })
    //     .min(0, {
    //         message:
    //             "Instructor ID cannot be empty"
    //     }),

    batchNumber: z
        .string({
            required_error:
                "Batch number is required"
        })
        .min(1, {
            message:
                "Batch number cannot be empty"
        }),

    programType: z
        .string({
            required_error:
                "Program type is required"
        })
        .min(1, {
            message:
                "Program type cannot be empty"
        })
});

export default CourseSchema;