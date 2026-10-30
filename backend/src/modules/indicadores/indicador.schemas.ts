import { z } from 'zod';

export const cadastroIndicadorSchema = z.object({
  nome: z.string().trim().min(2).max(140),
  unidade: z.string().trim().min(1).max(40),
  descricao: z.string().trim().max(2000).optional(),
  setorId: z.string().uuid(),
  ativo: z.boolean().default(true),
});

export const edicaoIndicadorSchema = cadastroIndicadorSchema
  .partial()
  .extend({
    descricao: cadastroIndicadorSchema.shape.descricao.unwrap().nullable().optional(),
    ativo: z.boolean().optional(),
  })
  .strict()
  .refine((dados) => Object.values(dados).some((valor) => valor !== undefined), {
    message: 'Informe ao menos um campo para atualizar.',
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
export type EdicaoIndicadorInput = z.infer<typeof edicaoIndicadorSchema>;
export type ListarIndicadoresInput = z.infer<typeof listarIndicadoresSchema>;
