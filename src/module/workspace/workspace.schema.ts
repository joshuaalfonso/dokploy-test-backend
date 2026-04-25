import z from "zod";





export const workspaceParamSchema = z.object({
  user_id: z.string().regex(/^\d+$/, 'ID must be numeric'),
})