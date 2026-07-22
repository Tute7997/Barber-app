import { NavLink, useNavigate } from 'react-router-dom'
import { Scissors, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/agenda', label: 'Agenda de Turnos' },
  { to: '/precios', label: 'Precios' },
]

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  return (
    <nav className="border-b border-accent/10 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-2">
          <Scissors className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold text-primary">LuxeSalon</span>
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
            className="flex items-center gap-1.5 rounded-lg border border-accent/15 px-3 py-2 text-sm font-medium text-accent hover:bg-accent/5"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </nav>
  )
}
