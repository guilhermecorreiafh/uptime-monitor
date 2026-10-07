import { useState, type FormEvent } from 'react'
import { createService, updateService } from './api'
import type { MonitoredService } from './types'

type Props = {
  editing: MonitoredService | null
  onSaved: () => void
  onCancel: () => void
}

const intervalOptions = [30, 60, 300]

export function ServiceForm({ editing, onSaved, onCancel }: Props) {
  const [name, setName] = useState(editing?.name ?? '')
  const [url, setUrl] = useState(editing?.url ?? '')
  const [intervalSeconds, setIntervalSeconds] = useState(editing?.intervalSeconds ?? 60)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const data = { name, url, intervalSeconds }

      if (editing) {
        await updateService(editing.id, data)
      } else {
        await createService(data)
        setName('')
        setUrl('')
        setIntervalSeconds(60)
      }

      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar serviço')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="service-form" onSubmit={handleSubmit}>
      <input
        placeholder="Nome"
        value={name}
        onChange={e => setName(e.target.value)}
        required
        maxLength={100}
      />
      <input
        placeholder="https://..."
        type="url"
        value={url}
        onChange={e => setUrl(e.target.value)}
        required
      />
      <select value={intervalSeconds} onChange={e => setIntervalSeconds(Number(e.target.value))}>
        {!intervalOptions.includes(intervalSeconds) && (
          <option value={intervalSeconds}>{intervalSeconds}s</option>
        )}
        <option value={30}>30s</option>
        <option value={60}>1 min</option>
        <option value={300}>5 min</option>
      </select>
      <button type="submit" disabled={saving}>
        {saving ? 'Salvando...' : editing ? 'Salvar' : 'Adicionar'}
      </button>
      {editing && (
        <button type="button" onClick={onCancel}>
          Cancelar
        </button>
      )}

      {error && <p className="error">{error}</p>}
    </form>
  )
}