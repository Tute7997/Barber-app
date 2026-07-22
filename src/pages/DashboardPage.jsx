import { useEffect, useState } from 'react'
import { CalendarCheck, CheckCircle2, DollarSign, Loader2, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { SERVICES, PROMO_TYPES, serviceLabel, promoLabel } from '../lib/priceConstants'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-primary/20 bg-card p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-accent">{value}</p>
          <p className="text-sm text-accent/60">{label}</p>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true

    async function fetchToday() {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('appointments')
        .select('*')
        .eq('date', todayISO())

      if (!active) return

      if (fetchError) {
        setError(`No se pudo cargar el resumen: ${fetchError.message}`)
      } else {
        setAppointments(data ?? [])
        setError(null)
      }
      setLoading(false)
    }

    fetchToday()
    return () => {
      active = false
    }
  }, [])

  const totalToday = appointments.length
  const completedToday = appointments.filter((a) => a.completed).length
  const totalIncome = appointments
    .filter((a) => a.paid)
    .reduce((sum, a) => sum + Number(a.price ?? 0), 0)

  const byService = SERVICES.map((s) => {
    const rows = appointments.filter((a) => a.service_type === s.key)
    return {
      key: s.key,
      label: s.label,
      count: rows.length,
      total: rows.reduce((sum, a) => sum + Number(a.price ?? 0), 0),
    }
  })

  const byPromo = PROMO_TYPES.map((p) => {
    const rows = appointments.filter((a) => a.promo_type === p.key)
    return {
      key: p.key,
      label: p.label,
      count: rows.length,
      total: rows.reduce((sum, a) => sum + Number(a.price ?? 0), 0),
    }
  })

  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto max-w-5xl p-6">
        <h1 className="text-3xl font-bold text-primary">Resumen del Día</h1>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-900/60 bg-red-950/40 p-3 text-sm text-red-400">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="mt-16 flex flex-col items-center justify-center gap-3 text-accent/60">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Cargando resumen...</p>
          </div>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard icon={CalendarCheck} label="Turnos hoy" value={totalToday} />
              <StatCard
                icon={CheckCircle2}
                label="Turnos completados"
                value={completedToday}
              />
              <StatCard
                icon={DollarSign}
                label="Ingresos totales"
                value={`$${totalIncome.toFixed(2)}`}
              />
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              <section className="rounded-xl border border-primary/20 bg-card p-5 shadow-sm">
                <h2 className="mb-3 text-lg font-semibold text-accent/80">
                  Desglose por Servicio
                </h2>
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-primary/10 text-xs uppercase tracking-wide text-accent/50">
                      <th className="py-2">Servicio</th>
                      <th className="py-2">Turnos</th>
                      <th className="py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byService.map((row) => (
                      <tr key={row.key} className="border-b border-primary/5 last:border-0">
                        <td className="py-2 font-medium text-accent">{row.label}</td>
                        <td className="py-2">{row.count}</td>
                        <td className="py-2">${row.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              <section className="rounded-xl border border-primary/20 bg-card p-5 shadow-sm">
                <h2 className="mb-3 text-lg font-semibold text-accent/80">
                  Desglose por Promoción
                </h2>
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-primary/10 text-xs uppercase tracking-wide text-accent/50">
                      <th className="py-2">Promoción</th>
                      <th className="py-2">Turnos</th>
                      <th className="py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byPromo.map((row) => (
                      <tr key={row.key} className="border-b border-primary/5 last:border-0">
                        <td className="py-2 font-medium text-accent">{row.label}</td>
                        <td className="py-2">{row.count}</td>
                        <td className="py-2">${row.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
