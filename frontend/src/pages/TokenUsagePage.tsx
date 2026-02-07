import { useApi } from '../hooks/useApi'
import { useSSE } from '../hooks/useSSE'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface TokenUsageData {
  totalTokens: number
  monthlyTokens: number
  totalSessions: number
  byModel: { model: string; totalTokens: number; sessionCount: number }[]
  byAgent: { agentId: string; agentName: string; emoji: string; totalTokens: number; monthlyTokens: number; sessionCount: number }[]
  daily: { date: string; tokens: number }[]
}

function formatTokens(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return String(n)
}

export default function TokenUsagePage() {
  const { data, loading, refetch } = useApi<TokenUsageData>('/api/token-usage')
  useSSE(() => refetch(), { event: 'session-change' })

  if (loading && !data) return <div className="text-gray-400 p-4">Loading...</div>
  if (!data) return <div className="text-red-400 p-4">Failed to load token usage data</div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Token Usage</h1>

      <div className="bg-[#0a0a0a] border border-cyan-500/10 rounded-xl px-4 py-3 text-sm text-gray-400 shadow-[0_0_15px_-3px_rgba(6,182,212,0.08)]">
        Detailed breakdown of token consumption across all agents, models, and time periods.
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card p-4">
          <div className="text-[9px] font-bold text-[#8e959d] uppercase">Total Tokens</div>
          <div className="text-xl font-black mt-1">{formatTokens(data.totalTokens)}</div>
        </div>
        <div className="card p-4">
          <div className="text-[9px] font-bold text-[#8e959d] uppercase">Monthly (30d)</div>
          <div className="text-xl font-black mt-1">{formatTokens(data.monthlyTokens)}</div>
        </div>
        <div className="card p-4">
          <div className="text-[9px] font-bold text-[#8e959d] uppercase">Total Sessions</div>
          <div className="text-xl font-black mt-1">{data.totalSessions}</div>
        </div>
        <div className="card p-4">
          <div className="text-[9px] font-bold text-[#8e959d] uppercase">Active Models</div>
          <div className="text-xl font-black mt-1">{data.byModel.length}</div>
        </div>
      </div>

      {/* Daily Usage Chart */}
      <div className="bg-[#0a0a0a] border border-zinc-800 rounded-xl p-4">
        <h2 className="text-[11px] font-black text-[#8e959d] uppercase tracking-[0.2em] mb-4">Daily Usage (Last 30 Days)</h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.daily}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fill: '#8e959d' }}
                tickFormatter={(v: string) => v.slice(5)}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 9, fill: '#8e959d' }}
                tickFormatter={(v: number) => formatTokens(v)}
                width={50}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1c1f23', border: '1px solid #2d3135', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#8e959d' }}
                formatter={(value: number) => [formatTokens(value), 'Tokens']}
              />
              <Bar dataKey="tokens" fill="#4ade80" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Per-Model Table */}
      <div className="bg-[#0a0a0a] border border-zinc-800 rounded-xl p-4">
        <h2 className="text-[11px] font-black text-[#8e959d] uppercase tracking-[0.2em] mb-4">Usage by Model</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[9px] font-bold text-[#8e959d] uppercase border-b border-zinc-800">
              <th className="text-left py-2">Model</th>
              <th className="text-right py-2">Tokens</th>
              <th className="text-right py-2">Sessions</th>
            </tr>
          </thead>
          <tbody>
            {data.byModel.map(m => (
              <tr key={m.model} className="border-b border-zinc-800/50">
                <td className="py-2 font-mono text-xs">{m.model}</td>
                <td className="py-2 text-right font-black">{formatTokens(m.totalTokens)}</td>
                <td className="py-2 text-right text-gray-400">{m.sessionCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Per-Agent Table */}
      <div className="bg-[#0a0a0a] border border-zinc-800 rounded-xl p-4">
        <h2 className="text-[11px] font-black text-[#8e959d] uppercase tracking-[0.2em] mb-4">Usage by Agent</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[9px] font-bold text-[#8e959d] uppercase border-b border-zinc-800">
              <th className="text-left py-2">Agent</th>
              <th className="text-right py-2">Total</th>
              <th className="text-right py-2">Monthly</th>
              <th className="text-right py-2">Sessions</th>
            </tr>
          </thead>
          <tbody>
            {data.byAgent.map(a => (
              <tr key={a.agentId} className="border-b border-zinc-800/50">
                <td className="py-2">
                  <span className="mr-1.5">{a.emoji}</span>
                  <span className="text-xs">{a.agentName}</span>
                </td>
                <td className="py-2 text-right font-black">{formatTokens(a.totalTokens)}</td>
                <td className="py-2 text-right text-gray-400">{formatTokens(a.monthlyTokens)}</td>
                <td className="py-2 text-right text-gray-400">{a.sessionCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
