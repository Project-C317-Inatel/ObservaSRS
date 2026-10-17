import { z } from 'zod';

export const cadastroSetorSchema = z.object({
  nome: z.string().trim().min(2).max(100),
  descricao: z.string().trim().max(2000).optional(),
  ativo: z.boolean().default(true),
});

export const listarSetoresSchema = z.object({
  ativo: z
    .enum(['true', 'false'])
    .transform((valor) => valor === 'true')
    .optional(),
});

export const setorIdSchema = z.object({
  id: z.string().uuid(),
});

export type CadastroSetorInput = z.infer<typeof cadastroSetorSchema>;
export type ListarSetoresInput = z.infer<typeof listarSetoresSchema>;
