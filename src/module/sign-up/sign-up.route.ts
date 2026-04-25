import { Hono } from "hono";
import { SignUpController } from "./sign-up.controller.js";
import { validator } from "../../util/validate-zod.js";
import { signUpSchema } from "./sign-up.schema.js";


export const signUpRoute = new Hono();



signUpRoute.post(
    '', 
    validator('json', signUpSchema),
    SignUpController
);


