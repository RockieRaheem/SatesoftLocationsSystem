import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { UgandaElectoralRegistry } from './ugandaElectoralRegistry.ts';

const fixture = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__', 'uganda-electoral-small.json');

describe('UgandaElectoralRegistry', () => {
  const registry = new UgandaElectoralRegistry(fixture);

  it('deduplicates overlaps while preserving same-name villages in different locations', () => {
    const result = registry.getVillages({}, 1, 20);
    expect(result.pagination.totalItems).toBe(5);
    expect(new Set(result.data.map(record => record.id)).size).toBe(5);
    expect(result.data.filter(record => record.village === 'SAME')).toHaveLength(2);
    expect(result.data.find(record => record.village === 'SAME' && record.subcounty === 'SUBCOUNTY ONE')?.sources)
      .toEqual(['bySubcounty', 'byVillage']);
    expect(result.data.find(record => record.village === 'NEW - PLACE')?.id)
      .not.toBe(result.data.find(record => record.village === 'NEW PLACE')?.id);
  });

  it('flags records whose constituency cannot be inferred', () => {
    const orphan = registry.getVillages({ search: 'ORPHAN' }, 1, 20).data[0];
    expect(orphan.constituency).toBe('UNASSIGNED / NEEDS VERIFICATION');
    expect(orphan.needsVerification).toBe(true);
  });

  it('filters hierarchy options and applies bounded pagination', () => {
    expect(registry.getOptions('constituency', { district: 'alpha' }).map(option => option.name)).toEqual([
      'CONSTITUENCY ONE', 'CONSTITUENCY TWO', 'UNASSIGNED / NEEDS VERIFICATION',
    ]);
    expect(registry.getVillages({ district: 'alpha' }, 2, 2).data).toHaveLength(2);
  });
});
