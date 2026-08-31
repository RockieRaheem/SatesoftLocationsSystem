import type { Country, RegionalEconomicLevel } from '../../types.ts';
import type { Database, Json } from './database.types.ts';

type CountryRow = Database['public']['Tables']['countries']['Row'];
type CountryInsert = Database['public']['Tables']['countries']['Insert'];
type RegionRow = Database['public']['Tables']['regional_economic_levels']['Row'];
const json = (value: unknown): Json => value as Json;

export function countryFromRow(row: CountryRow): Country {
  return {
    id: row.id, name: row.name, continent: row.continent, economicZones: row.economic_zones,
    currency: row.currency, currencySymbol: row.currency_symbol, currencyCode: row.currency_code,
    countryCode: row.country_code, phoneCode: row.phone_code, vat: Number(row.vat),
    numberOfAdminLevels: row.number_of_admin_levels ?? undefined,
    numberOfElectoralLevels: row.number_of_electoral_levels ?? undefined,
    numberOfEconomicLevels: row.number_of_economic_levels ?? undefined,
    adminLevels: row.admin_levels as unknown as Country['adminLevels'],
    adminLevelNames: row.admin_level_names as unknown as Country['adminLevelNames'],
    electoralLevelNames: row.electoral_level_names as unknown as Country['electoralLevelNames'],
    currencyDenominators: row.currency_denominators as unknown as Country['currencyDenominators'],
    loyaltyProgram: row.loyalty_program as unknown as Country['loyaltyProgram'],
    roundingConfig: row.rounding_config as unknown as Country['roundingConfig'],
    smsLocalRate: row.sms_local_rate == null ? undefined : Number(row.sms_local_rate),
    decimalPlaces: row.decimal_places ?? undefined, createdBy: row.created_by ?? undefined,
    updatedBy: row.updated_by ?? undefined, updatedAt: row.updated_at,
  };
}

export function countryToRow(country: Omit<Country, 'id'> | Country): CountryInsert {
  return {
    name: country.name.trim(), country_code: country.countryCode.trim().toUpperCase(),
    continent: country.continent.trim(), economic_zones: country.economicZones,
    currency: country.currency.trim(), currency_symbol: country.currencySymbol.trim(),
    currency_code: country.currencyCode.trim().toUpperCase(), phone_code: country.phoneCode.trim(), vat: country.vat,
    number_of_admin_levels: country.numberOfAdminLevels ?? null,
    number_of_electoral_levels: country.numberOfElectoralLevels ?? null,
    number_of_economic_levels: country.numberOfEconomicLevels ?? null,
    admin_levels: json(country.adminLevels), admin_level_names: json(country.adminLevelNames ?? []),
    electoral_level_names: json(country.electoralLevelNames ?? []), currency_denominators: json(country.currencyDenominators ?? []),
    loyalty_program: country.loyaltyProgram ? json(country.loyaltyProgram) : null,
    rounding_config: country.roundingConfig ? json(country.roundingConfig) : null,
    sms_local_rate: country.smsLocalRate ?? null, decimal_places: country.decimalPlaces ?? null,
    created_by: country.createdBy ?? null, updated_by: country.updatedBy ?? null,
  };
}

export const regionFromRow = (row: RegionRow): RegionalEconomicLevel => ({
  id: row.id, name: row.name, abbreviation: row.abbreviation, flag: row.flag,
  description: row.description, countries: row.countries, color: row.color,
});

export const regionToRow = (region: RegionalEconomicLevel): Database['public']['Tables']['regional_economic_levels']['Insert'] => ({
  id: region.id, name: region.name.trim(), abbreviation: region.abbreviation.trim().toUpperCase(),
  flag: region.flag.trim(), description: region.description.trim(), countries: region.countries, color: region.color,
});
