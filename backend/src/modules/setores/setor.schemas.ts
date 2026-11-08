import { z } from 'zod';

export const cadastroSetorSchema = z.object({
  nome: z.string().trim().min(2).max(100),
  descricao: z.string().trim().max(2000).optional(),
  ativo: z.boolean().default(true),
});

export const edicaoSetorSchema = cadastroSetorSchema
  .partial()
  .extend({
    descricao: cadastroSetorSchema.shape.descricao.unwrap().nullable().optional(),
    ativo: z.boolean().optional(),
  })
  .strict()
  .refine((dados) => Object.values(dados).some((valor) => valor !== undefined), {
    message: 'Informe ao menos um campo para atualizar.',
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
export type EdicaoSetorInput = z.infer<typeof edicaoSetorSchema>;
export type ListarSetoresInput = z.infer<typeof listarSetoresSchema>;
