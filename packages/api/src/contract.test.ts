import { readFileSync } from 'node:fs'
import { parse } from 'yaml'
import { describe, expect, test } from 'vitest'

const contract = parse(readFileSync(new URL('../openapi.yaml', import.meta.url), 'utf8'))
const operations = Object.values(contract.paths as Record<string, Record<string, { operationId: string }>>)
  .flatMap((item) => Object.values(item))

describe('the API contract', () => {
  test('holds only the operations this app uses', () => {
    expect(operations.map((op) => op.operationId).sort()).toEqual([
      'catalog_availability_retrieve',
      'catalog_list',
      'catalog_retrieve',
    ])
  })

  test('needs no login for any operation', () => {
    expect(contract.security).toBeUndefined()
    expect(contract.components.securitySchemes).toBeUndefined()
    for (const op of operations) expect(op).not.toHaveProperty('security')
  })

  test('has no private gear fields', () => {
    const fields = Object.values(contract.components.schemas as Record<string, { properties?: object }>)
      .flatMap((schema) => Object.keys(schema.properties ?? {}))
    for (const field of ['serial_number', 'replacement_value', 'checked_out_to', 'renter']) {
      expect(fields).not.toContain(field)
    }
  })
})
