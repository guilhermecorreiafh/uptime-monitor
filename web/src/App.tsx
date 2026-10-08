import { useCallback, useEffect, useState } from 'react'
import { deleteService, getServices } from './api'
import { timeAgo } from './format'
import { ServiceDetail } from './ServiceDetail'
import { ServiceForm } from './ServiceForm'
import type { MonitoredService } from './types'
import { useTheme } from './useTheme'
import './App.css'

function App() {
  const [services, setServices] = useState<MonitoredService[]>([])
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<MonitoredService | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
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
  const selected = services.find(s => s.id === selectedId) ?? null

  async function handleDelete(service: MonitoredService) {
    if (!window.confirm(`Excluir "${service.name}"?`)) return

    try {
      await deleteService(service.id)
      if (editing?.id === service.id) setEditing(null)
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

      <ServiceForm
        key={`form-${editing?.id ?? 'new'}`}
        editing={editing}
        onSaved={() => {
          setEditing(null)
          load()
        }}
        onCancel={() => setEditing(null)}
      />

      {error && <p className="error">{error}</p>}

      <ul className="service-list">
        {services.map(service => (
          <li
            key={service.id}
            className={`service ${service.id === selectedId ? 'selected' : ''}`}
          >
            <span className={`dot ${statusClass(service.isUp)}`} />

            <button
              className="service-info"
              onClick={() => setSelectedId(service.id === selectedId ? null : service.id)}
            >
              <strong>{service.name}</strong>
              <small className="url">{service.url}</small>
            </button>

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
              className="edit"
              onClick={() => setEditing(service)}
              aria-label={`Editar ${service.name}`}
            >
              ✎
            </button>

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

      {selected && (
        <ServiceDetail
          key={`detail-${selected.id}`}
          service={selected}
          onClose={() => setSelectedId(null)}
        />
      )}
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