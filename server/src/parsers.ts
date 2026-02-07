import fs from 'fs';
import path from 'path';

const OPENCLAW_DIR = '/home/salem/.openclaw';

const cache = new Map<string, { data: unknown; expiry: number }>();

function cached<T>(key: string, ttlMs: number, fn: () => T): T {
  const now = Date.now();
  const entry = cache.get(key);
  if (entry && entry.expiry > now) return entry.data as T;
  const data = fn();
  cache.set(key, { data, expiry: now + ttlMs });
  return data;
}

function readJsonSafe(filePath: string): unknown {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf-8')); } catch { return null; }
}

function readFileSafe(filePath: string): string {
  try { return fs.readFileSync(filePath, 'utf-8'); } catch { return ''; }
}

function readJsonlTail(filePath: string, maxLines: number): unknown[] {
  try {
    const content = fs.readFileSync(filePath, 'utf-8').trim();
    if (!content) return [];
    const lines = content.split('\n');
    const tail = lines.slice(-maxLines);
    return tail.map(line => {
      try { return JSON.parse(line); } catch { return null; }
    }).filter(Boolean);
  } catch { return []; }
}

export function getAgents() {
  return cached('agents', 30000, () => {
    const config = readJsonSafe(path.join(OPENCLAW_DIR, 'openclaw.json')) as any;
    if (!config?.agents?.list) return [];
    return config.agents.list.map((a: any) => ({
      id: a.id,
      name: a.name,
      identity: a.identity || { name: a.name, theme: 'gray', emoji: '🤖' },
    }));
  });
}

export function getAgentSessions(agentId: string) {
  return cached('sessions:' + agentId, 10000, () => {
    const sessionsPath = path.join(OPENCLAW_DIR, 'agents', agentId, 'sessions', 'sessions.json');
    const data = readJsonSafe(sessionsPath) as Record<string, any> | null;
    if (!data) return [];
    return Object.entries(data).map(([key, s]) => ({
      sessionKey: key,
      sessionId: s.sessionId || '',
      agentId,
      updatedAt: s.updatedAt || 0,
      channel: s.lastChannel || s.channel || '',
      model: s.model || '',
      totalTokens: s.totalTokens || 0,
      displayName: s.displayName || s.origin?.from || '',
    })).sort((a: any, b: any) => b.updatedAt - a.updatedAt);
  });
}

export function getAllSessions() {
  const agents = getAgents();
  return agents.flatMap((a: any) => getAgentSessions(a.id)).sort((a: any, b: any) => b.updatedAt - a.updatedAt);
}

export function getAgentStats(agentId: string) {
  const sessions = getAgentSessions(agentId);
  const now = Date.now();
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
  const totalTokens = sessions.reduce((s, x: any) => s + x.totalTokens, 0);
  const monthlyTokens = sessions.filter((s: any) => s.updatedAt > thirtyDaysAgo).reduce((s, x: any) => s + x.totalTokens, 0);
  return { sessionCount: sessions.length, totalTokens, monthlyTokens, lastActive: sessions.length > 0 ? sessions[0].updatedAt : 0 };
}

export function getOverview() {
  const agents = getAgents();
  const agentStats = agents.map((a: any) => ({ ...a, stats: getAgentStats(a.id) }));
  const healthState = readFileSafe(path.join(OPENCLAW_DIR, 'healthcheck.state')).trim() || 'ok';
  const usageState = readFileSafe(path.join(OPENCLAW_DIR, 'usage-monitor.state')).trim() || 'ok';
  const cronJobs = (readJsonSafe(path.join(OPENCLAW_DIR, 'cron', 'jobs.json')) as any)?.jobs || [];

  const totalTokens = agentStats.reduce((s, a) => s + a.stats.totalTokens, 0);
  const monthlyTokens = agentStats.reduce((s, a) => s + a.stats.monthlyTokens, 0);

  return {
    agents: agentStats,
    health: { state: healthState },
    usage: { state: usageState, rateLimit: 75, queueDepth: 2 },
    totals: { tokens: totalTokens, monthlyTokens, sessions: agentStats.reduce((s, a) => s + a.stats.sessionCount, 0) },
    cronSummary: { total: cronJobs.length, enabled: cronJobs.filter((j: any) => j.enabled).length }
  };
}

export function getHealth() {
  const log = readFileSafe(path.join(OPENCLAW_DIR, 'healthcheck.log'));
  return log.split('\n').filter(Boolean).map(line => {
    const match = line.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} UTC)\s+(.+?):\s*(.*)$/);
    return match ? { timestamp: match[1], level: match[2], message: match[3] } : { timestamp: '', level: 'INFO', message: line };
  }).reverse().slice(0, 50);
}

export function getUsage() {
  const log = readFileSafe(path.join(OPENCLAW_DIR, 'usage-monitor.log'));
  return log.split('\n').filter(Boolean).map(line => {
    const match = line.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} UTC)\s+(.+?):\s*(.*)$/);
    return match ? { timestamp: match[1], level: match[2], message: match[3] } : { timestamp: '', level: 'INFO', message: line };
  }).reverse().slice(0, 50);
}

export function getCronJobs() {
  const jobsData = readJsonSafe(path.join(OPENCLAW_DIR, 'cron', 'jobs.json')) as any;
  if (!jobsData?.jobs) return [];
  return jobsData.jobs.map((job: any) => {
    const runsFile = path.join(OPENCLAW_DIR, 'cron', 'runs', `${job.id}.jsonl`);
    const runs = readJsonlTail(runsFile, 20);
    return { ...job, runs };
  });
}

export function getCommands(limit = 100) {
  return readJsonlTail(path.join(OPENCLAW_DIR, 'logs', 'commands.log'), limit);
}

export function getTokenUsage() {
  const agents = getAgents();
  const now = Date.now();
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

  let totalTokens = 0;
  let monthlyTokens = 0;
  let totalSessions = 0;
  const modelMap = new Map<string, { totalTokens: number; sessionCount: number }>();
  const dailyMap = new Map<string, number>();

  // Initialize last 30 days
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now - i * 24 * 60 * 60 * 1000);
    dailyMap.set(d.toISOString().slice(0, 10), 0);
  }

  const byAgent = agents.map((a: any) => {
    const sessions = getAgentSessions(a.id);
    const stats = getAgentStats(a.id);
    totalTokens += stats.totalTokens;
    monthlyTokens += stats.monthlyTokens;
    totalSessions += stats.sessionCount;

    for (const s of sessions as any[]) {
      // Per-model aggregation
      const model = s.model || 'unknown';
      const existing = modelMap.get(model);
      if (existing) {
        existing.totalTokens += s.totalTokens;
        existing.sessionCount += 1;
      } else {
        modelMap.set(model, { totalTokens: s.totalTokens, sessionCount: 1 });
      }

      // Daily aggregation
      if (s.updatedAt > thirtyDaysAgo) {
        const dateKey = new Date(s.updatedAt).toISOString().slice(0, 10);
        if (dailyMap.has(dateKey)) {
          dailyMap.set(dateKey, dailyMap.get(dateKey)! + s.totalTokens);
        }
      }
    }

    return {
      agentId: a.id,
      agentName: a.identity?.name || a.name,
      emoji: a.identity?.emoji || '🤖',
      totalTokens: stats.totalTokens,
      monthlyTokens: stats.monthlyTokens,
      sessionCount: stats.sessionCount,
    };
  });

  const byModel = Array.from(modelMap.entries())
    .map(([model, v]) => ({ model, totalTokens: v.totalTokens, sessionCount: v.sessionCount }))
    .sort((a, b) => b.totalTokens - a.totalTokens);

  const daily = Array.from(dailyMap.entries())
    .map(([date, tokens]) => ({ date, tokens }));

  return {
    totalTokens,
    monthlyTokens,
    totalSessions,
    byModel,
    byAgent: byAgent.sort((a: any, b: any) => b.totalTokens - a.totalTokens),
    daily,
  };
}

export function getSessionMessages(agentId: string, sessionId: string, limit = 50) {
  const sessionsDir = path.join(OPENCLAW_DIR, 'agents', agentId, 'sessions');
  try {
    const files = fs.readdirSync(sessionsDir).filter(f => f.endsWith('.jsonl'));
    for (const file of files) {
      const filePath = path.join(sessionsDir, file);
      const lines = readJsonlTail(filePath, 200);
      const sessionLine = lines.find((l: any) => l.type === 'session' && l.id === sessionId);
      if (sessionLine) {
        return lines.filter((l: any) => l.type === 'message').map((l: any) => ({
          id: l.id,
          timestamp: l.timestamp,
          role: l.message?.role,
          content: l.message?.content?.map((c: any) => c.type === 'text' ? c.text : `[${c.type}]`).join('') || '',
        })).slice(-limit);
      }
    }
  } catch { }
  return [];
}
