import type { ColetaAutonomaRequest, LoginRequest } from './api';

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export type LoginField = keyof LoginRequest;

export type LoginErrors = Partial<Record<LoginField, string>>;

export type ColetaAutonomaField = keyof ColetaAutonomaRequest;

export type ColetaAutonomaErrors = Partial<Record<ColetaAutonomaField, string>>;
