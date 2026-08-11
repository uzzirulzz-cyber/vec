import { createApp } from '../server/app';
import { connectDB } from '../server/config/db';

const app = createApp();
let isDbConnected = false;

export default async function handler(req: any, res: any) {
  if (!isDbConnected) {
    try {
      await connectDB();
      isDbConnected = true;
    } catch (error) {
      console.error('Database connection error in Vercel function:', error);
    }
  }
  return app(req, res);
}
