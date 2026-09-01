import React, { useEffect, useMemo, useState } from 'react';
import { Theme, Shop, RegionalEconomicLevel, Country } from '../types';
import type { UgandaElectoralSummary } from '../electoral/types';
import { apiFetch } from '../src/services/api';
import AfricaMap from './AfricaMap';
import CountryDetailMap from './CountryDetailMap';
import CountryMapModal from './CountryMapModal';

interface CountriesMapPageProps {
    theme: Theme;
    shops: Shop[];
    regionalLevels: RegionalEconomicLevel[];
    countries?: Country[];
}

const CountriesMapPage: React.FC<CountriesMapPageProps> = ({ theme, shops, regionalLevels, countries }) => {
    const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
    const [doubleClickedCountry, setDoubleClickedCountry] = useState<{ id: string; name: string } | null>(null);
    const [ugandaSummary, setUgandaSummary] = useState<UgandaElectoralSummary | null>(null);

    useEffect(() => {
        let active = true;
        apiFetch('/api/electoral/uganda/summary')
            .then(response => response.json() as Promise<UgandaElectoralSummary>)
            .then(summary => { if (active) setUgandaSummary(summary); })
            .catch(() => undefined);
        return () => { active = false; };
    }, []);

    const coverageByCountry = useMemo(() => {
        const coverage: Record<string, { count: number; label: string }> = {};
        shops.forEach(shop => {
            const current = coverage[shop.countryCode]?.count ?? 0;
            coverage[shop.countryCode] = { count: current + 1, label: 'Registered shops' };
        });
        if (ugandaSummary) {
            coverage.UG = {
                count: ugandaSummary.normalizedTotals.villagesAndCells,
                label: 'EC villages & cells',
            };
        }
        return coverage;
    }, [shops, ugandaSummary]);

    const openCountry = (id: string, name: string) => {
        if (id === 'UG') {
            setDoubleClickedCountry({ id, name });
            return;
        }
        setSelectedCountryId(id);
    };

    return (
        <div className={`h-[calc(100vh-180px)] min-h-[500px] lg:min-h-[600px] w-full flex flex-col items-center justify-center p-4 rounded-xl relative overflow-hidden border ${theme === 'dark' ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-[#f5f5f9]'}`}>
            {/* Map Container */}
            <div className="relative w-full flex-1 min-h-0 flex items-center justify-center p-2">
                {selectedCountryId ? (
                    <CountryDetailMap 
                        countryId={selectedCountryId} 
                        shops={shops} 
                        theme={theme} 
                        onBack={() => setSelectedCountryId(null)} 
                    />
                ) : (
                    <AfricaMap 
                        shops={shops}
                        coverageByCountry={coverageByCountry}
                        regionalLevels={regionalLevels}
                        theme={theme}
                        countries={countries}
                        onCountryClick={openCountry}
                        onCountryDoubleClick={(id, name) => setDoubleClickedCountry({ id, name })}
                    />
                )}
            </div>

            {doubleClickedCountry && (
                <CountryMapModal
                    countryId={doubleClickedCountry.id}
                    countryName={doubleClickedCountry.name}
                    theme={theme}
                    onClose={() => setDoubleClickedCountry(null)}
                />
            )}
        </div>
    );
};

export default CountriesMapPage;
