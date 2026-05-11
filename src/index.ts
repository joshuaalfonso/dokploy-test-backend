import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { testConnection } from './config/db.js';
import { signUpRoute } from './module/sign-up/sign-up.route.js';
import { cors } from 'hono/cors';
import { logInRoute } from './module/log-in/log-in.route.js';
import { workspaceRoute } from './module/workspace/workspace.route.js';
import { htmlVerifyTemplete, transport } from './config/smtp.js';
import { verifyEmailRoute } from './module/verify/verify.route.js';
import { projectRoute } from './module/project/project.route.js';
import { workspaceMemberRoute } from './module/workspace-member/workspace-member.route.js';



const app = new Hono();

app.use(cors())

app.route('sign-up', signUpRoute);
app.route('log-in', logInRoute);
app.route('verify', verifyEmailRoute);
app.route('workspace', workspaceRoute);
app.route('workspace-member', workspaceMemberRoute);
app.route('project', projectRoute);

app.get('/', (c) => { 
  return c.text('Hello Hono!')
})


await testConnection();


serve({
  fetch: app.fetch, 
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})


