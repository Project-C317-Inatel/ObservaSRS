import { api } from './api';
import type { StatusResponse } from '../types';

export function getApiStatus(): Promise<StatusResponse> {
  return api.get<StatusResponse>('/status');
}
