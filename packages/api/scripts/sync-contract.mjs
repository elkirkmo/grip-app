// Rebuild openapi.yaml, this app's API contract, from a backend's full OpenAPI spec.
// Only the operations listed below are kept, and each one must be callable without a login.
// To use a new endpoint, add its operationId here on purpose, then run `npm run gen`.
//
//   npm run sync -w @grip/api -- <path to the backend's openapi.yaml>

import { readFileSync, writeFileSync } from 'node:fs'
import { parse, stringify } from 'yaml'

const OPERATIONS = ['catalog_list', 'catalog_retrieve', 'catalog_availability_retrieve']

const METHODS = ['get', 'put', 'post', 'delete', 'patch', 'options', 'head', 'trace']
const SCHEMA_REF = '#/components/schemas/'
const OUTPUT = new URL('../openapi.yaml', import.meta.url)

function fail(message) {
  console.error(message)
  process.exit(1)
}

const source = process.argv[2]
if (!source) fail('Usage: npm run sync -w @grip/api -- <path to the backend openapi.yaml>')
const spec = parse(readFileSync(source, 'utf8'))

const paths = {}
const found = new Set()
for (const [path, item] of Object.entries(spec.paths ?? {})) {
  for (const method of METHODS) {
    const operation = item[method]
    if (!operation || !OPERATIONS.includes(operation.operationId)) continue
    const security = operation.security ?? spec.security ?? []
    if (!security.some((requirement) => Object.keys(requirement).length === 0)) {
      fail(`${operation.operationId} needs a login, and the contract only holds public operations.`)
    }
    // How a backend authenticates is its own business; the contract only says the call is public.
    const { security: _, ...publicOperation } = operation
    paths[path] ??= {}
    paths[path][method] = publicOperation
    found.add(operation.operationId)
  }
}
const missing = OPERATIONS.filter((id) => !found.has(id))
if (missing.length) fail(`Not in ${source}: ${missing.join(', ')}`)

// Keep only the schemas the kept operations reach.
const allSchemas = spec.components?.schemas ?? {}
const used = new Set()
const queue = [paths]
while (queue.length) {
  const node = queue.pop()
  if (!node || typeof node !== 'object') continue
  for (const [key, value] of Object.entries(node)) {
    if (key === '$ref' && typeof value === 'string' && value.startsWith(SCHEMA_REF)) {
      const name = value.slice(SCHEMA_REF.length)
      if (!(name in allSchemas)) fail(`Missing schema ${name} in ${source}`)
      if (!used.has(name)) {
        used.add(name)
        queue.push(allSchemas[name])
      }
    } else {
      queue.push(value)
    }
  }
}

const contract = {
  openapi: spec.openapi,
  info: { title: 'Grip app API contract', version: spec.info?.version ?? '0.0.0' },
  paths,
  components: { schemas: Object.fromEntries([...used].sort().map((name) => [name, allSchemas[name]])) },
}
const header = '# The API this app needs. Built by scripts/sync-contract.mjs; change OPERATIONS there, not this file.\n'
writeFileSync(OUTPUT, header + stringify(contract))
console.log(`Wrote ${found.size} operations and ${used.size} schemas to openapi.yaml`)
