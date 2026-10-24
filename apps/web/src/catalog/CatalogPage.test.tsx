import type { CatalogGear } from '@grip/api'
import { fireEvent, screen, within } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { renderApp } from '../test/renderApp'

// In the order grip-api sends it: by category, so uncategorized gear comes first.
const gear: CatalogGear[] = [
  { id: 4, name: 'Sandbag', category: '', description: '', daily_rate: '2.00', max_rental_days: 7, max_days_ahead: 0 },
  { id: 1, name: 'Aputure 600d', category: 'Lighting', description: 'Daylight LED', daily_rate: '75.00', max_rental_days: 7, max_days_ahead: 60 },
  { id: 2, name: 'Skypanel S60', category: 'Lighting', description: '', daily_rate: '150.00', max_rental_days: 2, max_days_ahead: 60 },
  { id: 3, name: 'C-stand', category: 'Grip', description: '', daily_rate: '10.00', max_rental_days: 7, max_days_ahead: 60 },
]

const catalog = () => Response.json(gear)
const availability = () =>
  Response.json({
    start_date: '2026-11-02',
    due_date: '2026-11-04',
    items: [
      { id: 1, available: true, reason: null },
      { id: 2, available: false, reason: 'too_long' },
      { id: 3, available: false, reason: 'booked' },
      { id: 4, available: false, reason: 'too_far_ahead' },
    ],
  })

const row = (name: string) => screen.getByText(name).closest('li')!
const availabilityCalls = (requests: URL[]) => requests.filter((url) => url.pathname === '/api/catalog/availability/')

describe('catalog', () => {
  test('lists gear by category with daily rates and the app name', async () => {
    renderApp('/', { '/api/catalog/': catalog })
    expect(await screen.findByRole('heading', { name: 'Lighting' })).toBeTruthy()
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual(['Lighting', 'Grip', 'Other'])
    expect(within(row('Aputure 600d')).getByText(/75\.00\/day · up to 7 days/)).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Test Rentals' })).toBeTruthy()
  })

  test('waits for both dates before checking availability', async () => {
    const { requests } = renderApp('/?start=2026-11-02', { '/api/catalog/': catalog, '/api/catalog/availability/': availability })
    await screen.findByText('Aputure 600d')
    expect(availabilityCalls(requests)).toEqual([])
    expect(screen.queryByText('Available')).toBeNull()
    expect(screen.queryByRole('alert')).toBeNull()
  })

  test('shows availability and the reason for each item', async () => {
    const { requests } = renderApp('/?start=2026-11-02&due=2026-11-04', {
      '/api/catalog/': catalog,
      '/api/catalog/availability/': availability,
    })
    await screen.findByText('Aputure 600d')
    expect(await within(row('Aputure 600d')).findByText('Available')).toBeTruthy()
    expect(within(row('Skypanel S60')).getByText('Max 2 days')).toBeTruthy()
    expect(within(row('C-stand')).getByText('Booked')).toBeTruthy()
    expect(within(row('Sandbag')).getByText('Same-day only')).toBeTruthy()
    expect(availabilityCalls(requests).map((url) => url.search)).toEqual(['?start_date=2026-11-02&due_date=2026-11-04'])
  })

  test('picking a start date fills in the return date and checks availability', async () => {
    const { requests, router } = renderApp('/', { '/api/catalog/': catalog, '/api/catalog/availability/': availability })
    await screen.findByText('Aputure 600d')
    fireEvent.change(screen.getByLabelText('Pick up'), { target: { value: '2026-11-02' } })
    expect(router.state.location.search).toBe('?start=2026-11-02&due=2026-11-02')
    expect(await within(row('Aputure 600d')).findByText('Available')).toBeTruthy()
    expect(availabilityCalls(requests)).toHaveLength(1)
  })

  test('moving the start past the return date moves the return date too', async () => {
    const { router } = renderApp('/?start=2026-11-02&due=2026-11-03', { '/api/catalog/': catalog, '/api/catalog/availability/': availability })
    await screen.findByText('Aputure 600d')
    fireEvent.change(screen.getByLabelText('Pick up'), { target: { value: '2026-11-05' } })
    expect(router.state.location.search).toBe('?start=2026-11-05&due=2026-11-05')
  })

  test('explains when the backend rejects the dates', async () => {
    renderApp('/?start=2020-01-01&due=2020-01-02', {
      '/api/catalog/': catalog,
      '/api/catalog/availability/': () => Response.json({ start_date: ["Start date can't be in the past."] }, { status: 400 }),
    })
    expect((await screen.findByRole('alert')).textContent).toBe("Start date can't be in the past.")
  })

  test('says so when the gear list will not load', async () => {
    renderApp('/', { '/api/catalog/': () => new Response('oops', { status: 500 }) })
    expect((await screen.findByRole('alert')).textContent).toMatch(/Couldn't load the gear list/)
  })
})

test('unknown pages say so', () => {
  renderApp('/nope', {})
  expect(screen.getByText('Page not found.')).toBeTruthy()
})
