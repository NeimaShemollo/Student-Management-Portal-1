import {z} from "zod"

export const ResetPasswordSchema = z.object({
    token: z
     .string({required_error:"Reset token is required"})
     .trim()
     .min(1,{message:"Reset token cannot be empty"}),
    newPassword: z
     .string({required_error:"New password is required"})
     .min(6,{message:"New password must be at least 6 characters long"}),
})