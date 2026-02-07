import { Router } from 'express';
import {
  getOverview, getAgents, getAgentStats, getAgentSessions,
  getSessionMessages, getHealth, getUsage, getCronJobs,
  getCommands, getAllSessions, getTokenUsage,
} from './parsers.js';

export const apiRouter = Router();

apiRouter.get('/overview', (_req, res) => {
  res.json(getOverview());
});

apiRouter.get('/agents', (_req, res) => {
  const agents = getAgents();
  const result = agents.map(a => ({ ...a, stats: getAgentStats(a.id) }));
  res.json(result);
});

apiRouter.get('/agents/:id', (req, res) => {
  const { id } = req.params;
  const agents = getAgents();
  const agent = agents.find(a => a.id === id);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  const stats = getAgentStats(id);
  const sessions = getAgentSessions(id);
  res.json({ ...agent, stats, sessions });
});

apiRouter.get('/agents/:id/sessions/:sid', (req, res) => {
  const { id, sid } = req.params;
  const limit = parseInt(req.query.limit as string) || 50;
  const messages = getSessionMessages(id, sid, limit);
  res.json({ messages });
});

apiRouter.get('/health', (_req, res) => {
  res.json(getHealth());
});

apiRouter.get('/usage', (_req, res) => {
  res.json(getUsage());
});

apiRouter.get('/cron', (_req, res) => {
  res.json(getCronJobs());
});

apiRouter.get('/commands', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 100;
  res.json(getCommands(limit));
});

apiRouter.get('/sessions', (_req, res) => {
  res.json(getAllSessions());
});

apiRouter.get('/token-usage', (_req, res) => {
  res.json(getTokenUsage());
});
