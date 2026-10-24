import type { ApiClient } from '@grip/api'
import { createContext, useContext } from 'react'

// The client comes from context so tests can hand in one with a fake backend.
export const ApiContext = createContext<ApiClient | null>(null)

export function useApi(): ApiClient {
  const api = useContext(ApiContext)
  if (!api) throw new Error('useApi needs an ApiContext provider')
  return api
}

/** Turn an error body like {"start_date": ["Can't be in the past."]} into one readable line. */
export function errorMessage(body: unknown): string {
  if (body && typeof body === 'object') {
    const messages = Object.values(body).flat().filter((m): m is string => typeof m === 'string')
    if (messages.length) return messages.join(' ')
  }
  return 'Something went wrong. Try again in a moment.'
}
