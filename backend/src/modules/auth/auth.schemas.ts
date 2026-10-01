import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .transform((email) => email.toLowerCase()),
  senha: z.string().min(1).max(128),
});

export const registroSchema = z.object({
  nome: z.string().trim().min(2).max(120),
  email: z
    .string()
    .trim()
    .email()
    .transform((email) => email.toLowerCase()),
  senha: z.string().min(8).max(128),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegistroInput = z.infer<typeof registroSchema>;
