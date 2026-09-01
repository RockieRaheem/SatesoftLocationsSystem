import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'motion/react';
import { 
  X, Loader2, Download, Maximize2, Minimize2, ZoomIn, ZoomOut, 
  RotateCcw, Plus, Minus, MapPin, Building2, Map, Users, ChevronRight,
  TrendingUp, Compass, Calendar, ArrowLeft, RefreshCw, BarChart2
} from 'lucide-react';
import { Theme } from '../types';
import { countryDetailedMaps } from '../countryPaths';
import { africaDetailedPaths } from '../africaPaths';
import UgandaElectoralMap from './UgandaElectoralMap';

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
    d: "M 280,270 L 260,310 L 245,340 L 230,370 L 215,400 L 200,430 C 190,460 170,510 150,550 C 130,570 115,590 130,600 L 160,610 L 190,615 L 210,610 L 235,595 L 255,570 L 270,550 C 290,530 310,490 330,450 C 350,420 330,340 320,340 Z",
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

interface CountryMapModalProps {
  countryId: string;
  countryName: string;
  theme: Theme;
  onClose: () => void;
  initialLevel?: 'regions' | 'districts' | 'villages';
  initialRegion?: string | null;
  initialDistrict?: string | null;
}

interface ParsedPath {
  d: string;
  id: string;
  name: string;
  labelX?: number;
  labelY?: number;
}

const GenericCountryMapModal: React.FC<CountryMapModalProps> = ({
  countryId, 
  countryName, 
  theme, 
  onClose,
  initialLevel,
  initialRegion,
  initialDistrict
}) => {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [scale, setScale] = useState(1);
  
  // Drill-down states
  const [currentLevel, setCurrentLevel] = useState<'regions' | 'districts' | 'villages'>('regions');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedDivision, setSelectedDivision] = useState<string | null>(null);
  const [selectedVillage, setSelectedVillage] = useState<{ id: string; name: string } | null>(null);
  const [showVillageDetails, setShowVillageDetails] = useState(false);
  const [hoveredEntity, setHoveredEntity] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef<number>(0);

  // Motion values for smooth panning and zooming
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
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

  const handleBack = () => {
    if (selectedDivision) {
      setSelectedDivision(null);
      handleReset();
    } else if (currentLevel === 'villages') {
      setCurrentLevel('districts');
      setSelectedDistrict(null);
      setSelectedVillage(null);
      setScale(2.2);
      x.set(-50);
      y.set(-50);
    } else if (currentLevel === 'districts') {
      setCurrentLevel('regions');
      setSelectedRegion(null);
      setScale(1);
      x.set(0);
      y.set(0);
      setSelectedDistrict(null);
      setSelectedVillage(null);
    } else {
      onClose();
    }
  };

  // Setup hierarchical regions/districts/villages dynamically
  const adminHierarchy = useMemo(() => {
    // Uganda custom real data
    if (countryId === 'UG') {
      return {
        regions: [
          { id: 'UG-1', name: 'Central' },
          { id: 'UG-2', name: 'Western' },
          { id: 'UG-3', name: 'Eastern' },
          { id: 'UG-4', name: 'Northern' }
        ],
        districtsByRegion: {
          'Central': [
            { id: 'UG-11', name: 'Kampala' },
            { id: 'UG-12', name: 'Mukono' },
            { id: 'UG-13', name: 'Wakiso' }
          ],
          'Western': [
            { id: 'UG-21', name: 'Mbarara' },
            { id: 'UG-22', name: 'Fort Portal' },
            { id: 'UG-23', name: 'Kabale' }
          ],
          'Eastern': [
            { id: 'UG-31', name: 'Jinja' },
            { id: 'UG-32', name: 'Mbale' },
            { id: 'UG-33', name: 'Soroti' }
          ],
          'Northern': [
            { id: 'UG-41', name: 'Gulu' },
            { id: 'UG-42', name: 'Lira' },
            { id: 'UG-43', name: 'Arua' }
          ]
        } as Record<string, { id: string; name: string }[]>,
        villagesByDistrict: {
          'Kampala': [
            { id: 'UG-111', name: 'Nakasero' },
            { id: 'UG-112', name: 'Kalamu' },
            { id: 'UG-113', name: 'Kololo' }
          ],
          'Mukono': [
            { id: 'UG-121', name: 'Kiwanga' },
            { id: 'UG-122', name: 'Seeta' },
            { id: 'UG-123', name: 'Goma' }
          ],
          'Wakiso': [
            { id: 'UG-131', name: 'Entebbe' },
            { id: 'UG-132', name: 'Kira' },
            { id: 'UG-133', name: 'Kasangati' }
          ]
        } as Record<string, { id: string; name: string }[]>
      };
    }

    // Procedural organic fallback for all other countries: Kenya (KE), Nigeria (NG), Angola (AO), etc.
    const regions = [
      { id: `${countryId}-1`, name: 'Capital Territory' },
      { id: `${countryId}-2`, name: 'Coastal Province' },
      { id: `${countryId}-3`, name: 'Highlands Region' },
      { id: `${countryId}-4`, name: 'Northern Plains' }
    ];

    const districtsByRegion: Record<string, { id: string; name: string }[]> = {};
    regions.forEach((r, idx) => {
      districtsByRegion[r.name] = [
        { id: `${countryId}-${idx}1`, name: `${r.name} Central` },
        { id: `${countryId}-${idx}2`, name: `${r.name} East` },
        { id: `${countryId}-${idx}3`, name: `${r.name} West` }
      ];
    });

    const villagesByDistrict: Record<string, { id: string; name: string }[]> = {};
    Object.values(districtsByRegion).flat().forEach((d, idx) => {
      villagesByDistrict[d.name] = [
        { id: `${countryId}-${idx}11`, name: `${d.name.replace(' Central', '').replace(' East', '').replace(' West', '')} Green Valley` },
        { id: `${countryId}-${idx}12`, name: `Upper ${d.name.split(' ')[0]}` },
        { id: `${countryId}-${idx}13`, name: `Lower ${d.name.split(' ')[0]}` }
      ];
    });

    return { regions, districtsByRegion, villagesByDistrict };
  }, [countryId]);

  // Map initial selections/levels passed from parent click
  useEffect(() => {
    if (initialDistrict) {
      setSelectedDistrict(initialDistrict);
      setCurrentLevel('villages');
      
      // Find region of this district to keep hierarchy consistent
      let foundRegion: string | null = null;
      for (const [regionName, districts] of Object.entries(adminHierarchy.districtsByRegion)) {
        if (districts.some(d => d.name.toLowerCase() === initialDistrict.toLowerCase())) {
          foundRegion = regionName;
          break;
        }
      }
      if (foundRegion) {
        setSelectedRegion(foundRegion);
      }
      
      // Handle zoom and pan
      setScale(1.2);
      x.set(-30);
      y.set(-30);
    } else if (initialRegion) {
      setSelectedRegion(initialRegion);
      setCurrentLevel('districts');
      setScale(2.2);
      x.set(-50);
      y.set(-50);
    }
  }, [initialDistrict, initialRegion, adminHierarchy, countryId]);

  // Handle double clicks / double taps to trigger the metrics card
  const handleEntityDoubleTap = (village: { id: string; name: string }) => {
    setSelectedVillage(village);
    setShowVillageDetails(true);
  };

  const handleEntitySingleClick = (entityName: string) => {
    setHoveredEntity(entityName);
    
    // Check if clicking level 1 to go to 2
    if (currentLevel === 'regions') {
      const matchedRegion = adminHierarchy.regions.find(r => r.name.toLowerCase() === entityName.toLowerCase());
      if (matchedRegion) {
        setSelectedRegion(matchedRegion.name);
        setCurrentLevel('districts');
        setScale(2.2);
        x.set(-50);
        y.set(-50);
      } else {
        // Fallback for click matching
        setSelectedRegion(entityName);
        setCurrentLevel('districts');
        setScale(2.2);
      }
    } 
    // Check if clicking level 2 to go to 3
    else if (currentLevel === 'districts') {
      const regionDistricts = adminHierarchy.districtsByRegion[selectedRegion || ''] || [];
      const matchedDistrict = regionDistricts.find(d => d.name.toLowerCase() === entityName.toLowerCase());
      if (matchedDistrict) {
        setSelectedDistrict(matchedDistrict.name);
        setCurrentLevel('villages');
        setScale(4.5);
        x.set(-150);
        y.set(-100);
      } else {
        // Fallback
        setSelectedDistrict(entityName);
        setCurrentLevel('villages');
        setScale(4.5);
      }
    }
  };

  // Universal tap detector supporting both clicks and touch gestures
  const handleTapGesture = (entity: { id: string; name: string }, type: 'region' | 'district' | 'village') => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapRef.current;
    
    if (tapLength < 300 && tapLength > 0) {
      // Double click / Double tap handler
      if (type === 'village') {
        handleEntityDoubleTap(entity);
      } else {
        // If they double tap region or district, open and skip directly
        handleEntitySingleClick(entity.name);
      }
    } else {
      // Single Click / Single tap handler
      if (type === 'village') {
        setSelectedVillage(entity);
      } else {
        handleEntitySingleClick(entity.name);
      }
    }
    
    lastTapRef.current = currentTime;
  };

  // Slugify country names for fetch
  const slugify = (text: string) => {
    const overrides: Record<string, string> = {
      "Côte d'Ivoire": "cote-divoire",
      "Democratic Republic of Congo": "democratic-republic-of-congo",
      "Republic of Congo": "republic-of-congo",
      "Central African Republic": "central-african-republic",
      "Western Sahara": "western-sahara",
      "South Africa": "south-africa",
      "South Sudan": "south-sudan",
      "Equatorial Guinea": "equatorial-guinea",
      "Sierra Leone": "sierra-leone",
      "Burkina Faso": "burkina-faso",
      "Cape Verde": "cape-verde",
      "Sao Tome and Principe": "sao-tome-and-principe",
      "Guinea-Bissau": "guinea-bissau"
    };

    if (overrides[text]) return overrides[text];

    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Parse paths from fetched dynamic SVG
  const parsedPaths = useMemo<ParsedPath[]>(() => {
    if (countryId === 'UG') {
      const uganda = africaDetailedPaths.find(country => country.countryId === 'UG');
      return uganda ? [{ d: uganda.d, id: 'UG-outline', name: 'Uganda' }] : [];
    }
    const localMap = countryDetailedMaps[countryId];
    if (localMap) {
      return localMap.paths.map((p, index) => ({
        d: p.d,
        id: `${countryId}-region-${index}`,
        name: p.name,
        labelX: p.labelX,
        labelY: p.labelY
      }));
    }

    if (!svgContent) return [];
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgContent, "image/svg+xml");
      const pathElements = doc.querySelectorAll("path");
      const result: ParsedPath[] = [];
      pathElements.forEach((pathNode, idx) => {
        const d = pathNode.getAttribute("d") || "";
        const id = pathNode.getAttribute("id") || pathNode.getAttribute("data-id") || `${countryId}-region-${idx}`;
        const name = pathNode.getAttribute("name") || pathNode.getAttribute("title") || pathNode.getAttribute("data-name") || id;
        if (d) {
          result.push({ d, id, name });
        }
      });
      return result;
    } catch (e) {
      console.error("Error parsing SVG", e);
      return [];
    }
  }, [svgContent, countryId]);

  // Fetch or Load Map
  useEffect(() => {
    const localMap = countryDetailedMaps[countryId];
    if (localMap || countryId === 'UG') {
      setLoading(false);
      setError(null);
    } else {
      const fetchSvg = async () => {
        setLoading(true);
        setError(null);
        try {
          const slug = slugify(countryName);
          const url = `https://mapsvg.com/maps/geo-calibrated/${slug}.svg`;
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Failed to fetch map for ${countryName}`);
          }
          const text = await response.text();
          setSvgContent(text);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
          setLoading(false);
        }
      };

      fetchSvg();
    }
  }, [countryName, countryId]);

  // Calculate dynamic responsive SVG viewBox
  const viewBox = useMemo(() => {
    if (countryId === 'UG' && selectedDistrict === 'Kampala' && currentLevel === 'villages') {
      return selectedDivision === 'Kawempe' ? "110 15 220 250" : "0 0 500 580";
    }
    if (countryId === 'TZ' && selectedDistrict === 'Dar es Salaam') {
      return "60 50 480 620";
    }
    if (countryId === 'UG') {
      return "154 103 20 25";
    }
    const localMap = countryDetailedMaps[countryId];
    if (localMap) {
      return `0 0 ${localMap.width} ${localMap.height}`;
    }
    
    if (svgContent) {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgContent, "image/svg+xml");
        const svgElement = doc.querySelector("svg");
        const vb = svgElement?.getAttribute("viewBox");
        if (vb) return vb;
        
        const width = svgElement?.getAttribute("width") || "1000";
        const height = svgElement?.getAttribute("height") || "1000";
        return `0 0 ${width} ${height}`;
      } catch (e) {
        return "0 0 1000 1000";
      }
    }
    return "0 0 1000 1000";
  }, [svgContent, countryId]);

  // Set default scroll wheel magnification
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

  // UI listings based on active level
  const activeLevelEntities = useMemo(() => {
    if (selectedDivision === 'Kawempe') {
      return KAWEMPE_PARISHES.map(p => ({ id: p.name, name: p.name }));
    }
    if (currentLevel === 'regions') {
      return adminHierarchy.regions;
    } else if (currentLevel === 'districts') {
      return adminHierarchy.districtsByRegion[selectedRegion || ''] || [];
    } else {
      if (selectedDistrict === 'Kampala') {
        return KAMPALA_DIVISIONS.map(d => ({ id: d.name, name: d.name }));
      }
      return adminHierarchy.villagesByDistrict[selectedDistrict || ''] || [];
    }
  }, [currentLevel, selectedRegion, selectedDistrict, selectedDivision, adminHierarchy]);

  // Generate dynamic stats to mock deep geographical records
  const dynamicMappedStats = useMemo(() => {
    const seed = selectedVillage ? selectedVillage.id.length : selectedDistrict ? selectedDistrict.length : selectedRegion ? selectedRegion.length : 12;
    const activeContributors = Math.max(2, (seed % 5) + 1);
    const activeSellers = Math.max(12, (seed * 14) % 190);
    const mockVolume = (seed * 115000) % 950000 + 400000;
    const density = ((seed * 3) % 12) + 2;
    
    return {
      activeContributors,
      activeSellers,
      mockVolume,
      density,
      syncProgress: "100% Synced"
    };
  }, [selectedRegion, selectedDistrict, selectedVillage]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className={`relative w-full max-w-6xl ${isFullScreen ? 'h-[95vh]' : 'h-[85vh]'} rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col ${
            theme === 'dark' ? 'bg-slate-950 border border-slate-800' : 'bg-slate-50 border border-slate-200'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-4 sm:p-5 border-b shrink-0 ${theme === 'dark' ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-white'}`}>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 bg-yellow-500/10 text-yellow-500 rounded-lg shrink-0">
                  <Map className="w-4 h-4" />
                </span>
                <h2 className={`text-xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {selectedDistrict === 'Kampala' ? "Kampala Division Mapping" : `${countryName} Village Mapping`}
                </h2>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest opacity-65 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                {selectedDistrict === 'Kampala' ? "Interactive Divisions in Kampala & Administrative Boundaries" : "Interactive Local Administrative Levels & Village Boundaries"}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`hidden sm:flex items-center space-x-1 p-1 rounded-xl ${theme === 'dark' ? 'bg-slate-900/80' : 'bg-slate-100'}`}>
                <button
                  onClick={handleZoomOut}
                  className={`p-1.5 rounded-lg transition-all ${
                    theme === 'dark' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-white text-slate-500 shadow-sm'
                  }`}
                  title="Zoom Out"
                >
                  <ZoomOut size={16} />
                </button>
                <div className={`w-px h-3.5 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`} />
                <button
                  onClick={handleReset}
                  className={`p-1.5 rounded-lg transition-all ${
                    theme === 'dark' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-white text-slate-500 shadow-sm'
                  }`}
                  title="Reset Zoom"
                >
                  <RotateCcw size={16} />
                </button>
                <div className={`w-px h-3.5 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`} />
                <button
                  onClick={handleZoomIn}
                  className={`p-1.5 rounded-lg transition-all ${
                    theme === 'dark' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-white text-slate-500 shadow-sm'
                  }`}
                  title="Zoom In"
                >
                  <ZoomIn size={16} />
                </button>
              </div>

              <div className={`hidden sm:block w-px h-5 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`} />

              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className={`p-2 rounded-lg transition-all ${
                  theme === 'dark' ? 'hover:bg-slate-900 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                }`}
                title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
              >
                {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
              <button
                onClick={handleBack}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  theme === 'dark' 
                    ? 'border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-slate-100' 
                    : 'border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
                title="Back to Main View"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>

              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-all ${
                  theme === 'dark' ? 'hover:bg-red-500/15 text-slate-400 hover:text-red-500' : 'hover:bg-red-50 text-slate-500 hover:text-red-600'
                }`}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Main Layout Area */}
          <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
            
            {/* Sidebar Navigation & Checklist */}
            <div className={`w-full md:w-80 border-b md:border-b-0 md:border-r shrink-0 flex flex-col min-h-0 ${
              theme === 'dark' ? 'border-slate-800 bg-slate-950 text-slate-100' : 'border-slate-200 bg-white text-slate-900'
            }`}>
              
              {/* Dynamic Breadcrumbs */}
              <div className={`px-4 py-3 border-b text-[11px] font-semibold flex items-center flex-wrap gap-1 tracking-wide ${
                theme === 'dark' ? 'border-slate-900 bg-slate-950/60 text-slate-400' : 'border-slate-100 bg-slate-50 text-slate-500'
              }`}>
                <button 
                  onClick={() => {
                    setCurrentLevel('regions');
                    setSelectedRegion(null);
                    setSelectedDistrict(null);
                    setSelectedVillage(null);
                  }}
                  className="hover:text-yellow-500 transition-colors uppercase"
                >
                  {countryName}
                </button>
                
                {selectedRegion && (
                  <>
                    <ChevronRight size={10} className="opacity-50" />
                    <button 
                      onClick={() => {
                        setCurrentLevel('districts');
                        setSelectedDistrict(null);
                        setSelectedVillage(null);
                      }}
                      className="hover:text-yellow-500 transition-colors max-w-[80px] truncate uppercase"
                      title={selectedRegion}
                    >
                      {selectedRegion}
                    </button>
                  </>
                )}

                {selectedDistrict && (
                  <>
                    <ChevronRight size={10} className="opacity-50" />
                    <button 
                      onClick={() => {
                        setCurrentLevel('villages');
                        setSelectedDivision(null);
                        setSelectedVillage(null);
                      }}
                      className="hover:text-yellow-500 transition-colors max-w-[80px] truncate uppercase"
                      title={selectedDistrict}
                    >
                      {selectedDistrict}
                    </button>
                  </>
                )}

                {selectedDivision && (
                  <>
                    <ChevronRight size={10} className="opacity-50" />
                    <span className="text-yellow-500 max-w-[80px] truncate uppercase animate-pulse" title={selectedDivision}>
                      {selectedDivision}
                    </span>
                  </>
                )}

                {selectedVillage && (
                  <>
                    <ChevronRight size={10} className="opacity-50" />
                    <span className="text-yellow-500 max-w-[80px] truncate uppercase" title={selectedVillage.name}>
                      {selectedVillage.name}
                    </span>
                  </>
                )}
              </div>

              {/* Interaction instructions */}
              <div className="p-3.5 bg-yellow-500/10 border-b border-yellow-500/10 text-[11px] leading-relaxed text-yellow-600 font-semibold flex gap-2">
                <Compass className="w-4 h-4 text-yellow-500 shrink-0" />
                <span>
                  {selectedDivision === 'Kawempe' && "🎯 Hover over any Parish to highlight it. Click 'Up a Level' to return."}
                  {currentLevel === 'regions' && "🎯 Click any Region path or name to view local Districts."}
                  {currentLevel === 'districts' && (selectedRegion === 'Central' ? "🎯 Click Kampala to drill down to Divisions in Kampala." : "🎯 Click any District to drill down to Mapped Villages.")}
                  {currentLevel === 'villages' && !selectedDivision && (selectedDistrict === 'Kampala' ? "⚡ Click Kawempe Division on the map to explore its localized parishes." : "⚡ Double tap a village target to open the localized active metrics card.")}
                </span>
              </div>

              {/* Sidebar Active Entities Checklist */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {selectedDivision === 'Kawempe' ? "Parishes in Kawempe" : (
                      currentLevel === 'regions' ? "Regions" : (
                        currentLevel === 'districts' ? `Districts in ${selectedRegion}` : (
                          selectedDistrict === 'Kampala' ? "Divisions in Kampala" : `Villages in ${selectedDistrict}`
                        )
                      )
                    )}
                  </span>
                  <span className="text-[10px] bg-yellow-500/10 text-yellow-500 font-bold px-2 py-0.5 rounded-full">
                    {activeLevelEntities.length} Listed
                  </span>
                </div>

                <div className="space-y-1.5">
                  {activeLevelEntities.map((entity, idx) => {
                    const isHovered = hoveredEntity === entity.name;
                    const isSelected = 
                      (selectedDivision === 'Kawempe' && hoveredEntity === entity.name) ||
                      (currentLevel === 'regions' && selectedRegion === entity.name) ||
                      (currentLevel === 'districts' && selectedDistrict === entity.name) ||
                      (currentLevel === 'villages' && selectedVillage?.name === entity.name);

                    return (
                      <div
                        key={entity.id}
                        onMouseEnter={() => setHoveredEntity(entity.name)}
                        onMouseLeave={() => setHoveredEntity(null)}
                        onClick={() => {
                          if (selectedDivision === 'Kawempe') {
                            setHoveredEntity(entity.name);
                          } else {
                            handleTapGesture(entity, currentLevel === 'regions' ? 'region' : currentLevel === 'districts' ? 'district' : 'village');
                          }
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl border text-xs font-bold transition-all duration-150 cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-yellow-500/15 border-yellow-500 text-yellow-600'
                            : isHovered
                            ? theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900 shadow-xs'
                            : theme === 'dark' ? 'bg-slate-900/40 border-slate-900 text-slate-400' : 'bg-slate-100/50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {selectedDivision === 'Kawempe' && <Compass className="w-3.5 h-3.5 opacity-60 text-sky-400" />}
                          {selectedDivision !== 'Kawempe' && currentLevel === 'regions' && <Map className="w-3.5 h-3.5 opacity-60 text-indigo-400" />}
                          {selectedDivision !== 'Kawempe' && currentLevel === 'districts' && <Building2 className="w-3.5 h-3.5 opacity-60 text-emerald-400" />}
                          {selectedDivision !== 'Kawempe' && currentLevel === 'villages' && <MapPin className="w-3.5 h-3.5 opacity-60 text-red-400" />}
                          <span className="truncate">{entity.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {selectedDivision === 'Kawempe' ? (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-500 font-bold border border-sky-500/10">Parish</span>
                          ) : (
                            currentLevel === 'villages' ? (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/10">Active</span>
                            ) : (
                              <ChevronRight size={12} className="opacity-50" />
                            )
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic stats preview box */}
              <div className={`p-4 border-t ${theme === 'dark' ? 'border-slate-900 bg-slate-950/60' : 'border-slate-100 bg-slate-50/50'}`}>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Offline status</span>
                    <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                      {dynamicMappedStats.syncProgress}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className={`p-2.5 rounded-lg border ${theme === 'dark' ? 'bg-slate-900/50 border-slate-900' : 'bg-white border-slate-200'}`}>
                      <span className="block text-[9px] uppercase font-bold text-slate-400">Contributors</span>
                      <span className="text-sm font-black text-slate-200 flex items-center gap-1 pt-0.5">
                        <Users size={12} className="text-yellow-500" />
                        {dynamicMappedStats.activeContributors} Active
                      </span>
                    </div>
                    <div className={`p-2.5 rounded-lg border ${theme === 'dark' ? 'bg-slate-900/50 border-slate-900' : 'bg-white border-slate-200'}`}>
                      <span className="block text-[9px] uppercase font-bold text-slate-400">Active Sellers</span>
                      <span className="text-sm font-black text-slate-200 flex items-center gap-1 pt-0.5">
                        <TrendingUp size={12} className="text-yellow-500" />
                        {dynamicMappedStats.activeSellers}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Stage Window */}
            <div 
              ref={containerRef}
              className="flex-1 overflow-hidden flex items-center justify-center relative bg-transparent cursor-grab active:cursor-grabbing min-h-0"
              onMouseMove={(e) => {
                if (containerRef.current) {
                  const rect = containerRef.current.getBoundingClientRect();
                  handleMouseMove({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                }
              }}
            >
              {loading ? (
                <div className="flex flex-col items-center space-y-3 p-8">
                  <Loader2 className="w-10 h-10 animate-spin text-yellow-500" />
                  <p className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    Assembling vectorized sub-regions...
                  </p>
                </div>
              ) : error ? (
                <div className="text-center space-y-4 max-w-sm p-6">
                  <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                    <X className="text-red-500 w-6 h-6" />
                  </div>
                  <h3 className={`text-md font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    Grid Calibration Pending
                  </h3>
                  <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    Vector boundary files are offline. Would you like to proceed with the pre-coded analytical regional mesh?
                  </p>
                  <button
                    onClick={() => {
                      // Fallback to procedurally generated grids is automatic
                      setLoading(false);
                      setSvgContent("<svg viewBox='0 0 1000 1000'></svg>");
                      setError(null);
                    }}
                    className="px-5 py-2.5 bg-yellow-500 text-slate-900 rounded-xl font-bold text-xs hover:bg-yellow-400 transition-colors uppercase tracking-wider"
                  >
                    Load procedurally
                  </button>
                </div>
              ) : (
                <div className="w-full h-full relative flex items-center justify-center p-4">
                  
                  {/* Floating Analytical Controls */}
                  <div className="absolute top-4 left-4 z-20 flex gap-2">
                    {(currentLevel !== 'regions' || selectedDivision) && (
                      <button
                        onClick={() => {
                          if (selectedDivision) {
                            setSelectedDivision(null);
                            handleReset();
                          } else if (currentLevel === 'villages') {
                            setCurrentLevel('districts');
                            setSelectedDistrict(null);
                            setSelectedVillage(null);
                            setScale(2.2);
                          } else if (currentLevel === 'districts') {
                            setCurrentLevel('regions');
                            setSelectedRegion(null);
                            setScale(1);
                            setSelectedDistrict(null);
                            setSelectedVillage(null);
                          }
                        }}
                        className={`flex items-center space-x-1 py-1.5 px-3 rounded-lg text-xs font-bold shadow-lg border transition-all ${
                          theme === 'dark' 
                            ? 'bg-slate-900/90 border-slate-800 text-white hover:bg-slate-800' 
                            : 'bg-white/90 border-slate-200 text-slate-800 hover:bg-slate-50'
                        }`}
                      >
                        <ArrowLeft size={14} />
                        <span>Up a level</span>
                      </button>
                    )}
                  </div>

                  <motion.div 
                    style={{ 
                      scale: springScale,
                      x: springX,
                      y: springY,
                      transformOrigin: 'center'
                    }}
                    drag
                    dragMomentum={true}
                    dragElastic={0.05}
                    className="w-full h-full flex items-center justify-center country-svg-container"
                  >
                    <svg
                      viewBox={viewBox}
                      className="max-w-full max-h-full"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      <g>
                        {countryId === 'TZ' && selectedDistrict === 'Dar es Salaam' ? (
                          DAR_ES_SALAAM_LEVELS.map((level, idx) => {
                            const isHovered = hoveredEntity === level.name;
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
                              <g key={`modal-dar-level-g-${idx}`} id={`modal-dar-level-${level.name}`}>
                                {isDistrict && level.wards && level.wards.map((wardPath, wIdx) => (
                                  <path
                                    key={`modal-ward-line-${wIdx}`}
                                    d={wardPath}
                                    fill="none"
                                    stroke={theme === 'dark' ? '#334155' : '#cbd5e1'}
                                    strokeWidth="0.8"
                                    strokeDasharray="1 2"
                                  />
                                ))}
                                
                                <motion.path
                                  id={`modal-dar-path-${idx}`}
                                  d={level.d}
                                  fill={fillColor}
                                  stroke={strokeColor}
                                  strokeWidth={isHovered ? (parseFloat(strokeWidth) + 0.6).toString() : strokeWidth}
                                  initial={false}
                                  animate={{
                                    fill: fillColor,
                                    transition: { duration: 0.15 }
                                  }}
                                  onMouseEnter={() => setHoveredEntity(level.name)}
                                  onMouseLeave={() => setHoveredEntity(null)}
                                  className="outline-none cursor-pointer"
                                  style={{ strokeLinejoin: "round", strokeLinecap: "round" }}
                                />

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

                                {((isDistrict && !hoveredEntity) || isHovered) && (
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
                        ) : countryId === 'UG' && selectedDistrict === 'Kampala' && currentLevel === 'villages' ? (
                          selectedDivision === 'Kawempe' ? (
                            KAWEMPE_PARISHES.map((parish, idx) => {
                              const isHovered = hoveredEntity === parish.name;
                              
                              // Orange for Mulago, sky-blue or theme-based for others
                              let fillColor = theme === 'dark' ? '#0c4a6e' : '#bae6fd'; // sky-700 / sky-200
                              let strokeColor = theme === 'dark' ? '#0284c7' : '#0284c7'; // sky-600
                              if (parish.color === 'orange') {
                                fillColor = theme === 'dark' ? '#7c2d12' : '#fed7aa'; // orange-900 / orange-200
                                strokeColor = theme === 'dark' ? '#f97316' : '#f97316'; // orange-500
                              }

                              return (
                                <g key={`modal-kawempe-parish-${idx}`}>
                                  <motion.path
                                    d={parish.d}
                                    fill={fillColor}
                                    stroke={strokeColor}
                                    strokeWidth={isHovered ? "2.0" : "1.2"}
                                    initial={false}
                                    animate={{
                                      fill: isHovered 
                                        ? (theme === 'dark' ? '#1e3a8a' : '#93c5fd') 
                                        : fillColor,
                                      stroke: isHovered ? '#025080' : strokeColor,
                                      transition: { duration: 0.2 }
                                    }}
                                    onMouseEnter={() => setHoveredEntity(parish.name)}
                                    onMouseLeave={() => setHoveredEntity(null)}
                                    className="transition-all duration-300 cursor-pointer outline-none"
                                  />
                                  <text
                                    x={parish.labelX}
                                    y={parish.labelY}
                                    textAnchor="middle"
                                    className={`text-[8px] font-black select-none pointer-events-none fill-current ${
                                      theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
                                    }`}
                                    style={{ fontFamily: 'var(--font-sans)', letterSpacing: '0.02em' }}
                                  >
                                    {parish.name.replace(" Parish", "")}
                                  </text>
                                  <text
                                    x={parish.labelX}
                                    y={parish.labelY + 8}
                                    textAnchor="middle"
                                    className={`text-[5px] font-bold tracking-widest select-none pointer-events-none opacity-60 fill-current ${
                                      theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                                    }`}
                                    style={{ fontFamily: 'var(--font-sans)' }}
                                  >
                                    PARISH
                                  </text>
                                </g>
                              );
                            })
                          ) : (
                            KAMPALA_DIVISIONS.map((division, idx) => {
                              const isHovered = hoveredEntity === division.name;
                              return (
                                <g key={`modal-kampala-div-${idx}`}>
                                  <motion.path
                                    d={division.d}
                                    fill={theme === 'dark' ? '#111827' : '#f8fafc'}
                                    stroke={theme === 'dark' ? '#374151' : '#cbd5e1'}
                                    strokeWidth={isHovered ? "1.8" : "1.0"}
                                    initial={false}
                                    animate={{
                                      fill: isHovered 
                                        ? (division.name === "Kawempe Division" ? (theme === 'dark' ? '#1e3a8a' : '#dbeafe') : (theme === 'dark' ? '#1e1b4b' : '#e0e7ff')) 
                                        : (theme === 'dark' ? '#111827' : '#f8fafc'),
                                      transition: { duration: 0.2 }
                                    }}
                                    onMouseEnter={() => setHoveredEntity(division.name)}
                                    onMouseLeave={() => setHoveredEntity(null)}
                                    onClick={() => {
                                      if (division.name === "Kawempe Division") {
                                        setSelectedDivision("Kawempe");
                                        handleReset();
                                      }
                                    }}
                                    className="transition-all duration-300 cursor-pointer outline-none"
                                  />
                                  <g 
                                    className="cursor-pointer"
                                    onClick={() => {
                                      if (division.name === "Kawempe Division") {
                                        setSelectedDivision("Kawempe");
                                        handleReset();
                                      }
                                    }}
                                  >
                                    <text
                                      x={division.labelX}
                                      y={division.labelY}
                                      textAnchor="middle"
                                      className={`text-[10px] font-bold select-none pointer-events-none fill-current ${
                                        theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                                      }`}
                                      style={{ fontFamily: 'var(--font-sans)', letterSpacing: '0.04em' }}
                                    >
                                      {division.name.replace(" Division", "")}
                                    </text>
                                    <text
                                      x={division.labelX}
                                      y={division.labelY + 12}
                                      textAnchor="middle"
                                      className={`text-[7px] font-black tracking-widest select-none pointer-events-none opacity-50 fill-current ${
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
                        ) : (
                          parsedPaths.map((path) => {
                            const isHovered = hoveredEntity?.toLowerCase() === path.name.toLowerCase();
                            const isSelected = selectedRegion?.toLowerCase() === path.name.toLowerCase();
                            
                            // Styling variables based on drill levels
                            let fillColor = theme === 'dark' ? '#111827' : '#f8fafc';
                            let strokeColor = theme === 'dark' ? '#374151' : '#cbd5e1';
                            let opacity = 1;

                            if (countryId === 'TZ') {
                              fillColor = theme === 'dark' ? '#111827' : '#f8fafc';
                              strokeColor = theme === 'dark' ? '#4b5563' : '#64748b';
                              if (isHovered) {
                                fillColor = theme === 'dark' ? '#1f2937' : '#f1f5f9';
                              }
                            } else if (currentLevel !== 'regions') {
                              if (isSelected) {
                                fillColor = theme === 'dark' ? '#1e1b4b' : '#e0e7ff';
                                strokeColor = theme === 'dark' ? '#6366f1' : '#818cf8';
                              } else {
                                opacity = 0.3;
                              }
                            } else if (isHovered) {
                              fillColor = theme === 'dark' ? '#f59e0b' : '#fef08a';
                              strokeColor = '#eab308';
                            }

                            return (
                              <g key={path.id} className="outline-none">
                                <motion.path
                                  d={path.d}
                                  fill={fillColor}
                                  stroke={strokeColor}
                                  strokeWidth={countryId === 'TZ' ? (isHovered ? "2.0" : "1.2") : (isHovered ? "1.5" : "0.75")}
                                  opacity={opacity}
                                  className="transition-all duration-300 pointer-events-auto cursor-pointer outline-none"
                                  onClick={() => {
                                    handleEntitySingleClick(path.name);
                                    if (countryId === 'TZ' && path.name === 'Dar es Salaam') {
                                      setSelectedDistrict('Dar es Salaam');
                                      setCurrentLevel('villages');
                                      setScale(1.2);
                                      x.set(-30);
                                      y.set(-30);
                                    }
                                  }}
                                  onDoubleClick={() => {
                                    if (countryId === 'TZ' && path.name === 'Dar es Salaam') {
                                      setSelectedDistrict('Dar es Salaam');
                                      setCurrentLevel('villages');
                                      setScale(1.2);
                                      x.set(-30);
                                      y.set(-30);
                                    }
                                  }}
                                  onMouseEnter={() => setHoveredEntity(path.name)}
                                  onMouseLeave={() => setHoveredEntity(null)}
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

                        {/* Mapped District Pins (Level 2) */}
                        {currentLevel === 'districts' && countryId !== 'RW' && (
                          <g id="district-pins-overlay">
                            {(adminHierarchy.districtsByRegion[selectedRegion || ''] || []).map((district, idx) => {
                              const pos = [
                                { x: 450, y: 350 },
                                { x: 550, y: 450 },
                                { x: 350, y: 550 }
                              ][idx % 3] || { x: 500, y: 500 };

                              const isHovered = hoveredEntity === district.name;

                              return (
                                <g 
                                  key={district.id}
                                  onClick={() => handleTapGesture(district, 'district')}
                                  onMouseEnter={() => setHoveredEntity(district.name)}
                                  onMouseLeave={() => setHoveredEntity(null)}
                                  className="cursor-pointer"
                                >
                                  <motion.circle
                                    cx={pos.x}
                                    cy={pos.y}
                                    r={isHovered ? 12 : 9}
                                    fill={isHovered ? "#10b981" : "#3b82f6"}
                                    stroke="white"
                                    strokeWidth="1.5"
                                  />
                                  <text
                                    x={pos.x}
                                    y={pos.y - 15}
                                    textAnchor="middle"
                                    fill={theme === 'dark' ? 'white' : '#1e293b'}
                                    className="text-[12px] font-black"
                                    style={{ userSelect: 'none' }}
                                  >
                                    {district.name}
                                  </text>
                                </g>
                              );
                            })}
                          </g>
                        )}

                        {/* Mapped Village Dots & Pulse Rings (Level 3 - drill down completed) */}
                        {currentLevel === 'villages' && countryId !== 'RW' && (
                          <g id="village-dots-overlay">
                            {(adminHierarchy.villagesByDistrict[selectedDistrict || ''] || []).map((village, idx) => {
                              const pos = selectedDistrict === 'Kampala'
                                ? ({
                                    'Nakasero': { x: 235, y: 250 },
                                    'Kololo': { x: 290, y: 220 },
                                    'Kalamu': { x: 180, y: 150 }
                                  }[village.name] || { x: 250, y: 250 })
                                : [
                                    { x: 480, y: 320 },
                                    { x: 520, y: 460 },
                                    { x: 380, y: 520 }
                                  ][idx % 3] || { x: 500, y: 500 };

                              const isHovered = hoveredEntity === village.name;
                              const isSelected = selectedVillage?.name === village.name;

                              return (
                                <g 
                                  key={village.id}
                                  onClick={() => handleTapGesture(village, 'village')}
                                  onMouseEnter={() => setHoveredEntity(village.name)}
                                  onMouseLeave={() => setHoveredEntity(null)}
                                  className="cursor-pointer"
                                >
                                  {/* Pulsing ring */}
                                  <circle
                                    cx={pos.x}
                                    cy={pos.y}
                                    r={16}
                                    fill="none"
                                    stroke="#ef4444"
                                    strokeWidth="1"
                                    className="animate-ping"
                                    style={{ transformOrigin: `${pos.x}px ${pos.y}px`, opacity: 0.3 }}
                                  />
                                  {/* Solid dot */}
                                  <motion.circle
                                    cx={pos.x}
                                    cy={pos.y}
                                    r={isHovered || isSelected ? 8 : 5}
                                    fill={isSelected ? "#eab308" : isHovered ? "#ef4444" : "#f43f5e"}
                                    stroke="white"
                                    strokeWidth="1.5"
                                  />
                                  <text
                                    x={pos.x}
                                    y={pos.y - 15}
                                    textAnchor="middle"
                                    fill={isSelected ? '#eab308' : theme === 'dark' ? 'white' : '#1e293b'}
                                    className="text-[10px] font-bold uppercase tracking-wider"
                                    style={{ userSelect: 'none' }}
                                  >
                                    {village.name}
                                  </text>
                                </g>
                              );
                            })}
                          </g>
                        )}
                      </g>
                    </svg>
                  </motion.div>

                  {/* SVG Map Legend */}
                  <div className="absolute bottom-4 left-4 z-15 p-2 rounded-lg border backdrop-blur-md flex items-center gap-4 text-[10px] uppercase font-bold tracking-wider shadow-md bg-white border-slate-200 text-slate-700 bg-opacity-95">
                    {currentLevel === 'regions' && (
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 rounded bg-amber-500/10 border border-amber-500" />
                        <span>Hover Territory Region</span>
                      </div>
                    )}
                    {currentLevel === 'districts' && (
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 rounded-full bg-blue-500" />
                        <span>District map points</span>
                      </div>
                    )}
                    {currentLevel === 'villages' && (
                      <>
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full bg-rose-500" />
                          <span>Village point</span>
                        </div>
                        <div className="flex items-center gap-1.5 ml-1">
                          <span className="w-3 h-3 rounded-full bg-yellow-500" />
                          <span>Selected</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer controls */}
          <div className={`p-4 border-t h-14 flex items-center justify-between font-mono text-[10px] uppercase font-bold shrink-0 ${theme === 'dark' ? 'border-slate-800 bg-slate-950/80 text-slate-504' : 'border-slate-200 bg-slate-50'}`}>
            <span className="opacity-60 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
              Lat/Lng Map Grid Active
            </span>
            <span className="opacity-65">
              {currentLevel === 'regions' && "Level: National overview"}
              {currentLevel === 'districts' && `Level: Province (Showing ${selectedRegion})`}
              {currentLevel === 'villages' && `Level: Municipal (Showing ${selectedDistrict})`}
            </span>
          </div>
        </motion.div>

        {/* Mapped Village Detail Overlay Card (Triggered on Double Tap / Dialog selection) */}
        <AnimatePresence>
          {showVillageDetails && selectedVillage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowVillageDetails(false)}
            >
              <div 
                className={`relative w-full max-w-md rounded-2xl shadow-2xl p-6 border overflow-hidden ${
                  theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex justify-between items-start pb-4 border-b border-dashed border-slate-700/30">
                  <div>
                    <span className="text-[10px] uppercase bg-rose-500/10 text-rose-500 font-bold px-2 py-0.5 rounded border border-rose-500/10 tracking-widest">
                      Village node
                    </span>
                    <h3 className="text-xl font-black tracking-tight mt-1">
                      {selectedVillage.name}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setShowVillageDetails(false)}
                    className="p-1 rounded-lg hover:bg-slate-100/10 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* KPI stats */}
                <div className="py-4 space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`p-3 rounded-xl border ${theme === 'dark' ? 'bg-slate-950/40 border-slate-800/80' : 'bg-slate-50 border-slate-100'}`}>
                      <span className="block text-[9px] uppercase font-bold text-slate-400">Shop density</span>
                      <span className="text-md font-black mt-1 block flex items-center gap-1.5 text-rose-500">
                        <Building2 size={14} />
                        {dynamicMappedStats.density} Shops/km²
                      </span>
                    </div>
                    <div className={`p-3 rounded-xl border ${theme === 'dark' ? 'bg-slate-950/40 border-slate-800/80' : 'bg-slate-50 border-slate-100'}`}>
                      <span className="block text-[9px] uppercase font-bold text-slate-400">Weekly sales Volume</span>
                      <span className="text-md font-black mt-1 block flex items-center gap-1.5 text-emerald-500">
                        <TrendingUp size={14} />
                        {countryId === 'UG' ? 'USh ' : '₪ '} 
                        {dynamicMappedStats.mockVolume.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Descriptive parameters */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold py-1 border-b border-slate-700/10">
                      <span className="opacity-60 flex items-center gap-1.5">
                        <Users size={12} className="text-yellow-500" />
                        Contributors Mapped
                      </span>
                      <span>{dynamicMappedStats.activeContributors} Active</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold py-1 border-b border-slate-700/10">
                      <span className="opacity-60 flex items-center gap-1.5">
                        <Calendar size={12} className="text-yellow-500" />
                        Verification date
                      </span>
                      <span>Jun 12, 2026</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold py-1 border-b border-slate-700/10">
                      <span className="opacity-60 flex items-center gap-1.5">
                        <Compass size={12} className="text-yellow-500" />
                        Map coordinates
                      </span>
                      <span className="font-mono text-[10px] tracking-wider text-slate-400">32.61° E, 0.38° N</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold py-1">
                      <span className="opacity-60 flex items-center gap-1.5">
                        <BarChart2 size={12} className="text-yellow-500" />
                        Offline Sync status
                      </span>
                      <span className="text-emerald-500 flex items-center gap-1 font-mono uppercase text-[10px]">
                        ● Synced
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions button */}
                <button
                  onClick={() => setShowVillageDetails(false)}
                  className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all duration-200 mt-2 hover:shadow-lg shadow-md"
                >
                  Return to map
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

// Simple mouse move coordinates tracker
let currentMousePos = { x: 0, y: 0 };
const handleMouseMove = (pos: { x: number, y: number }) => {
  currentMousePos = pos;
};

const CountryMapModal: React.FC<CountryMapModalProps> = (props) => {
  if (props.countryId === 'UG') {
    return <div className="fixed inset-0 z-[100] bg-slate-950/55 p-2 backdrop-blur-sm sm:p-5"><UgandaElectoralMap theme={props.theme} onBack={props.onClose} /></div>;
  }
  return <GenericCountryMapModal {...props} />;
};

export default CountryMapModal;
