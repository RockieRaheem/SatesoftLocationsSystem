import React, { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'motion/react';
import { countryDetailedMaps } from '../countryPaths';
import { Theme, Shop } from '../types';
import { ArrowLeft, Plus, Minus, Maximize2, RotateCcw } from 'lucide-react';
import CountryMapModal from './CountryMapModal';

const KAMPALA_DIVISIONS = [
  {
    name: "Kawempe Division",
    d: "M 250,15 C 245,30 240,15 220,20 C 190,30 180,50 180,70 L 125,90 L 140,180 L 165,215 L 195,210 L 210,175 L 245,140 L 275,160 L 285,115 Z",
    labelX: 205,
    labelY: 110
  },
  {
    name: "Rubaga Division",
    d: "M 165,215 L 140,180 L 125,90 L 180,70 C 120,110 60,160 20,220 C 0,250 10,270 45,290 L 85,360 C 120,380 160,375 195,365 L 210,280 L 180,275 L 195,240 Z",
    labelX: 115,
    labelY: 265
  },
  {
    name: "Central Division",
    d: "M 165,215 L 195,210 L 210,175 L 245,140 L 275,160 L 270,175 L 305,235 L 270,255 L 250,250 L 210,280 L 180,275 L 195,240 Z",
    labelX: 235,
    labelY: 220
  },
  {
    name: "Nakawa Division",
    d: "M 250,15 C 290,10 320,25 330,45 L 330,65 L 375,80 L 380,130 C 400,200 420,205 440,215 C 420,245 410,260 475,310 L 465,335 L 305,235 L 270,175 L 275,160 L 285,115 Z",
    labelX: 360,
    labelY: 180
  },
  {
    name: "Makindye Division",
    d: "M 305,235 L 465,335 L 375,520 C 340,490 300,440 270,400 L 195,365 L 210,280 L 250,250 L 270,255 Z",
    labelX: 320,
    labelY: 380
  }
];

const KAWEMPE_PARISHES = [
  {
    name: "Komamboga Parish",
    d: "M 180,70 L 220,20 L 250,15 L 235,60 L 195,65 Z",
    labelX: 215,
    labelY: 40,
    color: "sky-blue"
  },
  {
    name: "Kikaaya Parish",
    d: "M 250,15 L 285,115 L 245,110 L 235,60 Z",
    labelX: 255,
    labelY: 70,
    color: "sky-blue"
  },
  {
    name: "Kyebando Parish",
    d: "M 245,110 L 285,115 L 275,160 L 225,145 L 215,120 Z",
    labelX: 245,
    labelY: 130,
    color: "sky-blue"
  },
  {
    name: "Kawempe I Parish",
    d: "M 180,70 L 195,65 L 235,60 L 215,120 L 165,115 Z",
    labelX: 195,
    labelY: 85,
    color: "sky-blue"
  },
  {
    name: "Kawempe II Parish",
    d: "M 125,90 L 165,115 L 160,155 L 132,135 Z",
    labelX: 145,
    labelY: 120,
    color: "sky-blue"
  },
  {
    name: "Kazo-Muganzirwazza Parish",
    d: "M 132,135 L 160,155 L 180,150 L 140,180 Z",
    labelX: 152,
    labelY: 155,
    color: "sky-blue"
  },
  {
    name: "Bwaise I Parish",
    d: "M 165,115 L 215,120 L 225,145 L 180,150 L 160,155 Z",
    labelX: 190,
    labelY: 135,
    color: "sky-blue"
  },
  {
    name: "Bwaise II Parish",
    d: "M 140,180 L 180,150 L 175,185 L 150,195 Z",
    labelX: 160,
    labelY: 175,
    color: "sky-blue"
  },
  {
    name: "Bwaise III Parish",
    d: "M 180,150 L 225,145 L 210,175 L 175,185 Z",
    labelX: 195,
    labelY: 165,
    color: "sky-blue"
  },
  {
    name: "Mulago III Parish",
    d: "M 225,145 L 275,160 L 245,180 L 210,175 Z",
    labelX: 240,
    labelY: 162,
    color: "orange"
  },
  {
    name: "Mulago II Parish",
    d: "M 210,175 L 245,180 L 225,200 L 195,195 Z",
    labelX: 220,
    labelY: 188,
    color: "orange"
  },
  {
    name: "Mulago I Parish",
    d: "M 195,195 L 225,200 L 210,212 L 185,205 Z",
    labelX: 202,
    labelY: 202,
    color: "orange"
  },
  {
    name: "Makerere III Parish",
    d: "M 150,195 L 175,185 L 165,210 L 140,205 Z",
    labelX: 155,
    labelY: 200,
    color: "sky-blue"
  },
  {
    name: "Makerere II Parish",
    d: "M 168 220 L 220 220 L 205 240 L 160 245 Z",
    labelX: 188,
    labelY: 232,
    color: "sky-blue"
  },
  {
    name: "Wandegeya Parish",
    d: "M 160 245 L 205 240 L 195 250 L 175 250 Z",
    labelX: 185,
    labelY: 247,
    color: "sky-blue"
  }
];

const DAR_ES_SALAAM_LEVELS = [
  {
    name: "Kinondoni",
    type: "district",
    d: "M 280,270 L 265,273 L 255,270 L 230,275 L 200,280 L 180,240 L 170,180 L 150,150 L 135,110 L 160,85 L 180,75 L 210,65 L 240,60 L 245,65 L 235,100 L 220,110 L 240,115 L 255,105 L 270,115 L 285,130 L 315,160 L 330,150 L 342,130 L 350,110 L 358,105 L 362,110 L 365,130 L 355,160 L 345,185 L 335,215 L 325,235 L 310,240 L 300,250 L 290,260 Z",
    labelX: 230,
    labelY: 170,
    wards: [
      "M 170,180 L 210,210 L 240,190",
      "M 220,140 L 245,160 L 280,150",
      "M 250,110 L 270,130 L 300,120",
      "M 280,260 L 260,240 L 230,245",
      "M 320,200 L 340,180"
    ]
  },
  {
    name: "Ubungo",
    type: "district",
    d: "M 135,110 L 150,150 L 170,180 L 180,240 L 200,280 L 185,385 L 170,395 L 150,405 L 125,415 L 110,395 L 95,360 L 115,330 L 125,290 L 110,230 L 95,180 L 100,140 L 120,120 Z",
    labelX: 145,
    labelY: 300,
    wards: [
      "M 120,300 L 160,310 L 190,295",
      "M 110,330 L 150,340 L 180,330",
      "M 100,360 L 140,370 L 170,360"
    ]
  },
  {
    name: "Ilala",
    type: "district",
    d: "M 125,415 L 150,405 L 170,395 L 185,385 L 200,280 L 230,275 L 255,270 L 265,273 L 280,270 L 260,310 L 245,340 L 230,370 L 215,400 L 200,430 L 180,480 L 165,510 L 150,540 L 130,570 L 115,590 L 100,560 L 90,520 L 105,480 Z",
    labelX: 175,
    labelY: 485,
    wards: [
      "M 140,430 L 180,440 L 220,430",
      "M 155,450 L 190,465 L 230,450",
      "M 160,470 L 200,490 L 240,475",
      "M 145,530 L 185,525 L 215,510"
    ]
  },
  {
    name: "Temeke",
    type: "district",
    d: "M 280,270 L 260,310 L 245,340 L 230,370 L 215,400 L 200,430 L 180,480 L 165,510 L 150,540 L 130,570 L 115,590 L 130,600 L 160,610 L 190,615 L 210,610 L 235,595 L 255,570 L 270,550 L 290,490 L 310,430 L 320,380 L 305,340 L 290,305 Z",
    labelX: 250,
    labelY: 530,
    wards: [
      "M 255,310 L 275,315 L 285,335",
      "M 235,350 L 265,345 L 280,360",
      "M 275,375 L 305,370 L 330,385",
      "M 210,410 L 240,405 L 270,415",
      "M 190,460 L 220,450 L 250,465"
    ]
  },
  {
    name: "Kigamboni",
    type: "district",
    d: "M 280,270 L 290,305 L 305,340 L 320,380 L 310,430 L 290,490 L 270,550 L 290,560 L 320,580 L 350,600 L 370,620 L 390,635 L 415,645 L 430,630 L 450,610 L 470,580 L 490,540 L 515,490 L 525,440 L 515,390 L 490,360 L 460,340 L 420,315 L 380,295 L 350,285 L 320,275 Z",
    labelX: 410,
    labelY: 480,
    wards: [
      "M 320,340 L 360,345 L 400,335",
      "M 360,370 L 410,385 L 460,370",
      "M 380,450 L 430,465 L 480,455",
      "M 350,510 L 400,520 L 450,500"
    ]
  },
  {
    name: "CBD",
    type: "highlight-ward",
    d: "M 280,270 C 275,268 280,268 285,270 C 285,275 285,280 280,285 C 275,285 270,280 280,270 Z",
    labelX: 298,
    labelY: 268,
    dotX: 280,
    dotY: 270
  },
  {
    name: "Keko",
    type: "ward",
    d: "M 270,300 C 273,295 277,295 280,300 C 278,305 272,308 270,300 Z",
    labelX: 295,
    labelY: 298
  },
  {
    name: "Kurasini",
    type: "ward",
    d: "M 275,320 C 280,315 285,315 288,322 C 285,328 278,330 275,320 Z",
    labelX: 300,
    labelY: 320
  },
  {
    name: "Mbagala",
    type: "ward",
    d: "M 290,400 C 295,395 305,395 310,402 C 305,410 295,412 290,400 Z",
    labelX: 322,
    labelY: 402
  },
  {
    name: "Chamazi",
    type: "ward",
    d: "M 235,430 C 240,425 248,428 250,435 C 245,450 238,455 232,448 Z",
    labelX: 255,
    labelY: 442
  }
];

interface CountryDetailMapProps {
  countryId: string;
  shops: Shop[];
  theme: Theme;
  onBack: () => void;
}

const CountryDetailMap: React.FC<CountryDetailMapProps> = ({ countryId, shops, theme, onBack }) => {
  const mapData = countryDetailedMaps[countryId];
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [drillDownDistrict, setDrillDownDistrict] = useState<string | null>(null);
  const [drillDownDivision, setDrillDownDivision] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [modalConfig, setModalConfig] = useState<{
    countryId: string;
    countryName: string;
    initialLevel?: 'regions' | 'districts' | 'villages';
    initialRegion?: string | null;
    initialDistrict?: string | null;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  const handleRegionClick = (pathName: string) => {
    const cName = countryId === 'UG' ? 'Uganda' : (countryId === 'TZ' ? 'Tanzania' : countryId);
    
    const triggerOpen = () => {
      if (countryId === 'UG') {
        setModalConfig({
          countryId,
          countryName: cName,
          initialLevel: 'villages',
          initialDistrict: pathName
        });
      } else if (countryId === 'TZ') {
        if (pathName === 'Dar es Salaam') {
          setModalConfig({
            countryId,
            countryName: cName,
            initialLevel: 'villages',
            initialDistrict: 'Dar es Salaam'
          });
        } else {
          setModalConfig({
            countryId,
            countryName: cName,
            initialLevel: 'districts',
            initialRegion: pathName
          });
        }
      } else {
        setModalConfig({
          countryId,
          countryName: cName,
          initialLevel: 'districts',
          initialRegion: pathName
        });
      }
    };

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      // Trigger immediately on second tap of double click
      triggerOpen();
    } else {
      clickTimeoutRef.current = setTimeout(() => {
        triggerOpen();
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

  const countryShops = useMemo(() => {
    return shops.filter(shop => shop.countryCode === countryId);
  }, [shops, countryId]);

  if (!mapData) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <p className="text-slate-500 font-medium">Detailed map for this country is coming soon.</p>
        <button 
          onClick={onBack}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-slate-700 font-bold text-sm"
        >
          <ArrowLeft size={16} />
          <span>Back to Africa Map</span>
        </button>
      </div>
    );
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const project = (lat: number, lng: number) => {
    if (!mapData.geoViewBox) return { x: 0, y: 0 };
    const [minLon, maxLat, maxLon, minLat] = mapData.geoViewBox.split(' ').map(Number);
    
    const x = (lng - minLon) * (mapData.width / (maxLon - minLon));
    const y = (maxLat - lat) * (mapData.height / (maxLat - minLat));
    
    return { x, y };
  };

  const projectKampala = (lat: number, lng: number) => {
    const minLon = 32.50;
    const maxLon = 32.66;
    const minLat = 0.22;
    const maxLat = 0.42;
    
    const x = (lng - minLon) * (500 / (maxLon - minLon));
    const y = (maxLat - lat) * (580 / (maxLat - minLat));
    
    return { x, y };
  };

  return (
    <div 
      ref={containerRef}
      id="country-detail-container"
      className="relative w-full h-full overflow-hidden bg-transparent flex flex-col cursor-grab active:cursor-grabbing"
      onMouseMove={handleMouseMove}
    >
      <div className="absolute top-4 right-4 z-20 flex flex-col space-y-2">
        <button 
          onClick={
            drillDownDivision 
              ? () => { setDrillDownDivision(null); handleReset(); } 
              : (drillDownDistrict ? () => { setDrillDownDistrict(null); handleReset(); } : onBack)
          }
          id="back-to-africa-btn"
          className={`px-3 py-2 rounded-lg border backdrop-blur-md transition-all shadow-lg flex items-center space-x-2 text-xs font-bold ${
            theme === 'dark' 
              ? 'bg-slate-900/80 border-slate-700 text-white hover:bg-slate-800' 
              : 'bg-white/80 border-slate-200 text-slate-900 hover:bg-slate-50'
          }`}
          title={
            drillDownDivision 
              ? "Back to Kampala Map" 
              : (drillDownDistrict ? (countryId === 'TZ' ? "Back to Tanzania Map" : "Back to Country Map") : "Back to Africa Map")
          }
        >
          <ArrowLeft size={16} />
          <span>
            {drillDownDivision 
              ? "Kampala Map" 
              : (drillDownDistrict ? (countryId === 'TZ' ? "Tanzania Map" : "Country Map") : "Africa Map")}
          </span>
        </button>

        <div className={`flex flex-col border rounded-lg overflow-hidden shadow-lg ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <button 
            onClick={handleZoomIn}
            id="country-zoom-in-btn"
            className={`p-2 transition-colors ${theme === 'dark' ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-50 text-slate-600'} border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-100'}`}
            title="Zoom In"
          >
            <Plus size={18} />
          </button>
          <button 
            onClick={handleZoomOut}
            id="country-zoom-out-btn"
            className={`p-2 transition-colors ${theme === 'dark' ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-50 text-slate-600'} border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-100'}`}
            title="Zoom Out"
          >
            <Minus size={18} />
          </button>
          <button 
            onClick={handleReset}
            id="country-reset-view-btn"
            className={`p-2 transition-colors ${theme === 'dark' ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-50 text-slate-600'}`}
            title="Reset View"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 relative w-full h-full min-h-0 flex items-center justify-center p-6">
        <svg 
          id="country-svg-map"
          viewBox={
            drillDownDistrict === 'Kampala' 
              ? (drillDownDivision === 'Kawempe' ? "110 15 220 250" : "0 0 500 580") 
              : (drillDownDistrict === 'Dar es Salaam' ? "60 50 480 620" : `0 0 ${mapData.width} ${mapData.height}`)
          }
          className="max-w-full max-h-full"
          preserveAspectRatio="xMidYMid meet"
          style={{ filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.15))' }}
        >
          <motion.g
            id="country-transform-group"
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
            <g id="regions-group">
              {drillDownDistrict === 'Kampala' ? (
                drillDownDivision === 'Kawempe' ? (
                  KAWEMPE_PARISHES.map((parish, idx) => {
                    const isHovered = hoveredRegion === parish.name;
                    
                    // Colors as requested based on the image (Mulago in orange, others in custom theme-safe sky-blue)
                    let fillColor = theme === 'dark' ? '#0c4a6e' : '#bae6fd'; // sky-700 / sky-200
                    let strokeColor = theme === 'dark' ? '#0284c7' : '#0284c7'; // sky-600
                    if (parish.color === 'orange') {
                      fillColor = theme === 'dark' ? '#7c2d12' : '#fed7aa'; // orange-900 / orange-200
                      strokeColor = theme === 'dark' ? '#f97316' : '#f97316'; // orange-500
                    }

                    return (
                      <g key={`kawempe-parish-g-${idx}`}>
                        <motion.path
                          id={`parish-path-${idx}`}
                          d={parish.d}
                          fill={fillColor}
                          stroke={strokeColor}
                          strokeWidth="1.2"
                          initial={false}
                          animate={{
                            fill: isHovered 
                              ? (theme === 'dark' ? '#1e3a8a' : '#93c5fd') 
                              : fillColor,
                            stroke: isHovered ? '#025080' : strokeColor,
                            transition: { duration: 0.2 }
                          }}
                          onMouseEnter={() => setHoveredRegion(parish.name)}
                          onMouseLeave={() => setHoveredRegion(null)}
                          className="outline-none cursor-pointer"
                        />
                        <text
                          x={parish.labelX}
                          y={parish.labelY}
                          textAnchor="middle"
                          className={`text-[8px] font-black pointer-events-none select-none fill-current ${
                            theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
                          }`}
                          style={{ fontFamily: 'var(--font-sans)', letterSpacing: '0.02em', pointerEvents: 'none' }}
                        >
                          {parish.name.replace(" Parish", "")}
                        </text>
                        <text
                          x={parish.labelX}
                          y={parish.labelY + 8}
                          textAnchor="middle"
                          className={`text-[5px] font-bold tracking-widest pointer-events-none select-none opacity-60 fill-current ${
                            theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                          }`}
                          style={{ fontFamily: 'var(--font-sans)', pointerEvents: 'none' }}
                        >
                          PARISH
                        </text>
                      </g>
                    );
                  })
                ) : (
                  KAMPALA_DIVISIONS.map((division, idx) => {
                    const isHovered = hoveredRegion === division.name;
                    return (
                      <g key={`kampala-division-g-${idx}`}>
                        <motion.path
                          id={`division-path-${idx}`}
                          d={division.d}
                          fill={theme === 'dark' ? '#1e293b' : '#f1f5f9'}
                          stroke={theme === 'dark' ? '#334155' : '#cbd5e1'}
                          strokeWidth="1.2"
                          initial={false}
                          animate={{
                            fill: isHovered 
                              ? (division.name === "Kawempe Division" ? (theme === 'dark' ? '#1e3a8a' : '#dbeafe') : (theme === 'dark' ? '#334155' : '#e2e8f0')) 
                              : (theme === 'dark' ? '#1e293b' : '#f1f5f9'),
                            transition: { duration: 0.2 }
                          }}
                          onMouseEnter={() => setHoveredRegion(division.name)}
                          onMouseLeave={() => setHoveredRegion(null)}
                          onClick={() => {
                            if (division.name === "Kawempe Division") {
                               setDrillDownDivision("Kawempe");
                               handleReset();
                            }
                          }}
                          className="outline-none cursor-pointer"
                        />
                        <g 
                          className="cursor-pointer"
                          onClick={() => {
                            if (division.name === "Kawempe Division") {
                              setDrillDownDivision("Kawempe");
                              handleReset();
                            }
                          }}
                        >
                          <text
                            x={division.labelX}
                            y={division.labelY}
                            textAnchor="middle"
                            className={`text-[11px] font-bold select-none pointer-events-none fill-current ${
                              theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                            }`}
                            style={{ fontFamily: 'var(--font-sans)', letterSpacing: '0.04em' }}
                          >
                            {division.name.replace(" Division", "")}
                          </text>
                          <text
                            x={division.labelX}
                            y={division.labelY + 12}
                            textAnchor="middle"
                            className={`text-[8px] font-black tracking-widest select-none pointer-events-none opacity-50 fill-current ${
                              theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                            }`}
                            style={{ fontFamily: 'var(--font-sans)' }}
                          >
                            {division.name === "Kawempe Division" ? "EXPLORE PARISHES" : "DIVISION"}
                          </text>
                        </g>
                      </g>
                    );
                  })
                )
              ) : drillDownDistrict === 'Dar es Salaam' ? (
                DAR_ES_SALAAM_LEVELS.map((level, idx) => {
                  const isHovered = hoveredRegion === level.name;
                  const isDistrict = level.type === 'district';
                  const isCBD = level.type === 'highlight-ward';
                  
                  // Vectorized map: use only the borders and not the background colors!
                  // We use transparent or almost completely transparent fill (0.001 alpha) so pointer events / hovers still work nicely.
                  const fillColor = isHovered 
                    ? (theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)')
                    : 'rgba(255, 255, 255, 0.001)';

                  let strokeColor = theme === 'dark' ? '#94a3b8' : '#334155'; // crisp, high-contrast borders
                  let strokeWidth = isDistrict ? "2.0" : "1.0";
                  
                  if (isCBD) {
                    strokeColor = '#f97316'; // Orange-500 for CBD border
                    strokeWidth = "2.0";
                  } else if (level.type === 'ward') {
                    strokeColor = '#d97706'; // Gold/Amber border for highlighted wards
                    strokeWidth = "1.5";
                  }

                  return (
                    <g key={`dar-level-g-${idx}`} id={`dar-level-${level.name}`}>
                      {/* Sub-division ward lines inside district boundaries */}
                      {isDistrict && level.wards && level.wards.map((wardPath, wIdx) => (
                        <path
                          key={`ward-line-${wIdx}`}
                          d={wardPath}
                          fill="none"
                          stroke={theme === 'dark' ? '#334155' : '#cbd5e1'}
                          strokeWidth="0.8"
                          strokeDasharray="1 2"
                        />
                      ))}
                      
                      {/* Main Interactive boundary path */}
                      <motion.path
                        id={`dar-path-${idx}`}
                        d={level.d}
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth={isHovered ? (parseFloat(strokeWidth) + 0.6).toString() : strokeWidth}
                        initial={false}
                        animate={{
                          fill: fillColor,
                          transition: { duration: 0.15 }
                        }}
                        onMouseEnter={() => setHoveredRegion(level.name)}
                        onMouseLeave={() => setHoveredRegion(null)}
                        className="outline-none cursor-pointer"
                        style={{ strokeLinejoin: "round", strokeLinecap: "round" }}
                      />

                      {/* CBD center dot */}
                      {isCBD && level.dotX && level.dotY && (
                        <circle
                          cx={level.dotX}
                          cy={level.dotY}
                          r="4"
                          fill="#f97316"
                          stroke={theme === 'dark' ? '#0f172a' : '#ffffff'}
                          strokeWidth="1.5"
                          className="pointer-events-none"
                        />
                      )}

                      {/* Display text on hover or permanently for districts */}
                      {((isDistrict && !hoveredRegion) || isHovered) && (
                        <g className="pointer-events-none select-none">
                          <text
                            x={level.labelX}
                            y={level.labelY}
                            textAnchor="middle"
                            stroke={theme === 'dark' ? '#0f172a' : '#ffffff'}
                            strokeWidth="3.5"
                            strokeLinejoin="round"
                            className="text-[9px] font-black uppercase select-none pointer-events-none fill-none opacity-90"
                            style={{ fontFamily: 'var(--font-sans)', letterSpacing: '0.04em' }}
                          >
                            {level.name}
                          </text>
                          <text
                            x={level.labelX}
                            y={level.labelY}
                            textAnchor="middle"
                            className={`text-[9px] font-black uppercase select-none pointer-events-none fill-current ${
                              isHovered 
                                ? (isCBD ? 'text-orange-500' : 'text-yellow-500 font-extrabold') 
                                : (theme === 'dark' ? 'text-slate-300' : 'text-slate-700')
                            }`}
                            style={{ fontFamily: 'var(--font-sans)', letterSpacing: '0.04em' }}
                          >
                            {level.name}
                          </text>
                          
                          {/* Secondary type descriptor */}
                          <text
                            x={level.labelX}
                            y={level.labelY + 8}
                            textAnchor="middle"
                            className={`text-[6px] font-bold tracking-widest pointer-events-none select-none opacity-60 fill-current ${
                              theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                            }`}
                            style={{ fontFamily: 'var(--font-sans)' }}
                          >
                            {level.type === 'district' ? 'DISTRICT' : 'WARD'}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })
              ) : (
                mapData.paths.map((path, idx) => {
                  const isHovered = hoveredRegion === path.name;
                  const isKampala = countryId === 'UG' && path.name === 'Kampala';
                  const isDarEsSalaamRegion = countryId === 'TZ' && path.name === 'Dar es Salaam';
                  
                  let fillColor = theme === 'dark' ? '#1e293b' : '#f1f5f9';
                  let strokeColor = theme === 'dark' ? '#334155' : '#cbd5e1';

                  if (countryId === 'TZ') {
                    fillColor = theme === 'dark' ? '#111827' : '#f8fafc';
                    strokeColor = theme === 'dark' ? '#4b5563' : '#64748b';
                    if (isHovered) {
                      fillColor = theme === 'dark' ? '#1f2937' : '#f1f5f9';
                    }
                  }

                  return (
                    <g key={`${countryId}-region-${idx}`} className="outline-none">
                      <motion.path
                        id={`region-path-${idx}`}
                        d={path.d}
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth={countryId === 'TZ' ? (isHovered ? "2.0" : "1.2") : "0.5"}
                        initial={false}
                        animate={{
                          fill: isHovered 
                            ? (isKampala ? '#eab308' : fillColor) 
                            : fillColor,
                          transition: { duration: 0.2 }
                        }}
                        onMouseEnter={() => setHoveredRegion(path.name)}
                        onMouseLeave={() => setHoveredRegion(null)}
                        onClick={() => handleRegionClick(path.name)}
                        onDoubleClick={() => handleRegionClick(path.name)}
                        className={`outline-none ${(isKampala || isDarEsSalaamRegion) ? 'cursor-pointer' : ''}`}
                      />
                      {countryId === 'TZ' && path.labelX && path.labelY && isHovered && (
                        <g className="pointer-events-none select-none">
                          <text
                            x={path.labelX}
                            y={path.labelY}
                            textAnchor="middle"
                            stroke={theme === 'dark' ? '#0f172a' : '#ffffff'}
                            strokeWidth="4"
                            strokeLinejoin="round"
                            className="text-[8px] font-black select-none pointer-events-none fill-none"
                            style={{ fontFamily: 'var(--font-sans)', letterSpacing: '0.02em' }}
                          >
                            {path.name}
                          </text>
                          <text
                            x={path.labelX}
                            y={path.labelY}
                            textAnchor="middle"
                            className={`text-[8px] font-black select-none pointer-events-none fill-current ${
                              theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
                            }`}
                            style={{ fontFamily: 'var(--font-sans)', letterSpacing: '0.02em' }}
                          >
                            {path.name}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })
              )}

              {/* Indian Ocean label and custom cartographic features */}
              {drillDownDistrict === 'Dar es Salaam' && (
                <>
                  <g className="pointer-events-none select-none">
                    <text
                      x="480"
                      y="220"
                      textAnchor="middle"
                      className={`text-[9px] font-medium italic tracking-wide fill-current ${
                        theme === 'dark' ? 'text-sky-800' : 'text-sky-300'
                      }`}
                      style={{ fontFamily: 'var(--font-sans)' }}
                    >
                      Indian Ocean
                    </text>
                  </g>

                  {/* Aesthetic scale bar bottom-right */}
                  <g id="dar-scale" transform="translate(380, 580)" className="pointer-events-none select-none">
                    <path d="M 0,-4 L 0,0 L 60,0 L 60,-4 M 20,0 L 20,-4 M 40,0 L 40,-4" fill="none" stroke={theme === 'dark' ? '#94a3b8' : '#475569'} strokeWidth="1.2"/>
                    <text x="0" y="-8" textAnchor="middle" className={`text-[6px] font-mono ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>0</text>
                    <text x="20" y="-8" textAnchor="middle" className={`text-[6px] font-mono ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>7</text>
                    <text x="40" y="-8" textAnchor="middle" className={`text-[6px] font-mono ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>14</text>
                    <text x="60" y="-8" textAnchor="middle" className={`text-[6px] font-mono ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>28km</text>
                  </g>

                  {/* Aesthetic Map Legend bottom-left */}
                  <g id="dar-legend" transform="translate(80, 520)" className="pointer-events-none select-none">
                    <rect width="125" height="65" rx="6" fill={theme === 'dark' ? '#1e293b' : '#ffffff'} stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} strokeWidth="1" opacity="0.9"/>
                    
                    <text x="12" y="15" className={`text-[8px] font-extrabold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>Dar es Salaam</text>
                    
                    {/* District boundary icon */}
                    <rect x="12" y="24" width="12" height="6" rx="0.5" fill="none" stroke={theme === 'dark' ? '#475569' : '#94a3b8'} strokeWidth="1.5" />
                    <text x="30" y="29" className={`text-[7px] ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>District Boundary</text>
                    
                    {/* Ward boundary icon */}
                    <rect x="12" y="36" width="12" height="6" rx="0.5" fill="none" stroke={theme === 'dark' ? '#334155' : '#cbd5e1'} strokeWidth="1" strokeDasharray="1 1.5" />
                    <text x="30" y="41" className={`text-[7px] ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Ward Boundary</text>
                    
                    {/* Indian Ocean icon */}
                    <rect x="12" y="48" width="12" height="6" rx="0.5" fill="none" stroke={theme === 'dark' ? '#0369a1' : '#7dd3fc'} strokeWidth="1.2" />
                    <text x="30" y="53" className={`text-[7px] ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Indian Ocean</text>
                  </g>
                </>
              )}
            </g>
 
            {/* Shop Indicators */}
            <g id="country-shop-indicators" pointerEvents="none">
              {countryShops.map(shop => {
                const { x, y } = drillDownDistrict === 'Kampala'
                  ? projectKampala(shop.location.lat, shop.location.lng)
                  : project(shop.location.lat, shop.location.lng);
                return (
                  <motion.g key={shop.id} id={`shop-indicator-${shop.id}`}>
                    <motion.circle
                      cx={x}
                      cy={y}
                      r="4"
                      fill="#ef4444"
                      stroke="white"
                      strokeWidth="1.2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    />
                    <motion.circle
                      cx={x}
                      cy={y}
                      r="10"
                      fill="#ef4444"
                      initial={{ opacity: 0.3, scale: 0 }}
                      animate={{ opacity: 0, scale: 2 }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    />
                  </motion.g>
                );
              })}
            </g>
          </motion.g>
        </svg>
 
        <AnimatePresence>
          {hoveredRegion && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className={`absolute pointer-events-none z-50 p-2 rounded-lg shadow-xl border backdrop-blur-md ${
                theme === 'dark' 
                  ? 'bg-slate-900/90 border-slate-700 text-white' 
                  : 'bg-white/90 border-slate-200 text-slate-900'
              }`}
              style={{ 
                left: mousePos.x + 10, 
                top: mousePos.y - 10,
                transform: 'translate(0, -100%)'
              }}
            >
              <span className="font-bold text-xs uppercase tracking-widest flex flex-col items-start gap-0.5">
                <span>{hoveredRegion}</span>
                {hoveredRegion === 'Kampala' && !drillDownDistrict && (
                  <span className="text-[9px] text-yellow-500 font-extrabold normal-case font-mono animate-pulse mt-0.5">
                    Click to drill down divisions
                  </span>
                )}
                {hoveredRegion === 'Dar es Salaam' && !drillDownDistrict && (
                  <span className="text-[9px] text-yellow-500 font-extrabold normal-case font-mono animate-pulse mt-0.5">
                    Double-click to explore administrative levels
                  </span>
                )}
                {hoveredRegion === 'Kawempe Division' && !drillDownDivision && (
                  <span className="text-[9px] text-yellow-500 font-extrabold normal-case font-mono animate-pulse mt-0.5">
                    Click to drill down parishes
                  </span>
                )}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
 
      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 flex flex-col space-y-2">
        <div className={`p-2.5 rounded-lg border backdrop-blur-sm ${theme === 'dark' ? 'bg-slate-900/50 border-slate-700' : 'bg-white/50 border-slate-200'}`}>
          <div className="flex flex-col gap-1">
            <span className={`text-[9px] font-black uppercase tracking-widest opacity-70 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              {drillDownDivision === 'Kawempe' 
                ? "Kawempe Parishes Overview" 
                : (drillDownDistrict === 'Kampala' 
                  ? "Kampala Divisions Overview" 
                  : (drillDownDistrict === 'Dar es Salaam' 
                    ? "Dar es Salaam Admin Levels" 
                    : "Country Map Properties"))}
            </span>
            <div className="flex items-center space-x-3.5 mt-1">
              <div className="flex items-center space-x-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-500/50 animate-pulse" />
                <span className={`text-[10px] font-bold uppercase ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>Shop Location</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <div className={`w-3 h-3 rounded-md ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'} border border-slate-400`} />
                <span className={`text-[10px] font-bold uppercase ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                  {drillDownDivision === 'Kawempe' 
                    ? "Parish Territory" 
                    : (drillDownDistrict === 'Kampala' 
                      ? "Division Border" 
                      : (drillDownDistrict === 'Dar es Salaam' 
                        ? "Administrative Territory" 
                        : "District Territory"))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {modalConfig && (
        <CountryMapModal
          countryId={modalConfig.countryId}
          countryName={modalConfig.countryName}
          theme={theme}
          initialLevel={modalConfig.initialLevel}
          initialRegion={modalConfig.initialRegion}
          initialDistrict={modalConfig.initialDistrict}
          onClose={() => setModalConfig(null)}
        />
      )}
    </div>
  );
};

export default CountryDetailMap;
