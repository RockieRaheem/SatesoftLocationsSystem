export type ElectoralSourceIndex = 'byVillage' | 'byParish' | 'bySubcounty';

export interface ElectoralOption {
  id: string;
  name: string;
  recordCount: number;
  needsVerification: boolean;
}

export interface UgandaElectoralRecord {
  id: string;
  district: string;
  constituency: string;
  subcounty: string;
  parish: string;
  village: string;
  needsVerification: boolean;
  sources: ElectoralSourceIndex[];
}

export interface UgandaElectoralSummary {
  countryCode: 'UG';
  dataset: {
    title: string;
    referenceYear: 2022;
    status: 'historical-needs-verification';
    sourceFile: string;
    authoritativeForCurrentUse: false;
  };
  normalizedTotals: {
    districtsAndCities: number;
    constituencies: number;
    subcountiesTownsAndDivisions: number;
    parishesAndWards: number;
    villagesAndCells: number;
    recordsNeedingVerification: number;
  };
  sourceIndexTotals: {
    districts: number;
    villageKeys: number;
    parishKeys: number;
    subcountyKeys: number;
  };
  official2022Reference: {
    districtsAndCities: 146;
    subcountiesTownsAndDivisions: 2211;
    cityWards: 431;
    districtParishesAndWards: 10259;
    villagesAndCells: 70512;
  };
  warnings: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface ElectoralFilters {
  district?: string;
  constituency?: string;
  subcounty?: string;
  parish?: string;
  search?: string;
}
