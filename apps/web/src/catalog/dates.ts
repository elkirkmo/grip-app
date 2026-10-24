import type { DateRange } from './queries'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/** Today in the browser's time zone, as YYYY-MM-DD. */
export function localToday(now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

/** Both dates, if both are present and well formed. The backend checks the rest. */
export function rangeFrom(params: URLSearchParams): DateRange | null {
  const start = params.get('start') ?? ''
  const due = params.get('due') ?? ''
  return ISO_DATE.test(start) && ISO_DATE.test(due) ? { start, due } : null
}
