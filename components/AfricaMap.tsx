import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Theme, Shop, RegionalEconomicLevel, Country } from '../types';
import { africaDetailedPaths, africaGeoViewBox, africaWidth, africaHeight } from '../africaPaths';
import { allAfricanCountries } from '../data';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'motion/react';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react';

interface AfricaMapProps {
  shops: Shop[];
  coverageByCountry: Record<string, { count: number; label: string; loading?: boolean }>;
  regionalLevels: RegionalEconomicLevel[];
  theme: Theme;
  countries?: Country[];
  onCountryClick?: (countryId: string, countryName: string) => void;
  onCountryDoubleClick?: (countryId: string, countryName: string) => void;
}

const AfricaMap: React.FC<AfricaMapProps> = ({ shops, coverageByCountry, regionalLevels, theme, countries, onCountryClick, onCountryDoubleClick }) => {
  const [hoveredCountry, setHoveredCountry] = useState<{ id: string, name: string, count: number, coverageLabel: string, loading?: boolean, color?: string } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  const handleCountryInteraction = (id: string, name: string) => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      onCountryDoubleClick?.(id, name);
    } else {
      clickTimeoutRef.current = setTimeout(() => {
        onCountryClick?.(id, name);
        clickTimeoutRef.current = null;
      }, 250);
    }
  };


  // Motion values for smooth panning
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Springs for smooth transitions
  const springX = useSpring(x, { stiffness: 300, damping: 30 });
  const springY = useSpring(y, { stiffness: 300, damping: 30 });
  const springScale = useSpring(scale, { stiffness: 300, damping: 30 });

  const handleZoomIn = () => setScale(prev => Math.min(prev * 1.5, 10));
  const handleZoomOut = () => setScale(prev => Math.max(prev / 1.5, 0.5));
  const handleReset = () => {
    setScale(1);
    x.set(0);
    y.set(0);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Handle mouse wheel zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey || e.shiftKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setScale(prev => Math.max(0.5, Math.min(10, prev * delta)));
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  const getCountryRegion = useMemo(() => {
    const countriesList = countries && countries.length > 0 ? countries : allAfricanCountries;
    return (countryName: string): string | null => {
      // 1. Check dynamic list (ignoring case)
      const dynamicCountry = countriesList.find(c => c.name.toLowerCase() === countryName.toLowerCase());
      if (dynamicCountry) {
        const zones = dynamicCountry.economicZones || [];
        for (const zone of zones) {
          const normalized = zone.trim().toLowerCase();
          if (normalized === 'northern africa' || normalized === 'norther africa') return 'Northern Africa';
          if (normalized === 'western africa') return 'Western Africa';
          if (normalized === 'southern africa') return 'Southern Africa';
          if (normalized === 'central africa') return 'Central Africa';
          if (normalized === 'eastern africa') return 'Eastern Africa';
        }
      }

      // 2. Fallback to standard UN subregions
      const nameLower = countryName.toLowerCase();
      
      // Northern Africa
      if ([
        'egypt', 'libya', 'tunisia', 'algeria', 'morocco', 'sudan', 'western sahara', 'mauritania'
      ].includes(nameLower)) {
        return 'Northern Africa';
      }
      
      // Western Africa
      if ([
        'nigeria', 'niger', 'burkina faso', 'mali', 'senegal', 'gambia', 'guinea', 'guinea-bissau',
        'sierra leone', 'liberia', "côte d'ivoire", 'ghana', 'togo', 'benin', 'cape verde', 'cabo verde', 'cote d\'ivoire'
      ].includes(nameLower)) {
        return 'Western Africa';
      }
      
      // Central Africa
      if ([
        'chad', 'central african republic', 'cameroon', 'gabon', 'congo', 'republic of congo',
        'democratic republic of congo', 'democratic republic of the congo', 'dr congo', 'angola', 'equatorial guinea', 'sao tome and principe'
      ].includes(nameLower)) {
        return 'Central Africa';
      }
      
      // Eastern Africa
      if ([
        'uganda', 'kenya', 'tanzania', 'rwanda', 'burundi', 'somalia', 'djibouti', 'eritrea', 'ethiopia',
        'south sudan', 'seychelles', 'reunion', 'madagascar', 'mozambique', 'malawi', 'zambia', 'zimbabwe',
        'comoros', 'mauritius'
      ].includes(nameLower)) {
        return 'Eastern Africa';
      }
      
      // Southern Africa
      if ([
        'south africa', 'namibia', 'botswana', 'lesotho', 'eswatini', 'swaziland'
      ].includes(nameLower)) {
        return 'Southern Africa';
      }
      
      return null;
    };
  }, [countries]);

  const activeRegions = useMemo(() => {
    const list = countries && countries.length > 0 ? countries : allAfricanCountries;
    const active = new Set<string>();
    list.forEach(c => {
      (c.economicZones || []).forEach(zone => {
        const normalized = zone.trim().toLowerCase();
        if (normalized === 'northern africa' || normalized === 'norther africa') active.add('Northern Africa');
        if (normalized === 'western africa') active.add('Western Africa');
        if (normalized === 'southern africa') active.add('Southern Africa');
        if (normalized === 'central africa') active.add('Central Africa');
        if (normalized === 'eastern africa') active.add('Eastern Africa');
      });
    });
    return active;
  }, [countries]);

  const groupedCountryPaths = useMemo(() => {
    const groups: Record<string, typeof africaDetailedPaths> = {
      'Northern Africa': [],
      'Western Africa': [],
      'Central Africa': [],
      'Eastern Africa': [],
      'Southern Africa': [],
      'unassigned': []
    };

    africaDetailedPaths.forEach(country => {
      const region = getCountryRegion(country.name);
      if (region && groups[region]) {
        groups[region].push(country);
      } else {
        groups['unassigned'].push(country);
      }
    });

    return groups;
  }, [countries, getCountryRegion]);

  const maxDensity = useMemo(() => {
    const values = Object.values(coverageByCountry).map(item => item.count);
    return values.length > 0 ? Math.max(...values) : 1;
  }, [coverageByCountry]);

  const colorScale = (density: number, countryName: string) => {
    // Check if country belongs to a region with a custom color
    const region = regionalLevels.find(rl => rl.countries.includes(countryName));
    if (region && region.color) {
      return region.color;
    }

    if (density === 0) {
      return theme === 'dark' ? '#1e293b' : '#f1f5f9';
    }
    const intensity = Math.max(0.2, Math.min(1, density / maxDensity));
    if (theme === 'dark') {
      return `rgba(234, 179, 8, ${intensity})`; // yellow-500
    }
    return `rgba(202, 138, 4, ${intensity})`; // yellow-600
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  // Projection for the dots (calibrated for the vectorized map)
  const project = (lat: number, lng: number) => {
    const [minLon, maxLat, maxLon, minLat] = africaGeoViewBox.split(' ').map(Number);
    
    const svgMinX = 0;
    const svgMinY = 0;
    const svgWidth = 239.05701;
    const svgHeight = 217.31789;

    const x = svgMinX + (lng - minLon) * (svgWidth / (maxLon - minLon));
    const y = svgMinY + (maxLat - lat) * (svgHeight / (maxLat - minLat));
    
    return { x, y };
  };

  return (
    <div 
      ref={containerRef}
      id="africa-map-container"
      className={`relative w-full transition-all duration-500 ease-in-out overflow-hidden bg-transparent cursor-grab active:cursor-grabbing ${isExpanded ? 'h-[80vh]' : 'h-full'} flex items-center justify-center p-2`}
      onMouseMove={handleMouseMove}
    >
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col space-y-2">
        <div className={`flex flex-col border rounded-lg overflow-hidden shadow-lg ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <button 
            onClick={handleZoomIn}
            id="zoom-in-btn"
            className={`p-2 transition-colors ${theme === 'dark' ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-50 text-slate-600'} border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-100'}`}
            title="Zoom In"
          >
            <ZoomIn size={18} />
          </button>
          <button 
            onClick={handleZoomOut}
            id="zoom-out-btn"
            className={`p-2 transition-colors ${theme === 'dark' ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-50 text-slate-600'} border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-100'}`}
            title="Zoom Out"
          >
            <ZoomOut size={18} />
          </button>
          <button 
            onClick={handleReset}
            id="reset-view-btn"
            className={`p-2 transition-colors ${theme === 'dark' ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-50 text-slate-600'} border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-100'}`}
            title="Reset View"
          >
            <RotateCcw size={18} />
          </button>
          <button 
            onClick={toggleExpand}
            id="toggle-expand-btn"
            className={`p-2 transition-colors ${theme === 'dark' ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-50 text-slate-600'}`}
            title={isExpanded ? "Collapse Map" : "Expand Map"}
          >
            <Maximize2 size={18} className={isExpanded ? "rotate-180" : ""} />
          </button>
        </div>
      </div>

      <svg 
        id="africa-svg-map"
        viewBox="0 0 239.05701 217.31789" 
        className="max-w-full max-h-full"
        preserveAspectRatio="xMidYMid meet"
        style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))', overflow: 'visible' }}
      >
        <motion.g
          id="map-transform-group"
          style={{ 
            x: springX,
            y: springY,
            scale: springScale,
            transformOrigin: 'center'
          }}
          drag
          dragMomentum={true}
          dragElastic={0.05}
        >
          <g id="countries-group">
            {/* First render ALL inactive regions in the background (only thin borders) */}
            {(() => {
              const allRegionNames = ['Northern Africa', 'Western Africa', 'Central Africa', 'Eastern Africa', 'Southern Africa', 'unassigned'];
              const inactiveRegionNames = allRegionNames.filter(r => !activeRegions.has(r));
              const activeRegionNames = allRegionNames.filter(r => activeRegions.has(r));

              return (
                <>
                  {/* Step 1: Render all inactive countries */}
                  {inactiveRegionNames.map(regionName => {
                    const countriesInThisRegion = groupedCountryPaths[regionName] || [];
                    return (
                      <g key={regionName} id={`inactive-region-group-${regionName.replace(/\s+/g, '-').toLowerCase()}`}>
                        {countriesInThisRegion.map(country => {
                          const countryId = (country as any).countryId || country.id;
                          const coverage = coverageByCountry[countryId] ?? { count: 0, label: 'Mapped locations' };
                          const density = coverage.count;
                          const isHovered = hoveredCountry?.id === country.id;
                          const baseColor = colorScale(density, country.name);

                          return (
                            <motion.path
                              key={country.id}
                              id={`country-path-${country.id}`}
                              d={country.d}
                              fill={baseColor}
                              stroke={theme === 'dark' ? '#334155' : '#cbd5e1'}
                              strokeWidth="0.5"
                              initial={false}
                              animate={{
                                fill: isHovered ? (theme === 'dark' ? '#f59e0b' : '#d97706') : baseColor,
                                stroke: isHovered ? 'transparent' : (theme === 'dark' ? '#334155' : '#cbd5e1'),
                                strokeWidth: isHovered ? 0 : 0.5,
                                scale: isHovered ? 1.01 : 1,
                                transition: { duration: 0.2 }
                              }}
                              onMouseEnter={() => setHoveredCountry({ id: country.id, name: country.name, count: density, coverageLabel: coverage.label, loading: coverage.loading, color: baseColor })}
                              onMouseLeave={() => setHoveredCountry(null)}
                              onClick={() => {
                                const normalizedId = countryId.split('-')[0];
                                handleCountryInteraction(normalizedId, country.name);
                              }}
                              onDoubleClick={() => {
                                const normalizedId = countryId.split('-')[0];
                                handleCountryInteraction(normalizedId, country.name);
                              }}
                              className="cursor-pointer outline-none"
                              style={{ transformOrigin: 'center', transformBox: 'fill-box' }}
                            />
                          );
                        })}
                      </g>
                    );
                  })}

                  {/* Step 2: Render all active countries normally on top (making borders beautifully normal vector lines!) */}
                  {activeRegionNames.map(regionName => {
                    const countriesInThisRegion = groupedCountryPaths[regionName] || [];
                    return (
                      <g 
                        key={regionName} 
                        id={`active-region-group-${regionName.replace(/\s+/g, '-').toLowerCase()}`}
                      >
                        {countriesInThisRegion.map(country => {
                          const countryId = (country as any).countryId || country.id;
                          const coverage = coverageByCountry[countryId] ?? { count: 0, label: 'Mapped locations' };
                          const density = coverage.count;
                          const isHovered = hoveredCountry?.id === country.id;
                          const baseColor = colorScale(density, country.name);

                          return (
                            <motion.path
                              key={country.id}
                              id={`country-path-${country.id}`}
                              d={country.d}
                              fill={baseColor}
                              stroke={theme === 'dark' ? '#334155' : '#cbd5e1'}
                              strokeWidth="0.5"
                              initial={false}
                              animate={{
                                fill: isHovered ? (theme === 'dark' ? '#f59e0b' : '#d97706') : baseColor,
                                stroke: isHovered ? 'transparent' : (theme === 'dark' ? '#334155' : '#cbd5e1'),
                                strokeWidth: isHovered ? 0 : 0.5,
                                scale: isHovered ? 1.01 : 1,
                                transition: { duration: 0.2 }
                              }}
                              onMouseEnter={() => setHoveredCountry({ id: country.id, name: country.name, count: density, coverageLabel: coverage.label, loading: coverage.loading, color: baseColor })}
                              onMouseLeave={() => setHoveredCountry(null)}
                              onClick={() => {
                                const normalizedId = countryId.split('-')[0];
                                handleCountryInteraction(normalizedId, country.name);
                              }}
                              onDoubleClick={() => {
                                const normalizedId = countryId.split('-')[0];
                                handleCountryInteraction(normalizedId, country.name);
                              }}
                              className="cursor-pointer outline-none"
                              style={{ transformOrigin: 'center', transformBox: 'fill-box' }}
                            />
                          );
                        })}
                      </g>
                    );
                  })}
                </>
              );
            })()}
          </g>


      </motion.g>
    </svg>

      <AnimatePresence>
        {hoveredCountry && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            id="country-tooltip"
            className={`absolute pointer-events-none z-50 p-3 rounded-xl shadow-2xl border backdrop-blur-md ${
              theme === 'dark' 
                ? 'bg-slate-900/90 border-slate-700 text-white' 
                : 'bg-white/90 border-slate-200 text-slate-900'
            }`}
            style={{ 
              left: mousePos.x, 
              top: mousePos.y - 20,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="flex flex-col space-y-1">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-bold uppercase tracking-wider opacity-60">{hoveredCountry.name}</span>
                {hoveredCountry.color && (
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: hoveredCountry.color }} />
                )}
              </div>
              
              {regionalLevels.find(rl => rl.countries.includes(hoveredCountry.name)) && (
                <div className="flex items-center space-x-1 mb-1">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${theme === 'dark' ? 'bg-slate-800 text-yellow-500' : 'bg-yellow-50 text-yellow-700'}`}>
                    {regionalLevels.find(rl => rl.countries.includes(hoveredCountry.name))?.abbreviation}
                  </span>
                </div>
              )}

              <div className="flex items-baseline space-x-1">
                <span className="text-lg font-black">{hoveredCountry.loading ? '—' : hoveredCountry.count.toLocaleString()}</span>
                <span className="text-[10px] uppercase font-bold opacity-60">{hoveredCountry.coverageLabel}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 flex flex-col space-y-2 z-20">
        <div id="map-legend" className={`p-3 rounded-lg border backdrop-blur-sm shadow-lg ${theme === 'dark' ? 'bg-slate-900/80 border-slate-700' : 'bg-white/80 border-slate-200'}`}>
          <div className="flex flex-col space-y-1">
            <span className={`text-[8px] font-bold uppercase ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Mapped coverage</span>
            <div className="flex h-1.5 w-32 rounded-full overflow-hidden">
              <div className="flex-1 bg-yellow-100" />
              <div className="flex-1 bg-yellow-300" />
              <div className="flex-1 bg-yellow-500" />
              <div className="flex-1 bg-yellow-700" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AfricaMap;
