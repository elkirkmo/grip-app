import createClient from 'openapi-fetch'
import type { components, paths } from './schema'

export type { paths }

type Schemas = components['schemas']
export type CatalogGear = Schemas['CatalogGear']
export type Availability = Schemas['Availability']
export type ItemAvailability = Schemas['ItemAvailability']
export type UnavailableReason = Schemas['UnavailableReason']

export interface ApiClientOptions {
  /** Swap in a different fetch, e.g. in tests. */
  fetch?: (input: Request) => Promise<Response>
}

/** A typed client for any backend that implements openapi.yaml. */
export function createApiClient(baseUrl: string, options: ApiClientOptions = {}) {
  return createClient<paths>({ baseUrl, ...options })
}

export type ApiClient = ReturnType<typeof createApiClient>
