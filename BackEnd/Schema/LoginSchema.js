import { z } from "zod";

const LoginSchema = z.object({
    emailAddress: z
        .string({
            required_error: "Email address is required"
        })
        .trim()
        .email({
            message: "Invalid email format"
        }),

    password: z
        .string({
            required_error: "Password is required"
        })
        .min(4, {
            message: "Password must be at least 4 characters long"
        })
});

export default LoginSchema;