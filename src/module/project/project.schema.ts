import z from "zod";







export const createProjectSchema = z.object({
  workspace_id: z.number().min(1),
  project_name: z.string().min(3),
  project_description: z.string().min(10)
})