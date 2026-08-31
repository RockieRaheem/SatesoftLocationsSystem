import React, { useEffect, useMemo, useState } from 'react';
import type { Theme } from '../types.ts';
import type { ElectoralOption, PaginatedResponse, UgandaElectoralRecord, UgandaElectoralSummary } from '../electoral/types.ts';

type Selection = { district: string; constituency: string; subcounty: string; parish: string };
const emptySelection: Selection = { district: '', constituency: '', subcounty: '', parish: '' };

const UgandaElectoralRegistry: React.FC<{ theme: Theme }> = ({ theme }) => {
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
      fetch('/api/electoral/uganda/summary').then(response => response.ok ? response.json() : Promise.reject(new Error('Summary unavailable'))),
      fetch('/api/electoral/uganda/districts').then(response => response.ok ? response.json() : Promise.reject(new Error('Districts unavailable'))),
    ]).then(([summaryData, districtData]) => {
      setSummary(summaryData);
      setOptions(current => ({ ...current, district: districtData.data }));
    }).catch((reason: Error) => setError(reason.message)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const loadOptions = async () => {
      const updates: Partial<Record<keyof Selection, ElectoralOption[]>> = {};
      if (selection.district) updates.constituency = (await fetch(`/api/electoral/uganda/constituencies?${query}`).then(r => r.json())).data;
      if (selection.constituency) updates.subcounty = (await fetch(`/api/electoral/uganda/subcounties?${query}`).then(r => r.json())).data;
      if (selection.subcounty) updates.parish = (await fetch(`/api/electoral/uganda/parishes?${query}`).then(r => r.json())).data;
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
      fetch(`/api/electoral/uganda/villages?${params}`, { signal: controller.signal })
        .then(response => response.ok ? response.json() : Promise.reject(new Error('Villages unavailable')))
        .then(setVillages)
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

  const surface = theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900';
  const input = theme === 'dark' ? 'bg-slate-900 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900';
  const totals = summary?.normalizedTotals;

  return (
    <section className={`mb-8 rounded-xl border p-5 ${surface}`} aria-labelledby="uganda-electoral-heading">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 id="uganda-electoral-heading" className="text-xl font-bold">Uganda electoral location registry</h2>
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900">Historical 2022 · verification required</span>
          </div>
          <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            Browse District/City → Constituency → Subcounty/Town/Division → Parish/Ward → Village/Cell.
          </p>
        </div>
        <a className="text-sm font-medium text-blue-600 hover:underline" href="https://www.ec.or.ug/" target="_blank" rel="noreferrer">Electoral Commission Uganda ↗</a>
      </div>

      {error && <div role="alert" className="mt-4 rounded-md bg-red-100 p-3 text-sm text-red-800">{error}</div>}

      {summary && <>
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {[
            ['Districts / Cities', totals?.districtsAndCities], ['Constituencies', totals?.constituencies],
            ['Subcounties', totals?.subcountiesTownsAndDivisions], ['Parishes / Wards', totals?.parishesAndWards],
            ['Villages / Cells', totals?.villagesAndCells], ['Needs review', totals?.recordsNeedingVerification],
          ].map(([label, value]) => <div key={String(label)} className={`rounded-lg border p-3 ${theme === 'dark' ? 'border-slate-700 bg-slate-900/60' : 'border-slate-200 bg-slate-50'}`}>
            <div className="text-xl font-bold">{Number(value ?? 0).toLocaleString()}</div><div className="text-xs opacity-70">{label}</div>
          </div>)}
        </div>
        <details className={`mt-4 rounded-lg p-3 text-sm ${theme === 'dark' ? 'bg-amber-950/40 text-amber-200' : 'bg-amber-50 text-amber-900'}`}>
          <summary className="cursor-pointer font-semibold">Data quality and operational notice</summary>
          <ul className="mt-2 list-disc space-y-1 pl-5">{summary.warnings.map(warning => <li key={warning}>{warning}</li>)}</ul>
        </details>
      </>}

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {(['district', 'constituency', 'subcounty', 'parish'] as const).map((level, index) => (
          <label key={level} className="text-xs font-semibold capitalize">
            {level}
            <select value={selection[level]} onChange={event => choose(level, event.target.value)} disabled={index > 0 && !selection[(['district', 'constituency', 'subcounty'] as const)[index - 1]]} className={`mt-1 block w-full rounded-md border p-2 text-sm ${input}`}>
              <option value="">All {level === 'parish' ? 'parishes' : `${level}s`}</option>
              {options[level].map(option => <option key={option.id} value={option.name}>{option.name} ({option.recordCount.toLocaleString()})</option>)}
            </select>
          </label>
        ))}
        <label className="text-xs font-semibold">Search villages
          <input value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} maxLength={100} placeholder="Name or parent location" className={`mt-1 block w-full rounded-md border p-2 text-sm ${input}`} />
        </label>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}><tr>{['Village / Cell', 'Parish / Ward', 'Subcounty / Division', 'Constituency', 'District / City', 'Status'].map(name => <th key={name} className="border-b p-2 font-semibold">{name}</th>)}</tr></thead>
          <tbody>{villages?.data.map(record => <tr key={record.id} className={theme === 'dark' ? 'border-slate-700' : 'border-slate-100'}>
            <td className="border-b p-2 font-medium">{record.village}</td><td className="border-b p-2">{record.parish}</td><td className="border-b p-2">{record.subcounty}</td><td className="border-b p-2">{record.constituency}</td><td className="border-b p-2">{record.district}</td>
            <td className="border-b p-2"><span className={`whitespace-nowrap rounded px-2 py-1 text-xs ${record.needsVerification ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'}`}>{record.needsVerification ? 'Review' : 'Mapped'}</span></td>
          </tr>)}</tbody>
        </table>
        {!loading && villages?.data.length === 0 && <p className="py-8 text-center text-sm opacity-60">No matching villages or cells.</p>}
        {loading && <p className="py-8 text-center text-sm opacity-60" aria-live="polite">Loading electoral locations…</p>}
      </div>

      {villages && villages.pagination.totalPages > 1 && <div className="mt-4 flex items-center justify-between text-sm">
        <span>{villages.pagination.totalItems.toLocaleString()} records · Page {villages.pagination.page} of {villages.pagination.totalPages}</span>
        <div className="flex gap-2"><button className={`rounded border px-3 py-1.5 ${input}`} disabled={page <= 1} onClick={() => setPage(value => value - 1)}>Previous</button><button className={`rounded border px-3 py-1.5 ${input}`} disabled={page >= villages.pagination.totalPages} onClick={() => setPage(value => value + 1)}>Next</button></div>
      </div>}
    </section>
  );
};

export default UgandaElectoralRegistry;
