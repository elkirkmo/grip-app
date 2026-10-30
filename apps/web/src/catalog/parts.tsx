import type { CatalogGear, ItemAvailability } from '@grip/api'

const THUMB = 'size-16 shrink-0 rounded bg-neutral-200 object-cover sm:size-20'

/** A square crop of the item's photo, or a grey square of the same size so rows line up. */
export function Thumbnail({ url }: { url: string | null }) {
  // The name sits right beside it, so the photo adds nothing for screen readers.
  if (!url) return <div className={THUMB} aria-hidden="true" />
  return <img src={url} alt="" width={80} height={80} loading="lazy" decoding="async" className={THUMB} />
}

/** Whether the item can be booked for the chosen dates, and if not, why. */
export function Status({ gear, status }: { gear: CatalogGear; status: ItemAvailability }) {
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
