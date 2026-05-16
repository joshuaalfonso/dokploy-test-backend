import z from "zod";





export const createProjectSchema = z.object({
  workspace_id: z.number().min(1),
  project_name: z.string().min(3),
  project_description: z.string().min(10),
  status: z.enum(['planning', 'active', 'inactive', 'completed']),
  project_member: z.array(
    z.object({
      user_id: z.number(),
      role: z.enum(['admin', 'member', 'viewer'])
    })
  )
})

export const updateProjectSchema = z.object({
  project_id: z.number().min(1),
  project_name: z.string().min(3),
  project_description: z.string().min(10),
  status: z.enum(['planning', 'active', 'inactive', 'completed'])
})