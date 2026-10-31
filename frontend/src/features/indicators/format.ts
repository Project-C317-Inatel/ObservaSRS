export function formatPeriod(period: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(period)) {
    return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', dateStyle: 'medium' }).format(
      new Date(`${period}T00:00:00Z`),
    );
  }
  const month = /^(\d{4})-(\d{1,2})$/.exec(period);
  if (!month) return period;
  return new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' })
    .format(new Date(Number(month[1]), Number(month[2]) - 1, 1))
    .replace('.', '');
}
