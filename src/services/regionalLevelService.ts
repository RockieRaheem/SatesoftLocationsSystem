import type { RegionalEconomicLevel } from '../../types.ts';
import { apiFetch } from './api.ts';

const baseUrl = '/api/regions';

export const regionalLevelService = {
  async getAll(): Promise<RegionalEconomicLevel[]> { return (await apiFetch(baseUrl)).json(); },
  async save(level: RegionalEconomicLevel): Promise<RegionalEconomicLevel> {
    return (await apiFetch(`${baseUrl}/${level.id}`, { method: 'PUT', body: JSON.stringify(level) })).json();
  },
  async remove(id: number): Promise<void> { await apiFetch(`${baseUrl}/${id}`, { method: 'DELETE' }); },
};
