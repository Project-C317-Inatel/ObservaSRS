import { z } from 'zod';

import { booleanoQuerySchema, paginacaoSchema } from '../../shared/http/paginacao.js';
import { periodoSchema } from '../registros-indicadores/registro-indicador.schemas.js';

const imagemUrlSchema = z
  .string()
  .trim()
  .max(2000)
  .url()
  .refine((url) => /^https?:\/\//i.test(url), 'Informe uma URL HTTP ou HTTPS.');

export const cadastroItemPitSchema = z
  .object({
    nome: z.string().trim().min(2).max(150),
    categoria: z.string().trim().min(2).max(80),
    descricao: z.string().trim().max(4000).optional(),
    imagemUrl: imagemUrlSchema.nullable().optional(),
    localizacao: z.string().trim().min(2).max(150),
    ativo: z.boolean().default(true),
    revisaoPrevistaEm: periodoSchema.optional(),
  })
  .strict();

export const edicaoItemPitSchema = cadastroItemPitSchema
  .partial()
  .extend({
    ativo: z.boolean().optional(),
    descricao: z.string().trim().max(4000).nullable().optional(),
  })
  .refine((dados) => Object.values(dados).some((valor) => valor !== undefined), {
    message: 'Informe ao menos um campo para atualizar.',
  });

export const revisaoItemPitSchema = z
  .object({ revisaoPrevistaEm: periodoSchema.optional() })
  .strict();
export const itemPitIdSchema = z.object({ id: z.string().uuid() });

export const listarItensPitPublicosSchema = paginacaoSchema
  .extend({
    categoria: z.string().trim().min(2).max(80).optional(),
    busca: z.string().trim().min(1).max(150).optional(),
  })
  .strict();

export const listarItensPitSchema = listarItensPitPublicosSchema.extend({
  ativo: booleanoQuerySchema.optional(),
  revisaoPendente: booleanoQuerySchema.optional(),
});

export type CadastroItemPitInput = z.infer<typeof cadastroItemPitSchema>;
export type EdicaoItemPitInput = z.infer<typeof edicaoItemPitSchema>;
export type ListarItensPitInput = z.infer<typeof listarItensPitSchema>;
export type ListarItensPitPublicosInput = z.infer<typeof listarItensPitPublicosSchema>;
