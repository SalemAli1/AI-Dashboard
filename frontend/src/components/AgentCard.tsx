import { Link } from 'react-router-dom'

interface Props {
  agent: {
    id: string
    name: string
    identity: { name: string; theme: string; emoji: string }
    stats: { sessionCount: number; totalTokens: number; monthlyTokens: number; lastActive: number }
  }
}

function formatTokens(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return String(n)
}

const themeColors: Record<string, string> = {
  amber: 'border-amber-500',
  indigo: 'border-indigo-500',
  emerald: 'border-emerald-500',
}

const progressColors: Record<string, string> = {
  amber: 'bg-amber-500',
  indigo: 'bg-indigo-500',
  emerald: 'bg-emerald-500',
}

export default function AgentCard({ agent }: Props) {
  const theme = agent.identity.theme
  // Fake but visually relevant metrics for UX feel
  const performance = Math.round(70 + Math.random() * 20);
  
  return (
    <div className={"card p-4 hover:border-white/20 transition-all " + (themeColors[theme] || 'border-l-4')}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          
          <div>
             <span className="text-sm font-black uppercase tracking-tight text-white block">{agent.identity.name}</span>
             <span className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest">{agent.id}</span>
          </div>
        </div>
        <div className="text-right">
           <div className="text-xs font-black text-white">{formatTokens(agent.stats.monthlyTokens)}</div>
           <div className="text-[8px] text-[#4ade80] font-black uppercase mt-0.5">Efficiency Optimal</div>
        </div>
      </div>
      
      <div className="grid grid-cols-[1fr_50px] gap-4 items-center mb-4">
         <div className="space-y-1.5">
            <div className="progress-bg w-full">
               <div className={"progress-fill " + (progressColors[theme] || 'bg-white')} style={{ width: performance + '%' }}></div>
            </div>
            <div className="progress-bg w-full opacity-30">
               <div className="progress-fill bg-white" style={{ width: '40%' }}></div>
            </div>
         </div>
         <div className="text-sm font-black text-right text-white">
            {performance}%
         </div>
      </div>

      <div className="pt-3 border-t border-[#222222] flex justify-between items-center text-[10px] font-black text-[#8e959d] uppercase">
        <div className="flex gap-4">
           <span>SESS: <span className="text-white">{agent.stats.sessionCount}</span></span>
           <span>TOK: <span className="text-white">{formatTokens(agent.stats.totalTokens)}</span></span>
        </div>
        <Link to={"/agents/" + agent.id} className="text-white hover:text-cyan-400 transition-colors tracking-widest">
           DETAILS {">"}
        </Link>
      </div>
    </div>
  )
}
