import { Link, Outlet } from 'react-router'
import { config } from './config'

export default function Layout() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-8">
        <Link to="/" className="text-2xl font-semibold">
          {config.appName}
        </Link>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
