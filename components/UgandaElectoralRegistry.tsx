import React, { useEffect, useMemo, useState } from 'react';
import type { Theme } from '../types.ts';
import type { ElectoralOption, PaginatedResponse, UgandaElectoralRecord, UgandaElectoralSummary } from '../electoral/types.ts';
import { apiFetch } from '../src/services/api.ts';
import Icon from './Icon.tsx';

type Selection = { district: string; constituency: string; subcounty: string; parish: string };
const emptySelection: Selection = { district: '', constituency: '', subcounty: '', parish: '' };

const UgandaElectoralRegistry: React.FC<{ theme: Theme }> = () => {
  const [summary, setSummary] = useState<UgandaElectoralSummary | null>(null);
  const [options, setOptions] = useState<Record<keyof Selection, ElectoralOption[]>>({ district: [], constituency: [], subcounty: [], parish: [] });
  const [selection, setSelection] = useState<Selection>(emptySelection);
  const [villages, setVillages] = useState<PaginatedResponse<UgandaElectoralRecord> | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(selection).forEach(([name, value]) => value && params.set(name, value));
    return params;
  }, [selection]);

  useEffect(() => {
    Promise.all([
      apiFetch('/api/electoral/uganda/summary').then(response => response.json()),
      apiFetch('/api/electoral/uganda/districts').then(response => response.json()),
    ]).then(([summaryData, districtData]) => {
      setSummary(summaryData);
      setOptions(current => ({ ...current, district: districtData.data }));
    }).catch((reason: Error) => setError(reason.message)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const loadOptions = async () => {
      const updates: Partial<Record<keyof Selection, ElectoralOption[]>> = {};
      if (selection.district) updates.constituency = (await apiFetch(`/api/electoral/uganda/constituencies?${query}`).then(r => r.json())).data;
      if (selection.constituency) updates.subcounty = (await apiFetch(`/api/electoral/uganda/subcounties?${query}`).then(r => r.json())).data;
      if (selection.subcounty) updates.parish = (await apiFetch(`/api/electoral/uganda/parishes?${query}`).then(r => r.json())).data;
      setOptions(current => ({ ...current, ...updates }));
    };
    loadOptions().catch(() => setError('Unable to load hierarchy options.'));
  }, [query, selection.constituency, selection.district, selection.subcounty]);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams(query);
      params.set('page', String(page));
      params.set('pageSize', '25');
      if (search.trim()) params.set('search', search.trim());
      setLoading(true);
      apiFetch(`/api/electoral/uganda/villages?${params}`, { signal: controller.signal })
        .then(response => response.json()).then(setVillages)
        .catch((reason: Error) => reason.name !== 'AbortError' && setError(reason.message))
        .finally(() => setLoading(false));
    }, 250);
    return () => { window.clearTimeout(timeout); controller.abort(); };
  }, [page, query, search]);

  const choose = (level: keyof Selection, value: string) => {
    const order: Array<keyof Selection> = ['district', 'constituency', 'subcounty', 'parish'];
    const index = order.indexOf(level);
    setSelection(current => Object.fromEntries(order.map((item, position) => [item, position < index ? current[item] : position === index ? value : ''])) as unknown as Selection);
    setPage(1);
  };
  const reset = () => { setSelection(emptySelection); setSearch(''); setPage(1); };
  const totals = summary?.normalizedTotals;
  const filtersActive = search || Object.values(selection).some(Boolean);

  return <section className="space-y-5" aria-labelledby="uganda-electoral-heading">
    <div className="surface-card overflow-hidden">
      <div className="flex flex-col gap-5 border-b border-[#ebe9e2] p-5 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-4"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#f9c80e] font-bold text-[#1f1f1f]">UG</div><div><div className="flex flex-wrap items-center gap-2"><h2 id="uganda-electoral-heading" className="text-lg font-semibold tracking-[-0.02em]">Uganda national hierarchy</h2><span className="rounded-full bg-[#fff4c7] px-2.5 py-1 text-[10px] font-semibold text-[#6e5700]">2022 source</span></div><p className="mt-1.5 max-w-2xl text-xs leading-5 text-[#77766f]">Trace each village or cell through its parish, subcounty, constituency, and district.</p></div></div>
        <a className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#474742] hover:text-black" href="https://www.ec.or.ug/" target="_blank" rel="noreferrer">Source: Electoral Commission <span aria-hidden="true">↗</span></a>
      </div>

      {error && <div role="alert" className="m-5 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</div>}

      {summary && <div className="grid grid-cols-2 border-b border-[#ebe9e2] md:grid-cols-3 xl:grid-cols-6">{[
        ['Districts & cities', totals?.districtsAndCities], ['Constituencies', totals?.constituencies],
        ['Subcounties', totals?.subcountiesTownsAndDivisions], ['Parishes & wards', totals?.parishesAndWards],
        ['Villages & cells', totals?.villagesAndCells], ['Needs review', totals?.recordsNeedingVerification],
      ].map(([label, value], index) => <div key={String(label)} className={`border-[#ebe9e2] p-4 md:p-5 ${index < 5 ? 'xl:border-r' : ''}`}><div className="text-xl font-semibold tracking-[-0.03em]">{Number(value ?? 0).toLocaleString()}</div><div className="mt-1 text-[10px] text-[#8c8a82]">{label}</div></div>)}</div>}

      <div className="bg-[#fafaf7] p-5 sm:p-6"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">{(['district', 'constituency', 'subcounty', 'parish'] as const).map((level, index) => <label key={level} className="text-[11px] font-semibold capitalize text-[#5f5f5a]">{level}<select value={selection[level]} onChange={event => choose(level, event.target.value)} disabled={index > 0 && !selection[(['district', 'constituency', 'subcounty'] as const)[index - 1]]} className="field-control mt-1.5 block w-full p-2.5 text-xs disabled:bg-[#f0efe9]"><option value="">All {level === 'parish' ? 'parishes' : `${level}s`}</option>{options[level].map(option => <option key={option.id} value={option.name}>{option.name} ({option.recordCount.toLocaleString()})</option>)}</select></label>)}<label className="text-[11px] font-semibold text-[#5f5f5a]">Village or cell<div className="relative mt-1.5"><Icon name="search" className="absolute left-3 top-2.5 h-4 w-4 text-[#99978f]" /><input value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} maxLength={100} placeholder="Search locations" className="field-control block w-full py-2.5 pl-9 pr-3 text-xs" /></div></label></div>{filtersActive && <button onClick={reset} className="mt-3 text-[11px] font-semibold text-[#6f6e68] underline decoration-[#c7c4bb] underline-offset-4 hover:text-black">Clear all filters</button>}</div>
    </div>

    <div className="surface-card overflow-hidden"><div className="flex items-center justify-between border-b border-[#ebe9e2] px-5 py-4"><div><h3 className="text-sm font-semibold">Location records</h3><p className="mt-0.5 text-[10px] text-[#96948c]">{villages ? `${villages.pagination.totalItems.toLocaleString()} matching records` : 'Loading records'}</p></div>{loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#dedcd4] border-t-[#1f1f1f]" />}</div><div className="overflow-x-auto"><table className="min-w-full text-left text-xs"><thead className="bg-[#fafaf7] text-[#77766f]"><tr>{['Village / Cell', 'Parish / Ward', 'Subcounty / Division', 'Constituency', 'District / City', 'Status'].map(name => <th key={name} className="whitespace-nowrap border-b border-[#ebe9e2] px-4 py-3 font-semibold">{name}</th>)}</tr></thead><tbody className="divide-y divide-[#efede7]">{villages?.data.map(record => <tr key={record.id} className="transition-colors hover:bg-[#fffdf5]"><td className="whitespace-nowrap px-4 py-3.5 font-semibold text-[#292925]">{record.village}</td><td className="whitespace-nowrap px-4 py-3.5 text-[#66655f]">{record.parish}</td><td className="whitespace-nowrap px-4 py-3.5 text-[#66655f]">{record.subcounty}</td><td className="whitespace-nowrap px-4 py-3.5 text-[#66655f]">{record.constituency}</td><td className="whitespace-nowrap px-4 py-3.5 text-[#66655f]">{record.district}</td><td className="px-4 py-3.5"><span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold ${record.needsVerification ? 'bg-[#fff4c7] text-[#6e5700]' : 'bg-[#eef6ee] text-[#2e6932]'}`}>{record.needsVerification ? 'Review' : 'Mapped'}</span></td></tr>)}</tbody></table>{!loading && villages?.data.length === 0 && <div className="grid min-h-48 place-items-center p-8 text-center"><div><p className="text-sm font-semibold">No matching locations</p><p className="mt-1 text-xs text-[#88867f]">Try removing a filter or using a broader search.</p></div></div>}</div>
      {villages && villages.pagination.totalPages > 1 && <div className="flex flex-col gap-3 border-t border-[#ebe9e2] px-5 py-4 text-xs sm:flex-row sm:items-center sm:justify-between"><span className="text-[#77766f]">Page {villages.pagination.page} of {villages.pagination.totalPages}</span><div className="flex gap-2"><button className="button-secondary !px-3 !py-1.5 !text-xs" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>Previous</button><button className="button-secondary !px-3 !py-1.5 !text-xs" disabled={page >= villages.pagination.totalPages} onClick={() => setPage(value => value + 1)}>Next</button></div></div>}
    </div>

    {summary && <details className="rounded-2xl border border-[#eadca3] bg-[#fffaf0] p-4 text-xs text-[#6e5700]"><summary className="cursor-pointer font-semibold">Data quality and operational notice</summary><ul className="mt-3 list-disc space-y-1.5 pl-5 leading-5">{summary.warnings.map(warning => <li key={warning}>{warning}</li>)}</ul></details>}
  </section>;
};

export default UgandaElectoralRegistry;
