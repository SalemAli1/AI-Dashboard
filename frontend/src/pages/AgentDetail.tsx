import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useApi } from '../hooks/useApi'
import { useSSE, SSEFilter } from '../hooks/useSSE'
import TokenChart from '../components/TokenChart'
import SessionTable from '../components/SessionTable'

interface AgentData {
  id: string
  name: string
  identity: { name: string; theme: string; emoji: string }
  stats: { sessionCount: number; totalInput: number; totalOutput: number; totalTokens: number; lastActive: number }
  sessions: Array<{
    sessionKey: string; sessionId: string; agentId: string; updatedAt: number
    channel: string; model: string; inputTokens: number; outputTokens: number
    totalTokens: number; contextTokens: number; displayName: string; chatType: string; subject: string
  }>
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

export default function AgentDetail() {
  const { id } = useParams<{ id: string }>()
  const { data, loading, refetch } = useApi<AgentData>(`/api/agents/${id}`, [id])
  const sseFilter = useMemo<SSEFilter>(() => ({ event: 'session-change', agentId: id }), [id])
  useSSE(() => refetch(), sseFilter)

  if (loading && !data) return <div className="text-gray-400">Loading...</div>
  if (!data) return <div className="text-red-400">Agent not found</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/" className="text-gray-500 hover:text-white">&larr;</Link>
        <span className="text-3xl">{data.identity.emoji}</span>
        <div>
          <h1 className="text-2xl font-bold">{data.identity.name}</h1>
          <span className="text-sm text-gray-400">{data.id}</span>
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-violet-500/10 rounded-xl px-4 py-3 text-sm text-gray-400 shadow-[0_0_15px_-3px_rgba(139,92,246,0.08)]">
        This is a detailed view of one agent. You can see how many conversations (sessions) it has had, how many tokens it has used, and a chart of its usage over time. Input tokens are what you send to the agent, output tokens are what it sends back.
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0a0a0a] border border-zinc-800 border-t-2 border-t-violet-500 rounded-xl p-4">
          <div className="text-sm text-gray-400">Sessions</div>
          <div className="text-3xl font-bold mt-1 text-violet-400">{data.stats.sessionCount}</div>
        </div>
        <div className="bg-[#0a0a0a] border border-zinc-800 border-t-2 border-t-violet-500 rounded-xl p-4">
          <div className="text-sm text-gray-400">Total Tokens</div>
          <div className="text-3xl font-bold mt-1">{formatTokens(data.stats.totalTokens)}</div>
        </div>
        <div className="bg-[#0a0a0a] border border-zinc-800 border-t-2 border-t-cyan-500 rounded-xl p-4">
          <div className="text-sm text-gray-400">Input Tokens</div>
          <div className="text-3xl font-bold mt-1 text-cyan-400">{formatTokens(data.stats.totalInput)}</div>
        </div>
        <div className="bg-[#0a0a0a] border border-zinc-800 border-t-2 border-t-violet-500 rounded-xl p-4">
          <div className="text-sm text-gray-400">Output Tokens</div>
          <div className="text-3xl font-bold mt-1 text-violet-400">{formatTokens(data.stats.totalOutput)}</div>
        </div>
      </div>

      {/* Token chart */}
      <div className="bg-[#0a0a0a] border border-zinc-800 rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-3">Token Usage Over Time</h2>
        <TokenChart sessions={data.sessions} />
      </div>

      {/* Session list */}
      <div className="bg-[#0a0a0a] border border-zinc-800 rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-3">Sessions ({data.sessions.length})</h2>
        <SessionTable sessions={data.sessions} />
      </div>
    </div>
  )
}
