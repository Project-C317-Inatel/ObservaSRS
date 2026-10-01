import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';

import { login, logout, me, registro } from './auth.controller.js';
import { exigirAutenticacao } from './auth.middleware.js';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'too_many_login_attempts',
    message: 'Muitas tentativas de login. Tente novamente mais tarde.',
  },
});

const registroLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'too_many_registration_attempts',
    message: 'Muitas tentativas de cadastro. Tente novamente mais tarde.',
  },
});

export const authRoutes = Router();

authRoutes.post('/auth/registro', registroLimiter, registro);
authRoutes.post('/auth/login', loginLimiter, login);
authRoutes.get('/auth/me', exigirAutenticacao, me);
authRoutes.post('/auth/logout', logout);
