import { z } from 'zod';

export const listarSolicitacoesSchema = z.object({
  status: z.enum(['PENDENTE', 'APROVADO', 'REJEITADO']).default('PENDENTE'),
});

export const solicitacaoIdSchema = z.object({
  id: z.string().uuid(),
});

export type StatusSolicitacao = z.infer<typeof listarSolicitacoesSchema>['status'];
