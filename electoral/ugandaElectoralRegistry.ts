import { readFileSync } from 'node:fs';
import path from 'node:path';
import type {
  ElectoralFilters,
  ElectoralOption,
  ElectoralSourceIndex,
  PaginatedResponse,
  UgandaElectoralRecord,
  UgandaElectoralSummary,
} from './types.ts';

const UNKNOWN_CONSTITUENCY = 'UNASSIGNED / NEEDS VERIFICATION';
const DEFAULT_DATA_PATH = path.join(process.cwd(), 'Support Files', 'electoral-commission-2022.json');

interface RawVillage { village?: string; parish?: string; subcounty?: string; constituency?: string; district?: string }
interface RawParish { parish?: string; villages?: string[]; subcounty?: string; district?: string }
interface RawSubcounty { subcounty?: string; district?: string; constituency?: string; data?: Array<{ parish?: string; villages?: string[] }> }
interface RawDataset {
  districts?: string[];
  byVillage?: Record<string, RawVillage>;
  byParish?: Record<string, RawParish>;
  bySubcounty?: Record<string, RawSubcounty>;
}

const clean = (value: unknown): string => String(value ?? '').trim().replace(/\s+/g, ' ').toUpperCase();
const key = (...values: string[]) => values.map(clean).join('||');
const idPart = (value: string) => encodeURIComponent(clean(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));

export class UgandaElectoralRegistry {
  private readonly records: UgandaElectoralRecord[];
  private readonly summary: UgandaElectoralSummary;

  constructor(dataPath = process.env.UGANDA_ELECTORAL_DATA_PATH || DEFAULT_DATA_PATH) {
    let raw: RawDataset;
    try {
      raw = JSON.parse(readFileSync(path.resolve(dataPath), 'utf8')) as RawDataset;
    } catch (error) {
      throw new Error(`Unable to load Uganda electoral dataset at ${path.resolve(dataPath)}: ${error instanceof Error ? error.message : String(error)}`);
    }

    const merged = new Map<string, UgandaElectoralRecord & { sourceSet: Set<ElectoralSourceIndex> }>();
    const add = (input: RawVillage, source: ElectoralSourceIndex, needsVerification = false) => {
      const district = clean(input.district);
      const constituency = clean(input.constituency) || UNKNOWN_CONSTITUENCY;
      const subcounty = clean(input.subcounty);
      const parish = clean(input.parish);
      const village = clean(input.village);
      if (!district || !subcounty || !parish || !village) return;
      const composite = key(district, constituency, subcounty, parish, village);
      const existing = merged.get(composite);
      if (existing) {
        existing.sourceSet.add(source);
        existing.needsVerification ||= needsVerification;
        return;
      }
      merged.set(composite, {
        id: [district, constituency, subcounty, parish, village].map(idPart).join('/'),
        district, constituency, subcounty, parish, village,
        needsVerification,
        sources: [],
        sourceSet: new Set([source]),
      });
    };

    Object.values(raw.byVillage ?? {}).forEach((record) => add(record, 'byVillage'));
    Object.values(raw.bySubcounty ?? {}).forEach((subcounty) => {
      for (const parish of subcounty.data ?? []) {
        for (const village of parish.villages ?? []) {
          add({ ...subcounty, parish: parish.parish, village }, 'bySubcounty');
        }
      }
    });

    const parishConstituencies = new Map<string, Set<string>>();
    const subcountyConstituencies = new Map<string, Set<string>>();
    for (const record of merged.values()) {
      const parishKey = key(record.district, record.subcounty, record.parish);
      const subcountyKey = key(record.district, record.subcounty);
      if (!parishConstituencies.has(parishKey)) parishConstituencies.set(parishKey, new Set());
      if (!subcountyConstituencies.has(subcountyKey)) subcountyConstituencies.set(subcountyKey, new Set());
      parishConstituencies.get(parishKey)!.add(record.constituency);
      subcountyConstituencies.get(subcountyKey)!.add(record.constituency);
    }

    Object.values(raw.byParish ?? {}).forEach((parish) => {
      const exact = parishConstituencies.get(key(clean(parish.district), clean(parish.subcounty), clean(parish.parish)));
      const parent = subcountyConstituencies.get(key(clean(parish.district), clean(parish.subcounty)));
      const candidates = exact?.size === 1 ? exact : parent?.size === 1 ? parent : undefined;
      const constituency = candidates ? [...candidates][0] : UNKNOWN_CONSTITUENCY;
      for (const village of parish.villages ?? []) {
        add({ ...parish, constituency, village }, 'byParish', !candidates);
      }
    });

    this.records = [...merged.values()].map(({ sourceSet, ...record }) => ({
      ...record,
      sources: [...sourceSet].sort(),
    })).sort((a, b) => a.id.localeCompare(b.id));

    const distinct = (selector: (record: UgandaElectoralRecord) => string) => new Set(this.records.map(selector)).size;
    this.summary = {
      countryCode: 'UG',
      dataset: {
        title: 'Uganda Electoral Commission support dataset',
        referenceYear: 2022,
        status: 'historical-needs-verification',
        sourceFile: path.basename(dataPath),
        authoritativeForCurrentUse: false,
      },
      normalizedTotals: {
        districtsAndCities: distinct(r => r.district),
        constituencies: distinct(r => key(r.district, r.constituency)),
        subcountiesTownsAndDivisions: distinct(r => key(r.district, r.constituency, r.subcounty)),
        parishesAndWards: distinct(r => key(r.district, r.constituency, r.subcounty, r.parish)),
        villagesAndCells: this.records.length,
        recordsNeedingVerification: this.records.filter(r => r.needsVerification).length,
      },
      sourceIndexTotals: {
        districts: new Set((raw.districts ?? []).map(clean)).size,
        villageKeys: Object.keys(raw.byVillage ?? {}).length,
        parishKeys: Object.keys(raw.byParish ?? {}).length,
        subcountyKeys: Object.keys(raw.bySubcounty ?? {}).length,
      },
      official2022Reference: {
        districtsAndCities: 146,
        subcountiesTownsAndDivisions: 2211,
        cityWards: 431,
        districtParishesAndWards: 10259,
        villagesAndCells: 70512,
      },
      warnings: [
        'This is a historical 2022 support dataset and is not authoritative for current elections.',
        'The three source indexes overlap and contain omissions, overwritten duplicate names, and conflicting totals.',
        'Unassigned constituency records must be reviewed against a current Electoral Commission register before operational use.',
        'Stable IDs are derived from the full hierarchy; village names alone are not unique identifiers.',
      ],
    };
  }

  getSummary(): UgandaElectoralSummary {
    return this.summary;
  }

  getOptions(level: 'district' | 'constituency' | 'subcounty' | 'parish', filters: ElectoralFilters): ElectoralOption[] {
    const selected = this.filter(filters, false);
    const grouped = new Map<string, { name: string; count: number; needsVerification: boolean }>();
    for (const record of selected) {
      const name = record[level];
      const hierarchy = level === 'district' ? [name]
        : level === 'constituency' ? [record.district, name]
        : level === 'subcounty' ? [record.district, record.constituency, name]
        : [record.district, record.constituency, record.subcounty, name];
      const optionKey = key(...hierarchy);
      const current = grouped.get(optionKey);
      if (current) {
        current.count += 1;
        current.needsVerification ||= record.needsVerification;
      } else grouped.set(optionKey, { name, count: 1, needsVerification: record.needsVerification });
    }
    return [...grouped.entries()].map(([optionKey, value]) => ({
      id: optionKey.split('||').map(idPart).join('/'),
      name: value.name,
      recordCount: value.count,
      needsVerification: value.needsVerification,
    })).sort((a, b) => a.name.localeCompare(b.name));
  }

  getVillages(filters: ElectoralFilters, page = 1, pageSize = 50): PaginatedResponse<UgandaElectoralRecord> {
    const records = this.filter(filters, true);
    const start = (page - 1) * pageSize;
    return {
      data: records.slice(start, start + pageSize),
      pagination: { page, pageSize, totalItems: records.length, totalPages: Math.ceil(records.length / pageSize) },
    };
  }

  private filter(filters: ElectoralFilters, includeSearch: boolean): UgandaElectoralRecord[] {
    const district = clean(filters.district);
    const constituency = clean(filters.constituency);
    const subcounty = clean(filters.subcounty);
    const parish = clean(filters.parish);
    const search = clean(filters.search);
    return this.records.filter(record =>
      (!district || record.district === district) &&
      (!constituency || record.constituency === constituency) &&
      (!subcounty || record.subcounty === subcounty) &&
      (!parish || record.parish === parish) &&
      (!includeSearch || !search || [record.village, record.parish, record.subcounty, record.constituency, record.district].some(value => value.includes(search)))
    );
  }
}

let singleton: UgandaElectoralRegistry | undefined;
export const getUgandaElectoralRegistry = () => singleton ??= new UgandaElectoralRegistry();
