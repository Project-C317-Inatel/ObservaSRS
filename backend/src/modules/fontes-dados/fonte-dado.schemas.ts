import { z } from 'zod';

export const cadastroFonteDadoSchema = z.object({
  nome: z.string().trim().min(2).max(150),
  descricao: z.string().trim().max(2000).optional(),
  tipo: z.string().trim().min(1).max(50),
  referencia: z.string().trim().max(2000).optional(),
});

export const listarFontesDadosSchema = z.object({
  tipo: z.string().trim().min(1).max(50).optional(),
});

export const fonteDadoIdSchema = z.object({
  id: z.string().uuid(),
});

export type CadastroFonteDadoInput = z.infer<typeof cadastroFonteDadoSchema>;
export type ListarFontesDadosInput = z.infer<typeof listarFontesDadosSchema>;
