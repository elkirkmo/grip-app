import { screen } from '@testing-library/react'
import { afterEach, describe, expect, test } from 'vitest'
import { config } from './config'
import { catalog } from './test/fixtures'
import { renderApp } from './test/renderApp'

const backend = { '/api/catalog/': catalog }
const saved = { ...config }

afterEach(() => Object.assign(config, saved))

describe('header', () => {
  test('links back to the home site when one is configured', () => {
    Object.assign(config, { homeName: 'Example Films', homeUrl: 'https://example.com' })
    renderApp('/cart', backend)
    expect(screen.getByRole('link', { name: '← Back to Example Films' }).getAttribute('href')).toBe('https://example.com')
  })

  test('has no home link when none is configured', () => {
    Object.assign(config, { homeName: undefined, homeUrl: undefined })
    renderApp('/cart', backend)
    expect(screen.queryByText(/Back to/)).toBeNull()
  })
})
