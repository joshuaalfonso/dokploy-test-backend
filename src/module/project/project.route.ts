import { Hono } from "hono";
import { authMiddleware } from "../../middleware/auth.js";
import { validator } from "../../util/validate-zod.js";
import { createProjectController, getPaginatedProjectController, getProjectByWorkspaceController, getProjectMemberController, getProjectTimelineByUserController, getSingleProjectController, updateProjectController } from "./project.controller.js";
import { createProjectSchema, updateProjectSchema } from "./project.schema.js";


export const projectRoute = new Hono();


// projectRoute.get('', authMiddleware ,getProjectByUserController);
projectRoute.get(
    '/paginated/:workspace_id', 
    authMiddleware ,
    getPaginatedProjectController
);
projectRoute.get('/:workspace_id', authMiddleware ,getProjectByWorkspaceController);
projectRoute.get('/detail/:project_id', authMiddleware ,getSingleProjectController);
projectRoute.get('/member/:project_id', authMiddleware ,getProjectMemberController);
projectRoute.get('/timeline/:project_id' ,getProjectTimelineByUserController);

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