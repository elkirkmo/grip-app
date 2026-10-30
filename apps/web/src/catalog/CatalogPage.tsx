import type { CatalogGear, ItemAvailability } from '@grip/api'
import { addToCart, cartRange, removeFromCart, useCart } from '../cart/cart'
import DateFields from '../cart/DateFields'
import { money } from '../money'
import { Status, Thumbnail } from './parts'
import { useAvailability, useCatalog } from './queries'

export default function CatalogPage() {
  const cart = useCart()
  const range = cartRange(cart)
  const catalog = useCatalog()
  const availability = useAvailability(range)

  return (
    <section>
      <DateFields />

      {availability.isError && (
        <p role="alert" className="mt-4 text-red-700">
          {availability.error.message}
        </p>
      )}

      {catalog.isPending && <p className="mt-8 text-neutral-500">Loading gear…</p>}
      {catalog.isError && (
        <p role="alert" className="mt-8 text-red-700">
          Couldn't load the gear list. {catalog.error.message}
        </p>
      )}
      {catalog.data && catalog.data.length === 0 && <p className="mt-8">No gear to rent right now.</p>}
      {catalog.data &&
        byCategory(catalog.data).map(([category, items]) => (
          <section key={category} className="mt-8">
            <h2 className="text-lg font-semibold">{category}</h2>
            <ul className="mt-2 divide-y divide-neutral-200">
              {items.map((gear) => (
                <GearRow
                  key={gear.id}
                  gear={gear}
                  inCart={cart.ids.includes(gear.id)}
                  checking={range !== null && availability.isFetching}
                  status={availability.data?.get(gear.id)}
                />
              ))}
            </ul>
          </section>
        ))}
    </section>
  )
}

const OTHER = 'Other'

/** Group in the backend's order, with uncategorized gear last under "Other". */
function byCategory(gear: CatalogGear[]): [string, CatalogGear[]][] {
  const groups = new Map<string, CatalogGear[]>()
  for (const item of gear) {
    const category = item.category || OTHER
    groups.set(category, [...(groups.get(category) ?? []), item])
  }
  return [...groups].sort(([a], [b]) => Number(a === OTHER) - Number(b === OTHER))
}

interface GearRowProps {
  gear: CatalogGear
  inCart: boolean
  checking: boolean
  status?: ItemAvailability
}

function GearRow({ gear, inCart, checking, status }: GearRowProps) {
  return (
    <li className="flex items-start gap-4 py-3">
      <Thumbnail url={gear.thumbnail_url} />
      <div className="min-w-0 flex-1">
        <p className="font-medium">{gear.name}</p>
        {gear.description && <p className="text-sm text-neutral-600">{gear.description}</p>}
        <p className="text-sm text-neutral-500">
          {money.format(Number(gear.daily_rate))}/day · up to {gear.max_rental_days} days
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        {checking ? <span className="text-sm text-neutral-400">Checking…</span> : status && <Status gear={gear} status={status} />}
        <CartButton gear={gear} inCart={inCart} />
      </div>
    </li>
  )
}

/** Any item can go in the cart, whatever its availability; the cart flags problems for its dates. */
function CartButton({ gear, inCart }: { gear: CatalogGear; inCart: boolean }) {
  // The item's name is for screen readers, which otherwise hear a list of identical buttons.
  const name = <span className="sr-only">{gear.name}</span>
  return inCart ? (
    <button
      type="button"
      className="rounded border border-neutral-300 px-3 py-1 text-sm hover:bg-neutral-100"
      onClick={() => removeFromCart(gear.id)}
    >
      Remove {name}
    </button>
  ) : (
    <button
      type="button"
      className="rounded bg-neutral-900 px-3 py-1 text-sm text-white hover:bg-neutral-700"
      onClick={() => addToCart(gear.id)}
    >
      Add to cart {name}
    </button>
  )
}
