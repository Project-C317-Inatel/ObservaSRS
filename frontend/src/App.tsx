import { Button } from './components/ui/Button';
import { LoginForm } from './components/forms/LoginForm';

export default function App() {
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
        <LoginForm />
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Button className="w-full sm:w-auto">Primário</Button>
          <Button className="w-full sm:w-auto" variant="secondary">
            Secundário
          </Button>
          <Button className="w-full sm:w-auto" variant="ghost">
            Ghost
          </Button>
        </div>
      </section>
    </main>
  );
}
