import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';

import { HOME_SECTION_BY_PATH } from '../../routes';
import { Footer } from './Footer';
import { Header } from './Header';

/** Moldura das páginas públicas: cabeçalho, conteúdo da rota atual e rodapé. */
export function PublicLayout() {
  const { pathname } = useLocation();

  // Ao trocar de página: rola até a seção (Indicadores/Relatórios) ou volta ao topo.
  useEffect(() => {
    const sectionId = HOME_SECTION_BY_PATH[pathname];
    const target = sectionId ? document.getElementById(sectionId) : null;

    if (target && typeof target.scrollIntoView === 'function') {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo?.({ top: 0 });
    }
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
