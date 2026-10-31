import { z } from 'zod';

import { booleanoQuerySchema, paginacaoSchema } from '../../shared/http/paginacao.js';

// Campo compartilhado: normaliza a mascara, sem presumir um formato federal unico.
export const cnpjCadasturSchema = z
  .string()
  .trim()
  .min(1)
  .max(60)
  .transform((valor) => valor.replace(/[./\s-]/g, '').toUpperCase())
  .pipe(
    z
      .string()
      .regex(
        /^[A-Z0-9]{3,30}$/,
        'Informe um CNPJ ou Cadastur com 3 a 30 letras ou digitos, desconsiderando a mascara.',
      ),
  );

export const mesReferenciaSchema = z
  .string()
  .regex(/^(?!0000)\d{4}-(0[1-9]|1[0-2])$/, 'Use AAAA-MM com um mes valido.');
export const statusColetaSchema = z.enum(['PENDENTE', 'APROVADO', 'REJEITADO']);
export const coletaIdSchema = z.object({ id: z.string().uuid() });
export const acaoColetaSchema = z.object({}).strict();
export const publicacaoColetaSchema = z.object({ publicado: z.boolean() }).strict();

export const cadastroEstabelecimentoSchema = z
  .object({
    nome: z.string().trim().min(3).max(150),
    cnpjCadastur: cnpjCadasturSchema,
    tipo: z.string().trim().min(2).max(80),
    ativo: z.boolean().default(true),
  })
  .strict();

export const edicaoEstabelecimentoSchema = cadastroEstabelecimentoSchema
  .partial()
  .extend({
    ativo: z.boolean().optional(),
  })
  .refine((dados) => Object.values(dados).some((valor) => valor !== undefined), {
    message: 'Informe ao menos um campo para atualizar.',
  });

export const listarEstabelecimentosSchema = paginacaoSchema
  .extend({
    ativo: booleanoQuerySchema.optional(),
    tipo: z.string().trim().min(2).max(80).optional(),
    busca: z.string().trim().min(1).max(150).optional(),
  })
  .strict();

export const envioColetaSchema = z
  .object({
    nomeEstabelecimento: z.string().trim().min(3).max(150),
    cnpjCadastur: cnpjCadasturSchema,
    periodoReferencia: mesReferenciaSchema,
    leitosOcupados: z.number().int().min(0).max(2147483647),
    origemVisitantes: z.string().trim().max(120).default(''),
  })
  .strict();

export const edicaoColetaSchema = envioColetaSchema
  .pick({ leitosOcupados: true, origemVisitantes: true })
  .partial()
  .extend({
    origemVisitantes: z.string().trim().max(120).optional(),
  })
  .refine((dados) => Object.values(dados).some((valor) => valor !== undefined), {
    message: 'Informe ao menos um campo para atualizar.',
  });

export const listarColetasSchema = paginacaoSchema
  .extend({
    estabelecimentoId: z.string().uuid().optional(),
    status: statusColetaSchema.optional(),
    periodoReferencia: mesReferenciaSchema.optional(),
    publicado: booleanoQuerySchema.optional(),
  })
  .strict();

export const resumoColetasSchema = z.object({ periodoReferencia: mesReferenciaSchema }).strict();

export type CadastroEstabelecimentoInput = z.infer<typeof cadastroEstabelecimentoSchema>;
export type EdicaoEstabelecimentoInput = z.infer<typeof edicaoEstabelecimentoSchema>;
export type ListarEstabelecimentosInput = z.infer<typeof listarEstabelecimentosSchema>;
export type EnvioColetaInput = z.infer<typeof envioColetaSchema>;
export type EdicaoColetaInput = z.infer<typeof edicaoColetaSchema>;
export type ListarColetasInput = z.infer<typeof listarColetasSchema>;
