







import { z } from 'zod'

export const signUpSchema = z.object({
    full_name: z.string().min(5, 'Full name is too short'),
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

