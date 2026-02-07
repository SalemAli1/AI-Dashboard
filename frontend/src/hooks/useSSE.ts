import { useEffect, useRef } from 'react'

export interface SSEFilter {
  event?: string
  file?: string
  agentId?: string
}

function matchesFilter(data: any, filter?: SSEFilter): boolean {
  if (!filter) return true
  if (filter.event && data.type !== filter.event) return false
  if (filter.file && data.file !== filter.file) return false
  if (filter.agentId && data.agentId !== filter.agentId) return false
  return true
}

export function useSSE(onEvent: (data: any) => void, filter?: SSEFilter) {
  const cbRef = useRef(onEvent)
  cbRef.current = onEvent
  const filterRef = useRef(filter)
  filterRef.current = filter

  useEffect(() => {
    const es = new EventSource('/api/sse')
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        if (matchesFilter(data, filterRef.current)) {
          cbRef.current(data)
        }
      } catch { /* ignore parse errors */ }
    }
    return () => es.close()
  }, [])
}
