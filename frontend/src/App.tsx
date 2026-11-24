import { Navigate, Route, Routes } from 'react-router';

import { AdminLayout } from './components/layout/AdminLayout';
import { PublicLayout } from './components/layout/PublicLayout';
import { ProtectedRoute } from './components/routing/ProtectedRoute';
import { CadasturPage } from './features/cadastur/CadasturPage';
import { PitPage } from './features/pit/PitPage';
import { AccessRequestsPage } from './features/admin/AccessRequestsPage';
import { AdminHomePage } from './features/admin/AdminHomePage';
import { ColetaPage } from './pages/ColetaPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="indicadores" element={<HomePage />} />
        <Route path="relatorios" element={<HomePage />} />
        <Route path="inventario" element={<PitPage />} />
        <Route path="cadastur" element={<CadasturPage />} />
        <Route path="coleta" element={<ColetaPage />} />
        <Route path="login" element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']} />}>
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminHomePage />} />
          <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
            <Route path="solicitacoes" element={<AccessRequestsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
