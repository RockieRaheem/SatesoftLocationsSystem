import type { RegionalEconomicLevel } from '../../types.ts';
import { apiFetch } from './api.ts';
import { supabase } from '../supabase/browser.ts';

const baseUrl = '/api/regions';

const imageFromDataUrl = (dataUrl: string): { blob: Blob; mimeType: string } => {
  const match = dataUrl.match(/^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=\s]+)$/);
  if (!match) throw new Error('Use a PNG, JPEG, or WebP flag image.');
  const bytes = Uint8Array.from(atob(match[2].replace(/\s/g, '')), character => character.charCodeAt(0));
  return { blob: new Blob([bytes], { type: match[1] }), mimeType: match[1] };
};

export const regionalLevelService = {
  async getAll(): Promise<RegionalEconomicLevel[]> { return (await apiFetch(baseUrl)).json(); },
  async save(level: RegionalEconomicLevel): Promise<RegionalEconomicLevel> {
    let storedLevel = level;
    if (level.flag.startsWith('data:')) {
      if (!supabase) throw new Error('Supabase is not configured.');
      const { blob, mimeType } = imageFromDataUrl(level.flag);
      if (blob.size > 200 * 1024) throw new Error('Flag images must be 200KB or smaller.');
      const objectPath = `${level.id}/flag`;
      const { error } = await supabase.storage.from('region-flags').upload(objectPath, blob, {
        contentType: mimeType, cacheControl: '3600', upsert: true,
      });
      if (error) throw new Error(error.message);
      const { data } = supabase.storage.from('region-flags').getPublicUrl(objectPath);
      storedLevel = { ...level, flag: `${data.publicUrl}?v=${Date.now()}` };
    }
    return (await apiFetch(`${baseUrl}/${level.id}`, { method: 'PUT', body: JSON.stringify(storedLevel) })).json();
  },
  async remove(id: number): Promise<void> { await apiFetch(`${baseUrl}/${id}`, { method: 'DELETE' }); },
};
