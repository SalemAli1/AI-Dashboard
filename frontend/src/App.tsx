import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import AgentDetail from './pages/AgentDetail'
import HealthPage from './pages/HealthPage'
import SessionsPage from './pages/SessionsPage'
import CronPage from './pages/CronPage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#141619]">
        <main className="flex-1 p-4 pb-24 md:pb-6 max-w-2xl mx-auto w-full">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/agents/:id" element={<AgentDetail />} />
            <Route path="/health" element={<HealthPage />} />
            <Route path="/sessions" element={<SessionsPage />} />
            <Route path="/cron" element={<CronPage />} />
          </Routes>
        </main>

        <div className="flex justify-center items-center gap-2 py-4 text-xs text-[#8e959d]">
          <span className="text-green-500">✔</span>
          <span>Secure 100.105.192.71</span>
        </div>

        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#1c1f23] border-t border-[#2d3135] flex items-center justify-around">
          <NavLink to="/" end className={({ isActive }) => "flex-1 text-center py-4 text-[10px] font-bold uppercase tracking-widest " + (isActive ? 'text-[#4ade80] border-b-2 border-[#4ade80]' : 'text-[#8e959d]')}>DASHBOARD</NavLink>
          <NavLink to="/health" className={({ isActive }) => "flex-1 text-center py-4 text-[10px] font-bold uppercase tracking-widest " + (isActive ? 'text-[#4ade80] border-b-2 border-[#4ade80]' : 'text-[#8e959d]')}>HEALTH</NavLink>
          <NavLink to="/sessions" className={({ isActive }) => "flex-1 text-center py-4 text-[10px] font-bold uppercase tracking-widest " + (isActive ? 'text-[#4ade80] border-b-2 border-[#4ade80]' : 'text-[#8e959d]')}>SESSIONS</NavLink>
          <NavLink to="/cron" className={({ isActive }) => "flex-1 text-center py-4 text-[10px] font-bold uppercase tracking-widest " + (isActive ? 'text-[#4ade80] border-b-2 border-[#4ade80]' : 'text-[#8e959d]')}>CRON</NavLink>
        </nav>
      </div>
    </BrowserRouter>
  )
}
