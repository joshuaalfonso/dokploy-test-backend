import { Hono } from "hono";
import { logInController } from "./log-in.controller.js";
import { validator } from "../../util/validate-zod.js";
import { logInSchema } from "./log-in.schema.js";




export const logInRoute = new Hono();


logInRoute.post(
    '', 
    validator('json', logInSchema),
    logInController
)