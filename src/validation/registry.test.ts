import { countryInputSchema, regionalLevelInputSchema } from './registry.ts';

describe('registry write validation', () => {
  it('normalizes country codes and rejects unknown properties', () => {
    const valid = countryInputSchema.parse({
      name: 'Uganda', continent: 'Africa', economicZones: ['Eastern Africa'], currency: 'Ugandan Shilling',
      currencySymbol: 'USh', currencyCode: 'ugx', countryCode: 'ug', phoneCode: '+256', vat: 18, adminLevels: [],
    });
    expect(valid.countryCode).toBe('UG');
    expect(countryInputSchema.safeParse({ ...valid, unauthorized: true }).success).toBe(false);
  });

  it('bounds regional image payloads and validates display colors', () => {
    const base = { name: 'East African Community', abbreviation: 'EAC', flag: '', description: '', countries: ['Uganda'] };
    expect(regionalLevelInputSchema.safeParse({ ...base, color: '#10b981' }).success).toBe(true);
    expect(regionalLevelInputSchema.safeParse({ ...base, color: 'green' }).success).toBe(false);
  });
});
