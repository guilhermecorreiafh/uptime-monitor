import { useEffect, useState } from 'react'
import { getServices } from './api'
import type { MonitoredService } from './types'
import './App.css'
import { useTheme } from './useTheme'

function App() {
  const [services, setServices] = useState<MonitoredService[]>([])
  const [error, setError] = useState<string | null>(null)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const load = () =>
      getServices()
        .then(data => {
          setServices(data)
          setError(null)
        })
        .catch(() => setError('Não foi possível conectar à API'))

    load()
    const intervalId = setInterval(load, 5000)

    return () => clearInterval(intervalId)
  }, [])

  return (
    <main className="container">
      <header className="header">
        <h1>Uptime Monitor</h1>
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Alternar tema">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </header>
      {error && <p className="error">{error}</p>}

      <ul className="service-list">
        {services.map(service => (
          <li key={service.id} className="service">
            <span className={`dot ${statusClass(service.isUp)}`} />
            <div>
              <strong>{service.name}</strong>
              <small>{service.url}</small>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}

function statusClass(isUp: boolean | null) {
  if (isUp === null) return 'unknown'
  return isUp ? 'up' : 'down'
}

export default App