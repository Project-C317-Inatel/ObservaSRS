import { useState } from 'react';
import { Link, NavLink } from 'react-router';

import { COLETA_NAV, LOGIN_NAV, PUBLIC_NAV, type NavItem } from '../../routes';
import { Logo } from '../ui/Logo';

const baseLink =
  'rounded-lg px-3 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-purple';
const activeLink = 'bg-brand-gradient text-white shadow-sm';
const idleLink = 'text-slate-700 hover:bg-slate-100';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  function renderLink(item: NavItem, extraClass = '') {
    return (
      <NavLink
        key={item.path}
        to={item.path}
        onClick={closeMenu}
        className={({ isActive }) =>
          `${baseLink} ${isActive ? activeLink : idleLink} ${extraClass}`
        }
      >
        {item.label}
      </NavLink>
    );
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          to="/"
          onClick={closeMenu}
          className="flex items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-brand-purple"
        >
          <Logo />
          <span className="leading-tight">
            <span className="block font-bold text-slate-900">ObservaSRS</span>
            <span className="block text-xs text-slate-500">Cultura, lazer e turismo</span>
          </span>
        </Link>

        <nav aria-label="Navegação principal" className="hidden items-center gap-1 lg:flex">
          {PUBLIC_NAV.map((item) => renderLink(item))}
          <span className="mx-2 h-6 w-px bg-slate-200" aria-hidden="true" />
          {renderLink(COLETA_NAV)}
          <NavLink
            to={LOGIN_NAV.path}
            className={({ isActive }) =>
              `${baseLink} ml-2 border ${
                isActive
                  ? 'border-transparent bg-brand-gradient text-white'
                  : 'border-slate-300 text-slate-800 hover:bg-slate-50'
              }`
            }
          >
            {LOGIN_NAV.label}
          </NavLink>
        </nav>

        <button
          type="button"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 lg:hidden"
          aria-expanded={menuOpen}
          aria-controls="menu-mobile"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? 'Fechar' : 'Menu'}
        </button>
      </div>

      {menuOpen ? (
        <nav
          id="menu-mobile"
          aria-label="Navegação principal (mobile)"
          className="flex flex-col gap-1 border-t border-slate-200 px-4 py-3 lg:hidden"
        >
          {[...PUBLIC_NAV, COLETA_NAV, LOGIN_NAV].map((item) => renderLink(item, 'w-full'))}
        </nav>
      ) : null}
    </header>
  );
}