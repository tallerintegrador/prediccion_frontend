import { Navigate, Route, Routes } from 'react-router-dom'
import { MainLayout } from './components/layout/MainLayout'
import { Dashboard } from './pages/Dashboard'
import { Historico } from './pages/Historico'
import { Motor } from './pages/Motor'
import { Prediccion } from './pages/Prediccion'
import { Preliquidacion } from './pages/Preliquidacion'
import { Reconciliacion } from './pages/Reconciliacion'

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="historico" element={<Historico />} />
        <Route path="prediccion" element={<Prediccion />} />
        <Route path="preliquidacion" element={<Preliquidacion />} />
        <Route path="reconciliacion" element={<Reconciliacion />} />
        <Route path="motor" element={<Motor />} />
      </Route>
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  )
}
