import { fireEvent, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { CART_KEY } from '../cart/cart'
import { availability, catalog, pinToday, storeCart, storedCart } from '../test/fixtures'
import { renderApp } from '../test/renderApp'

const row = (name: string) => screen.getByText(name, { selector: 'p' }).closest('li')!
const availabilityCalls = (requests: URL[]) => requests.filter((url) => url.pathname === '/api/catalog/availability/')

beforeEach(pinToday)
afterEach(() => vi.useRealTimers())

describe('catalog', () => {
  test('lists gear by category with daily rates and the app name', async () => {
    renderApp('/', { '/api/catalog/': catalog })
    expect(await screen.findByRole('heading', { name: 'Lighting' })).toBeTruthy()
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual(['Lighting', 'Grip', 'Other'])
    expect(within(row('Aputure 600d')).getByText(/75\.00\/day · up to 7 days/)).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Test Rentals' })).toBeTruthy()
  })

  test('shows each photo as a thumbnail, and a blank square without one', async () => {
    renderApp('/', { '/api/catalog/': catalog })
    await screen.findByText('Aputure 600d', { selector: 'p' })
    expect(row('Aputure 600d').querySelector('img')?.getAttribute('src')).toBe('https://img.test/gear/1/a-thumb.webp')
    expect(row('C-stand').querySelector('img')).toBeNull()
    expect(row('C-stand').querySelector('[aria-hidden="true"]')).toBeTruthy()
  })

  test('waits for dates before checking availability', async () => {
    const { requests } = renderApp('/', { '/api/catalog/': catalog, '/api/catalog/availability/': availability })
    await screen.findByText('Aputure 600d', { selector: 'p' })
    expect(availabilityCalls(requests)).toEqual([])
    expect(screen.queryByText('Available')).toBeNull()
    expect(screen.queryByRole('alert')).toBeNull()
  })

  test('shows availability and the reason for each item', async () => {
    storeCart({ start: '2026-11-02', due: '2026-11-04' })
    const { requests } = renderApp('/', { '/api/catalog/': catalog, '/api/catalog/availability/': availability })
    await screen.findByText('Aputure 600d', { selector: 'p' })
    expect(await within(row('Aputure 600d')).findByText('Available')).toBeTruthy()
    expect(within(row('Skypanel S60')).getByText('Max 2 days')).toBeTruthy()
    expect(within(row('C-stand')).getByText('Booked')).toBeTruthy()
    expect(within(row('Sandbag')).getByText('Same-day only')).toBeTruthy()
    expect(availabilityCalls(requests).map((url) => url.search)).toEqual(['?start_date=2026-11-02&due_date=2026-11-04'])
  })

  test('picking a start date fills in the return date, remembers both, and checks availability', async () => {
    const { requests } = renderApp('/', { '/api/catalog/': catalog, '/api/catalog/availability/': availability })
    await screen.findByText('Aputure 600d', { selector: 'p' })
    fireEvent.change(screen.getByLabelText('Pick up'), { target: { value: '2026-11-02' } })
    expect((screen.getByLabelText('Return') as HTMLInputElement).value).toBe('2026-11-02')
    expect(storedCart()).toMatchObject({ start: '2026-11-02', due: '2026-11-02' })
    expect(await within(row('Aputure 600d')).findByText('Available')).toBeTruthy()
    expect(availabilityCalls(requests)).toHaveLength(1)
  })

  test('moving the start past the return date moves the return date too', async () => {
    storeCart({ start: '2026-11-02', due: '2026-11-03' })
    renderApp('/', { '/api/catalog/': catalog, '/api/catalog/availability/': availability })
    await screen.findByText('Aputure 600d', { selector: 'p' })
    fireEvent.change(screen.getByLabelText('Pick up'), { target: { value: '2026-11-05' } })
    expect(storedCart()).toMatchObject({ start: '2026-11-05', due: '2026-11-05' })
  })

  test('explains when the backend rejects the dates', async () => {
    storeCart({ start: '2026-11-02', due: '2026-11-04' })
    renderApp('/', {
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

describe('cart', () => {
  test('adds and removes items, whatever their availability, and counts them in the header', async () => {
    storeCart({ start: '2026-11-02', due: '2026-11-04' })
    renderApp('/', { '/api/catalog/': catalog, '/api/catalog/availability/': availability })
    await screen.findByText('C-stand', { selector: 'p' })
    await within(row('C-stand')).findByText('Booked')
    expect(screen.getByText('Cart (0)')).toBeTruthy()

    fireEvent.click(within(row('C-stand')).getByRole('button', { name: 'Add to cart C-stand' }))
    fireEvent.click(within(row('Aputure 600d')).getByRole('button', { name: 'Add to cart Aputure 600d' }))
    expect(screen.getByText('Cart (2)')).toBeTruthy()
    expect(storedCart().ids).toEqual([3, 1])

    fireEvent.click(within(row('C-stand')).getByRole('button', { name: 'Remove C-stand' }))
    expect(screen.getByText('Cart (1)')).toBeTruthy()
    expect(within(row('C-stand')).getByRole('button', { name: 'Add to cart C-stand' })).toBeTruthy()
    expect(storedCart().ids).toEqual([1])
  })

  test('comes back after a reload', async () => {
    storeCart({ ids: [2], start: '2026-11-02', due: '2026-11-04' })
    renderApp('/', { '/api/catalog/': catalog, '/api/catalog/availability/': availability })
    await screen.findByText('Skypanel S60', { selector: 'p' })
    expect(await within(row('Skypanel S60')).findByRole('button', { name: 'Remove Skypanel S60' })).toBeTruthy()
    expect(screen.getByText('Cart (1)')).toBeTruthy()
    expect((screen.getByLabelText('Pick up') as HTMLInputElement).value).toBe('2026-11-02')
    expect((screen.getByLabelText('Return') as HTMLInputElement).value).toBe('2026-11-04')
  })

  test('forgets dates that have passed but keeps the items', async () => {
    storeCart({ ids: [2], start: '2026-10-29', due: '2026-11-04' })
    const { requests } = renderApp('/', { '/api/catalog/': catalog, '/api/catalog/availability/': availability })
    await screen.findByText('Aputure 600d', { selector: 'p' })
    expect((screen.getByLabelText('Pick up') as HTMLInputElement).value).toBe('')
    expect(availabilityCalls(requests)).toEqual([])
    expect(screen.getByText('Cart (1)')).toBeTruthy()
  })

  test('drops items that are no longer in the catalog', async () => {
    storeCart({ ids: [99, 3] })
    renderApp('/', { '/api/catalog/': catalog })
    await screen.findByText('Aputure 600d', { selector: 'p' })
    expect(await screen.findByText('Cart (1)')).toBeTruthy()
    expect(storedCart().ids).toEqual([3])
  })

  test('starts empty when what was stored is not a cart', async () => {
    localStorage.setItem(CART_KEY, '{not json')
    renderApp('/', { '/api/catalog/': catalog })
    await screen.findByText('Aputure 600d', { selector: 'p' })
    expect(screen.getByText('Cart (0)')).toBeTruthy()
  })
})

test('unknown pages say so', () => {
  renderApp('/nope', {})
  expect(screen.getByText('Page not found.')).toBeTruthy()
})
