import { Bell } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { formatLongDate } from '../../utils/formatters'

const titles: Record<string, { title: string; subtitle: string }> = {
  '/': {
    title: 'Dashboard general',
    subtitle: 'Vista general del proceso de importaciones',
  },
  '/historico': {
    title: 'Consulta historica',
    subtitle: 'Acceso autonomo al historial de costos',
  },
  '/prediccion': {
    title: 'Estimacion predictiva de costos',
    subtitle: 'Simulador del motor de aprendizaje automatico',
  },
  '/preliquidacion': {
    title: 'Pre-liquidacion estimada',
    subtitle: 'Documento generado automaticamente para Contabilidad',
  },
  '/reconciliacion': {
    title: 'Panel de reconciliacion',
    subtitle: 'Comparacion entre el costo predicho y el costo real',
  },
  '/motor': {
    title: 'Precision del motor predictivo',
    subtitle: 'Metricas de validacion del modelo de aprendizaje automatico',
  },
}

export function Topbar() {
  const location = useLocation()
  const current = titles[location.pathname] ?? titles['/']

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
      <div className="flex h-18 items-center justify-between gap-6 px-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-950">{current.title}</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">{current.subtitle}</p>
        </div>

        <div className="hidden items-center gap-5 xl:flex">
          <p className="text-sm capitalize text-slate-600">{formatLongDate()}</p>
          <button className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100" type="button">
            <Bell size={18} />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-rose-500" />
          </button>
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
              CM
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Camila Moreno</p>
              <p className="text-xs text-slate-500">Importaciones</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
