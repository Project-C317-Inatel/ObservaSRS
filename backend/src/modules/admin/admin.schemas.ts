import { z } from 'zod';

export const listarSolicitacoesSchema = z.object({
  status: z.enum(['PENDENTE', 'APROVADO', 'REJEITADO']).default('PENDENTE'),
  ativo: z
    .enum(['true', 'false'])
    .transform((valor) => valor === 'true')
    .optional(),
});

export const solicitacaoIdSchema = z.object({
  id: z.string().uuid(),
});

export const contaIdSchema = z.object({ id: z.string().uuid() });
export const alteracaoAcessoSchema = z.object({}).strict();

export type StatusSolicitacao = z.infer<typeof listarSolicitacoesSchema>['status'];
