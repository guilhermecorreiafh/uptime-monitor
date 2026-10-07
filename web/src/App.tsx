import { useCallback, useEffect, useState } from 'react'
import { deleteService, getServices } from './api'
import { timeAgo } from './format'
import { ServiceForm } from './ServiceForm'
import type { MonitoredService } from './types'
import { useTheme } from './useTheme'
import './App.css'

function App() {
  const [services, setServices] = useState<MonitoredService[]>([])
  const [error, setError] = useState<string | null>(null)
  const { theme, toggleTheme } = useTheme()

  const load = useCallback(() => {
    getServices()
      .then(data => {
        setServices(data)
        setError(null)
      })
      .catch(() => setError('Não foi possível conectar à API'))
  }, [])

  useEffect(() => {
    load()
    const intervalId = setInterval(load, 5000)

    return () => clearInterval(intervalId)
  }, [load])

  const upCount = services.filter(s => s.isUp).length

  async function handleDelete(service: MonitoredService) {
    if (!window.confirm(`Excluir "${service.name}"?`)) return

    try {
      await deleteService(service.id)
      load()
    } catch {
      setError('Não foi possível excluir o serviço')
    }
  }

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

      <ServiceForm onCreated={load} />

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

            <button
              className="delete"
              onClick={() => handleDelete(service)}
              aria-label={`Excluir ${service.name}`}
            >
              ✕
            </button>

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