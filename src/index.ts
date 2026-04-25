import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { testConnection } from './config/db.js';
import { signUpRoute } from './module/sign-up/sign-up.route.js';

const app = new Hono();

app.route('sign-up', signUpRoute)

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
