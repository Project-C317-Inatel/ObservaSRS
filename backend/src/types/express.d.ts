import type { SessionPayload } from '../modules/auth/auth.token.js';

declare global {
  namespace Express {
    interface Request {
      auth?: SessionPayload;
    }
  }
}

export {};
