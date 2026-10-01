import { Button } from './components/ui/Button';

export default function App() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="bg-brand-gradient px-6 py-16 text-white">
        <h1 className="text-3xl font-bold">ObservaSRS</h1>
        <p className="mt-2 max-w-xl">Observatório do Turismo de Santa Rita do Sapucaí</p>
      </header>
      <section className="flex flex-wrap gap-3 p-6">
        <Button>Primário</Button>
        <Button variant="secondary">Secundário</Button>
        <Button variant="ghost">Ghost</Button>
      </section>
    </main>
  );
}
