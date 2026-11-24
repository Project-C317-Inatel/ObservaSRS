/**
 * Página inicial do painel. Por enquanto só dá as boas-vindas; os cards com os
 * números (coletas pendentes etc.) entram quando as telas de gestão ficarem prontas.
 */
export function AdminHomePage() {
  return (
    <section aria-labelledby="admin-inicio-titulo">
      <h2 id="admin-inicio-titulo" className="text-xl font-semibold">
        Início
      </h2>
      <p className="mt-2 max-w-2xl text-slate-600">
        Aqui a equipe da SMCELT gerencia os dados do Observatório. Use o menu acima para acessar
        cada área.
      </p>
    </section>
  );
}
