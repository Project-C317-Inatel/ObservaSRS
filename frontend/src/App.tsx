import { useEffect, useState } from 'react';

import { ColetaAutonomaForm } from './components/forms/ColetaAutonomaForm';
import { LoginForm } from './components/forms/LoginForm';
import { AdminPage } from './features/admin/AdminPage';
import { IndicatorsPage } from './features/indicators/IndicatorsPage';

export default function App() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  function navigate(nextPath: string) {
    window.history.pushState({}, '', nextPath);
    setPath(nextPath);
  }

  if (path === '/admin') {
    return <AdminPage onLogout={() => navigate('/')} />;
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="bg-brand-gradient px-4 py-10 text-white sm:px-6 sm:py-16">
        <div className="mx-auto w-full max-w-7xl">
          <h1 className="text-2xl font-bold sm:text-3xl">ObservaSRS</h1>
          <p className="mt-2 max-w-xl text-sm sm:text-base">
            Observatório do Turismo de Santa Rita do Sapucaí
          </p>
        </div>
      </header>
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:flex-row lg:items-start">
        <ColetaAutonomaForm />
        <LoginForm onSuccess={() => navigate('/admin')} />
      </section>
      <IndicatorsPage />
    </main>
  );
}
