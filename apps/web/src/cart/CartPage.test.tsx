import { fireEvent, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { rentalDays } from '../catalog/dates'
import { availability, catalog, pinToday, storeCart, storedCart } from '../test/fixtures'
import { renderApp } from '../test/renderApp'

const backend = { '/api/catalog/': catalog, '/api/catalog/availability/': availability }
const row = (name: string) => screen.getByText(name, { selector: 'p' }).closest('li')!
const subtotal = () => screen.getByText(/^Estimated subtotal/).parentElement!.textContent

beforeEach(pinToday)
afterEach(() => vi.useRealTimers())

describe('cart page', () => {
  test('says when the cart is empty and links back to the gear', async () => {
    const { router } = renderApp('/cart', backend)
    expect(screen.getByText('Your cart is empty.')).toBeTruthy()
    fireEvent.click(screen.getByRole('link', { name: 'Browse gear' }))
    expect(router.state.location.pathname).toBe('/')
  })

  test('is linked from the header with the item count', async () => {
    storeCart({ ids: [3] })
    const { router } = renderApp('/', backend)
    await screen.findByText('C-stand', { selector: 'p' })
    fireEvent.click(screen.getByRole('link', { name: 'Cart (1)' }))
    expect(router.state.location.pathname).toBe('/cart')
    expect(screen.getByRole('heading', { name: 'Your cart' })).toBeTruthy()
  })

  test('lists items in the order added, with each line and the subtotal for the dates', async () => {
    storeCart({ ids: [3, 1], start: '2026-11-02', due: '2026-11-04' })
    renderApp('/cart', backend)
    await screen.findByText('C-stand', { selector: 'p' })
    expect(screen.getAllByRole('listitem').map((li) => li.querySelector('p')!.textContent)).toEqual(['C-stand', 'Aputure 600d'])
    expect(within(row('C-stand')).getByText(/10\.00\/day × 3 days = \$30\.00/)).toBeTruthy()
    expect(within(row('Aputure 600d')).getByText(/75\.00\/day × 3 days = \$225\.00/)).toBeTruthy()
    expect(subtotal()).toMatch(/^Estimated subtotal, 3 days\$255\.00$/)
  })

  test('counts out and back the same day as one day', async () => {
    storeCart({ ids: [1], start: '2026-11-02', due: '2026-11-02' })
    renderApp('/cart', backend)
    await screen.findByText('Aputure 600d', { selector: 'p' })
    expect(subtotal()).toMatch(/^Estimated subtotal, 1 day\$75\.00$/)
  })

  test('asks for dates before showing a price', async () => {
    storeCart({ ids: [1] })
    renderApp('/cart', backend)
    await screen.findByText('Aputure 600d', { selector: 'p' })
    expect(screen.getByText('Pick your dates to see the price.')).toBeTruthy()
    expect(screen.queryByText(/Estimated subtotal/)).toBeNull()
    expect(within(row('Aputure 600d')).queryByText(/×/)).toBeNull()
  })

  test("flags items that can't be booked for the dates", async () => {
    storeCart({ ids: [1, 3], start: '2026-11-02', due: '2026-11-04' })
    renderApp('/cart', backend)
    await screen.findByText('C-stand', { selector: 'p' })
    expect(await within(row('C-stand')).findByText('Booked')).toBeTruthy()
    expect(within(row('Aputure 600d')).getByText('Available')).toBeTruthy()
    expect(screen.getByText(/Some items can't be booked for these dates/)).toBeTruthy()
  })

  test('does not flag anything when every item is available', async () => {
    storeCart({ ids: [1], start: '2026-11-02', due: '2026-11-04' })
    renderApp('/cart', backend)
    expect(await screen.findByText('Available')).toBeTruthy()
    expect(screen.queryByText(/Some items can't be booked/)).toBeNull()
  })

  test('removes an item', async () => {
    storeCart({ ids: [3, 1], start: '2026-11-02', due: '2026-11-04' })
    renderApp('/cart', backend)
    await screen.findByText('C-stand', { selector: 'p' })
    fireEvent.click(screen.getByRole('button', { name: 'Remove C-stand' }))
    expect(screen.queryByText('C-stand', { selector: 'p' })).toBeNull()
    expect(screen.getByRole('link', { name: 'Cart (1)' })).toBeTruthy()
    expect(storedCart().ids).toEqual([1])
    expect(subtotal()).toMatch(/\$225\.00$/)
  })

  test('changes the dates for the whole cart', async () => {
    storeCart({ ids: [1], start: '2026-11-02', due: '2026-11-04' })
    renderApp('/cart', backend)
    await screen.findByText('Aputure 600d', { selector: 'p' })
    fireEvent.change(screen.getByLabelText('Return'), { target: { value: '2026-11-03' } })
    expect(storedCart()).toMatchObject({ start: '2026-11-02', due: '2026-11-03' })
    expect(subtotal()).toMatch(/^Estimated subtotal, 2 days\$150\.00$/)
  })
})

describe('rentalDays', () => {
  test('counts both the pick-up and the return day', () => {
    expect(rentalDays('2026-11-02', '2026-11-02')).toBe(1)
    expect(rentalDays('2026-11-02', '2026-11-04')).toBe(3)
  })

  test('counts across a month, a year and a daylight-saving change', () => {
    expect(rentalDays('2026-10-31', '2026-11-02')).toBe(3)
    expect(rentalDays('2026-12-31', '2027-01-01')).toBe(2)
    expect(rentalDays('2028-02-28', '2028-03-01')).toBe(3)
  })
})
