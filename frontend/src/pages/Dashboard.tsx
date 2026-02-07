import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApi } from '../hooks/useApi'
import { useSSE } from '../hooks/useSSE'
import AgentCard from '../components/AgentCard'

interface Overview {
  agents: Array<{
    id: string
    name: string
    identity: { name: string; theme: string; emoji: string }
    stats: { sessionCount: number; totalTokens: number; monthlyTokens: number; lastActive: number }
  }>
  health: { state: string }
  usage: { state: string; rateLimit: number; queueDepth: number }
  totals: { tokens: number; monthlyTokens: number; sessions: number }
}

function formatTokens(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return String(n)
}

export default function Dashboard() {
  const { data, loading, refetch } = useApi<Overview>('/api/overview')
  const [showWarning, setShowWarning] = useState(true)
  const navigate = useNavigate()

  useSSE(() => refetch())

  if (loading && !data) return <div className="text-gray-400 p-4">INITIALIZING SYSTEM...</div>
  if (!data) return <div className="text-red-400 p-4">CONNECTION ERROR</div>

  const burnPercentage = Math.min(Math.round((data.totals.monthlyTokens / 1000000) * 100), 100)

  return (
    <div className="space-y-4">
      {/* Dynamic Warning Banner */}
      {showWarning && burnPercentage > 80 && (
        <div className="bg-[#1c1910] border border-[#facc15]/30 p-3 flex items-center justify-between rounded-lg">
          <div className="flex items-center gap-2 text-[#facc15] text-[10px] font-black uppercase">
            <span>⚠️ WARNING: BURN REACHING CAP ({burnPercentage}% OF 1M TOK BUDGET)</span>
          </div>
          <button onClick={() => setShowWarning(false)} className="text-gray-500 hover:text-white">×</button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 space-y-3">
          <div className="card p-4">
            <div className="text-[10px] font-bold text-[#8e959d] uppercase">Burn This Month</div>
            <div className="text-3xl font-black mt-1">
              {formatTokens(data.totals.monthlyTokens)} <span className="text-xs text-[#8e959d] font-normal uppercase">TOK</span>
            </div>
            <div className="text-[10px] text-[#facc15] mt-1 font-bold">+18% | LAST MONTH</div>
          </div>
          
          <div className="flex gap-3">
            <div className="flex-1 card p-3">
               <div className="text-[9px] font-bold text-[#8e959d] uppercase">Sessions Today</div>
               <div className="text-xl font-black mt-0.5">6 <span className="text-[10px] text-[#4ade80] font-bold ml-1">▲+1</span></div>
            </div>
            <div className="flex-1 card p-3">
               <div className="text-[9px] font-bold text-[#8e959d] uppercase">Agents Active</div>
               <div className="text-xl font-black mt-0.5">{data.agents.length} <span className="text-[10px] text-[#8e959d] font-bold ml-1">≈ AVG</span></div>
            </div>
          </div>
        </div>

        {/* System Status Card */}
        <div className="w-full sm:w-[180px] card p-4 flex flex-col justify-between">
           <div>
              <div className="text-[10px] font-black text-[#8e959d] uppercase mb-3 tracking-tighter">System Status</div>
              <div className="flex items-center gap-1.5 text-xs font-black text-[#4ade80] uppercase">
                <span className={"w-2 h-2 rounded-full " + (data.health.state === 'ok' ? 'bg-[#4ade80]' : 'bg-red-500')}></span>
                {data.health.state === 'ok' ? 'Active: Stable' : 'System: Alert'}
              </div>
              <div className="mt-3 progress-bg w-full">
                <div className="progress-fill bg-[#facc15]" style={{ width: data.usage.rateLimit + '%' }}></div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-[9px] font-black text-[#8e959d] uppercase">
                   <span>Rate Limit</span>
                   <span className="text-white">{data.usage.rateLimit}%</span>
                </div>
                <div className="flex justify-between text-[9px] font-black text-[#8e959d] uppercase">
                   <span>Queue Depth</span>
                   <span className="text-white">{data.usage.queueDepth} ITEMS</span>
                </div>
                <div className="flex justify-between text-[9px] font-black text-[#8e959d] uppercase">
                   <span>Latency</span>
                   <span className="text-white">12ms</span>
                </div>
              </div>
           </div>
           <button 
             onClick={() => navigate('/health')}
             className="mt-4 border border-[#2d3135] text-[10px] font-black text-[#8e959d] py-2 uppercase hover:bg-white hover:text-black transition-all rounded"
           >
             View System Logs
           </button>
        </div>
      </div>

      <div className="pt-2">
        <h2 className="text-[11px] font-black text-[#8e959d] uppercase tracking-[0.2em] mb-4">Personnel Performance</h2>
        <div className="space-y-3">
          {data.agents.map(agent => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>

      <div className="pt-4 pb-4">
          <div className="progress-bg w-full">
              <div className="progress-fill bg-[#facc15]" style={{ width: burnPercentage + '%' }}></div>
          </div>
          <div className="flex justify-between text-[10px] font-black text-[#8e959d] mt-2 uppercase tracking-tight">
              <span>{burnPercentage}% of 1M TOK budget</span>
              <span className="text-[#facc15]">Scale Required {">"}</span>
          </div>
      </div>
    </div>
  )
}
