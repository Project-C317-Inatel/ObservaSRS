import type { LoginRequest } from './api';

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export type LoginField = keyof LoginRequest;

export type LoginErrors = Partial<Record<LoginField, string>>;
