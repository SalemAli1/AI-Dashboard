import { useApi } from '../hooks/useApi'
import { useSSE } from '../hooks/useSSE'
import SessionTable from '../components/SessionTable'

interface Session {
  sessionKey: string; sessionId: string; agentId: string; updatedAt: number
  channel: string; model: string; inputTokens: number; outputTokens: number
  totalTokens: number; contextTokens: number; displayName: string; chatType: string; subject: string
}

export default function SessionsPage() {
  const { data, loading, refetch } = useApi<Session[]>('/api/sessions')
  useSSE(() => refetch(), { event: 'session-change' })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">All Sessions</h1>
      <div className="bg-[#0a0a0a] border border-cyan-500/10 rounded-xl px-4 py-3 text-sm text-gray-400 shadow-[0_0_15px_-3px_rgba(6,182,212,0.08)]">
        A session is a single conversation between you (or a cron job) and an agent. Each row shows who was talking, which agent handled it, what model was used, and how many tokens it cost. You can click the column headers to sort.
      </div>
      {loading && !data && <div className="text-gray-400">Loading...</div>}
      {data && (
        <div className="bg-[#0a0a0a] border border-zinc-800 rounded-xl p-4">
          <SessionTable sessions={data} showAgent />
        </div>
      )}
    </div>
  )
}
