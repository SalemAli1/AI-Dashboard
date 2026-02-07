import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './routes.js';
import { sseHandler } from './sse.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3847;

const AUTH_TOKEN = process.env.OPENCLAW_DASH_TOKEN || '';

app.use(cors());

// Bearer token auth middleware (skip if no token configured)
app.use('/api', (req, res, next) => {
  if (!AUTH_TOKEN) return next();
  const auth = req.headers.authorization;
  if (auth === `Bearer ${AUTH_TOKEN}`) return next();
  // Allow token as query param for SSE
  if (req.query.token === AUTH_TOKEN) return next();
  res.status(401).json({ error: 'Unauthorized' });
});

app.use('/api', apiRouter);
app.get('/api/sse', sseHandler);

// Serve frontend in production
const frontendDir = path.resolve(__dirname, '../../dist/frontend');
app.use(express.static(frontendDir));
app.get('/{*path}', (_req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`OpenClaw Dashboard running on http://0.0.0.0:${PORT}`);
});
