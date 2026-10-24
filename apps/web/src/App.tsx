import { config } from './config'

export default function App() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold">{config.appName}</h1>
    </main>
  )
}
