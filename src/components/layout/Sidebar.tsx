import {
  BarChart3,
  Bolt,
  FileText,
  Home,
  Search,
  Shuffle,
  Zap,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { getMotorSummary } from '../../api/motor'
import { useFetchData } from '../../hooks/useFetchData'

const navigation = [
  { label: 'Dashboard', path: '/', icon: Home },
  { label: 'Consulta historica', path: '/historico', icon: Search },
  { label: 'Estimacion predictiva', path: '/prediccion', icon: Zap },
  { label: 'Pre-liquidacion', path: '/preliquidacion', icon: FileText },
  { label: 'Reconciliacion', path: '/reconciliacion', icon: Shuffle },
  { label: 'Precision del motor', path: '/motor', icon: BarChart3 },
]

export function Sidebar() {
  const { data } = useFetchData(getMotorSummary)

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-slate-200 bg-white lg:flex lg:flex-col">
      <div className="flex h-18 items-center gap-3 border-b border-slate-200 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-lg font-bold text-white">
          H
        </div>
        <div>
          <p className="text-sm font-bold text-slate-950">Sistema Predictivo de Costos</p>
          <p className="text-xs text-slate-500">Hortifrut Peru · Comercio Exterior</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6">
        <p className="mb-3 px-3 text-xs font-bold uppercase tracking-wide text-slate-400">Modulos</p>
        <div className="space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold transition ${
                  isActive ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="p-4">
        <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-indigo-700">
            <Bolt size={14} />
            Motor predictivo
          </div>
          <p className="text-sm text-slate-700">
            {data?.disponible ? 'Metricas de modelo disponibles' : 'Metricas no disponibles'}
          </p>
          <p className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-emerald-700">
            <span className={`h-2 w-2 rounded-full ${data?.disponible ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            {data?.disponible ? 'Modelo con metricas' : 'Sin archivo de metricas'}
          </p>
        </div>
      </div>
    </aside>
  )
}
