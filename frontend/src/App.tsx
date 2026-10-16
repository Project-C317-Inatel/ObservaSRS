import { Navigate, Route, Routes } from 'react-router';

import { PublicLayout } from './components/layout/PublicLayout';
import { CadasturPage } from './features/cadastur/CadasturPage';
import { PitPage } from './features/pit/PitPage';
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

      {/*
        Área restrita (entra quando o AdminPage for mergeado):
        <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']} />}>
          <Route path="admin" element={<AdminPage />} />
        </Route>
      */}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}