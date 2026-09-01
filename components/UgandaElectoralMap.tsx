import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, ArrowLeft, ChevronRight, Database, Loader2, MapPin, Search } from 'lucide-react';
import type { ElectoralOption, PaginatedResponse, UgandaElectoralRecord, UgandaElectoralSummary } from '../electoral/types';
import type { Theme } from '../types';
import { apiFetch } from '../src/services/api';

type Coordinate = [number, number];
type PolygonCoordinates = Coordinate[][];
type Geometry =
  | { type: 'Polygon'; coordinates: PolygonCoordinates }
  | { type: 'MultiPolygon'; coordinates: PolygonCoordinates[] };
type DistrictFeature = { type: 'Feature'; properties: { admin2name_en: string }; geometry: Geometry };
type DistrictCollection = { type: 'FeatureCollection'; features: DistrictFeature[] };
type Level = 'district' | 'constituency' | 'subcounty' | 'parish' | 'village';
type Selection = { district: string; constituency: string; subcounty: string; parish: string };
type DisplayItem = ElectoralOption & { record?: UgandaElectoralRecord };

const WIDTH = 700;
const HEIGHT = 720;
const LEVELS: Level[] = ['district', 'constituency', 'subcounty', 'parish', 'village'];
const LEVEL_LABELS: Record<Level, string> = {
  district: 'Districts & cities',
  constituency: 'Constituencies',
  subcounty: 'Subcounties, towns & divisions',
  parish: 'Parishes & wards',
  village: 'Villages & cells',
};
const OPTION_ENDPOINTS: Record<Exclude<Level, 'district' | 'village'>, string> = {
  constituency: 'constituencies',
  subcounty: 'subcounties',
  parish: 'parishes',
};
const emptySelection: Selection = { district: '', constituency: '', subcounty: '', parish: '' };
const districtAliases: Record<string, string> = { LUWERO: 'LUWEERO' };
const cityBoundaryAliases: Record<string, string> = {
  'ARUA CITY': 'ARUA',
  'FORT PORTAL CITY': 'KABAROLE',
  'GULU CITY': 'GULU',
  'HOIMA CITY': 'HOIMA',
  'JINJA CITY': 'JINJA',
  'LIRA CITY': 'LIRA',
  'MASAKA CITY': 'MASAKA',
  'MBALE CITY': 'MBALE',
  'MBARARA CITY': 'MBARARA',
  'SOROTI CITY': 'SOROTI',
};
const normalizeDistrict = (name: string) => districtAliases[name.trim().toUpperCase()] ?? name.trim().toUpperCase();

function geometryCoordinates(geometry: Geometry): Coordinate[] {
  const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  return polygons.flatMap(polygon => polygon.flatMap(ring => ring));
}

const UgandaElectoralMap: React.FC<{ theme: Theme; onBack: () => void }> = ({ theme, onBack }) => {
  const [boundaries, setBoundaries] = useState<DistrictCollection | null>(null);
  const [summary, setSummary] = useState<UgandaElectoralSummary | null>(null);
  const [districts, setDistricts] = useState<ElectoralOption[]>([]);
  const [items, setItems] = useState<DisplayItem[]>([]);
  const [level, setLevel] = useState<Level>('district');
  const [selection, setSelection] = useState<Selection>(emptySelection);
  const [selectedVillage, setSelectedVillage] = useState<UgandaElectoralRecord | null>(null);
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginatedResponse<UgandaElectoralRecord>['pagination'] | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const dark = theme === 'dark';

  useEffect(() => {
    let active = true;
    fetch('/data/uganda-districts.geojson')
      .then(response => {
        if (!response.ok) throw new Error('Uganda district boundaries could not be loaded.');
        return response.json() as Promise<DistrictCollection>;
      })
      .then(data => { if (active) setBoundaries(data); })
      .catch(cause => { if (active) setError(cause instanceof Error ? cause.message : 'Uganda district boundaries could not be loaded.'); });

    Promise.all([
      apiFetch('/api/electoral/uganda/summary').then(response => response.json() as Promise<UgandaElectoralSummary>),
      apiFetch('/api/electoral/uganda/districts').then(response => response.json() as Promise<{ data: ElectoralOption[] }>),
    ])
      .then(([summaryData, districtData]) => {
        if (!active) return;
        setSummary(summaryData);
        setDistricts(districtData.data);
        setItems(districtData.data);
      })
      .catch(cause => { if (active) setError(cause instanceof Error ? cause.message : 'Electoral Commission hierarchy could not be loaded.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const districtByName = useMemo(() => new Map(districts.map(item => [item.name.toUpperCase(), item])), [districts]);

  const projectedDistricts = useMemo(() => {
    if (!boundaries) return [];
    const allCoordinates = boundaries.features.flatMap(feature => geometryCoordinates(feature.geometry));
    const longitudes = allCoordinates.map(([longitude]) => longitude);
    const latitudes = allCoordinates.map(([, latitude]) => latitude);
    const minLongitude = Math.min(...longitudes);
    const maxLongitude = Math.max(...longitudes);
    const minLatitude = Math.min(...latitudes);
    const maxLatitude = Math.max(...latitudes);
    const padding = 22;
    const scale = Math.min((WIDTH - padding * 2) / (maxLongitude - minLongitude), (HEIGHT - padding * 2) / (maxLatitude - minLatitude));
    const renderedWidth = (maxLongitude - minLongitude) * scale;
    const renderedHeight = (maxLatitude - minLatitude) * scale;
    const offsetX = (WIDTH - renderedWidth) / 2;
    const offsetY = (HEIGHT - renderedHeight) / 2;
    const project = ([longitude, latitude]: Coordinate): Coordinate => [
      offsetX + (longitude - minLongitude) * scale,
      offsetY + (maxLatitude - latitude) * scale,
    ];
    const ringPath = (ring: Coordinate[]) => ring.map((coordinate, index) => {
      const [x, y] = project(coordinate);
      return `${index ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(' ') + ' Z';

    return boundaries.features.map(feature => {
      const polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates;
      const points = geometryCoordinates(feature.geometry).map(project);
      const xs = points.map(([x]) => x);
      const ys = points.map(([, y]) => y);
      const bounds = { minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) };
      return {
        name: feature.properties.admin2name_en,
        ecName: normalizeDistrict(feature.properties.admin2name_en),
        path: polygons.flatMap(polygon => polygon.map(ringPath)).join(' '),
        bounds,
      };
    });
  }, [boundaries]);

  const selectedShape = useMemo(
    () => projectedDistricts.find(district => district.ecName === (cityBoundaryAliases[selection.district] ?? selection.district)),
    [projectedDistricts, selection.district],
  );
  const viewBox = useMemo(() => {
    if (!selectedShape || level === 'district') return `0 0 ${WIDTH} ${HEIGHT}`;
    const { minX, minY, maxX, maxY } = selectedShape.bounds;
    const shapeWidth = Math.max(40, maxX - minX);
    const shapeHeight = Math.max(40, maxY - minY);
    const margin = Math.max(shapeWidth, shapeHeight) * 0.18;
    return `${minX - margin} ${minY - margin} ${shapeWidth + margin * 2} ${shapeHeight + margin * 2}`;
  }, [level, selectedShape]);

  const loadLevel = async (nextLevel: Level, nextSelection: Selection, nextPage = 1) => {
    setLoading(true);
    setError('');
    setSelectedVillage(null);
    setSearch('');
    try {
      if (nextLevel === 'district') {
        setItems(districts);
        setPagination(null);
      } else {
        const params = new URLSearchParams();
        Object.entries(nextSelection).forEach(([key, value]) => value && params.set(key, value));
        if (nextLevel === 'village') {
          params.set('page', String(nextPage));
          params.set('pageSize', '100');
          const result = await apiFetch(`/api/electoral/uganda/villages?${params}`).then(response => response.json() as Promise<PaginatedResponse<UgandaElectoralRecord>>);
          setItems(result.data.map(record => ({
            id: record.id,
            name: record.village,
            recordCount: 1,
            needsVerification: record.needsVerification,
            record,
          })));
          setPagination(result.pagination);
          setPage(nextPage);
        } else {
          const endpoint = OPTION_ENDPOINTS[nextLevel];
          const result = await apiFetch(`/api/electoral/uganda/${endpoint}?${params}`).then(response => response.json() as Promise<{ data: ElectoralOption[] }>);
          setItems(result.data);
          setPagination(null);
        }
      }
      setSelection(nextSelection);
      setLevel(nextLevel);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The next hierarchy level could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  const selectItem = (item: DisplayItem) => {
    if (level === 'village') {
      setSelectedVillage(item.record ?? null);
      return;
    }
    const nextSelection = { ...selection };
    if (level === 'district') {
      nextSelection.district = item.name;
      nextSelection.constituency = '';
      nextSelection.subcounty = '';
      nextSelection.parish = '';
    } else if (level === 'constituency') {
      nextSelection.constituency = item.name;
      nextSelection.subcounty = '';
      nextSelection.parish = '';
    } else if (level === 'subcounty') {
      nextSelection.subcounty = item.name;
      nextSelection.parish = '';
    } else if (level === 'parish') {
      nextSelection.parish = item.name;
    }
    const nextLevel = LEVELS[LEVELS.indexOf(level) + 1];
    void loadLevel(nextLevel, nextSelection);
  };

  const selectMappedDistrict = (item: ElectoralOption) => {
    const nextSelection: Selection = { district: item.name, constituency: '', subcounty: '', parish: '' };
    void loadLevel('constituency', nextSelection);
  };

  const navigateTo = (target: Level) => {
    const targetIndex = LEVELS.indexOf(target);
    const nextSelection = { ...selection };
    if (targetIndex <= 0) Object.assign(nextSelection, emptySelection);
    if (targetIndex <= 1) Object.assign(nextSelection, { constituency: '', subcounty: '', parish: '' });
    if (targetIndex <= 2) Object.assign(nextSelection, { subcounty: '', parish: '' });
    if (targetIndex <= 3) nextSelection.parish = '';
    void loadLevel(target, nextSelection);
  };

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term ? items.filter(item => item.name.toLowerCase().includes(term)) : items;
  }, [items, search]);
  const hoveredOption = hoveredDistrict ? districtByName.get(normalizeDistrict(hoveredDistrict)) : undefined;

  return (
    <div className={`flex h-full w-full flex-col overflow-hidden rounded-xl border ${dark ? 'border-slate-700 bg-slate-950 text-slate-100' : 'border-slate-200 bg-white text-slate-900'}`}>
      <header className={`flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 ${dark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="flex min-w-0 items-center gap-3">
          <button onClick={onBack} className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border ${dark ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-50'}`} aria-label="Back to Africa map"><ArrowLeft size={17} /></button>
          <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-yellow-600">Uganda electoral map</p><h2 className="truncate text-lg font-bold">District-to-village hierarchy</h2></div>
        </div>
        <div className="flex items-center gap-2 text-xs"><Database size={14} className="text-yellow-600" /><span className="font-semibold">{summary ? `${summary.normalizedTotals.villagesAndCells.toLocaleString()} EC villages & cells` : 'Loading EC coverage…'}</span></div>
      </header>

      <nav className={`flex items-center gap-1 overflow-x-auto border-b px-4 py-2 text-xs ${dark ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200 bg-slate-50'}`} aria-label="Location hierarchy">
        {LEVELS.map((entry, index) => {
          const currentIndex = LEVELS.indexOf(level);
          const enabled = index <= currentIndex;
          const selectedLabel = entry === 'district' ? selection.district : entry === 'constituency' ? selection.constituency : entry === 'subcounty' ? selection.subcounty : entry === 'parish' ? selection.parish : selectedVillage?.village;
          return <React.Fragment key={entry}>{index > 0 && <ChevronRight size={12} className="shrink-0 opacity-40" />}<button disabled={!enabled} onClick={() => enabled && navigateTo(entry)} className={`whitespace-nowrap rounded px-2 py-1 font-semibold ${entry === level ? 'bg-yellow-400 text-slate-950' : enabled ? 'hover:bg-yellow-100 hover:text-slate-900' : 'cursor-not-allowed opacity-40'}`}>{selectedLabel || LEVEL_LABELS[entry]}</button></React.Fragment>;
        })}
      </nav>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div ref={mapRef} className={`relative min-h-[430px] overflow-hidden ${dark ? 'bg-slate-900' : 'bg-[#f7f8f5]'}`} onMouseMove={event => {
          const rect = mapRef.current?.getBoundingClientRect();
          if (rect) setPointer({ x: event.clientX - rect.left, y: event.clientY - rect.top });
        }}>
          {!boundaries ? <div className="grid h-full place-items-center"><Loader2 className="animate-spin text-yellow-500" /></div> : (
            <svg className="h-full w-full" viewBox={viewBox} preserveAspectRatio="xMidYMid meet" role="img" aria-label="Uganda district boundary map">
              <g fillRule="evenodd">
                {projectedDistricts.map(district => {
                  const isSelected = selection.district === district.ecName;
                  const isHovered = hoveredDistrict === district.name;
                  const hasEcData = districtByName.has(district.ecName);
                  return <path key={district.name} d={district.path} fill={isSelected ? '#facc15' : isHovered ? '#fef08a' : dark ? '#1e293b' : '#ffffff'} stroke={isSelected ? '#111827' : dark ? '#64748b' : '#64748b'} strokeWidth={isSelected ? 2.2 : 0.9} opacity={level !== 'district' && !isSelected ? 0.18 : hasEcData ? 1 : 0.45} className={hasEcData ? 'cursor-pointer transition-colors' : 'cursor-not-allowed'} onMouseEnter={() => setHoveredDistrict(district.name)} onMouseLeave={() => setHoveredDistrict(null)} onClick={() => {
                    const option = districtByName.get(district.ecName);
                    if (option) selectMappedDistrict(option);
                  }} />;
                })}
              </g>
              {selectedShape && level !== 'district' && <text x={(selectedShape.bounds.minX + selectedShape.bounds.maxX) / 2} y={(selectedShape.bounds.minY + selectedShape.bounds.maxY) / 2} textAnchor="middle" className="pointer-events-none fill-slate-950 text-[10px] font-black uppercase" stroke="white" strokeWidth="3" paintOrder="stroke">{selection.district}</text>}
            </svg>
          )}
          {hoveredDistrict && <div className={`pointer-events-none absolute z-20 min-w-36 rounded-lg border px-3 py-2 shadow-xl ${dark ? 'border-slate-700 bg-slate-950' : 'border-slate-200 bg-white'}`} style={{ left: Math.min(pointer.x + 12, (mapRef.current?.clientWidth ?? 300) - 180), top: Math.max(12, pointer.y - 18) }}><p className="text-sm font-bold">{normalizeDistrict(hoveredDistrict)}</p><p className="mt-0.5 text-[10px] text-slate-500">{hoveredOption ? `${hoveredOption.recordCount.toLocaleString()} EC location records` : 'Boundary only · no matching EC records'}</p></div>}
          <div className={`absolute bottom-3 left-3 rounded-md border px-2.5 py-1.5 text-[10px] ${dark ? 'border-slate-700 bg-slate-950/90 text-slate-400' : 'border-slate-200 bg-white/90 text-slate-500'}`}>District boundaries: UBOS 2020 · Hierarchy: EC support data 2022</div>
        </div>

        <aside className={`flex min-h-0 flex-col border-t lg:border-l lg:border-t-0 ${dark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white'}`}>
          <div className={`border-b p-4 ${dark ? 'border-slate-800' : 'border-slate-200'}`}><div className="flex items-center justify-between gap-2"><div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Current level</p><h3 className="mt-1 font-bold">{LEVEL_LABELS[level]}</h3></div><span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-bold text-yellow-900">{level === 'village' ? pagination?.totalItems ?? 0 : items.length}</span></div><label className={`mt-3 flex items-center gap-2 rounded-lg border px-3 py-2 ${dark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-slate-50'}`}><Search size={14} className="text-slate-400" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder={`Find ${LEVEL_LABELS[level].toLowerCase()}…`} className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></label></div>
          {error && <div className="m-3 flex gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900"><AlertTriangle size={15} className="shrink-0" /><span>{error}</span></div>}
          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            {loading ? <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500"><Loader2 size={17} className="animate-spin" /> Loading hierarchy…</div> : filteredItems.length ? <div className="space-y-1.5">{filteredItems.map(item => <button key={item.id} onClick={() => selectItem(item)} className={`flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left transition ${selectedVillage?.id === item.id ? 'border-yellow-500 bg-yellow-100 text-slate-950' : dark ? 'border-slate-800 bg-slate-900 hover:border-yellow-600' : 'border-slate-200 bg-white hover:border-yellow-500 hover:bg-yellow-50'}`}><span className="min-w-0"><span className="block truncate text-xs font-bold">{item.name}</span>{item.needsVerification && <span className="text-[9px] font-semibold text-amber-600">Needs verification</span>}</span><span className="flex shrink-0 items-center gap-1 text-[10px] text-slate-500">{item.recordCount.toLocaleString()} <ChevronRight size={11} /></span></button>)}</div> : <div className="py-12 text-center text-xs text-slate-500">No matching records at this level.</div>}
          </div>
          {level === 'village' && pagination && pagination.totalPages > 1 && <div className={`flex items-center justify-between border-t p-3 text-xs ${dark ? 'border-slate-800' : 'border-slate-200'}`}><button disabled={page <= 1 || loading} onClick={() => void loadLevel('village', selection, page - 1)} className="rounded border px-3 py-1.5 disabled:opacity-40">Previous</button><span>Page {page.toLocaleString()} of {pagination.totalPages.toLocaleString()}</span><button disabled={page >= pagination.totalPages || loading} onClick={() => void loadLevel('village', selection, page + 1)} className="rounded border px-3 py-1.5 disabled:opacity-40">Next</button></div>}
          {selectedVillage && <div className={`border-t p-4 ${dark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-yellow-50'}`}><div className="flex items-center gap-2"><MapPin size={15} className="text-yellow-600" /><p className="text-sm font-bold">{selectedVillage.village}</p></div><p className="mt-2 text-[11px] leading-5 text-slate-500">{selectedVillage.parish} · {selectedVillage.subcounty}<br />{selectedVillage.constituency} · {selectedVillage.district}</p></div>}
        </aside>
      </div>
    </div>
  );
};

export default UgandaElectoralMap;
