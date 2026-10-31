import { z } from 'zod';

export const periodoSchema = z.iso
  .date()
  .refine((data) => !data.startsWith('0000'), 'O ano deve ser maior que zero.')
  .transform((data) => new Date(`${data}T00:00:00.000Z`));

const valorSchema = z
  .union([z.string().trim(), z.number().finite()])
  .transform((valor) => String(valor))
  .pipe(
    z.string().regex(/^-?\d{1,12}(\.\d{1,2})?$/, {
      message: 'Informe um valor com ate 12 digitos inteiros e 2 casas decimais, usando ponto.',
    }),
  );

export const cadastroRegistroIndicadorSchema = z.object({
  indicadorId: z.string().uuid(),
  fonteId: z.string().uuid(),
  periodo: periodoSchema,
  valor: valorSchema,
  publicado: z.boolean().default(false),
  observacao: z.string().trim().max(2000).optional(),
});

export const edicaoRegistroIndicadorSchema = cadastroRegistroIndicadorSchema
  .omit({ publicado: true })
  .partial()
  .extend({
    observacao: cadastroRegistroIndicadorSchema.shape.observacao.unwrap().nullable().optional(),
  })
  .strict()
  .refine((dados) => Object.values(dados).some((valor) => valor !== undefined), {
    message: 'Informe ao menos um campo para atualizar.',
  });

export const publicacaoRegistroIndicadorSchema = z.object({ publicado: z.boolean() }).strict();

export const listarRegistrosIndicadoresSchema = z
  .object({
    indicadorId: z.string().uuid().optional(),
    fonteId: z.string().uuid().optional(),
    setorId: z.string().uuid().optional(),
    publicado: z
      .enum(['true', 'false'])
      .transform((valor) => valor === 'true')
      .optional(),
    periodoInicio: periodoSchema.optional(),
    periodoFim: periodoSchema.optional(),
  })
  .refine(
    ({ periodoInicio, periodoFim }) => !periodoInicio || !periodoFim || periodoInicio <= periodoFim,
    { path: ['periodoFim'], message: 'O periodo final deve ser igual ou posterior ao inicial.' },
  );

export const registroIndicadorIdSchema = z.object({
  id: z.string().uuid(),
});

export type CadastroRegistroIndicadorInput = z.infer<typeof cadastroRegistroIndicadorSchema>;
export type EdicaoRegistroIndicadorInput = z.infer<typeof edicaoRegistroIndicadorSchema>;
export type PublicacaoRegistroIndicadorInput = z.infer<typeof publicacaoRegistroIndicadorSchema>;
export type ListarRegistrosIndicadoresInput = z.infer<typeof listarRegistrosIndicadoresSchema>;
