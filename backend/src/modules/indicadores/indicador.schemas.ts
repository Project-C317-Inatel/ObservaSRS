import { z } from 'zod';

export const cadastroIndicadorSchema = z.object({
  nome: z.string().trim().min(2).max(140),
  unidade: z.string().trim().min(1).max(40),
  descricao: z.string().trim().max(2000).optional(),
  setorId: z.string().uuid(),
  ativo: z.boolean().default(true),
});

export const listarIndicadoresSchema = z.object({
  setorId: z.string().uuid().optional(),
  ativo: z
    .enum(['true', 'false'])
    .transform((valor) => valor === 'true')
    .optional(),
});

export const indicadorIdSchema = z.object({
  id: z.string().uuid(),
});

export type CadastroIndicadorInput = z.infer<typeof cadastroIndicadorSchema>;
export type ListarIndicadoresInput = z.infer<typeof listarIndicadoresSchema>;
