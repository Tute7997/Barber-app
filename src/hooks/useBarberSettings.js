import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useBarberSettings(userId) {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSettings = useCallback(async () => {
    if (!userId) return

    setLoading(true)
    const { data, error: fetchError } = await supabase
      .from('barber_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (fetchError) {
      setError(fetchError.message)
      setSettings(null)
    } else {
      setError(null)
      setSettings(data)
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  return { settings, setSettings, loading, error, setError, refetch: fetchSettings }
}
