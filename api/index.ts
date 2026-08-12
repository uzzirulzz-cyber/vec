import { createApp } from '../server/app';
import { connectDB } from '../server/config/db';

const app = createApp();

export default async function handler(req: any, res: any) {
  try {
    await connectDB();
  } catch (err) {
    console.warn('DB connect notice in serverless handler:', err);
  }
  return app(req, res);
}

