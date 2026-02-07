import { useState } from 'react'

interface Session {
  sessionKey: string
  sessionId: string
  agentId: string
  updatedAt: number
  channel: string
  model: string
  inputTokens: number
  outputTokens: number
  totalTokens: number
  displayName: string
  chatType: string
  subject: string
}

interface Props {
  sessions: Session[]
  showAgent?: boolean
}

type SortKey = 'updatedAt' | 'totalTokens' | 'displayName'

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

export default function SessionTable({ sessions, showAgent = false }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('updatedAt')
  const [sortAsc, setSortAsc] = useState(false)

  const sorted = [...sessions].sort((a, b) => {
    const mul = sortAsc ? 1 : -1
    if (sortKey === 'displayName') return mul * (a.displayName || '').localeCompare(b.displayName || '')
    return mul * ((a[sortKey] || 0) - (b[sortKey] || 0))
  })

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc)
    else { setSortKey(key); setSortAsc(false) }
  }

  const arrow = (key: SortKey) => sortKey === key ? (sortAsc ? ' ↑' : ' ↓') : ''

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-400 border-b border-zinc-800">
            {showAgent && <th className="text-left py-2 px-3 font-medium">Agent</th>}
            <th className="text-left py-2 px-3 font-medium cursor-pointer hover:text-white" onClick={() => toggleSort('displayName')}>
              Name{arrow('displayName')}
            </th>
            <th className="text-left py-2 px-3 font-medium">Channel</th>
            <th className="text-left py-2 px-3 font-medium">Model</th>
            <th className="text-right py-2 px-3 font-medium cursor-pointer hover:text-white" onClick={() => toggleSort('totalTokens')}>
              Tokens{arrow('totalTokens')}
            </th>
            <th className="text-right py-2 px-3 font-medium cursor-pointer hover:text-white" onClick={() => toggleSort('updatedAt')}>
              Last Active{arrow('updatedAt')}
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.slice(0, 100).map(s => (
            <tr key={s.sessionKey} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors">
              {showAgent && <td className="py-2 px-3 font-mono text-xs text-violet-400">{s.agentId}</td>}
              <td className="py-2 px-3">
                <div>{s.displayName || s.subject || '(unnamed)'}</div>
                {s.chatType === 'group' && s.subject && (
                  <div className="text-xs text-gray-500">{s.subject}</div>
                )}
              </td>
              <td className="py-2 px-3 text-gray-400">{s.channel}</td>
              <td className="py-2 px-3 text-gray-400 font-mono text-xs">{s.model?.split('/').pop()}</td>
              <td className="py-2 px-3 text-right font-mono text-cyan-400">{formatTokens(s.totalTokens)}</td>
              <td className="py-2 px-3 text-right text-gray-400">
                {s.updatedAt ? new Date(s.updatedAt).toLocaleString() : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {sessions.length === 0 && (
        <div className="text-center text-gray-500 py-8">No sessions found</div>
      )}
    </div>
  )
}
