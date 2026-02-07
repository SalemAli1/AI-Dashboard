import { useApi } from '../hooks/useApi'
import { useSSE } from '../hooks/useSSE'

interface HealthEvent {
  timestamp: string
  level: string
  message: string
}

const levelColors: Record<string, string> = {
  RECOVERED: 'text-green-400',
  FIXED: 'text-green-400',
  HEALTHY: 'text-green-400',
  WARNING: 'text-yellow-400',
  UNHEALTHY: 'text-red-400',
  ALERT: 'text-red-400',
}

export default function HealthPage() {
  const { data: events, refetch } = useApi<HealthEvent[]>('/api/health')

  useSSE(() => refetch())

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black uppercase tracking-widest text-white">System Diagnostics</h1>
        <button onClick={() => refetch()} className="text-[10px] font-black border border-[#2d3135] px-3 py-1 uppercase text-[#8e959d]">Refresh</button>
      </div>

      <div className="bg-[#141619] border border-[#222222] p-4 rounded-lg space-y-4">
        <div className="flex items-center gap-2 text-[10px] font-black text-[#8e959d] uppercase border-b border-[#222222] pb-2">
           <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]"></span>
           Live System Log Stream
        </div>
        
        <div className="space-y-1 font-mono text-[10px]">
          {events?.map((e, i) => (
            <div key={i} className="grid grid-cols-[140px_80px_1fr] gap-4 py-1 border-b border-[#222222]/30 hover:bg-white/5 transition-colors">
              <span className="text-[#6C757D]">{e.timestamp}</span>
              <span className={"font-black " + (levelColors[e.level] || 'text-white')}>{e.level}</span>
              <span className="text-[#ADB5BD] truncate text-right sm:text-left">{e.message}</span>
            </div>
          ))}
          {(!events || events.length === 0) && (
            <div className="text-gray-500 py-12 text-center uppercase tracking-widest font-black">Scanning for data...</div>
          )}
        </div>
      </div>

      {/* Network Stats Mock for UX */}
      <div className="grid grid-cols-2 gap-3">
         <div className="card p-4">
            <div className="text-[10px] font-black text-[#8e959d] uppercase mb-1">Packet Stability</div>
            <div className="text-2xl font-black text-white">100%</div>
            <div className="text-[8px] text-[#4ade80] font-black mt-1">NO DROPS DETECTED</div>
         </div>
         <div className="card p-4">
            <div className="text-[10px] font-black text-[#8e959d] uppercase mb-1">Tunnel Status</div>
            <div className="text-2xl font-black text-cyan-400">ENCRYPTED</div>
            <div className="text-[8px] text-[#8e959d] font-black mt-1">TAILSCALE ACTIVE</div>
         </div>
      </div>
    </div>
  )
}
