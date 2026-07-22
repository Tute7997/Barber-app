import { useEffect, useRef, useState } from 'react'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { SERVICES, PROMOS, findPriceRow } from '../lib/priceConstants'

const MESSAGE_TIMEOUT_MS = 2500

function sanitizePriceInput(raw) {
  const cleaned = raw.replace(/[^0-9.]/g, '')
  const [intPart, ...rest] = cleaned.split('.')
  if (rest.length === 0) return intPart
  return `${intPart}.${rest.join('').slice(0, 2)}`
}

function PriceInput({ row, onChange }) {
  if (!row) return null
  return (
    <div className="relative w-28">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-accent/50">$</span>
      <input
        type="text"
        inputMode="decimal"
        value={row.price ?? ''}
        onChange={(e) => onChange(row.id, e.target.value)}
        className="w-full rounded-lg border border-accent/15 bg-white py-2 pl-7 pr-3 text-right font-medium text-accent focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </div>
  )
}

export default function PricesPage() {
  const [prices, setPrices] = useState([])
  const [savedPrices, setSavedPrices] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const messageTimer = useRef(null)

  useEffect(() => {
    let active = true

    async function fetchPrices() {
      setLoading(true)
      const { data, error: fetchError } = await supabase.from('prices').select('*')

      if (!active) return

      if (fetchError) {
        setError(`No se pudieron cargar los precios: ${fetchError.message}`)
      } else {
        setPrices(data ?? [])
        setSavedPrices(data ?? [])
        setError(null)
      }
      setLoading(false)
    }

    fetchPrices()

    return () => {
      active = false
    }
  }, [])

  const hasChanges = prices.some((row) => {
    const original = savedPrices.find((r) => r.id === row.id)
    return Number(original?.price) !== Number(row.price)
  })

  function flashSuccess(message) {
    setSuccessMessage(message)
    clearTimeout(messageTimer.current)
    messageTimer.current = setTimeout(() => setSuccessMessage(null), MESSAGE_TIMEOUT_MS)
  }

  function handlePriceChange(rowId, rawValue) {
    if (rowId === undefined || rowId === null) return

    const sanitized = sanitizePriceInput(rawValue)

    setPrices((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, price: sanitized } : row)),
    )
  }

  function handleCancel() {
    setPrices(savedPrices.map((row) => ({ ...row })))
    setError(null)
    setSuccessMessage(null)
  }

  async function handleSaveAll() {
    setError(null)

    const changedRows = prices.filter((row) => {
      const original = savedPrices.find((r) => r.id === row.id)
      return Number(original?.price) !== Number(row.price)
    })

    const parsed = []
    for (const row of changedRows) {
      const numericValue = parseFloat(row.price)
      if (Number.isNaN(numericValue)) {
        setError('Hay precios inválidos. Revisá los campos antes de guardar.')
        return
      }
      parsed.push({ ...row, price: numericValue })
    }

    setSaving(true)
    for (const row of parsed) {
      const { error: updateError } = await supabase
        .from('prices')
        .update({ price: row.price })
        .eq('service_type', row.service_type)
        .eq('promo_type', row.promo_type)

      if (updateError) {
        setSaving(false)
        setError(`No se pudo guardar ${row.service_type}/${row.promo_type}: ${updateError.message}`)
        return
      }
    }
    setSaving(false)

    const savedSnapshot = prices.map((row) => ({ ...row, price: parseFloat(row.price) }))
    setPrices(savedSnapshot)
    setSavedPrices(savedSnapshot)
    flashSuccess('Cambios guardados correctamente')
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto max-w-5xl p-6">
        <h1 className="text-3xl font-bold text-primary">Configuración de Precios</h1>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {loading ? (
          <div className="mt-16 flex flex-col items-center justify-center gap-3 text-accent/60">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Cargando precios...</p>
          </div>
        ) : (
          <>
            <section className="mt-8">
              <h2 className="text-lg font-semibold tracking-wide text-accent/80">
                PRECIOS NORMALES
              </h2>
              <div className="mt-3 divide-y divide-accent/10 rounded-xl border border-accent/10 bg-white shadow-sm">
                {SERVICES.map(({ key, label }) => {
                  const row = findPriceRow(prices, 'normal', key)
                  return (
                    <div key={key} className="flex items-center justify-between gap-4 p-4">
                      <span className="font-medium text-accent">{label}</span>
                      <PriceInput row={row} onChange={handlePriceChange} />
                    </div>
                  )
                })}
              </div>
            </section>

            <section className="mt-10">
              <h2 className="text-lg font-semibold tracking-wide text-accent/80">
                PROMOCIONES
              </h2>
              <div className="mt-3 grid grid-cols-1 gap-6 md:grid-cols-3">
                {PROMOS.map(({ key: promoKey, label, qty }) => (
                  <div
                    key={promoKey}
                    className="rounded-xl border border-accent/10 bg-white p-5 shadow-sm"
                  >
                    <h3 className="mb-4 font-semibold text-primary">{label}</h3>
                    <div className="space-y-4">
                      {SERVICES.map(({ key: serviceKey, label: serviceLabel }) => {
                        const promoRow = findPriceRow(prices, promoKey, serviceKey)
                        const normalRow = findPriceRow(prices, 'normal', serviceKey)
                        const promoPerUnit = parseFloat(promoRow?.price)
                        const normalPrice = parseFloat(normalRow?.price)

                        const hasValidNumbers =
                          !Number.isNaN(promoPerUnit) && !Number.isNaN(normalPrice) && qty > 0
                        const ahorras = hasValidNumbers
                          ? (normalPrice - promoPerUnit) * qty
                          : null

                        return (
                          <div key={serviceKey}>
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-sm font-medium text-accent">
                                {serviceLabel}
                              </span>
                              <PriceInput row={promoRow} onChange={handlePriceChange} />
                            </div>
                            {hasValidNumbers && (
                              <p className="mt-1 text-right text-xs text-secondary-dark">
                                Cada {serviceLabel.toLowerCase()} sale ${promoPerUnit.toFixed(2)}{' '}
                                (Ahorras ${ahorras.toFixed(2)})
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="mt-10 flex justify-end gap-3">
              <button
                onClick={handleCancel}
                disabled={!hasChanges || saving}
                className="rounded-lg border border-accent/15 px-5 py-2.5 text-sm font-medium text-accent hover:bg-accent/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveAll}
                disabled={!hasChanges || saving}
                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Guardar cambios
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
