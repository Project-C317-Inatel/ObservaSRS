import { z } from 'zod';

export const cadastroFonteDadoSchema = z.object({
  nome: z.string().trim().min(2).max(150),
  descricao: z.string().trim().max(2000).optional(),
  tipo: z.string().trim().min(1).max(50),
  referencia: z.string().trim().max(2000).optional(),
});

export const edicaoFonteDadoSchema = cadastroFonteDadoSchema
  .partial()
  .extend({
    descricao: cadastroFonteDadoSchema.shape.descricao.unwrap().nullable().optional(),
    referencia: cadastroFonteDadoSchema.shape.referencia.unwrap().nullable().optional(),
  })
  .strict()
  .refine((dados) => Object.values(dados).some((valor) => valor !== undefined), {
    message: 'Informe ao menos um campo para atualizar.',
  });

export const listarFontesDadosSchema = z.object({
  tipo: z.string().trim().min(1).max(50).optional(),
});

export const fonteDadoIdSchema = z.object({
  id: z.string().uuid(),
});

export type CadastroFonteDadoInput = z.infer<typeof cadastroFonteDadoSchema>;
export type EdicaoFonteDadoInput = z.infer<typeof edicaoFonteDadoSchema>;
export type ListarFontesDadosInput = z.infer<typeof listarFontesDadosSchema>;
