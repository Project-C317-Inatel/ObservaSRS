import { useNavigate } from 'react-router';

import { LoginForm } from '../components/forms/LoginForm';

export function LoginPage() {
  const navigate = useNavigate();

  return (
    <section
      aria-label="Login da SMCELT"
      className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-4 py-12 sm:px-6"
    >
      <LoginForm title="Área restrita SMCELT" onSuccess={() => navigate('/admin')} />
    </section>
  );
}