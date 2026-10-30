import type { CatalogGear } from '@grip/api'
import { vi } from 'vitest'
import { CART_KEY, type Cart } from '../cart/cart'

// In the order grip-api sends it: by category, so uncategorized gear comes first.
export const gear: CatalogGear[] = [
  { id: 4, name: 'Sandbag', category: '', description: '', daily_rate: '2.00', max_rental_days: 7, max_days_ahead: 0, image_url: null, thumbnail_url: null },
  { id: 1, name: 'Aputure 600d', category: 'Lighting', description: 'Daylight LED', daily_rate: '75.00', max_rental_days: 7, max_days_ahead: 60, image_url: 'https://img.test/gear/1/a.webp', thumbnail_url: 'https://img.test/gear/1/a-thumb.webp' },
  { id: 2, name: 'Skypanel S60', category: 'Lighting', description: '', daily_rate: '150.00', max_rental_days: 2, max_days_ahead: 60, image_url: null, thumbnail_url: null },
  { id: 3, name: 'C-stand', category: 'Grip', description: '', daily_rate: '10.00', max_rental_days: 7, max_days_ahead: 60, image_url: null, thumbnail_url: null },
]

export const catalog = () => Response.json(gear)
export const availability = () =>
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

export const storeCart = (cart: Partial<Cart>) => localStorage.setItem(CART_KEY, JSON.stringify({ ids: [], start: '', due: '', ...cart }))
export const storedCart = (): Cart => JSON.parse(localStorage.getItem(CART_KEY)!)

/** The cart forgets past dates, so tests that store dates pin "today" to 30 Oct 2026. */
export function pinToday() {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 9, 30, 12))
}
