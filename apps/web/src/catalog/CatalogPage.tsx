import type { CatalogGear, ItemAvailability } from '@grip/api'
import { useSearchParams } from 'react-router'
import { config } from '../config'
import { localToday, rangeFrom } from './dates'
import { useAvailability, useCatalog } from './queries'

const money = new Intl.NumberFormat(undefined, { style: 'currency', currency: config.currency })

export default function CatalogPage() {
  const [params, setParams] = useSearchParams()
  const range = rangeFrom(params)
  const catalog = useCatalog()
  const availability = useAvailability(range)

  function setDates(start: string, due: string) {
    // Keep the range sensible as the start moves: a due date before the start follows it.
    const next = new URLSearchParams(params)
    next.set('start', start)
    next.set('due', due && due >= start ? due : start)
    setParams(next, { replace: true })
  }

  return (
    <section>
      <form className="flex flex-wrap items-end gap-4" onSubmit={(e) => e.preventDefault()}>
        <label className="flex flex-col text-sm">
          Pick up
          <input
            type="date"
            className="mt-1 rounded border border-neutral-300 px-2 py-1"
            min={localToday()}
            value={params.get('start') ?? ''}
            onChange={(e) => setDates(e.target.value, params.get('due') ?? '')}
          />
        </label>
        <label className="flex flex-col text-sm">
          Return
          <input
            type="date"
            className="mt-1 rounded border border-neutral-300 px-2 py-1"
            min={params.get('start') || localToday()}
            value={params.get('due') ?? ''}
            onChange={(e) => setDates(params.get('start') || e.target.value, e.target.value)}
          />
        </label>
      </form>

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

function GearRow({ gear, checking, status }: { gear: CatalogGear; checking: boolean; status?: ItemAvailability }) {
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
      {checking ? <span className="text-sm text-neutral-400">Checking…</span> : status && <Status gear={gear} status={status} />}
    </li>
  )
}

const THUMB = 'size-16 shrink-0 rounded bg-neutral-200 object-cover sm:size-20'

/** A square crop of the item's photo, or a grey square of the same size so rows line up. */
function Thumbnail({ url }: { url: string | null }) {
  // The name sits right beside it, so the photo adds nothing for screen readers.
  if (!url) return <div className={THUMB} aria-hidden="true" />
  return <img src={url} alt="" width={80} height={80} loading="lazy" decoding="async" className={THUMB} />
}

function Status({ gear, status }: { gear: CatalogGear; status: ItemAvailability }) {
  const [text, tone] = statusText(gear, status)
  return <span className={`shrink-0 rounded px-2 py-0.5 text-sm ${tone}`}>{text}</span>
}

function statusText(gear: CatalogGear, status: ItemAvailability): [string, string] {
  const no = 'bg-neutral-100 text-neutral-700'
  switch (status.reason) {
    case null:
      return ['Available', 'bg-green-100 text-green-800']
    case 'booked':
      return ['Booked', no]
    case 'too_long':
      return [`Max ${gear.max_rental_days} days`, no]
    case 'too_far_ahead':
      return [gear.max_days_ahead === 0 ? 'Same-day only' : `Book within ${gear.max_days_ahead} days`, no]
  }
}
