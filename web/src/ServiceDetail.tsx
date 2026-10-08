import { useEffect, useState } from 'react'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getResults } from './api'
import type { CheckResult, MonitoredService } from './types'

type Props = {
  service: MonitoredService
  onClose: () => void
}

export function ServiceDetail({ service, onClose }: Props) {
  const [results, setResults] = useState<CheckResult[]>([])

  useEffect(() => {
    const load = () =>
      getResults(service.id)
        .then(setResults)
        .catch(() => setResults([]))

    load()
    const intervalId = setInterval(load, 5000)

    return () => clearInterval(intervalId)
  }, [service.id])

  const chartData = [...results].reverse().map(r => ({
    time: new Date(r.checkedAt).toLocaleTimeString('pt-BR'),
    ms: r.isSuccess ? r.responseTimeMs : null,
  }))

  const total = results.length
  const successTimes = results.filter(r => r.isSuccess).map(r => r.responseTimeMs)
  const uptime = total > 0 ? Math.round((successTimes.length / total) * 1000) / 10 : null
  const average =
    successTimes.length > 0
      ? Math.round(successTimes.reduce((sum, ms) => sum + ms, 0) / successTimes.length)
      : null
  const lastError = results.find(r => !r.isSuccess)?.error

  return (
    <section className="detail">
      <div className="detail-header">
        <h2>{service.name}</h2>
        <button className="theme-toggle" onClick={onClose} aria-label="Fechar detalhes">
          ✕
        </button>
      </div>

      <div className="detail-stats">
        <div>
          <small>Uptime</small>
          <strong>{uptime !== null ? `${uptime}%` : '—'}</strong>
        </div>
        <div>
          <small>Média</small>
          <strong>{average !== null ? `${average}ms` : '—'}</strong>
        </div>
        <div>
          <small>Checagens</small>
          <strong>{total}</strong>
        </div>
      </div>

      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <XAxis dataKey="time" tick={{ fontSize: 11 }} minTickGap={40} />
            <YAxis tick={{ fontSize: 11 }} unit="ms" width={64} />
            <Tooltip
              contentStyle={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
            />
            <Line
              type="monotone"
              dataKey="ms"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className="muted">Sem checagens ainda.</p>
      )}

      {lastError && <p className="error"><small>Último erro: {lastError}</small></p>}

      <p className="muted"><small>Baseado nas últimas 50 checagens</small></p>
    </section>
  )
}