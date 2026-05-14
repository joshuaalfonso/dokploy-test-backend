import z from "zod";



export const createTaskSchema = z.object({
  project_id: z.number().min(1),
  task_title: z.string().min(3),
  task_description: z.string().min(10),
  status: z.enum(['todo', 'in progress', 'for review', 'completed']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Due date must be in YYYY-MM-DD format",
    })
})