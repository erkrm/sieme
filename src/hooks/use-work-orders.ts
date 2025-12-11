import { useQuery } from '@tanstack/react-query'

async function fetchWorkOrders() {
  const response = await fetch('/api/admin/work-orders')
  if (!response.ok) {
    throw new Error('Network response was not ok')
  }
  return response.json()
}

export function useWorkOrdersPolling(intervalMs = 30000) {
  return useQuery({
    queryKey: ['work-orders'],
    queryFn: fetchWorkOrders,
    refetchInterval: intervalMs,
  })
}
