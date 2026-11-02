import { useEffect } from 'react'
import { Link, Outlet } from 'react-router'
import { keepOnlyInCart, useCart } from './cart/cart'
import { useCatalog } from './catalog/queries'
import { config } from './config'
import { toggleTheme, useTheme } from './theme'

export default function Layout() {
  const cart = useCart()
  const catalog = useCatalog()
  const theme = useTheme()

  // Retired gear falls out of the cart, so the count is right on every page.
  useEffect(() => {
    if (catalog.data) keepOnlyInCart(new Set(catalog.data.map((gear) => gear.id)))
  }, [catalog.data])

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {config.homeName && config.homeUrl && (
        <a href={config.homeUrl} className="mb-4 inline-block text-sm text-neutral-600 dark:text-neutral-400 hover:underline">
          ← Back to {config.homeName}
        </a>
      )}
      <header className="mb-8 flex items-baseline justify-between gap-4">
        <Link to="/" className="text-2xl font-semibold">
          {config.appName}
        </Link>
        <div className="flex items-baseline gap-4">
          <Link to="/cart" className="text-sm hover:underline">
            Cart ({cart.ids.length})
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="text-sm hover:underline"
          >
            {theme === 'dark' ? '☀\uFE0E' : '☾'}
          </button>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
