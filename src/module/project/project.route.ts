import { Hono } from "hono";
import { authMiddleware } from "../../middleware/auth.js";
import { validator } from "../../util/validate-zod.js";
import { createProjectController, getProjectByUserController, getProjectByWorkspaceController, updateProjectController } from "./project.controller.js";
import { createProjectSchema, updateProjectSchema } from "./project.schema.js";


export const projectRoute = new Hono();


projectRoute.get('', authMiddleware ,getProjectByUserController);
projectRoute.get('/:workspace_id', authMiddleware ,getProjectByWorkspaceController);

projectRoute.post(
    '',
    authMiddleware,
    validator('json', createProjectSchema),
    createProjectController
);

projectRoute.post(
    '',
    authMiddleware,
    validator('json', updateProjectSchema),
    updateProjectController
);