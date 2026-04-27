import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { testConnection } from './config/db.js';
import { signUpRoute } from './module/sign-up/sign-up.route.js';
import { cors } from 'hono/cors';
import { logInRoute } from './module/log-in/log-in.route.js';
import { workspaceRoute } from './module/workspace/workspace.route.js';
import nodemailer from 'nodemailer'


const app = new Hono();

app.use(cors())

app.route('sign-up', signUpRoute);
app.route('log-in', logInRoute);
app.route('workspace', workspaceRoute);

app.get('/', (c) => {
  return c.text('Hello Hono!')
})


await testConnection();


var transport = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    auth: {
      user: "a96aa0001@smtp-brevo.com",
      pass: "ZrA85HRaBFh2jcy0"
    } 
});

var mailOptions = {
    from: '"Strive" <noreply@strive.skadii-dev.org>',
    to: 'marizzedanicca@gmail.com',
    // to: 'joshua025icloud@gmail.com',
    subject: 'Test Email', 
    html: 'i love you',
};

transport.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Successfully sent');
});


serve({
  fetch: app.fetch, 
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})


// const nodemailer = require("nodemailer");

// var transport = nodemailer.createTransport({
//     host: "smtp.zeptomail.com",
//     port: 587,
//     auth: {
//     user: "emailapikey",
//     pass: "wSsVR61z8xOiX/ovn2CqL+trmQ8EVgj+E0Qr2AOl7X+qTKuQ9cc4lhHIAAKmHKRNRzU4HWcS8Oh4kRxShDVY3Y9+yg0EACiF9mqRe1U4J3x17qnvhDzMW2RckRCPJIkOwglukmhmFswj+g=="
//     }
// });

// var mailOptions = {
//     from: '"Strive" <noreply@skadii-dev.org>',
//     to: 'joshua025icloud@gmail.com',
//     subject: 'Test Email',
//     html: 'Test email sent successfully.',
// };

// transport.sendMail(mailOptions, (error, info) => {
//     if (error) {
//       return console.log(error);
//     }
//     console.log('Successfully sent');
// });
