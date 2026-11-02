import { useEffect } from 'react'
import { Link, Outlet } from 'react-router'
import { keepOnlyInCart, useCart } from './cart/cart'
import { useCatalog } from './catalog/queries'
import { config } from './config'

export default function Layout() {
  const cart = useCart()
  const catalog = useCatalog()

  // Retired gear falls out of the cart, so the count is right on every page.
  useEffect(() => {
    if (catalog.data) keepOnlyInCart(new Set(catalog.data.map((gear) => gear.id)))
  }, [catalog.data])

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {config.homeName && config.homeUrl && (
        <a href={config.homeUrl} className="mb-4 inline-block text-sm text-neutral-600 hover:underline">
          ← Back to {config.homeName}
        </a>
      )}
      <header className="mb-8 flex items-baseline justify-between gap-4">
        <Link to="/" className="text-2xl font-semibold">
          {config.appName}
        </Link>
        <Link to="/cart" className="text-sm hover:underline">
          Cart ({cart.ids.length})
        </Link>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
