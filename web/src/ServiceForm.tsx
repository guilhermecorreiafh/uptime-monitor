import { useState, type FormEvent } from 'react'
import { createService } from './api'

type Props = {
  onCreated: () => void
}

export function ServiceForm({ onCreated }: Props) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [intervalSeconds, setIntervalSeconds] = useState(60)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)

    try {
      await createService({ name, url, intervalSeconds })
      setName('')
      setUrl('')
      setIntervalSeconds(60)
      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar serviço')
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
        <option value={30}>30s</option>
        <option value={60}>1 min</option>
        <option value={300}>5 min</option>
      </select>
      <button type="submit" disabled={saving}>
        {saving ? 'Salvando...' : 'Adicionar'}
      </button>

      {error && <p className="error">{error}</p>}
    </form>
  )
}