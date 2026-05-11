import { Hono } from "hono";
import { authMiddleware } from "../../middleware/auth.js";
import { getWorkspaceMemberController } from "./workspace-member.controller.js";







export const workspaceMemberRoute = new Hono();


workspaceMemberRoute.get('', (c) => {
    return c.json({success: true})
});

workspaceMemberRoute.get(
    '/:workspace_id',
    authMiddleware, 
    getWorkspaceMemberController
)