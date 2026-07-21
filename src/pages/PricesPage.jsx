import { useEffect, useRef, useState } from 'react'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { SERVICES, PROMOS, findPriceRow } from '../lib/priceConstants'

const DEBOUNCE_MS = 400
const MESSAGE_TIMEOUT_MS = 2500

export default function PricesPage() {
  const [prices, setPrices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const timers = useRef({})
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
        setError(null)
      }
      setLoading(false)
    }

    fetchPrices()

    return () => {
      active = false
    }
  }, [])

  function flashSuccess(message) {
    setSuccessMessage(message)
    clearTimeout(messageTimer.current)
    messageTimer.current = setTimeout(() => setSuccessMessage(null), MESSAGE_TIMEOUT_MS)
  }

  function handlePriceChange(rowId, rawValue) {
    if (rowId === undefined || rowId === null) return

    setPrices((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, price: rawValue } : row)),
    )

    clearTimeout(timers.current[rowId])
    timers.current[rowId] = setTimeout(async () => {
      const numericValue = parseFloat(rawValue)
      if (Number.isNaN(numericValue)) return

      const { data, error: updateError } = await supabase
        .from('prices')
        .update({ price: numericValue })
        .eq('id', rowId)
        .select()
        .single()

      if (updateError) {
        setError(`No se pudo guardar el cambio: ${updateError.message}`)
      } else if (!data) {
        setError('No se encontró el precio para actualizar (ID inválido).')
      } else {
        setError(null)
        flashSuccess('Precio actualizado')
      }
    }, DEBOUNCE_MS)
  }

  function PriceInput({ row }) {
    if (!row) return null
    return (
      <div className="relative w-28">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-accent/50">$</span>
        <input
          type="number"
          step="0.01"
          min="0"
          value={row.price ?? ''}
          onChange={(e) => handlePriceChange(row.id, e.target.value)}
          className="w-full rounded-lg border border-accent/15 bg-white py-2 pl-7 pr-3 text-right font-medium text-accent focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
    )
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
                      <PriceInput row={row} />
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
                              <PriceInput row={promoRow} />
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
          </>
        )}
      </div>
    </div>
  )
}
