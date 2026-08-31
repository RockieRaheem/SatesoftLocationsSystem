import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { allAfricanCountries, mockRegionalEconomicLevels } from '../data.ts';
import { UgandaElectoralRegistry } from '../electoral/ugandaElectoralRegistry.ts';
import { countryToRow, regionToRow } from '../src/supabase/mappers.ts';
import { createAdminClient } from '../src/supabase/server.ts';
import type { Json } from '../src/supabase/database.types.ts';

const sourcePath = path.resolve(process.env.UGANDA_ELECTORAL_DATA_PATH || path.join('Support Files', 'electoral-commission-2022.json'));
const importUserId = process.env.SUPABASE_IMPORT_USER_ID?.trim() || null;
const batchSize = 500;

async function run() {
  const admin = createAdminClient();
  const uganda = allAfricanCountries.find(country => country.countryCode === 'UG');
  if (!uganda) throw new Error('Uganda country seed is missing.');

  const { error: countryError } = await admin.from('countries').upsert(countryToRow(uganda), { onConflict: 'country_code' });
  if (countryError) throw countryError;
  const ugandaRegions = mockRegionalEconomicLevels.filter(region => region.countries.includes('Uganda'));
  const { error: regionError } = await admin.from('regional_economic_levels').upsert(ugandaRegions.map(regionToRow), { onConflict: 'abbreviation' });
  if (regionError) throw regionError;

  const { data: failedDatasets, error: failedLookupError } = await admin.from('electoral_datasets')
    .select('id').eq('country_code', 'UG').eq('status', 'failed').eq('active', false);
  if (failedLookupError) throw failedLookupError;
  for (const failed of failedDatasets ?? []) {
    const { error } = await admin.from('electoral_locations').delete().eq('dataset_id', failed.id);
    if (error) throw error;
  }

  const source = readFileSync(sourcePath);
  const registry = new UgandaElectoralRegistry(sourcePath);
  const summary = registry.getSummary();
  const { data: dataset, error: datasetError } = await admin.from('electoral_datasets').insert({
    country_code: 'UG', reference_year: summary.dataset.referenceYear, title: summary.dataset.title,
    status: 'importing', source_file: path.basename(sourcePath),
    source_sha256: createHash('sha256').update(source).digest('hex'),
    authoritative_for_current_use: summary.dataset.authoritativeForCurrentUse,
    summary: summary as unknown as Json, warnings: summary.warnings as unknown as Json,
    imported_by: importUserId,
  }).select('id').single();
  if (datasetError || !dataset) throw datasetError || new Error('Dataset record was not created.');

  try {
    const records = registry.getAllRecords();
    for (let offset = 0; offset < records.length; offset += batchSize) {
      const rows = records.slice(offset, offset + batchSize).map(record => ({
        dataset_id: dataset.id, id: record.id, country_code: 'UG', district: record.district,
        constituency: record.constituency, subcounty: record.subcounty, parish: record.parish,
        village: record.village, needs_verification: record.needsVerification, sources: record.sources,
      }));
      const { error } = await admin.from('electoral_locations').insert(rows);
      if (error) throw error;
      console.log(`Imported ${Math.min(offset + batchSize, records.length).toLocaleString()} of ${records.length.toLocaleString()} locations.`);
    }
    const { error: readyError } = await admin.from('electoral_datasets').update({ status: summary.dataset.status }).eq('id', dataset.id);
    if (readyError) throw readyError;
    const { error: activationError } = await admin.rpc('activate_electoral_dataset', { p_dataset_id: dataset.id });
    if (activationError) throw activationError;
    console.log(`Activated Uganda dataset ${dataset.id} from ${path.basename(sourcePath)}.`);
  } catch (error) {
    const { error: cleanupError } = await admin.from('electoral_locations').delete().eq('dataset_id', dataset.id);
    if (cleanupError) console.error(`Failed to clean partial dataset ${dataset.id}: ${cleanupError.message}`);
    await admin.from('electoral_datasets').update({ status: 'failed', active: false }).eq('id', dataset.id);
    throw error;
  }
}

run().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
