import { z } from "zod";

const RegistrationSchema = z.object({
    fullName: z
        .string({
            required_error: "Full name is required"
        })
        .trim()
        .min(3, {
            message: "Full name must be at least 3 characters long"
        }),

    emailAddress: z
        .string({
            required_error: "Email address is required"
        })
        .trim()
        .email({
            message: "Invalid email format"
        }),

    phone: z
        .string({
            required_error: "Phone number is required"
        })
        .trim()
        .min(10, {
            message: "Please enter a valid phone number"
        }),

    birthDate: z
        .string({
            required_error: "Birth date is required"
        }),

    gender: z.enum(["male", "female"], {
        required_error: "Gender is required"
    }),

    academicBackground: z
        .string({
            required_error: "Academic background is required"
        })
        .trim()
        .min(5, {
            message: "Please describe your academic background"
        }),

    selectSupportType: z
        .array(
            z.enum(["Online", "In-person", "none"])
        )
        .optional(),

    password: z
        .string({
            required_error: "Password is required"
        })
        .min(6, {
            message: "Password must be at least 6 characters long"
        })
});

export default RegistrationSchema;