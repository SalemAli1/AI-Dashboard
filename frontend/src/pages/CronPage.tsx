import { useState } from 'react'
import { useApi } from '../hooks/useApi'
import { useSSE } from '../hooks/useSSE'

interface CronJob {
  id: string
  agentId: string
  name: string
  enabled: boolean
  schedule: { kind: string; everyMs?: number; expr?: string; tz?: string }
  sessionTarget: string
  state: { nextRunAtMs?: number; lastRunAtMs?: number; lastStatus?: string; lastDurationMs?: number }
  delivery: { mode: string; channel: string; to: string }
  runs: Array<{ ts: number; action: string; status: string; summary: string; durationMs: number }>
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60000).toFixed(1)}m`
}

function formatSchedule(schedule: CronJob['schedule']): string {
  if (schedule.kind === 'cron' && schedule.expr) return `cron: ${schedule.expr}`
  if (schedule.kind === 'every' && schedule.everyMs) return `every ${formatDuration(schedule.everyMs)}`
  return schedule.kind
}

export default function CronPage() {
  const { data, loading, refetch } = useApi<CronJob[]>('/api/cron')
  useSSE(() => refetch(), { event: 'file-change', file: 'cron/jobs.json' })
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (loading && !data) return <div className="text-gray-400">Loading...</div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Cron Jobs</h1>

      <div className="bg-[#0a0a0a] border border-orange-500/10 rounded-xl px-4 py-3 text-sm text-gray-400 ">
        Cron jobs are scheduled tasks that run automatically on a timer — like an alarm clock for your agents. A green dot means the job is active. Click on any job to see its recent runs and whether they succeeded or failed.
      </div>

      <div className="space-y-3">
        {data?.map(job => (
          <div key={job.id} className="bg-[#0a0a0a] border border-zinc-800 rounded-xl">
            <div
              className="p-4 flex items-center gap-4 cursor-pointer hover:bg-zinc-900/50 transition-colors rounded-xl"
              onClick={() => setExpandedId(expandedId === job.id ? null : job.id)}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${job.enabled ? 'bg-green-400 ' : 'bg-gray-600'}`} />
              <div className="flex-1 min-w-0">
                <div className="font-medium">{job.name}</div>
                <div className="text-xs text-gray-400 flex gap-3 mt-0.5">
                  <span>Agent: <span className="text-violet-400">{job.agentId}</span></span>
                  <span>{formatSchedule(job.schedule)}</span>
                  {job.delivery && <span>{job.delivery.channel} → {job.delivery.to}</span>}
                </div>
              </div>
              <div className="text-right text-sm shrink-0">
                {job.state.lastStatus && (
                  <span className={`text-xs px-2 py-0.5 rounded ${job.state.lastStatus === 'ok' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {job.state.lastStatus}
                  </span>
                )}
                {job.state.nextRunAtMs && (
                  <div className="text-xs text-gray-500 mt-1">
                    Next: {new Date(job.state.nextRunAtMs).toLocaleString()}
                  </div>
                )}
              </div>
              <span className="text-gray-500">{expandedId === job.id ? '▾' : '▸'}</span>
            </div>

            {expandedId === job.id && job.runs.length > 0 && (
              <div className="border-t border-zinc-800 px-4 pb-3">
                <div className="text-xs text-gray-500 py-2 font-medium">Recent Runs</div>
                <div className="space-y-1">
                  {job.runs.slice().reverse().map((run, i) => (
                    <div key={i} className="flex gap-3 text-sm font-mono py-1.5 px-2 bg-zinc-900/30 rounded-lg">
                      <span className="text-gray-500 shrink-0">
                        {new Date(run.ts).toLocaleString()}
                      </span>
                      <span className={run.status === 'ok' ? 'text-green-400' : 'text-red-400'}>
                        {run.status}
                      </span>
                      <span className="text-cyan-400">{formatDuration(run.durationMs)}</span>
                      <span className="text-gray-300 truncate">{run.summary}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {expandedId === job.id && job.runs.length === 0 && (
              <div className="border-t border-zinc-800 px-4 py-3 text-sm text-gray-500">
                No runs recorded yet
              </div>
            )}
          </div>
        ))}

        {(!data || data.length === 0) && (
          <div className="text-gray-500 text-center py-8">No cron jobs configured</div>
        )}
      </div>
    </div>
  )
}
