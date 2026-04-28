import z from "zod";





export const verifyEmailSchema = z.object({
     email: z.string().email('Invalid email format'),
     code: z.string().length(6)
})