import { z } from 'zod';

export const paginacaoSchema = z.object({
  pagina: z.coerce.number().int().min(1).max(1000000).default(1),
  limite: z.coerce.number().int().min(1).max(100).default(20),
});

export const booleanoQuerySchema = z.enum(['true', 'false']).transform((valor) => valor === 'true');

export function apresentarPaginacao(pagina: number, limite: number, total: number) {
  return { pagina, limite, total, totalPaginas: Math.ceil(total / limite) };
}
