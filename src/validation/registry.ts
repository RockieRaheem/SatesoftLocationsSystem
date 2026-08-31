import { z } from 'zod';

const shortText = z.string().trim().min(1).max(160);
const levelName = z.object({ level: z.number().int().min(1).max(20), name: shortText }).strict();
const adminLevel = z.object({
  id: z.number().int().positive(), name: shortText, level: z.number().int().min(1).max(20),
  countryCode: z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/), parentAdminLevelId: z.number().int().positive().optional(),
}).strict();
const denominator = z.object({
  id: z.number().int().positive(), value: z.number().nonnegative(), label: shortText,
  type: z.enum(['Note', 'Coin']), status: z.enum(['Active', 'Inactive']),
}).strict();
const roundingRule = z.object({ considerFigures: z.number().int().nonnegative(), roundTo: z.number().positive() }).strict();

export const countryInputSchema = z.object({
  id: z.number().int().positive().optional(), name: shortText, continent: shortText,
  economicZones: z.array(shortText).max(30), currency: shortText, currencySymbol: z.string().trim().min(1).max(12),
  currencyCode: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/), countryCode: z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/),
  phoneCode: z.string().trim().regex(/^\+[1-9]\d{0,3}$/), vat: z.number().min(0).max(100),
  numberOfAdminLevels: z.number().int().min(0).max(20).optional(),
  numberOfElectoralLevels: z.number().int().min(0).max(20).optional(),
  numberOfEconomicLevels: z.number().int().min(0).max(20).optional(),
  adminLevels: z.array(adminLevel).max(100_000), adminLevelNames: z.array(levelName).max(20).optional(),
  electoralLevelNames: z.array(levelName).max(20).optional(), currencyDenominators: z.array(denominator).max(100).optional(),
  smsLocalRate: z.number().nonnegative().optional(), decimalPlaces: z.number().int().min(0).max(6).optional(),
  loyaltyProgram: z.object({ enabled: z.boolean(), earningThreshold: z.number().nonnegative(), redemptionValue: z.number().nonnegative() }).strict().optional(),
  roundingConfig: z.object({ condition: z.enum(['Round Up', 'Round Down', 'Nearest']), upRules: z.array(roundingRule).max(20).optional(), downRules: z.array(roundingRule).max(20).optional() }).strict().optional(),
  createdBy: z.string().trim().max(160).optional(), updatedBy: z.string().trim().max(160).optional(), updatedAt: z.string().datetime().optional(),
}).strict();

export const regionalLevelInputSchema = z.object({
  id: z.number().int().positive().optional(), name: shortText,
  abbreviation: z.string().trim().min(1).max(20), flag: z.string().trim().max(300_000),
  description: z.string().trim().max(2_000), countries: z.array(shortText).max(100),
  color: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/),
}).strict();

export function parseBody<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (result.success) return result.data;
  const detail = result.error.issues[0];
  throw Object.assign(new Error(`Invalid request body: ${detail.path.join('.') || 'body'} ${detail.message}`), { status: 400 });
}
