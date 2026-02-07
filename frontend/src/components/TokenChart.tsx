import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface Session {
  sessionKey: string
  displayName: string
  inputTokens: number
  outputTokens: number
  contextTokens: number
  updatedAt: number
}

interface Props {
  sessions: Session[]
}

export default function TokenChart({ sessions }: Props) {
  // Aggregate tokens by day
  const byDay = new Map<string, { date: string; input: number; output: number; context: number }>()

  for (const s of sessions) {
    if (!s.updatedAt) continue
    const date = new Date(s.updatedAt).toISOString().slice(0, 10)
    const existing = byDay.get(date) || { date, input: 0, output: 0, context: 0 }
    existing.input += s.inputTokens
    existing.output += s.outputTokens
    existing.context += s.contextTokens
    byDay.set(date, existing)
  }

  const data = [...byDay.values()].sort((a, b) => a.date.localeCompare(b.date)).slice(-30)

  if (data.length === 0) {
    return <div className="text-gray-500 text-sm py-8 text-center">No token data available</div>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={d => d.slice(5)} stroke="#27272a" />
        <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} stroke="#27272a" />
        <Tooltip
          contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #3f3f46', borderRadius: '12px' }}
          labelStyle={{ color: '#d1d5db' }}
          itemStyle={{ color: '#d1d5db' }}
        />
        <Legend />
        <Bar dataKey="input" name="Input" fill="#06b6d4" radius={[2, 2, 0, 0]} />
        <Bar dataKey="output" name="Output" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
