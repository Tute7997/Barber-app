import { NavLink, useNavigate } from 'react-router-dom'
import { Scissors, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useBarberSettings } from '../hooks/useBarberSettings'

const LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/agenda', label: 'Agenda de Turnos' },
  { to: '/precios', label: 'Precios' },
  { to: '/settings', label: 'Personalización' },
]

export default function Navbar() {
  const { user, signOut } = useAuth()
  const { settings } = useBarberSettings(user?.id)
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  return (
    <nav className="border-b border-primary/20 bg-card">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-2">
          {settings?.logo_url ? (
            <img
              src={settings.logo_url}
              alt="Logo"
              className="h-7 w-7 rounded object-cover"
            />
          ) : (
            <Scissors className="h-6 w-6 text-primary" />
          )}
          <span className="text-lg font-bold text-primary">
            {settings?.barber_name || 'LuxeSalon'}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-accent/70 hover:text-primary'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {user && <span className="text-sm text-accent/60">Hola, {user.email}</span>}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg border border-primary/20 px-3 py-2 text-sm font-medium text-accent hover:bg-primary/10"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </nav>
  )
}
