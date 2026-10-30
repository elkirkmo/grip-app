/** Today in the browser's time zone, as YYYY-MM-DD. */
export function localToday(now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

/** Days charged for a rental, counted like the backend: out and back the same day is one day. */
export function rentalDays(start: string, due: string): number {
  // Midnight UTC on both dates, so a daylight-saving change in between can't add or lose an hour.
  const day = (iso: string) => Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)))
  return Math.round((day(due) - day(start)) / 86_400_000) + 1
}
