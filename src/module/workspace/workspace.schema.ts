import z from "zod";





export const workspaceParamSchema = z.object({
  user_id: z.string().regex(/^\d+$/, 'ID must be numeric'),
})



export const createWorkspaceSchema = z.object({
  workspace_name: z.string().min(3),
  description: z.string().optional()
})