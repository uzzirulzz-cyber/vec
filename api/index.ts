import { createApp } from '../server/app';
import { connectDB } from '../server/config/db';

const app = createApp();

// Initiate DB connection asynchronously without blocking serverless function execution
connectDB().catch((err) => {
  console.warn('Vercel serverless DB background connection notice:', err);
});

export default app;

