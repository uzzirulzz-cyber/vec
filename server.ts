import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import { createServer as createViteServer } from 'vite';
import { createApp } from './server/app';
import { connectDB } from './server/config/db';

async function startServer() {
  await connectDB();

  const app = createApp();
  const PORT = 3000;

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(expressStatic(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 VectorEngine AI Server running on http://0.0.0.0:${PORT}`);
  });
}

function expressStatic(distPath: string) {
  const express = require('express');
  return express.static(distPath);
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
