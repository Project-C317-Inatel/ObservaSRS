import { z } from 'zod';

import { periodoSchema } from '../registros-indicadores/registro-indicador.schemas.js';

const paginacaoSchema = z.object({
  pagina: z.coerce.number().int().min(1).max(1000000).default(1),
  limite: z.coerce.number().int().min(1).max(100).default(20),
});

export const listarSetoresPublicosSchema = paginacaoSchema.strict();

export const listarIndicadoresPublicosSchema = paginacaoSchema
  .extend({ setorId: z.string().uuid().optional() })
  .strict();

export const listarRegistrosPublicosSchema = paginacaoSchema
  .extend({
    indicadorId: z.string().uuid().optional(),
    fonteId: z.string().uuid().optional(),
    setorId: z.string().uuid().optional(),
    periodoInicio: periodoSchema.optional(),
    periodoFim: periodoSchema.optional(),
  })
  .strict()
  .refine(
    ({ periodoInicio, periodoFim }) => !periodoInicio || !periodoFim || periodoInicio <= periodoFim,
    { path: ['periodoFim'], message: 'O periodo final deve ser igual ou posterior ao inicial.' },
  );

export const consultaPublicaIdSchema = z.object({ id: z.string().uuid() });

export type PaginacaoPublicaInput = z.infer<typeof paginacaoSchema>;
export type ListarIndicadoresPublicosInput = z.infer<typeof listarIndicadoresPublicosSchema>;
export type ListarRegistrosPublicosInput = z.infer<typeof listarRegistrosPublicosSchema>;
