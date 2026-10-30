import { useSyncExternalStore } from 'react'
import { localToday } from '../catalog/dates'
import type { DateRange } from '../catalog/queries'

/** What the renter has picked: physical items (no quantities) and one pick-up/return range for all of them. */
export interface Cart {
  ids: number[]
  start: string
  due: string
}

export const CART_KEY = 'grip.cart'

const EMPTY: Cart = { ids: [], start: '', due: '' }
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

// The cart lives in this browser only. Storage can be blocked (private windows, strict settings),
// so the cart then lasts until the page closes.
let storageBroken = false
let memory = ''

function readRaw(): string {
  if (!storageBroken) {
    try {
      return localStorage.getItem(CART_KEY) ?? ''
    } catch {
      storageBroken = true
    }
  }
  return memory
}

/** Whatever was stored, made safe: unknown shapes become an empty cart, and past dates are dropped. */
function parse(raw: string): Cart {
  let value: Partial<Cart>
  try {
    value = JSON.parse(raw)
  } catch {
    return EMPTY
  }
  if (!value || typeof value !== 'object') return EMPTY
  const ids = Array.isArray(value.ids) ? [...new Set(value.ids.filter(Number.isInteger))] : []
  const { start, due } = value
  const datesOk =
    typeof start === 'string' && typeof due === 'string' && ISO_DATE.test(start) && ISO_DATE.test(due) && start >= localToday() && due >= start
  return datesOk ? { ids, start, due } : { ids, start: '', due: '' }
}

// useSyncExternalStore needs the same object back until the cart changes.
let lastRaw: string | null = null
let lastCart = EMPTY

function getSnapshot(): Cart {
  const raw = readRaw()
  if (raw !== lastRaw) {
    lastRaw = raw
    lastCart = parse(raw)
  }
  return lastCart
}

const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  // Another tab changing the cart fires this here.
  window.addEventListener('storage', listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', listener)
  }
}

function save(next: Cart) {
  const raw = JSON.stringify(next)
  try {
    localStorage.setItem(CART_KEY, raw)
  } catch {
    storageBroken = true
  }
  memory = raw
  listeners.forEach((listener) => listener())
}

export function useCart(): Cart {
  return useSyncExternalStore(subscribe, getSnapshot)
}

/** The cart's dates, once both are set. */
export function cartRange(cart: Cart): DateRange | null {
  return cart.start && cart.due ? { start: cart.start, due: cart.due } : null
}

export function addToCart(id: number) {
  const cart = getSnapshot()
  if (!cart.ids.includes(id)) save({ ...cart, ids: [...cart.ids, id] })
}

export function removeFromCart(id: number) {
  const cart = getSnapshot()
  save({ ...cart, ids: cart.ids.filter((other) => other !== id) })
}

export function setCartDates(start: string, due: string) {
  save({ ...getSnapshot(), start, due })
}

/** Drop items that are no longer in the catalog, such as retired gear. */
export function keepOnlyInCart(ids: Set<number>) {
  const cart = getSnapshot()
  const kept = cart.ids.filter((id) => ids.has(id))
  if (kept.length !== cart.ids.length) save({ ...cart, ids: kept })
}
