import { z } from 'zod';

export const tipoRelatorioSchema = z.enum(['TRIMESTRAL', 'SETORIAL', 'ANUAL']);

export const cadastroRelatorioSchema = z
  .object({
    titulo: z.string().trim().min(2).max(180),
    descricao: z.string().trim().max(2000).optional(),
    tipo: tipoRelatorioSchema,
    periodoReferencia: z.string().trim().min(1).max(30),
  })
  .strict();

export const edicaoRelatorioSchema = cadastroRelatorioSchema
  .partial()
  .extend({ descricao: cadastroRelatorioSchema.shape.descricao.unwrap().nullable().optional() })
  .refine((dados) => Object.values(dados).some((valor) => valor !== undefined), {
    message: 'Informe ao menos um campo para atualizar.',
  });

export const listarRelatoriosSchema = z
  .object({
    tipo: tipoRelatorioSchema.optional(),
    periodoReferencia: z.string().trim().min(1).max(30).optional(),
    publicado: z
      .enum(['true', 'false'])
      .transform((valor) => valor === 'true')
      .optional(),
    pagina: z.coerce.number().int().min(1).max(1000000).default(1),
    limite: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();

export const listarRelatoriosPublicosSchema = listarRelatoriosSchema.omit({ publicado: true });
export const relatorioIdSchema = z.object({ id: z.string().uuid() });
export const publicacaoRelatorioSchema = z.object({ publicado: z.boolean() }).strict();

export type CadastroRelatorioInput = z.infer<typeof cadastroRelatorioSchema>;
export type EdicaoRelatorioInput = z.infer<typeof edicaoRelatorioSchema>;
export type ListarRelatoriosInput = z.infer<typeof listarRelatoriosSchema>;
export type ListarRelatoriosPublicosInput = z.infer<typeof listarRelatoriosPublicosSchema>;
