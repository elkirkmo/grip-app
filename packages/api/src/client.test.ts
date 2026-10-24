import { expect, test } from 'vitest'
import { createApiClient } from '.'

function recordingClient(baseUrl: string) {
  const requests: Request[] = []
  const api = createApiClient(baseUrl, {
    fetch: async (request) => {
      requests.push(request)
      return Response.json({ start_date: '2026-11-02', due_date: '2026-11-03', items: [] })
    },
  })
  return { api, requests }
}

test('sends availability ids the way the backend reads them', async () => {
  const { api, requests } = recordingClient('https://rentals.example')
  const { data } = await api.GET('/api/catalog/availability/', {
    params: { query: { start_date: '2026-11-02', due_date: '2026-11-03', ids: [3, 7] } },
  })
  expect(requests[0].url).toBe(
    'https://rentals.example/api/catalog/availability/?start_date=2026-11-02&due_date=2026-11-03&ids=3&ids=7',
  )
  expect(data?.items).toEqual([])
})

test('accepts a base URL with a trailing slash', async () => {
  const { api, requests } = recordingClient('https://rentals.example/')
  await api.GET('/api/catalog/')
  expect(requests[0].url).toBe('https://rentals.example/api/catalog/')
})
