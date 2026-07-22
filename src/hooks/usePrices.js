import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const DEFAULT_PRICES = [
  { service_type: 'corte', promo_type: 'normal', price: 25 },
  { service_type: 'barba', promo_type: 'normal', price: 15 },
  { service_type: 'combo', promo_type: 'normal', price: 35 },
  { service_type: 'corte', promo_type: 'promo2', price: 22.5 },
  { service_type: 'barba', promo_type: 'promo2', price: 13.5 },
  { service_type: 'combo', promo_type: 'promo2', price: 31.5 },
  { service_type: 'corte', promo_type: 'promo3', price: 20 },
  { service_type: 'barba', promo_type: 'promo3', price: 12 },
  { service_type: 'combo', promo_type: 'promo3', price: 28 },
  { service_type: 'corte', promo_type: 'promo4', price: 17.5 },
  { service_type: 'barba', promo_type: 'promo4', price: 10.5 },
  { service_type: 'combo', promo_type: 'promo4', price: 24.5 },
]

export function usePrices(userId) {
  const [prices, setPrices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPrices = useCallback(async () => {
    if (!userId) return

    setLoading(true)
    let { data, error: fetchError } = await supabase
      .from('prices')
      .select('*')
      .eq('user_id', userId)

    if (!fetchError && (data ?? []).length === 0) {
      const seedPayload = DEFAULT_PRICES.map((row) => ({ ...row, user_id: userId }))
      const { data: seeded, error: seedError } = await supabase
        .from('prices')
        .insert(seedPayload)
        .select()

      if (seedError) {
        fetchError = seedError
      } else {
        data = seeded
      }
    }

    if (fetchError) {
      setError(`No se pudieron cargar los precios: ${fetchError.message}`)
    } else {
      setPrices(data ?? [])
      setError(null)
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchPrices()
  }, [fetchPrices])

  return { prices, setPrices, loading, error, setError, refetch: fetchPrices }
}
