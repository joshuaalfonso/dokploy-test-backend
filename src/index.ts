import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { testConnection } from './config/db.js';
import { signUpRoute } from './module/sign-up/sign-up.route.js';
import { cors } from 'hono/cors';
import { logInRoute } from './module/log-in/log-in.route.js';
import { workspaceRoute } from './module/workspace/workspace.route.js';
import { htmlVerifyTemplete, transport } from './config/smtp.js';
import { verifyEmailRoute } from './module/verify/verify.route.js';



const app = new Hono();

app.use(cors())

app.route('sign-up', signUpRoute);
app.route('log-in', logInRoute);
app.route('verify', verifyEmailRoute);
app.route('workspace', workspaceRoute);

app.get('/', (c) => { 
  return c.text('Hello Hono!')
})

app.post('/email', async (c) => {
 
  const mailOptions = { 
    from: '"Strive" <noreply@strive.skadii-dev.org>',
    to: 'joshua025icloud@gmail.com',
    subject: 'Email Verification',
    html: htmlVerifyTemplete, 
  }; 

  try {

    const info = await transport.sendMail(mailOptions);

    return c.json({
      success: true,
      message: 'Email sent successfully',
      info
    });

  } 
  
  catch (err) {

    return c.json({
      success: false,
      message: 'Failed to send email',
    });

  }

});

await testConnection();


serve({
  fetch: app.fetch, 
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})


