import { useQuery } from '@tanstack/react-query'
import { errorMessage, useApi } from '../api'

export function useCatalog() {
  const api = useApi()
  return useQuery({
    queryKey: ['catalog'],
    queryFn: async () => {
      const { data, error, response } = await api.GET('/api/catalog/')
      if (!response.ok || !data) throw new Error(errorMessage(error))
      return data
    },
  })
}

export interface DateRange {
  start: string
  due: string
}

export function useAvailability(dates: DateRange | null) {
  const api = useApi()
  return useQuery({
    queryKey: ['availability', dates?.start, dates?.due],
    enabled: dates !== null,
    queryFn: async () => {
      const { data, error, response } = await api.GET('/api/catalog/availability/', {
        params: { query: { start_date: dates!.start, due_date: dates!.due } },
      })
      if (!response.ok || !data) throw new Error(errorMessage(error))
      return new Map(data.items.map((item) => [item.id, item]))
    },
  })
}
