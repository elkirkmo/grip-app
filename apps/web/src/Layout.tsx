import { Link, Outlet } from 'react-router'
import { useCart } from './cart/cart'
import { config } from './config'

export default function Layout() {
  const cart = useCart()
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-8 flex items-baseline justify-between gap-4">
        <Link to="/" className="text-2xl font-semibold">
          {config.appName}
        </Link>
        <span className="text-sm">Cart ({cart.ids.length})</span>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
