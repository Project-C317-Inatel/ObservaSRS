import { Navigate, Route, Routes, useNavigate } from 'react-router';

import { PublicLayout } from './components/layout/PublicLayout';
import { ProtectedRoute } from './components/routing/ProtectedRoute';
import { CadasturPage } from './features/cadastur/CadasturPage';
import { PitPage } from './features/pit/PitPage';
import { AdminPage } from './features/admin/AdminPage';
import { ColetaPage } from './pages/ColetaPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';

function AdminRoute() {
  const navigate = useNavigate();

  return (
    <AdminPage onLogout={() => navigate('/login')} onUnauthenticated={() => navigate('/login')} />
  );
}

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

      <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
        <Route path="admin" element={<AdminRoute />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
