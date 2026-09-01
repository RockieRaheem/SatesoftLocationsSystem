import { readFileSync } from 'node:fs';
import path from 'node:path';

describe('Uganda district map asset', () => {
  const map = JSON.parse(readFileSync(path.resolve('public/data/uganda-districts.geojson'), 'utf8')) as {
    type: string;
    features: Array<{ properties: { admin2name_en: string }; geometry: { type: string; coordinates: unknown[] } }>;
  };

  it('contains the complete unique UBOS 2020 district boundary layer', () => {
    const names = map.features.map(feature => feature.properties.admin2name_en);
    expect(map.type).toBe('FeatureCollection');
    expect(map.features).toHaveLength(135);
    expect(new Set(names).size).toBe(135);
    expect(names).toEqual(expect.arrayContaining(['Abim', 'Kampala', 'Wakiso']));
  });

  it('contains renderable polygon geometry for every district', () => {
    expect(map.features.every(feature =>
      ['Polygon', 'MultiPolygon'].includes(feature.geometry.type) && feature.geometry.coordinates.length > 0,
    )).toBe(true);
  });
});
