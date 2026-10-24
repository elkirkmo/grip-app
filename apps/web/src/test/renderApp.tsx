import { createApiClient } from '@grip/api'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { ApiContext } from '../api'
import { routes } from '../routes'

type Handler = (url: URL) => Response

/** Render the app at `path` against a fake backend; `requests` records every call it gets. */
export function renderApp(path: string, backend: Record<string, Handler>) {
  const requests: URL[] = []
  const api = createApiClient('http://api.test', {
    fetch: async (request) => {
      const url = new URL(request.url)
      requests.push(url)
      const handler = backend[url.pathname]
      return handler ? handler(url) : Response.json({ detail: 'Not found.' }, { status: 404 })
    },
  })
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(
    <ApiContext value={api}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ApiContext>,
  )
  return { requests, router }
}
