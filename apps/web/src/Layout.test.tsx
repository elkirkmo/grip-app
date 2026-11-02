import { fireEvent, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { config } from './config'
import { catalog } from './test/fixtures'
import { renderApp } from './test/renderApp'
import { THEME_KEY } from './theme'

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

describe('theme toggle', () => {
  const html = document.documentElement

  afterEach(() => {
    html.className = ''
    vi.unstubAllGlobals()
  })

  function deviceIsDark(dark: boolean) {
    vi.stubGlobal('matchMedia', () => ({ matches: dark, addEventListener() {}, removeEventListener() {} }))
  }

  test('switches between dark and light and remembers the choice', () => {
    deviceIsDark(false)
    renderApp('/cart', backend)

    fireEvent.click(screen.getByRole('button', { name: 'Switch to dark mode' }))
    expect(html.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem(THEME_KEY)).toBe('dark')

    fireEvent.click(screen.getByRole('button', { name: 'Switch to light mode' }))
    expect(html.classList.contains('dark')).toBe(false)
    expect(html.classList.contains('light')).toBe(true)
    expect(localStorage.getItem(THEME_KEY)).toBe('light')
  })

  test("follows the device's setting until the renter picks one", () => {
    deviceIsDark(true)
    renderApp('/cart', backend)
    expect(screen.getByRole('button', { name: 'Switch to light mode' })).toBeTruthy()
    expect(html.className).toBe('')
  })

  test('a saved choice wins over the device setting', () => {
    deviceIsDark(true)
    localStorage.setItem(THEME_KEY, 'light')
    renderApp('/cart', backend)
    expect(screen.getByRole('button', { name: 'Switch to dark mode' })).toBeTruthy()
  })
})
