import { localToday } from '../catalog/dates'
import { setCartDates, useCart } from './cart'

/** The cart's pick-up and return dates; one range covers every item in it. */
export default function DateFields() {
  const cart = useCart()

  function setDates(start: string, due: string) {
    // Keep the range sensible as the start moves: a due date before the start follows it.
    setCartDates(start, due && due >= start ? due : start)
  }

  return (
    <form className="flex flex-wrap items-end gap-4" onSubmit={(e) => e.preventDefault()}>
      <label className="flex flex-col text-sm">
        Pick up
        <input
          type="date"
          className="mt-1 rounded border border-neutral-300 px-2 py-1"
          min={localToday()}
          value={cart.start}
          onChange={(e) => setDates(e.target.value, cart.due)}
        />
      </label>
      <label className="flex flex-col text-sm">
        Return
        <input
          type="date"
          className="mt-1 rounded border border-neutral-300 px-2 py-1"
          min={cart.start || localToday()}
          value={cart.due}
          onChange={(e) => setDates(cart.start || e.target.value, e.target.value)}
        />
      </label>
    </form>
  )
}
