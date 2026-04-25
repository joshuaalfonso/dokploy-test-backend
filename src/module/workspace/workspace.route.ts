import { Hono } from "hono";
import { getWorkspaceByUserController, getWorkspaceController } from "./workspace.controller.js";
import z from "zod";
import { validator } from "../../util/validate-zod.js";
import { workspaceParamSchema } from "./workspace.schema.js";
import { authMiddleware } from "../../middleware/auth.js";





export const workspaceRoute = new Hono();


workspaceRoute.get('', authMiddleware, getWorkspaceController);

workspaceRoute.get(
    '/:user_id', 
    authMiddleware,
    validator('param', workspaceParamSchema), 
    getWorkspaceByUserController
)