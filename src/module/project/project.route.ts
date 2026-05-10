import { Hono } from "hono";
import { authMiddleware } from "../../middleware/auth.js";
import { validator } from "../../util/validate-zod.js";
import { createProjectController, getProjectByUserController } from "./project.controller.js";
import { createProjectSchema } from "./project.schema.js";








export const projectRoute = new Hono();


projectRoute.get('', getProjectByUserController);
projectRoute.get('/user_id', getProjectByUserController);

projectRoute.post(
    '',
    authMiddleware,
    validator('json', createProjectSchema),
    createProjectController
)