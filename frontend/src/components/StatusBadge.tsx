interface Props {
  label: string
  state: string
}

const stateStyles: Record<string, string> = {
  ok: 'bg-green-500/20 text-green-400 border-green-500/40',
  warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
  error: 'bg-red-500/20 text-red-400 border-red-500/40',
  unknown: 'bg-gray-500/20 text-gray-400 border-gray-500/40',
}

const dotColors: Record<string, string> = {
  ok: 'bg-green-400 ',
  warning: 'bg-yellow-400 ',
  error: 'bg-red-400 ',
  unknown: 'bg-gray-400',
}

export default function StatusBadge({ label, state }: Props) {
  const normalized = state === 'ok' ? 'ok' : state.includes('warn') ? 'warning' : state.includes('error') || state.includes('unhealthy') ? 'error' : 'unknown'
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${stateStyles[normalized] || stateStyles.unknown}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColors[normalized] || dotColors.unknown}`} />
      {label}: {state}
    </span>
  )
}
