import { useEffect, useRef, useState } from 'react'
import { Loader2, AlertCircle, CheckCircle2, Upload } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useBarberSettings } from '../hooks/useBarberSettings'

const MESSAGE_TIMEOUT_MS = 2500
const MAX_LOGO_BYTES = 500 * 1024

export default function SettingsPage() {
  const { user } = useAuth()
  const { settings, setSettings, loading, error, setError } = useBarberSettings(user.id)

  const [name, setName] = useState('')
  const [logoData, setLogoData] = useState(null)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState(null)
  const messageTimer = useRef(null)

  useEffect(() => {
    if (!loading) {
      setName(settings?.barber_name ?? '')
      setLogoData(settings?.logo_url ?? null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  const hasChanges =
    name !== (settings?.barber_name ?? '') || logoData !== (settings?.logo_url ?? null)

  function flashSuccess(message) {
    setSuccessMessage(message)
    clearTimeout(messageTimer.current)
    messageTimer.current = setTimeout(() => setSuccessMessage(null), MESSAGE_TIMEOUT_MS)
  }

  function handleLogoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_LOGO_BYTES) {
      setError('La imagen es muy grande. Máximo 500KB.')
      return
    }

    setError(null)
    const reader = new FileReader()
    reader.onload = () => setLogoData(reader.result)
    reader.readAsDataURL(file)
  }

  function handleCancel() {
    setName(settings?.barber_name ?? '')
    setLogoData(settings?.logo_url ?? null)
    setError(null)
    setSuccessMessage(null)
  }

  async function handleSave() {
    setError(null)
    setSaving(true)

    const payload = { barber_name: name.trim() || null, logo_url: logoData }

    const query = settings?.id
      ? supabase.from('barber_settings').update(payload).eq('id', settings.id)
      : supabase.from('barber_settings').insert({ ...payload, user_id: user.id })

    const { data, error: saveError } = await query.select().single()

    setSaving(false)
    if (saveError) {
      setError(`No se pudieron guardar los cambios: ${saveError.message}`)
      return
    }

    setSettings(data)
    flashSuccess('Cambios guardados correctamente')
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto max-w-2xl p-6">
        <h1 className="text-3xl font-bold text-primary">Personalización</h1>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-900/60 bg-red-950/40 p-3 text-sm text-red-400">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-green-900/60 bg-green-950/40 p-3 text-sm text-green-400">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {loading ? (
          <div className="mt-16 flex flex-col items-center justify-center gap-3 text-accent/60">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Cargando configuración...</p>
          </div>
        ) : (
          <div className="mt-6 space-y-6 rounded-xl border border-primary/20 bg-card p-6 shadow-sm">
            <div>
              <label className="mb-1 block text-sm font-medium text-accent/70">
                Nombre de la barbería
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="LuxeSalon"
                className="w-full rounded-lg border border-primary/30 bg-input p-2.5 text-accent placeholder:text-accent/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-accent/70">Logo</label>
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-primary/20 bg-input">
                  {logoData ? (
                    <img src={logoData} alt="Logo" className="h-full w-full object-cover" />
                  ) : (
                    <Upload className="h-6 w-6 text-accent/40" />
                  )}
                </div>
                <label className="cursor-pointer rounded-lg border border-primary/30 px-4 py-2 text-sm font-medium text-accent hover:bg-primary/10">
                  Elegir imagen
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="mt-2 text-xs text-accent/40">PNG o JPG, máximo 500KB.</p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={handleCancel}
                disabled={!hasChanges || saving}
                className="rounded-lg border border-primary/20 px-5 py-2.5 text-sm font-medium text-accent hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-black hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Guardar cambios
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
