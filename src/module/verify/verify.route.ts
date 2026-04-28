import { Hono } from "hono";
import { validator } from "../../util/validate-zod.js";
import { verifyEmailSchema } from "./verify.schema.js";
import { verifyEmailController } from "./verify.controller.js";






export const verifyEmailRoute = new Hono();



verifyEmailRoute.post(
    '', 
    validator('json', verifyEmailSchema),
    verifyEmailController
);



