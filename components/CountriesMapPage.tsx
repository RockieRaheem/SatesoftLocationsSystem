import React, { useState, useMemo } from 'react';
import { Theme, Shop, RegionalEconomicLevel, Country } from '../types';
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

    const shopDensity = useMemo(() => {
        const density: Record<string, number> = {};
        shops.forEach(shop => {
            density[shop.countryCode] = (density[shop.countryCode] || 0) + 1;
        });
        return density;
    }, [shops]);

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
                        shopDensity={shopDensity}
                        regionalLevels={regionalLevels}
                        theme={theme}
                        countries={countries}
                        onCountryClick={(id) => setSelectedCountryId(id)}
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
