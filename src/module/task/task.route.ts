import { Hono } from "hono";
import { createTaskController, getallTaskController, getTaskByProjectController } from "./task.controller.js";
import { createTaskSchema } from "./task.schema.js";
import { validator } from "../../util/validate-zod.js";
import { authMiddleware } from "../../middleware/auth.js";


export const taskRoute = new Hono();

taskRoute.get('', getallTaskController);
taskRoute.get('/project/:project_id', getTaskByProjectController);
taskRoute.post(
    '', 
    authMiddleware,
    validator('json', createTaskSchema),
    createTaskController,
)