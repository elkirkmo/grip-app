import type { CatalogGear, ItemAvailability } from '@grip/api'
import { Link } from 'react-router'
import { rentalDays } from '../catalog/dates'
import { Status, Thumbnail } from '../catalog/parts'
import { useAvailability, useCatalog } from '../catalog/queries'
import { money } from '../money'
import { cartRange, removeFromCart, useCart } from './cart'
import DateFields from './DateFields'

// Prices are added up in cents so that, say, 3 × $0.10 doesn't come out as $0.30000000000000004.
const cents = (rate: string) => Math.round(Number(rate) * 100)
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

export default function CartPage() {
  const cart = useCart()
  const range = cartRange(cart)
  const catalog = useCatalog()
  const availability = useAvailability(range)

  if (cart.ids.length === 0) {
    return (
      <section>
        <h1 className="text-xl font-semibold">Your cart</h1>
        <p className="mt-4">Your cart is empty.</p>
        <Link to="/" className="mt-2 inline-block underline">
          Browse gear
        </Link>
      </section>
    )
  }

  // In the order they were added. Items missing from the catalog are dropped by the layout.
  const byId = new Map(catalog.data?.map((gear) => [gear.id, gear]))
  const items = cart.ids.map((id) => byId.get(id)).filter((gear): gear is CatalogGear => gear !== undefined)
  const days = range && rentalDays(range.start, range.due)
  const blocked = items.some((gear) => availability.data?.get(gear.id)?.available === false)
  const subtotal = days && items.reduce((sum, gear) => sum + cents(gear.daily_rate) * days, 0)

  return (
    <section>
      <h1 className="text-xl font-semibold">Your cart</h1>
      <div className="mt-4">
        <DateFields />
      </div>

      {availability.isError && (
        <p role="alert" className="mt-4 text-red-700">
          {availability.error.message}
        </p>
      )}
      {catalog.isPending && <p className="mt-8 text-neutral-500">Loading your cart…</p>}
      {catalog.isError && (
        <p role="alert" className="mt-8 text-red-700">
          Couldn't load your cart. {catalog.error.message}
        </p>
      )}

      {items.length > 0 && (
        <ul className="mt-6 divide-y divide-neutral-200">
          {items.map((gear) => (
            <CartRow
              key={gear.id}
              gear={gear}
              days={days}
              checking={range !== null && availability.isFetching}
              status={availability.data?.get(gear.id)}
            />
          ))}
        </ul>
      )}

      {blocked && (
        <p className="mt-4 rounded bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Some items can't be booked for these dates. Remove them or try other dates.
        </p>
      )}

      {items.length > 0 && (
        <div className="mt-6 border-t border-neutral-300 pt-4">
          {days && subtotal !== null ? (
            <>
              <p className="flex justify-between font-medium">
                <span>Estimated subtotal, {plural(days, 'day')}</span>
                <span>{money.format(subtotal / 100)}</span>
              </p>
              <p className="mt-1 text-sm text-neutral-500">The final price, with any discount, is set when you book.</p>
            </>
          ) : (
            <p className="text-neutral-600">Pick your dates to see the price.</p>
          )}
          <p className="mt-6 text-sm text-neutral-600">Booking needs an account — coming soon.</p>
        </div>
      )}
    </section>
  )
}

interface CartRowProps {
  gear: CatalogGear
  days: number | null
  checking: boolean
  status?: ItemAvailability
}

function CartRow({ gear, days, checking, status }: CartRowProps) {
  return (
    <li className="flex items-start gap-4 py-3">
      <Thumbnail url={gear.thumbnail_url} />
      <div className="min-w-0 flex-1">
        <p className="font-medium">{gear.name}</p>
        <p className="text-sm text-neutral-500">
          {money.format(Number(gear.daily_rate))}/day
          {days && ` × ${plural(days, 'day')} = ${money.format((cents(gear.daily_rate) * days) / 100)}`}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        {checking ? <span className="text-sm text-neutral-400">Checking…</span> : status && <Status gear={gear} status={status} />}
        <button
          type="button"
          className="rounded border border-neutral-300 px-3 py-1 text-sm hover:bg-neutral-100"
          onClick={() => removeFromCart(gear.id)}
        >
          Remove <span className="sr-only">{gear.name}</span>
        </button>
      </div>
    </li>
  )
}
