import { z } from "zod";

export const PaymentSchema = z.object({
    amount: z
        .coerce
        .number({
            required_error: "Amount is required"
        })
        .positive({
            message:
                "Amount must be a positive number"
        }),

    paymentMethod: z
        .enum(["Transfer", "Cash"], {
            required_error:
                "Payment method is required"
        }),

    transactionId: z
        .string()
        .trim()
        .optional(),

    courseId: z
        .string({
            required_error:
                "Course ID is required"
        })
        .trim()
        .min(1, {
            message:
                "Course ID is required"
        }),

    coursePrice: z
        .coerce
        .number({
            required_error:
                "Course price is required"
        })
        .positive(),

    paymentType: z
        .enum(["full", "partial"], {
            required_error:
                "Payment type is required"
        }),

    receiptUrl: z
        .string()
        .optional()
}).superRefine((data, ctx) => {
    if (data.paymentMethod !== "Transfer") {
        return;
    }

    if (!data.transactionId) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["transactionId"],
            message: "Transaction ID is required"
        });
        return;
    }

    if (data.transactionId.length < 5) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["transactionId"],
            message: "Transaction ID must be at least 5 characters"
        });
    }
}).transform((data) => {
    if (data.paymentMethod !== "Cash") {
        return data;
    }

    const { transactionId, ...cashPayment } = data;
    return cashPayment;
});