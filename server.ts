import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { authMiddleware } from './server/auth';
import { apiRouter } from './server/routes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Global auth extractor for Bearer tokens
  app.use(authMiddleware);

  // Mount backend API router
  app.use('/api', apiRouter);

  // Vite integration
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[COMFORT Server] Ready on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[COMFORT Server] Startup error:', err);
  process.exit(1);
});
