import { api } from './api';
import type { ColetaAutonomaRequest, ColetaAutonomaResponse } from '../types';

export function enviarColeta(data: ColetaAutonomaRequest): Promise<ColetaAutonomaResponse> {
  return api.post<ColetaAutonomaResponse>('/api/coletas', data);
}
