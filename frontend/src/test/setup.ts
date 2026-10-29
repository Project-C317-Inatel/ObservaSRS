import '@testing-library/jest-dom/vitest';

// O jsdom não tem ResizeObserver, que o ResponsiveContainer do Recharts usa.
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver ??= ResizeObserverMock as unknown as typeof ResizeObserver;
// O jsdom não implementa scrollTo, usado pelo PublicLayout ao trocar de rota.
window.scrollTo = () => {};
