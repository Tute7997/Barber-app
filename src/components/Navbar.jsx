import { NavLink } from 'react-router-dom'
import { Scissors } from 'lucide-react'

const LINKS = [
  { to: '/', label: 'Dashboard' },
  { to: '/agenda', label: 'Agenda de Turnos' },
  { to: '/precios', label: 'Precios' },
]

export default function Navbar() {
  return (
    <nav className="border-b border-accent/10 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-2">
          <Scissors className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold text-primary">LuxeSalon</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
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
      </div>
    </nav>
  )
}
