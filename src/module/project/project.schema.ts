import z from "zod";







export const createProjectSchema = z.object({
  workspace_id: z.number().min(1),
  project_name: z.string().min(3),
  project_description: z.string().min(10),
  status: z.enum(['planning', 'active', 'inactive', 'completed'])
})

export const updateProjectSchema = z.object({
  project_id: z.number().min(1),
  project_name: z.string().min(3),
  project_description: z.string().min(10),
  status: z.enum(['planning', 'active', 'inactive', 'completed'])
})