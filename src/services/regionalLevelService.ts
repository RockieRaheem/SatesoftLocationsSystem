import type { RegionalEconomicLevel } from '../../types.ts';
import { apiFetch } from './api.ts';
import { supabase } from '../supabase/browser.ts';

const baseUrl = '/api/regions';

export const regionalLevelService = {
  async getAll(): Promise<RegionalEconomicLevel[]> { return (await apiFetch(baseUrl)).json(); },
  async save(level: RegionalEconomicLevel): Promise<RegionalEconomicLevel> {
    let storedLevel = level;
    if (level.flag.startsWith('data:')) {
      if (!supabase) throw new Error('Supabase is not configured.');
      const match = level.flag.match(/^data:(image\/(?:png|jpeg|webp));base64,/);
      if (!match) throw new Error('Use a PNG, JPEG, or WebP flag image.');
      const file = await fetch(level.flag).then(response => response.blob());
      if (file.size > 200 * 1024) throw new Error('Flag images must be 200KB or smaller.');
      const objectPath = `${level.id}/flag`;
      const { error } = await supabase.storage.from('region-flags').upload(objectPath, file, {
        contentType: match[1], cacheControl: '3600', upsert: true,
      });
      if (error) throw new Error(error.message);
      const { data } = supabase.storage.from('region-flags').getPublicUrl(objectPath);
      storedLevel = { ...level, flag: `${data.publicUrl}?v=${Date.now()}` };
    }
    return (await apiFetch(`${baseUrl}/${level.id}`, { method: 'PUT', body: JSON.stringify(storedLevel) })).json();
  },
  async remove(id: number): Promise<void> { await apiFetch(`${baseUrl}/${id}`, { method: 'DELETE' }); },
};
