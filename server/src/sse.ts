import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const OPENCLAW_DIR = '/home/salem/.openclaw';

const WATCHED_FILES = [
  'healthcheck.state',
  'healthcheck.log',
  'usage-monitor.state',
  'usage-monitor.log',
  'cron/jobs.json',
  'logs/commands.log',
];

export function sseHandler(req: Request, res: Response) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  res.write('data: {"type":"connected"}\n\n');

  const watchers: fs.FSWatcher[] = [];

  // Watch core files
  for (const relPath of WATCHED_FILES) {
    const fullPath = path.join(OPENCLAW_DIR, relPath);
    try {
      const watcher = fs.watch(fullPath, () => {
        res.write(`data: ${JSON.stringify({ type: 'file-change', file: relPath })}\n\n`);
      });
      watchers.push(watcher);
    } catch { /* file may not exist */ }
  }

  // Watch session files for each agent
  const agentDirs = ['main', 'amir', 'hamza'];
  for (const agentId of agentDirs) {
    const sessionsDir = path.join(OPENCLAW_DIR, 'agents', agentId, 'sessions');
    try {
      const watcher = fs.watch(sessionsDir, () => {
        res.write(`data: ${JSON.stringify({ type: 'session-change', agentId })}\n\n`);
      });
      watchers.push(watcher);
    } catch { /* dir may not exist */ }
  }

  // Heartbeat every 30s
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 30000);

  req.on('close', () => {
    clearInterval(heartbeat);
    watchers.forEach(w => w.close());
  });
}
