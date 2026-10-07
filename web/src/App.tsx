import { useEffect, useState } from 'react'
import { getServices } from './api'
import { timeAgo } from './format'
import type { MonitoredService } from './types'
import { useTheme } from './useTheme'
import './App.css'

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

  const upCount = services.filter(s => s.isUp).length

  return (
    <main className="container">
      <header className="header">
        <h1>Uptime Monitor</h1>
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Alternar tema">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </header>

      {services.length > 0 && (
        <p className="summary">
          {upCount} de {services.length} serviços no ar
        </p>
      )}

      {error && <p className="error">{error}</p>}

      <ul className="service-list">
        {services.map(service => (
          <li key={service.id} className="service">
            <span className={`dot ${statusClass(service.isUp)}`} />

            <div className="service-info">
              <strong>{service.name}</strong>
              <small className="url">{service.url}</small>
            </div>

            <div className="service-meta">
              <span className={`status ${statusClass(service.isUp)}`}>
                {statusLabel(service.isUp)}
              </span>
              <small>
                {service.lastResponseTimeMs !== null && `${service.lastResponseTimeMs}ms · `}
                {timeAgo(service.lastCheckedAt)}
              </small>
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

function statusLabel(isUp: boolean | null) {
  if (isUp === null) return 'Aguardando'
  return isUp ? 'No ar' : 'Fora do ar'
}

export default App