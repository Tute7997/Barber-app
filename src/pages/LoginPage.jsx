import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Scissors, AlertCircle, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function translateError(message) {
  if (message.includes('Invalid login credentials')) {
    return 'Email o contraseña incorrectos.'
  }
  return message
}

export default function LoginPage() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  if (!authLoading && user) {
    return <Navigate to="/dashboard" replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (!EMAIL_REGEX.test(email)) {
      setError('Ingresá un email válido.')
      return
    }
    if (!password) {
      setError('Ingresá tu contraseña.')
      return
    }

    setSubmitting(true)
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    setSubmitting(false)

    if (signInError) {
      setError(translateError(signInError.message))
      return
    }

    navigate('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <div className="w-full max-w-md rounded-xl border border-primary/20 bg-card p-8 shadow-sm">
        <div className="flex flex-col items-center gap-2">
          <Scissors className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-primary">LuxeSalon</h1>
          <p className="text-sm text-accent/60">Iniciá sesión para continuar</p>
        </div>

        {error && (
          <div className="mt-6 flex items-start gap-2 rounded-lg border border-red-900/60 bg-red-950/40 p-3 text-sm text-red-400">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-accent/70">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vos@ejemplo.com"
              className="w-full rounded-lg border border-primary/30 bg-input p-2.5 text-accent placeholder:text-accent/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-accent/70">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-primary/30 bg-input p-2.5 text-accent placeholder:text-accent/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-black hover:bg-primary-dark disabled:opacity-50"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Iniciar sesión
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-accent/60">
          ¿No tenés cuenta?{' '}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Registrate aquí
          </Link>
        </p>
      </div>
    </div>
  )
}
