export function formatPeriod(period: string) {
  const month = /^(\d{4})-(\d{1,2})$/.exec(period);
  if (!month) return period;
  return new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' })
    .format(new Date(Number(month[1]), Number(month[2]) - 1, 1))
    .replace('.', '');
}
