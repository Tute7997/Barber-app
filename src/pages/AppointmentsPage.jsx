import { useEffect, useState } from 'react'
import {
  Plus,
  X,
  Trash2,
  Check,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { SERVICES, PROMOS, findPriceRow, serviceLabel, promoLabel } from '../lib/priceConstants'
import { useAuth } from '../context/AuthContext'
import { usePrices } from '../hooks/usePrices'

const PROMO_OPTIONS = [{ key: 'normal', label: 'Ninguna' }, ...PROMOS]

function buildTimeSlots(startHour = 9, endHour = 20, stepMinutes = 30) {
  const slots = []
  for (let h = startHour; h <= endHour; h += 1) {
    for (let m = 0; m < 60; m += stepMinutes) {
      if (h === endHour && m > 0) break
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }
  return slots
}

const TIME_SLOTS = buildTimeSlots()

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function shiftDate(dateStr, days) {
  const d = new Date(`${dateStr}T00:00:00`)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function emptyForm(date, time) {
  return {
    id: null,
    date,
    time,
    client_name: '',
    service_type: 'corte',
    promo_type: 'normal',
    paid: false,
    completed: false,
    notes: '',
  }
}

function AppointmentModal({ initialForm, prices, userId, onClose, onSaved, onDeleted }) {
  const [form, setForm] = useState(initialForm)
  const [saving, setSaving] = useState(false)
  const [modalError, setModalError] = useState(null)

  const priceRow = findPriceRow(prices, form.promo_type, form.service_type)
  const price = priceRow?.price ?? null

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    if (!form.client_name.trim()) {
      setModalError('El nombre del cliente es obligatorio.')
      return
    }
    setSaving(true)
    setModalError(null)

    const payload = {
      date: form.date,
      time: form.time,
      client_name: form.client_name.trim(),
      service_type: form.service_type,
      promo_type: form.promo_type,
      price: price ?? 0,
      paid: form.paid,
      completed: form.completed,
      notes: form.notes.trim() || null,
    }

    const query = form.id
      ? supabase.from('appointments').update(payload).eq('id', form.id)
      : supabase.from('appointments').insert({ ...payload, user_id: userId })

    const { error } = await query.select().single()

    setSaving(false)
    if (error) {
      setModalError(error.message)
      return
    }
    onSaved()
  }

  async function handleDelete() {
    setSaving(true)
    setModalError(null)
    const { error } = await supabase.from('appointments').delete().eq('id', form.id)
    setSaving(false)
    if (error) {
      setModalError(error.message)
      return
    }
    onDeleted()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-primary">
            {form.id ? 'Editar Turno' : 'Nuevo Turno'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-accent/50 hover:bg-accent/5 hover:text-accent"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {modalError && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{modalError}</span>
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-accent/70">Fecha</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => update('date', e.target.value)}
              className="w-full rounded-lg border border-accent/15 p-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-accent/70">Hora</label>
            <select
              value={form.time}
              onChange={(e) => update('time', e.target.value)}
              className="w-full rounded-lg border border-accent/15 p-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {TIME_SLOTS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium text-accent/70">Nombre cliente</label>
          <input
            type="text"
            value={form.client_name}
            onChange={(e) => update('client_name', e.target.value)}
            placeholder="Nombre y apellido"
            className="w-full rounded-lg border border-accent/15 p-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium text-accent/70">Servicio</label>
          <div className="flex gap-2">
            {SERVICES.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => update('service_type', s.key)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  form.service_type === s.key
                    ? 'border-primary bg-primary text-white'
                    : 'border-accent/15 text-accent hover:border-primary/40'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-accent/70">Promoción</label>
            <select
              value={form.promo_type}
              onChange={(e) => update('promo_type', e.target.value)}
              className="w-full rounded-lg border border-accent/15 p-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {PROMO_OPTIONS.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-accent/70">Precio</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-accent/50">$</span>
              <input
                type="text"
                readOnly
                value={price !== null ? price.toFixed(2) : '—'}
                className="w-full rounded-lg border border-accent/15 bg-accent/5 py-2 pl-7 pr-3 font-medium text-accent"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-6">
          <label className="flex items-center gap-2 text-sm font-medium text-accent">
            <input
              type="checkbox"
              checked={form.paid}
              onChange={(e) => update('paid', e.target.checked)}
              className="h-4 w-4 rounded border-accent/30 text-primary focus:ring-primary/30"
            />
            Pagado
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-accent">
            <input
              type="checkbox"
              checked={form.completed}
              onChange={(e) => update('completed', e.target.checked)}
              className="h-4 w-4 rounded border-accent/30 text-primary focus:ring-primary/30"
            />
            Hecho
          </label>
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium text-accent/70">Notas</label>
          <textarea
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-accent/15 p-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="mt-6 flex items-center justify-between">
          {form.id ? (
            <button
              onClick={handleDelete}
              disabled={saving}
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-accent/15 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/5 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AppointmentsPage() {
  const { user } = useAuth()
  const { prices } = usePrices(user.id)
  const [selectedDate, setSelectedDate] = useState(todayISO())
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalForm, setModalForm] = useState(null)

  async function fetchAppointments() {
    setLoading(true)
    const { data, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .eq('date', selectedDate)

    if (fetchError) {
      setError(`No se pudieron cargar los turnos: ${fetchError.message}`)
    } else {
      setAppointments(data ?? [])
      setError(null)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAppointments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate])

  function findAppointment(time) {
    return appointments.find((a) => a.time === time)
  }

  function openNew(time) {
    setModalForm(emptyForm(selectedDate, time ?? TIME_SLOTS[0]))
  }

  function openEdit(appointment) {
    setModalForm({
      id: appointment.id,
      date: appointment.date,
      time: appointment.time,
      client_name: appointment.client_name ?? '',
      service_type: appointment.service_type,
      promo_type: appointment.promo_type,
      paid: !!appointment.paid,
      completed: !!appointment.completed,
      notes: appointment.notes ?? '',
    })
  }

  function closeModal() {
    setModalForm(null)
  }

  function handleSaved() {
    setModalForm(null)
    fetchAppointments()
  }

  function handleDeleted() {
    setModalForm(null)
    fetchAppointments()
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto max-w-6xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-primary">Agenda de Turnos</h1>
          <button
            onClick={() => openNew()}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4" />
            Nuevo Turno
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={() => setSelectedDate((d) => shiftDate(d, -1))}
            className="rounded-lg border border-accent/15 bg-white p-2 hover:bg-accent/5"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-lg border border-accent/15 bg-white p-2"
          />
          <button
            onClick={() => setSelectedDate((d) => shiftDate(d, 1))}
            className="rounded-lg border border-accent/15 bg-white p-2 hover:bg-accent/5"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => setSelectedDate(todayISO())}
            className="rounded-lg border border-accent/15 bg-white px-3 py-2 text-sm font-medium text-accent hover:bg-accent/5"
          >
            Hoy
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="mt-16 flex flex-col items-center justify-center gap-3 text-accent/60">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Cargando turnos...</p>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-xl border border-accent/10 bg-white shadow-sm">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-accent/10 text-xs uppercase tracking-wide text-accent/50">
                  <th className="p-3">Hora</th>
                  <th className="p-3">Nombre</th>
                  <th className="p-3">Servicio</th>
                  <th className="p-3">Promoción</th>
                  <th className="p-3">Precio</th>
                  <th className="p-3">Pagado</th>
                  <th className="p-3">Hecho</th>
                  <th className="p-3">Notas</th>
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((time) => {
                  const appointment = findAppointment(time)
                  return (
                    <tr
                      key={time}
                      onClick={() =>
                        appointment ? openEdit(appointment) : openNew(time)
                      }
                      className={`cursor-pointer border-b border-accent/5 last:border-0 hover:bg-primary/5 ${
                        appointment ? '' : 'text-accent/30'
                      }`}
                    >
                      <td className="p-3 font-medium text-accent">{time}</td>
                      {appointment ? (
                        <>
                          <td className="p-3">{appointment.client_name}</td>
                          <td className="p-3">{serviceLabel(appointment.service_type)}</td>
                          <td className="p-3">{promoLabel(appointment.promo_type)}</td>
                          <td className="p-3">${Number(appointment.price).toFixed(2)}</td>
                          <td className="p-3">
                            {appointment.paid ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="p-3">
                            {appointment.completed ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="max-w-[160px] truncate p-3">
                            {appointment.notes || '—'}
                          </td>
                        </>
                      ) : (
                        <td className="p-3 italic" colSpan={7}>
                          Disponible
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalForm && (
        <AppointmentModal
          initialForm={modalForm}
          prices={prices}
          userId={user.id}
          onClose={closeModal}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  )
}
