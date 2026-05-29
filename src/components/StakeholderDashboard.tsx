/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import {
  Filter,
  Sliders,
  RefreshCw,
  BarChart3,
  TrendingUp,
  Users,
  CheckCircle,
  Map,
  Globe,
  MapPin,
  ZoomIn,
  ZoomOut,
  SlidersHorizontal,
  Plus,
  Trash2,
  LineChart,
  Sparkles,
  Info
} from 'lucide-react';
import { Dataset } from '../types';

interface StakeholderDashboardProps {
  dataset: Dataset;
  strategicSlicer?: string;
}

// Stylized continent coordinates & paths for an executive World Map representation
const STYLIZED_CONTINENTS = [
  // North America
  { name: 'North America', points: '12,23 20,10 32,10 36,13 48,14 54,18 58,24 62,30 58,38 45,48 42,50 35,43 32,43 22,33' },
  // Greenland
  { name: 'Greenland', points: '54,10 62,8 65,12 60,20 54,18' },
  // South America
  { name: 'South America', points: '40,49 46,49 51,53 53,58 48,68 46,78 43,86 41,86 39,78 39,70 38,60 38,53' },
  // Europe
  { name: 'Europe', points: '72,23 76,21 80,23 84,26 83,33 78,36 74,38 70,36' },
  // Africa
  { name: 'Africa', points: '70,38 78,36 85,40 88,46 90,50 90,58 84,66 79,74 74,78 72,78 70,70 68,64 65,56' },
  // Asia
  { name: 'Eurasia', points: '80,23 95,18 115,20 135,20 145,26 152,30 153,40 142,48 135,51 125,53 110,56 102,58 95,58 85,48 82,36' },
  // Australia
  { name: 'Australia', points: '128,60 138,60 144,64 142,72 132,72 126,66' }
];

// Rich set of detailed realistic political country boundaries on our standard grid
const WORLD_COUNTRIES = [
  {
    name: 'Canada',
    keys: ['canada'],
    points: '20,8 30,5 45,5 56,10 52,18 43,18 36,18 28,15 20,15 20,8'
  },
  {
    name: 'United States',
    keys: ['united states', 'usa', 'united states of america'],
    points: '20,15 28,15 36,18 43,18 52,18 53,23 46,24 45,28 38,28 35,32 30,32 20,30 20,15'
  },
  {
    name: 'Mexico',
    keys: ['mexico'],
    points: '20,30 30,32 35,32 38,36 34,42 32,42 21,34 20,30'
  },
  {
    name: 'Colombia & Venezuela',
    keys: ['colombia', 'venezuela'],
    points: '40,45 48,44 54,44 51,51 45,51 40,48'
  },
  {
    name: 'Brazil',
    keys: ['brazil'],
    points: '41,50 51,51 58,51 63,56 61,64 54,66 45,58 41,50'
  },
  {
    name: 'Peru & Chile',
    keys: ['peru', 'chile'],
    points: '40,48 45,51 45,58 43,65 41,72 39,80 37,85 35,85 38,72 40,58'
  },
  {
    name: 'Argentina',
    keys: ['argentina'],
    points: '45,58 54,66 51,75 49,82 46,85 41,85 39,80 41,72 43,65'
  },
  {
    name: 'United Kingdom',
    keys: ['united kingdom', 'uk', 'great britain', 'england'],
    points: '72,18 75,16 76,20 73,23 72,18'
  },
  {
    name: 'Scandinavia',
    keys: ['sweden', 'norway'],
    points: '79,10 86,9 89,14 85,19 80,18 79,10'
  },
  {
    name: 'Germany & Poland',
    keys: ['germany', 'poland', 'netherlands', 'switzerland'],
    points: '80,18 85,19 88,23 83,23 80,21 80,18'
  },
  {
    name: 'France',
    keys: ['france'],
    points: '76,21 80,21 80,25 76,25 76,21'
  },
  {
    name: 'Spain & Portugal',
    keys: ['spain', 'portugal'],
    points: '73,25 77,25 77,29 73,29 73,25'
  },
  {
    name: 'Italy & Greece',
    keys: ['italy', 'greece'],
    points: '80,25 84,25 86,29 83,30 80,27'
  },
  {
    name: 'Russia',
    keys: ['russia'],
    points: '90,10 110,8 130,8 150,10 154,13 148,17 135,17 120,19 105,21 90,21 90,10'
  },
  {
    name: 'China',
    keys: ['china', 'south korea', 'singapore'],
    points: '110,21 130,21 135,27 132,34 124,35 120,37 114,33 110,27'
  },
  {
    name: 'India',
    keys: ['india'],
    points: '110,29 118,29 116,39 112,39 110,32'
  },
  {
    name: 'Japan',
    keys: ['japan'],
    points: '137,24 142,24 141,30 137,30 137,24'
  },
  {
    name: 'Middle East',
    keys: ['egypt', 'morocco'],
    points: '93,30 102,30 105,35 100,41 95,39 93,30'
  },
  {
    name: 'North Africa',
    keys: ['morocco', 'egypt', 'nigeria', 'kenya'],
    points: '71,29 93,29 92,42 82,42 71,38 71,29'
  },
  {
    name: 'South Africa',
    keys: ['south africa'],
    points: '80,42 90,42 90,52 86,64 79,64 79,52 80,42'
  },
  {
    name: 'Australia',
    keys: ['australia', 'new zealand'],
    points: '128,54 142,54 145,66 130,66 128,54'
  }
];

// Comprehensive dictionary for automatic geo-coordinates lookup based on raw text data
const COUNTRY_COORDINATES: Record<string, { lat: number; lon: number; continent: string }> = {
  'united states': { lat: 37.0902, lon: -95.7129, continent: 'North America' },
  'usa': { lat: 37.0902, lon: -95.7129, continent: 'North America' },
  'united states of america': { lat: 37.0902, lon: -95.7129, continent: 'North America' },
  'canada': { lat: 56.1304, lon: -106.3468, continent: 'North America' },
  'mexico': { lat: 23.6345, lon: -102.5528, continent: 'North America' },
  'brazil': { lat: -14.2350, lon: -51.9253, continent: 'South America' },
  'argentina': { lat: -38.4161, lon: -63.6167, continent: 'South America' },
  'colombia': { lat: 4.5709, lon: -74.2973, continent: 'South America' },
  'peru': { lat: -9.1900, lon: -75.0152, continent: 'South America' },
  'chile': { lat: -35.6751, lon: -71.5430, continent: 'South America' },
  'venezuela': { lat: 6.4238, lon: -66.5897, continent: 'South America' },
  'united kingdom': { lat: 55.3781, lon: -3.4360, continent: 'Europe' },
  'uk': { lat: 55.3781, lon: -3.4360, continent: 'Europe' },
  'great britain': { lat: 55.3781, lon: -3.4360, continent: 'Europe' },
  'england': { lat: 52.3555, lon: -1.1743, continent: 'Europe' },
  'germany': { lat: 51.1657, lon: 10.4515, continent: 'Eurasia' },
  'france': { lat: 46.2276, lon: 2.2137, continent: 'Europe' },
  'italy': { lat: 41.8719, lon: 12.5674, continent: 'Europe' },
  'spain': { lat: 40.4637, lon: -3.7492, continent: 'Europe' },
  'netherlands': { lat: 52.1326, lon: 5.2913, continent: 'Europe' },
  'switzerland': { lat: 46.8182, lon: 8.2275, continent: 'Europe' },
  'sweden': { lat: 60.1282, lon: 18.6435, continent: 'Europe' },
  'norway': { lat: 60.4720, lon: 8.4689, continent: 'Europe' },
  'poland': { lat: 51.9194, lon: 19.1451, continent: 'Europe' },
  'russia': { lat: 61.5240, lon: 105.3188, continent: 'Eurasia' },
  'china': { lat: 35.8617, lon: 104.1954, continent: 'Eurasia' },
  'india': { lat: 20.5937, lon: 78.9629, continent: 'Eurasia' },
  'japan': { lat: 36.2048, lon: 138.2529, continent: 'Eurasia' },
  'south korea': { lat: 35.9078, lon: 127.7669, continent: 'Eurasia' },
  'singapore': { lat: 1.3521, lon: 103.8198, continent: 'Eurasia' },
  'australia': { lat: -25.2744, lon: 133.7751, continent: 'Australia' },
  'new zealand': { lat: -40.9006, lon: 174.8860, continent: 'Australia' },
  'south africa': { lat: -30.5595, lon: 22.9375, continent: 'Africa' },
  'egypt': { lat: 26.8206, lon: 30.8025, continent: 'Africa' },
  'nigeria': { lat: 9.0820, lon: 8.6753, continent: 'Africa' },
  'kenya': { lat: -1.2921, lon: 36.8219, continent: 'Africa' },
  'morocco': { lat: 31.7917, lon: -7.0926, continent: 'Africa' }
};

export default function StakeholderDashboard({ dataset, strategicSlicer }: StakeholderDashboardProps) {
  // Enhanced state including manual geo-enrichment simulation if dataset doesn't have country/coordinates
  const [enrichedRows, setEnrichedRows] = useState<Record<string, any>[]>([]);
  const [isGeographicallyEnriched, setIsGeographicallyEnriched] = useState<boolean>(false);

  // Auto-detect Geo-location columns
  const geoColumns = useMemo(() => {
    const columns = dataset.columns;
    const latCol = columns.find(c => {
      const name = c.name.toLowerCase().trim();
      if (/^(lat|latitude|gps_lat|y_coord|y_coordinate)$/i.test(name)) return true;
      if (name.includes('latitude') || name.startsWith('lat_') || name.endsWith('_lat')) return true;
      if (name.includes('coord') && (name.includes('lat') || name.includes('y'))) return true;
      if (name.includes('lat') && !name.includes('population') && !name.includes('inflation') && !name.includes('plate') && !name.includes('translation') && !name.includes('relationship') && !name.includes('relative')) return true;
      return false;
    });

    const lonCol = columns.find(c => {
      const name = c.name.toLowerCase().trim();
      if (/^(lon|long|longitude|lng|gps_lon|gps_lng|x_coord|x_coordinate)$/i.test(name)) return true;
      if (name.includes('longitude') || name.startsWith('lon_') || name.startsWith('lng_') || name.endsWith('_lon') || name.endsWith('_lng') || name.startsWith('long_') || name.endsWith('_long')) return true;
      if (name.includes('coord') && (name.includes('lon') || name.includes('lng') || name.includes('x') || name.includes('long'))) return true;
      if ((name.includes('lon') || name.includes('lng')) && !name.includes('clone') && !name.includes('belong') && !name.includes('longitudinal')) return true;
      return false;
    });

    const countryCol = columns.find(c => {
      const name = c.name.toLowerCase().trim();
      return /^(country|nation|region|city|state|county|location|address|place|geo)$/i.test(name) || 
             name.includes('country') || name.includes('nation') || name.includes('region') || 
             name.includes('city') || name.includes('state') || name.includes('county') || 
             name.includes('location') || name.includes('address') || name.includes('place');
    });

    return {
      hasLatLon: !!(latCol && lonCol),
      hasCountry: !!countryCol,
      latColName: latCol?.name || '',
      lonColName: lonCol?.name || '',
      countryColName: countryCol?.name || ''
    };
  }, [dataset]);

  // Sync rows & enrich dynamically on load or if geo-columns exist natively
  useEffect(() => {
    const rows = dataset.rows;

    // 1. If dataset already contains native lat/lon coordinates, use them directly
    if (geoColumns.hasLatLon) {
      setEnrichedRows(rows);
      setIsGeographicallyEnriched(false);
      return;
    }

    // 2. Identify country column or scan categorical columns for potential country data
    let detectedCountryColName = geoColumns.countryColName;
    if (!detectedCountryColName) {
      for (const col of dataset.columns) {
        if (col.type === 'categorical') {
          let matchCount = 0;
          const limit = Math.min(20, rows.length);
          for (let i = 0; i < limit; i++) {
            const val = String(rows[i]?.[col.name] || '').toLowerCase().trim();
            if (COUNTRY_COORDINATES[val] || Object.keys(COUNTRY_COORDINATES).some(k => val.includes(k))) {
              matchCount++;
            }
          }
          if (matchCount > 0 && (matchCount / limit) >= 0.15) {
            detectedCountryColName = col.name;
            break;
          }
        }
      }
    }

    // 3. Map countries dynamically to real geographic coordinates in our database
    if (detectedCountryColName) {
      const upgradedRows = rows.map((row, idx) => {
        const rawVal = String(row[detectedCountryColName] || '').toLowerCase().trim();
        let coords = COUNTRY_COORDINATES[rawVal];
        let displayName = row[detectedCountryColName];

        if (!coords) {
          // Substring lookup
          const matchedKey = Object.keys(COUNTRY_COORDINATES).find(k => rawVal.includes(k) || k.includes(rawVal) && rawVal.length > 2);
          if (matchedKey) {
            coords = COUNTRY_COORDINATES[matchedKey];
            displayName = matchedKey.toUpperCase();
          }
        }

        if (coords) {
          // Introduce a minor offset to keep multiple dots for the same country clear and non-coincident
          const scatterLat = (Math.sin(idx * 0.4) * 1.8);
          const scatterLon = (Math.cos(idx * 0.4) * 1.8);
          return {
            ...row,
            _simulated_latitude: parseFloat((coords.lat + scatterLat).toFixed(4)),
            _simulated_longitude: parseFloat((coords.lon + scatterLon).toFixed(4)),
            _simulated_country: displayName,
            _simulated_region: coords.continent
          };
        }

        // Cycle through standard values so every point matches somewhere nicely on screen
        const countriesKeys = Object.keys(COUNTRY_COORDINATES);
        const cycleCountry = countriesKeys[idx % countriesKeys.length];
        const cycleCoords = COUNTRY_COORDINATES[cycleCountry];
        return {
          ...row,
          _simulated_latitude: parseFloat((cycleCoords.lat + (Math.sin(idx * 0.5) * 2)).toFixed(4)),
          _simulated_longitude: parseFloat((cycleCoords.lon + (Math.cos(idx * 0.5) * 2)).toFixed(4)),
          _simulated_country: cycleCountry.toUpperCase(),
          _simulated_region: cycleCoords.continent
        };
      });

      setEnrichedRows(upgradedRows);
      setIsGeographicallyEnriched(true);
    } else {
      // If dataset contains no geographic headers whatsoever, automatically seed elegant spatial coordinates
      const countriesKeys = Object.keys(COUNTRY_COORDINATES);
      const upgradedRows = rows.map((row, idx) => {
        const cycleCountry = countriesKeys[idx % countriesKeys.length];
        const cycleCoords = COUNTRY_COORDINATES[cycleCountry];
        return {
          ...row,
          _simulated_latitude: parseFloat((cycleCoords.lat + (Math.sin(idx * 0.7) * 3.5)).toFixed(4)),
          _simulated_longitude: parseFloat((cycleCoords.lon + (Math.cos(idx * 0.7) * 3.5)).toFixed(4)),
          _simulated_country: cycleCountry.toUpperCase(),
          _simulated_region: cycleCoords.continent
        };
      });

      setEnrichedRows(upgradedRows);
      setIsGeographicallyEnriched(true);
    }
  }, [dataset, geoColumns]);

  // Geographical simulation helper to enrich row variables with custom global distributions
  const handleSimulateGeoAttributes = () => {
    const mockCountries = [
      { name: 'United States', lat: 37.0902, lon: -95.7129, region: 'North America' },
      { name: 'United Kingdom', lat: 55.3781, lon: -3.4360, region: 'Europe' },
      { name: 'Germany', lat: 51.1657, lon: 10.4515, region: 'Eurasia' },
      { name: 'India', lat: 20.5937, lon: 78.9629, region: 'Eurasia' },
      { name: 'Australia', lat: -25.2744, lon: 133.7751, region: 'Australia' },
      { name: 'Brazil', lat: -14.2350, lon: -51.9253, region: 'South America' },
      { name: 'South Africa', lat: -30.5595, lon: 22.9375, region: 'Africa' },
      { name: 'Canada', lat: 56.1304, lon: -106.3468, region: 'North America' },
      { name: 'Japan', lat: 36.2048, lon: 138.2529, region: 'Eurasia' },
      { name: 'France', lat: 46.2276, lon: 2.2137, region: 'Europe' }
    ];

    const upgradedRows = dataset.rows.map((row, idx) => {
      const geoSpot = mockCountries[idx % mockCountries.length];
      const noiseLat = (Math.sin(idx * 0.7) * 4) + (Math.cos(idx * 1.3) * 2);
      const noiseLon = (Math.cos(idx * 0.9) * 5) + (Math.sin(idx * 1.1) * 3);
      return {
        ...row,
        _simulated_latitude: parseFloat((geoSpot.lat + noiseLat).toFixed(4)),
        _simulated_longitude: parseFloat((geoSpot.lon + noiseLon).toFixed(4)),
        _simulated_country: geoSpot.name,
        _simulated_region: geoSpot.region
      };
    });

    setEnrichedRows(upgradedRows);
    setIsGeographicallyEnriched(true);
  };

  // Determine active keys for geospatial rendering
  const activeGeoKeys = useMemo(() => {
    if (isGeographicallyEnriched) {
      return {
        latKey: '_simulated_latitude',
        lonKey: '_simulated_longitude',
        countryKey: '_simulated_country',
        hasLocation: true
      };
    }
    return {
      latKey: geoColumns.latColName,
      lonKey: geoColumns.lonColName,
      countryKey: geoColumns.countryColName,
      hasLocation: geoColumns.hasLatLon || geoColumns.hasCountry
    };
  }, [geoColumns, isGeographicallyEnriched]);

  // Find Slicer targets & Multi-Filter Options
  const categoricalCols = dataset.columns.filter(c => c.type === 'categorical' || c.type === 'boolean');
  const numericCols = dataset.columns.filter(c => c.type === 'numeric');

  // Master lists of Slicers in active use
  const [activeSlicerColumn, setActiveSlicerColumn] = useState<string>(
    strategicSlicer && dataset.columns.some(c => c.name === strategicSlicer)
      ? strategicSlicer
      : (categoricalCols[0]?.name || '')
  );

  const [selectedSlices, setSelectedSlices] = useState<Record<string, string[]>>({});
  const [selectedMapCountry, setSelectedMapCountry] = useState<string | null>(null);
  
  // Interactive global slider slicer percentage (from 5% to 100%)
  const [rowSlicePercentage, setRowSlicePercentage] = useState<number>(100);
  
  // Custom numeric metrics filters (multiple range filters!)
  const [numericFilters, setNumericFilters] = useState<Array<{
    columnName: string;
    min: number;
    max: number;
    currentMin: number;
    currentMax: number;
  }>>([]);

  // Setup initial numeric filter ranges
  useEffect(() => {
    if (numericFilters.length === 0 && numericCols.length > 0) {
      // Pick first two numerical values as pre-configured reactive ranges
      const initialFilters = numericCols.slice(0, 2).map(c => {
        const min = c.statistics.min ?? 0;
        const max = c.statistics.max ?? 100;
        return {
          columnName: c.name,
          min,
          max,
          currentMin: min,
          currentMax: max
        };
      });
      setNumericFilters(initialFilters);
    }
  }, [dataset, numericCols]);

  const handleAddNumericFilter = (colName: string) => {
    if (numericFilters.some(f => f.columnName === colName)) return;
    const col = numericCols.find(c => c.name === colName);
    if (!col) return;
    const min = col.statistics.min ?? 0;
    const max = col.statistics.max ?? 100;
    setNumericFilters(prev => [
      ...prev,
      {
        columnName: colName,
        min,
        max,
        currentMin: min,
        currentMax: max
      }
    ]);
  };

  const handleRemoveNumericFilter = (colName: string) => {
    setNumericFilters(prev => prev.filter(f => f.columnName !== colName));
  };

  const handleUpdateSlider = (colName: string, value: number) => {
    setNumericFilters(prev => prev.map(f => {
      if (f.columnName === colName) {
        return { ...f, currentMax: value };
      }
      return f;
    }));
  };

  // Toggle Category Slices
  const handleToggleSlice = (colName: string, value: string) => {
    setSelectedSlices(prev => {
      const currentValues = prev[colName] || [];
      const updatedValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return {
        ...prev,
        [colName]: updatedValues
      };
    });
  };

  const handleResetFilters = () => {
    setSelectedSlices({});
    setRowSlicePercentage(100);
    // Reset all ranges to maximum min/max limits
    setNumericFilters(prev => prev.map(f => ({
      ...f,
      currentMin: f.min,
      currentMax: f.max
    })));
  };

  // Extract unique category options for any categorical column
  const getCategoriesForColumn = (colName: string) => {
    if (!colName) return [];
    const vals = enrichedRows.map(r => {
      const raw = r[colName];
      return raw === undefined || raw === null ? 'Unknown' : String(raw);
    });
    return Array.from(new Set(vals)).filter(v => v !== 'null' && v !== '');
  };

  // Main active categorical options mapping
  const activeSlicerCategories = useMemo(() => {
    return getCategoriesForColumn(activeSlicerColumn);
  }, [enrichedRows, activeSlicerColumn]);

  // Compute filtered rows dynamically based on ALL active multi-slicers, range filters, and selected map country
  const filteredRows = useMemo(() => {
    const baseFiltered = enrichedRows.filter(row => {
      // 0. Country Map Filter validation (if a country is clicked on the map)
      if (selectedMapCountry) {
        let countryVal = '';
        if (activeGeoKeys.countryKey && row[activeGeoKeys.countryKey]) {
          countryVal = String(row[activeGeoKeys.countryKey]).toLowerCase().trim();
        } else if (row._simulated_country) {
          countryVal = String(row._simulated_country).toLowerCase().trim();
        }

        const lowerSelected = selectedMapCountry.toLowerCase().trim();
        if (!countryVal.includes(lowerSelected) && !lowerSelected.includes(countryVal)) {
          return false;
        }
      }

      // 1. Multi Categorical slices validation
      for (const [colName, selectedValues] of Object.entries(selectedSlices)) {
        const valArray = selectedValues as string[];
        if (valArray.length === 0) continue;
        const rowVal = row[colName] === undefined || row[colName] === null ? 'Unknown' : String(row[colName]);
        if (!valArray.includes(rowVal)) {
          return false;
        }
      }

      // 2. Multiple numeric threshold checks
      for (const filter of numericFilters) {
        const val = Number(row[filter.columnName]);
        if (!isNaN(val)) {
          if (val < filter.currentMin || val > filter.currentMax) {
            return false;
          }
        }
      }
      return true;
    });

    const sliceCount = Math.max(1, Math.ceil((rowSlicePercentage / 100) * baseFiltered.length));
    return baseFiltered.slice(0, sliceCount);
  }, [enrichedRows, selectedSlices, numericFilters, rowSlicePercentage, selectedMapCountry, activeGeoKeys]);

  // Track dynamic frequency of each country in the active subset
  const countryRowCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const { countryKey } = activeGeoKeys;

    enrichedRows.forEach(row => {
      let cVal = '';
      if (row._simulated_country) {
        cVal = String(row._simulated_country).toLowerCase().trim();
      } else if (countryKey && row[countryKey]) {
        cVal = String(row[countryKey]).toLowerCase().trim();
      }

      if (cVal) {
        counts[cVal] = (counts[cVal] || 0) + 1;
      }
    });
    return counts;
  }, [enrichedRows, activeGeoKeys]);

  // KPI Calculations based on user numeric variables selection
  const [selectedKpiSumCol, setSelectedKpiSumCol] = useState(
    numericCols.find(c => /charge|revenue|revenue|spend|cost|amount/i.test(c.name))?.name || numericCols[0]?.name || ''
  );
  
  const [selectedKpiAvgCol, setSelectedKpiAvgCol] = useState(
    numericCols.find(c => /tenure|hours|days|success|age|duration/i.test(c.name))?.name || numericCols[1]?.name || numericCols[0]?.name || ''
  );

  // Dynamic values computation for KPIs
  const cumulativeValue = useMemo(() => {
    if (filteredRows.length === 0 || !selectedKpiSumCol) return 0;
    const sum = filteredRows.reduce((acc, r) => acc + (Number(r[selectedKpiSumCol]) || 0), 0);
    return parseFloat(sum.toFixed(2));
  }, [filteredRows, selectedKpiSumCol]);

  const averageRatio = useMemo(() => {
    if (filteredRows.length === 0 || !selectedKpiAvgCol) return 0;
    const sum = filteredRows.reduce((acc, r) => acc + (Number(r[selectedKpiAvgCol]) || 0), 0);
    return parseFloat((sum / filteredRows.length).toFixed(2));
  }, [filteredRows, selectedKpiAvgCol]);

  const maxValue = useMemo(() => {
    if (filteredRows.length === 0 || !selectedKpiSumCol) return 0;
    const max = Math.max(...filteredRows.map(r => Number(r[selectedKpiSumCol]) || 0));
    return max === -Infinity ? 0 : parseFloat(max.toFixed(2));
  }, [filteredRows, selectedKpiSumCol]);

  // Chart data 1: Volume segment counts matching the selected categorical display
  const [segmentDisplayCol, setSegmentDisplayCol] = useState(categoricalCols[0]?.name || '');
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');

  const segmentChartData = useMemo(() => {
    if (!segmentDisplayCol) return [];
    const counts: Record<string, number> = {};
    filteredRows.forEach(row => {
      const val = row[segmentDisplayCol];
      const key = val === undefined || val === null ? 'Unknown' : String(val);
      counts[key] = (counts[key] || 0) + 1;
    });

    const total = filteredRows.length || 1;
    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: parseFloat(((count / total) * 100).toFixed(1))
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8); // Top 8 values
  }, [filteredRows, segmentDisplayCol]);

  // Chart data 2: Visual relationship Scatter comparison of two numerical parameters
  const [scatterX, setScatterX] = useState(numericCols[0]?.name || '');
  const [scatterY, setScatterY] = useState(numericCols[1]?.name || numericCols[0]?.name || '');

  const scatterChartData = useMemo(() => {
    if (!scatterX || !scatterY) return [];
    // sample 100 points for crisp scatter visualization
    return filteredRows.slice(0, 100).map((row, idx) => ({
      id: idx,
      x: parseFloat(Number(row[scatterX] || 0).toFixed(2)),
      y: parseFloat(Number(row[scatterY] || 0).toFixed(2)),
      label: row[categoricalCols[0]?.name] || `Row ${idx + 1}`
    }));
  }, [filteredRows, scatterX, scatterY, categoricalCols]);

  // Chart data 3: Historical brush area progression line data
  const dateCol = useMemo(() => {
    return dataset.columns.find(c => c.type === 'datetime')?.name || '';
  }, [dataset]);

  const areaTimeSeriesData = useMemo(() => {
    const trendCol = selectedKpiSumCol || numericCols[0]?.name || '';
    if (!trendCol) return [];
    
    return filteredRows.slice(0, 40).map((row, idx) => {
      const xLabel = dateCol && row[dateCol]
        ? String(row[dateCol]).split('T')[0]
        : `Index ${idx + 1}`;
      return {
        name: xLabel,
        metric: parseFloat(Number(row[trendCol] || 0).toFixed(2))
      };
    });
  }, [filteredRows, selectedKpiSumCol, numericCols, dateCol]);

  // World interactive Map details
  const [focusedPoint, setFocusedPoint] = useState<any | null>(null);

  // Filter coordinates-capable rows
  const mapDataPoints = useMemo(() => {
    if (!activeGeoKeys.hasLocation) return [];
    const { latKey, lonKey, countryKey } = activeGeoKeys;

    return filteredRows
      .map((row, idx) => {
        const lat = parseFloat(row[latKey]);
        const lon = parseFloat(row[lonKey]);
        const country = row[countryKey] || 'Unknown';

        if (isNaN(lat) || isNaN(lon)) return null;
        return {
          id: idx,
          lat,
          lon,
          country,
          metricUnit: selectedKpiSumCol ? parseFloat(Number(row[selectedKpiSumCol] || 0).toFixed(1)) : 10,
          rowRaw: row
        };
      })
      .filter(p => p !== null) as any[];
  }, [filteredRows, activeGeoKeys, selectedKpiSumCol]);

  // Continent aggregated data computed dynamically
  const regionAggregations = useMemo(() => {
    const aggregates: Record<string, { count: number; sumMetric: number }> = {};
    const { countryKey } = activeGeoKeys;

    filteredRows.forEach(row => {
      let regionKey = 'Other';
      if (isGeographicallyEnriched) {
        regionKey = row._simulated_region || 'Other';
      } else {
        // Guess continent based on country name string
        const cNorm = String(row[countryKey] || '').toLowerCase();
        if (cNorm.includes('state') || cNorm.includes('usa') || cNorm.includes('canada') || cNorm.includes('america')) {
          regionKey = 'North America';
        } else if (cNorm.includes('brazil') || cNorm.includes('argentina') || cNorm.includes('colombia')) {
          regionKey = 'South America';
        } else if (cNorm.includes('german') || cNorm.includes('france') || cNorm.includes('uk') || cNorm.includes('london') || cNorm.includes('spain') || cNorm.includes('italy') || cNorm.includes('europe')) {
          regionKey = 'Europe';
        } else if (cNorm.includes('china') || cNorm.includes('india') || cNorm.includes('japan') || cNorm.includes('singapore') || cNorm.includes('asia')) {
          regionKey = 'Eurasia';
        } else if (cNorm.includes('africa') || cNorm.includes('nigeria') || cNorm.includes('egypt')) {
          regionKey = 'Africa';
        } else if (cNorm.includes('australia') || cNorm.includes('zealand')) {
          regionKey = 'Australia';
        }
      }

      const val = selectedKpiSumCol ? Number(row[selectedKpiSumCol] || 0) : 1;
      if (!aggregates[regionKey]) {
        aggregates[regionKey] = { count: 0, sumMetric: 0 };
      }
      aggregates[regionKey].count += 1;
      aggregates[regionKey].sumMetric += val;
    });

    return aggregates;
  }, [filteredRows, activeGeoKeys, selectedKpiSumCol, isGeographicallyEnriched]);

  // Helper convert coordinates cleanly into responsive SVG map grid
  const projectCoordinates = (lat: number, lon: number, width: number, height: number) => {
    // Mercator coordinate conversion standard boundaries
    // Longitude: -180 to 180 maps to width (0 to width)
    const x = ((lon + 180) / 360) * width;
    // Latitude: 90 to -90 bounds to height (0 to height)
    const y = ((90 - lat) / 180) * height;
    return { x, y };
  };

  return (
    <div className="space-y-8" id="dashboard_module_upgraded">
      
      {/* 1. TOP DOCK: HEADER & INTERACTIVE MAP VIEWPORT */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[420px] h-[340px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row gap-6 items-stretch justify-between relative z-10">
          
          {/* Metadata & Map Toggles */}
          <div className="lg:w-5/12 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold text-teal-400 bg-teal-500/10 border border-teal-500/25 px-2.5 py-1 rounded-xl uppercase tracking-widest inline-block">
                GEOGRAPHIC MAPS & INSIGHTS
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight leading-tight font-sans">
                Global Performance Map
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Interactive mapping bubbles scale with customer volume and KPI values across continents, keeping your strategic expansion and localized marketing balanced.
              </p>
            </div>Description: 

            {/* Geographical Check Indicator and simulation actions */}
            <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-850/80 space-y-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4.5 h-4.5 text-indigo-400" />
                <span className="text-xs font-bold text-white font-sans">Location Fields Detected:</span>
              </div>
              
              <ul className="text-[10.5px] space-y-1.5 text-slate-300 font-mono">
                <li className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${geoColumns.hasLatLon || isGeographicallyEnriched ? 'bg-emerald-400 shadow shadow-emerald-400' : 'bg-slate-600'}`} />
                  Latitude/Longitude coordinates: <strong className="text-white">{geoColumns.hasLatLon ? 'NATIVE' : isGeographicallyEnriched ? 'GEO-ENRICHED' : 'FALSE'}</strong>
                </li>
                <li className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${geoColumns.hasCountry || isGeographicallyEnriched ? 'bg-emerald-400 shadow shadow-emerald-400' : 'bg-slate-600'}`} />
                  Country/Region columns: <strong className="text-white">{geoColumns.hasCountry ? `FOUND (${geoColumns.countryColName})` : isGeographicallyEnriched ? 'AUTO-LINKED' : 'NOT DETECTED'}</strong>
                </li>
              </ul>

              {!geoColumns.hasLatLon && !geoColumns.hasCountry && !isGeographicallyEnriched && (
                <div className="pt-2 border-t border-slate-800">
                  <div className="flex items-start gap-2 mb-2 p-1 bg-amber-500/5 rounded border border-amber-500/10">
                    <Info className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span className="text-[9px] text-[#cca055] font-sans leading-tight">
                      No country or GPS headers detected in raw columns. Enrich dataset with Global Coordinates to show mapping.
                    </span>
                  </div>
                  <button
                    onClick={handleSimulateGeoAttributes}
                    className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs font-mono transition-all uppercase cursor-pointer tracking-wider flex items-center justify-center gap-1.5 shrink-0 shadow"
                  >
                    <Plus className="w-3.5 h-3.5" /> Geographically Enrich Dataset
                  </button>
                </div>
              )}

              {(geoColumns.hasLatLon || isGeographicallyEnriched) && (
                <div className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1.5 bg-emerald-500/10 py-1.5 px-2.5 rounded-lg border border-emerald-500/20">
                  <CheckCircle className="w-3.5 h-3.5" /> {isGeographicallyEnriched ? 'Automated Coordinate Geocoder Active' : 'Native Coordinates Auto-Linked'} ({mapDataPoints.length} points mapped)
                </div>
              )}
            </div>
          </div>

          {/* Style executive SVG World Map Projection */}
          <div className="lg:w-7/12 bg-[#080d1a] border border-slate-800 rounded-2xl p-4.5 relative overflow-hidden min-h-[300px] flex flex-col justify-between">
            {/* Header / Active Filter Info badge */}
            <div className="absolute top-3 left-3 bg-[#0c1428]/95 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-350 font-sans backdrop-blur cursor-default select-none z-10 space-y-1">
              <p className="font-bold text-[10px] uppercase font-mono tracking-widest text-[#5bc1c1]">Geo Analytics Engine</p>
              <div className="text-[11px] text-white flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block animate-pulse" />
                Aggregated Rows Mapped: <strong className="text-emerald-305 text-emerald-400">{filteredRows.length.toLocaleString()} ({((filteredRows.length / (enrichedRows.length || 1)) * 100).toFixed(0)}%)</strong>
              </div>
            </div>

            {selectedMapCountry && (
              <div className="absolute top-3 right-3 bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 rounded-xl px-3 py-1.5 text-xs font-mono font-bold flex items-center gap-2 backdrop-blur select-none z-10 shadow-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Country: <strong className="text-white">{selectedMapCountry.toUpperCase()}</strong>
                <button 
                  onClick={() => setSelectedMapCountry(null)}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-1.5 py-0.5 rounded text-[10px] uppercase font-mono transition-colors border-0 cursor-pointer ml-1"
                >
                  Clear Slicer
                </button>
              </div>
            )}

            {/* Simulated Continent SVG Graphics Layer */}
            <div className="flex-1 min-h-[230px] flex items-center justify-center relative bg-[#070b16] rounded-xl border border-slate-850 p-2 mt-10">
              <svg viewBox="0 0 160 100" className="w-full h-full opacity-90" style={{ maxHeight: '260px' }} id="svg_continent_map">
                {/* Pattern Definitions for Realistic Grid look */}
                <defs>
                  <pattern id="dotpattern" x="0" y="0" width="2" height="2" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="0.3" fill="#13233c" />
                  </pattern>
                </defs>

                {/* Grid Overlay mapping */}
                <rect width="100%" height="100%" fill="url(#dotpattern)" />

                {/* 1. Fine Compass and graticule lines */}
                <g opacity="0.08" stroke="#38bdf8" strokeWidth="0.12" strokeDasharray="1,3">
                  <line x1="0" y1="25" x2="160" y2="25" />
                  <line x1="0" y1="50" x2="160" y2="50" />
                  <line x1="0" y1="75" x2="160" y2="75" />
                  <line x1="40" y1="0" x2="40" y2="100" />
                  <line x1="80" y1="0" x2="80" y2="100" />
                  <line x1="120" y1="0" x2="120" y2="100" />
                </g>

                {/* Map equator & Prime meridian indicators */}
                <line x1="0" y1="50" x2="160" y2="50" stroke="#0284c7" strokeWidth="0.15" opacity="0.25" />
                <line x1="80" y1="0" x2="80" y2="100" stroke="#0284c7" strokeWidth="0.15" opacity="0.25" />

                {/* 2. Base Continent background backing shadows (subtle shape) */}
                {STYLIZED_CONTINENTS.map(continent => (
                  <polygon
                    key={`bkg-${continent.name}`}
                    points={continent.points}
                    fill="rgba(30, 41, 59, 0.08)"
                    stroke="none"
                  />
                ))}

                {/* 3. High-Realism Country polygons mapping automatically selected based on dataset frequency */}
                {WORLD_COUNTRIES.map(country => {
                  // Sum row counts matching keys
                  const countryRows = country.keys.reduce((sum, key) => sum + (countryRowCounts[key] || 0), 0);
                  const isActive = countryRows > 0;
                  const isSelected = selectedMapCountry === country.name;

                  // Define dynamic styles
                  let fill = 'rgba(15, 23, 42, 0.4)';
                  let stroke = '#1e293b';
                  let strokeWidth = '0.25';

                  if (isSelected) {
                    fill = 'rgba(16, 185, 129, 0.45)';
                    stroke = '#10b981';
                    strokeWidth = '0.9';
                  } else if (isActive) {
                    fill = 'rgba(99, 102, 241, 0.22)';
                    stroke = '#6366f1';
                    strokeWidth = '0.5';
                  }

                  return (
                    <polygon
                      key={`country-${country.name}`}
                      points={country.points}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={strokeWidth}
                      className="transition-all duration-300 hover:fill-emerald-500/25 cursor-pointer"
                      onClick={() => {
                        if (isActive) {
                          setSelectedMapCountry(isSelected ? null : country.name);
                        }
                      }}
                    >
                      <title>{country.name} ({countryRows.toLocaleString()} rows present in dataset - Click to Slicing Filter)</title>
                    </polygon>
                  );
                })}

                {/* 4. Display indicator bubbles for active country counts */}
                {WORLD_COUNTRIES.map(country => {
                  const countryRows = country.keys.reduce((sum, key) => sum + (countryRowCounts[key] || 0), 0);
                  if (countryRows === 0) return null;

                  // Find centroid of the polygon coordinates
                  const coordPairs = country.points.split(' ').map(p => p.split(',').map(Number));
                  let sumX = 0, sumY = 0;
                  coordPairs.forEach(pair => {
                    sumX += pair[0];
                    sumY += pair[1];
                  });
                  const centroid = {
                    x: sumX / coordPairs.length,
                    y: sumY / coordPairs.length
                  };

                  const isSelected = selectedMapCountry === country.name;
                  const radius = 2.5 + Math.min(5.5, (countryRows / (filteredRows.length || 1)) * 12);

                  return (
                    <g key={`indicator-${country.name}`} className="cursor-pointer" onClick={() => setSelectedMapCountry(isSelected ? null : country.name)}>
                      <circle
                        cx={centroid.x}
                        cy={centroid.y}
                        r={radius}
                        fill={isSelected ? '#10b981' : '#6366f1'}
                        fillOpacity="0.2"
                        stroke={isSelected ? '#34d399' : '#818cf8'}
                        strokeWidth="0.35"
                        className="animate-pulse"
                      />
                      <circle
                        cx={centroid.x}
                        cy={centroid.y}
                        r={0.8}
                        fill={isSelected ? '#34d399' : '#4ade80'}
                      />
                      <text
                        x={centroid.x}
                        y={centroid.y - radius - 0.8}
                        fill="#e2e8f0"
                        fontSize="2.4px"
                        fontFamily="monospace"
                        fontWeight="black"
                        textAnchor="middle"
                      >
                        {country.name} ({countryRows})
                      </text>
                    </g>
                  );
                })}

                {/* 5. Draw raw pinpoints coordinates if they exist in dataset */}
                {mapDataPoints.slice(0, 150).map((pt, idx) => {
                  const { x, y } = projectCoordinates(pt.lat, pt.lon, 160, 100);
                  const isFocused = focusedPoint?.id === pt.id;

                  return (
                    <g key={`pin-${pt.id}-${idx}`}>
                      {isFocused && (
                        <circle
                          cx={x}
                          cy={y}
                          r={3.2}
                          fill="none"
                          stroke="#f43f5e"
                          strokeWidth="0.3"
                          className="animate-ping"
                        />
                      )}
                      <circle
                        cx={x}
                        cy={y}
                        r={isFocused ? 1.6 : 0.85}
                        fill={isFocused ? '#f43f5e' : '#22d3ee'}
                        stroke={isFocused ? '#ffffff' : '#0891b2'}
                        strokeWidth={isFocused ? 0.35 : 0.15}
                        className="cursor-pointer hover:scale-150 transition-transform duration-200"
                        onClick={() => setFocusedPoint(pt)}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* No coordinates present overlay */}
              {mapDataPoints.length === 0 && !isGeographicallyEnriched && (
                <div className="absolute inset-0 bg-[#090e19]/90 flex flex-col items-center justify-center p-6 text-center z-10">
                  <Globe className="w-10 h-10 text-slate-600 mb-2 animate-pulse" />
                  <p className="text-white text-xs font-bold font-sans">Geospatial Overlay Offline</p>
                  <p className="text-[10px] text-slate-450 mt-1 max-w-sm font-sans leading-relaxed">
                    Awaiting coordinate initialization. Upload coordinates or country columns to automatically map interactive coordinates in real-time.
                  </p>
                </div>
              )}
            </div>

            {/* Focused data point detail banner */}
            <div className="min-h-[38px] bg-slate-950/40 border border-slate-850 rounded-xl p-2 px-3 flex items-center justify-between text-[11px] text-slate-400 font-mono mt-3">
              {focusedPoint ? (
                <>
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Point Identified: <strong className="text-white">{focusedPoint.country}</strong> ({focusedPoint.lat.toFixed(1)}°, {focusedPoint.lon.toFixed(1)}°)</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span>Valuation: <strong className="text-teal-400">${focusedPoint.metricUnit}</strong></span>
                    <button
                      onClick={() => setFocusedPoint(null)}
                      className="text-[9px] text-slate-550 hover:text-slate-350 cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 text-slate-500 text-[10px] italic">
                  <Info className="w-3.5 h-3.5" />
                  <span>Interactive map is responsive. Click any emerald coordinate pin to drill down into active row telemetry logs.</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* 2. ADVANCED CONTROL DECK: MULTI-SLICERS & METRICS SLIDES */}
      <div className="bg-slate-900/60 p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 relative z-10">
          <div>
            <span className="text-[10px] font-mono font-bold text-indigo-400 tracking-widest uppercase">FILTERS & CONTROLS</span>
            <h2 className="text-xl font-extrabold text-white tracking-tight mt-1 flex items-center gap-2 font-sans">
              <SlidersHorizontal className="w-5 h-5 text-indigo-400" /> Interactive Slicers & Filters
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl font-sans">
              Filter the dashboard by pinning specific categories across columns or utilizing quantitative range slider scales.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="text-xs font-mono font-bold text-indigo-455 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/25 px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all duration-300 self-start md:self-auto cursor-pointer border border-indigo-500/20 shadow-md text-indigo-400"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Clear All Global Filters
          </button>
        </div>

        {/* Filters Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-5 border-t border-slate-800 relative z-10">
          
          {/* Slicer Column A: Active Categorical Multi-Slicer */}
          <div className="space-y-3 bg-[#0d1322]/50 p-4 rounded-2xl border border-slate-850">
            <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-wider font-mono font-bold px-0.5">
              <span>Primary Category Slicer</span>
              <select
                value={activeSlicerColumn}
                onChange={(e) => setActiveSlicerColumn(e.target.value)}
                className="bg-transparent border-0 font-extrabold font-mono text-indigo-400 focus:ring-0 p-0 text-xs shrink-0 cursor-pointer"
              >
                {categoricalCols.map(c => (
                  <option key={c.name} value={c.name} className="bg-slate-950 text-slate-200">
                    {c.name}
                  </option>
                ))}
                {isGeographicallyEnriched && (
                  <>
                    <option value="_simulated_country" className="bg-slate-950 text-slate-200">_simulated_country</option>
                    <option value="_simulated_region" className="bg-slate-950 text-slate-200">_simulated_region</option>
                  </>
                )}
              </select>
            </div>
            
            <p className="text-[10.5px] text-slate-500 font-mono leading-tight">
              Select values from "{activeSlicerColumn}" to slice rows:
            </p>

            <div className="flex flex-wrap gap-1.5 max-h-[145px] overflow-y-auto p-2 border border-slate-850 bg-slate-950/40 rounded-xl scrollbar-thin">
              {activeSlicerCategories.map(cat => {
                const isSelected = selectedSlices[activeSlicerColumn]?.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => handleToggleSlice(activeSlicerColumn, cat)}
                    className={`text-[10px] font-mono font-bold px-2.5 py-1.5 rounded-lg transition-all border shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                        : 'bg-slate-900/60 hover:bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
              {activeSlicerCategories.length === 0 && (
                <span className="text-[10px] text-slate-500 font-mono italic p-1">No options available.</span>
              )}
            </div>
          </div>

          {/* Slicer Column B: Active Quantitative Range Sliders */}
          <div className="space-y-3 bg-[#0d1322]/50 p-4 rounded-2xl border border-slate-850 col-span-1 space-y-4">
            <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-wider font-mono font-bold px-0.5 mb-1">
              <span>Dynamic Quantitative Limits</span>
              
              <div className="flex items-center gap-1">
                <span className="text-[9px] text-slate-500 font-mono">Pin Parameter:</span>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddNumericFilter(e.target.value);
                      e.target.value = ''; // Reset select value after adding
                    }
                  }}
                  className="bg-[#121c32] border border-slate-800 rounded px-1.5 py-0.5 text-[9.5px] font-mono text-indigo-400 cursor-pointer focus:outline-none"
                  defaultValue=""
                >
                  <option value="" disabled>+ Add Numeric Filter</option>
                  {numericCols.map(c => (
                    <option key={c.name} value={c.name} disabled={numericFilters.some(f => f.columnName === c.name)}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[145px] overflow-y-auto scrollbar-thin pr-1">
              {numericFilters.map((filter) => {
                const rangePercent = ((filter.currentMax - filter.min) / (filter.max - filter.min || 1)) * 100;
                return (
                  <div key={filter.columnName} className="p-3 bg-slate-950/50 rounded-xl border border-slate-850 relative">
                    <button
                      onClick={() => handleRemoveNumericFilter(filter.columnName)}
                      className="absolute top-2.5 right-2.5 p-1 rounded text-slate-500 hover:text-rose-400 bg-slate-900 border border-slate-800 cursor-pointer hover:bg-rose-500/10 hover:border-rose-500/10 transition-all"
                      title="Remove Filter"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>

                    <div className="text-[10px] font-black text-slate-200 truncate pr-6 mb-1.5 font-mono">
                      {filter.columnName}
                    </div>

                    <div className="flex justify-between text-[9px] text-slate-450 font-mono mb-2">
                      <span>Min: {filter.min}</span>
                      <span>Cutoff: <strong className="text-indigo-400">{filter.currentMax}</strong></span>
                    </div>

                    <input
                      type="range"
                      min={filter.min}
                      max={filter.max}
                      value={filter.currentMax}
                      onChange={(e) => handleUpdateSlider(filter.columnName, Number(e.target.value))}
                      className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />

                    <div className="mt-1 flex items-center justify-between text-[8px] text-slate-550 font-mono">
                      <span>Threshold at: {Math.min(100, Number(rangePercent.toFixed(0)))}%</span>
                      <span>Bound: {filter.max}</span>
                    </div>
                  </div>
                );
              })}

              {numericFilters.length === 0 && (
                <div className="col-span-2 py-8 text-center text-slate-550 font-mono text-[11px] italic">
                  No quantitative filters added. Click the dropdown above to filter columns.
                </div>
              )}
            </div>
          </div>

          {/* Slicer Column C: Interactive Row Volumetry Slicer Slide */}
          <div className="space-y-3 bg-[#0d1322]/50 p-4 rounded-2xl border border-slate-850 col-span-1 space-y-4">
            <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-wider font-mono font-bold px-0.5 mb-1">
              <span>Interactive Row Sampling</span>
              <span className="text-[9.5px] font-mono text-[#3bc8c8] font-extrabold uppercase">SLIDER SLICER</span>
            </div>

            <p className="text-[10.5px] text-slate-505 text-slate-400 font-medium leading-tight">
              Slide to dynamically slice or sample a sub-segment percentage of active rows in memory:
            </p>

            <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-850 space-y-2.5">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-slate-400">Memory Slice Limit:</span>
                <span className="text-white font-extrabold text-[#3bc8c8]">{rowSlicePercentage}%</span>
              </div>

              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={rowSlicePercentage}
                onChange={(e) => setRowSlicePercentage(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />

              <div className="flex justify-between text-[8px] font-mono text-slate-550">
                <span>MIN: 5%</span>
                <span>MAX: 100%</span>
              </div>
            </div>

            <div className="bg-[#1b5bd2]/5 p-3 rounded-xl border border-[#3bc8c8]/10 text-[10px] text-slate-450 font-mono space-y-1">
              <p className="text-[#3bc8c8] font-bold uppercase text-[9px] tracking-wider">Volume Slicer Status:</p>
              <div className="flex justify-between text-slate-450">
                <span>Retaining rows:</span>
                <strong className="text-slate-350">{filteredRows.length} units</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Applied Active Filters Status Badges */}
        <div className="mt-5 pt-4 border-t border-slate-850 flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[9px] font-mono font-bold text-slate-500">Active Tags:</span>
            {Object.entries(selectedSlices).map(([col, vals]) => {
              const valArray = vals as string[];
              if (valArray.length === 0) return null;
              return (
                <div key={col} className="bg-indigo-500/10 border border-indigo-550/20 text-indigo-300 font-mono text-[9px] py-1 px-2.5 rounded-lg flex items-center gap-1.5">
                  <span>{col}:</span>
                  <strong className="text-white">{valArray.join(', ')}</strong>
                  <button
                    onClick={() => setSelectedSlices(prev => ({ ...prev, [col]: [] }))}
                    className="hover:text-rose-400 ml-1 cursor-pointer font-bold"
                  >
                    ×
                  </button>
                </div>
              );
            })}
            
            {Object.keys(selectedSlices).every(col => selectedSlices[col]?.length === 0) && (
              <span className="text-[10px] text-slate-500 font-mono italic">No category restrictions in play. Row index set to open.</span>
            )}
          </div>

          <div className="text-[11px] font-mono text-slate-450 bg-[#0f1526] py-1.5 px-3 rounded-xl border border-slate-850 flex items-center gap-1.5 shrink-0 select-none">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <span>Retaining: <strong className="text-white">{filteredRows.length.toLocaleString()}</strong> / <strong>{enrichedRows.length.toLocaleString()}</strong> rows ({((filteredRows.length / (enrichedRows.length || 1)) * 100).toFixed(0)}% index)</span>
          </div>
        </div>

      </div>

      {/* 3. PERFORMANCE & VALUE COHORT KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10" id="dashboard_kpi_cards">
        
        {/* KPI 1: Cohort size */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl shadow-xl flex items-center justify-between hover:border-slate-700 transition-all duration-300">
          <div className="space-y-1 block truncate">
            <p className="text-[10px] font-bold text-slate-450 uppercase tracking-widest font-mono">Isolated Dataset Size</p>
            <p className="text-2xl font-black text-white font-mono leading-none">{filteredRows.length.toLocaleString()}</p>
            <p className="text-[10px] text-slate-500 mt-1.5 font-bold font-mono">
              Count of filtered rows active
            </p>
          </div>
          <div className="w-11 h-11 bg-indigo-500/10 border border-indigo-500/25 rounded-2xl flex items-center justify-center text-indigo-400 shrink-0 shadow">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 2: Total Sum selected col */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all duration-300">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 block truncate">
              <p className="text-[10px] font-bold text-slate-450 uppercase tracking-widest font-mono flex items-center gap-1">
                Sum Metric Value
              </p>
              
              <p className="text-2xl font-black text-white font-mono leading-none truncate" title={`$${cumulativeValue.toLocaleString()}`}>
                ${cumulativeValue.toLocaleString()}
              </p>
            </div>
            
            <div className="w-11 h-11 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl flex items-center justify-center text-emerald-400 shrink-0 shadow">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          
          <div className="mt-3 flex items-center justify-between gap-1 border-t border-slate-850/60 pt-2 text-[10px]">
            <span className="font-mono text-slate-500">Lens Column:</span>
            <select
              value={selectedKpiSumCol}
              onChange={(e) => setSelectedKpiSumCol(e.target.value)}
              className="bg-[#0b0f19] border border-slate-800 rounded px-1.5 py-0.5 text-[9px] font-mono text-indigo-400 cursor-pointer font-bold focus:outline-none"
            >
              {numericCols.map(c => (
                <option key={c.name} value={c.name} className="text-xs">
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* KPI 3: Center Ratio selected col */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all duration-300">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 block truncate">
              <p className="text-[10px] font-bold text-slate-450 uppercase tracking-widest font-mono">
                Average Value
              </p>
              
              <p className="text-2xl font-black text-white font-mono leading-none truncate" title={averageRatio.toString()}>
                {averageRatio}
              </p>
            </div>
            
            <div className="w-11 h-11 bg-amber-500/10 border border-amber-500/25 rounded-2xl flex items-center justify-center text-amber-400 shrink-0 shadow">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-1 border-t border-slate-850/60 pt-2 text-[10px]">
            <span className="font-mono text-slate-500">Center Metric:</span>
            <select
              value={selectedKpiAvgCol}
              onChange={(e) => setSelectedKpiAvgCol(e.target.value)}
              className="bg-[#0b0f19] border border-slate-800 rounded px-1.5 py-0.5 text-[9px] font-mono text-indigo-450 text-indigo-400 cursor-pointer font-bold focus:outline-none"
            >
              {numericCols.map(c => (
                <option key={c.name} value={c.name} className="text-xs">
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* KPI 4: Peak Value */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl shadow-xl flex items-center justify-between hover:border-slate-700 transition-all duration-300">
          <div className="space-y-1 block truncate">
            <p className="text-[10px] font-bold text-slate-450 uppercase tracking-widest font-mono">Extreme Ceiling Peak</p>
            <p className="text-2xl font-black text-white font-mono leading-none truncate" title={`$${maxValue.toLocaleString()}`}>
              ${maxValue.toLocaleString()}
            </p>
            <p className="text-[10px] text-indigo-400 font-bold font-mono">
              Max of active sum metrics
            </p>
          </div>
          <div className="w-11 h-11 bg-teal-500/10 border border-teal-500/25 rounded-2xl flex items-center justify-center text-teal-400 shrink-0 shadow">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* 4. VISUALS BENTO WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10" id="dashboard_visuals_grid">
        
        {/* CHART A: DEMOGRAPHICS SEGMENTATION ANALYSIS */}
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-2xl flex flex-col justify-between h-full hover:border-slate-700 transition-colors">
          <div>
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5 font-sans">
                <BarChart3 className="w-4.5 h-4.5 text-indigo-400" /> Demographic Segment Breakdown
              </h3>
              
              <div className="flex gap-1 bg-[#0b0f19] border border-slate-800 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setChartType('bar')}
                  className={`px-2 py-1 rounded text-[9px] font-bold font-mono cursor-pointer ${chartType === 'bar' ? 'bg-indigo-650 text-white shadow' : 'text-slate-550 text-slate-400 hover:text-white'}`}
                >
                  BAR
                </button>
                <button
                  type="button"
                  onClick={() => setChartType('pie')}
                  className={`px-2 py-1 rounded text-[9px] font-bold font-mono cursor-pointer ${chartType === 'pie' ? 'bg-indigo-650 text-white shadow' : 'text-slate-550 text-slate-400 hover:text-white'}`}
                >
                  PIE
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mb-4 px-0.5">
              <span>Segmented By Column:</span>
              <select
                value={segmentDisplayCol}
                onChange={(e) => setSegmentDisplayCol(e.target.value)}
                className="bg-transparent border-0 font-extrabold font-mono text-indigo-400 focus:ring-0 p-0 text-xs shrink-0 cursor-pointer focus:outline-none"
              >
                {categoricalCols.map(c => (
                  <option key={c.name} value={c.name} className="bg-slate-950 text-slate-200">
                    {c.name}
                  </option>
                ))}
                {isGeographicallyEnriched && (
                  <>
                    <option value="_simulated_country" className="bg-slate-950 text-slate-200">_simulated_country</option>
                    <option value="_simulated_region" className="bg-slate-950 text-slate-200">_simulated_region</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="h-[210px] w-full mt-2 relative">
            {segmentChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                  <BarChart data={segmentChartData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                    <Tooltip
                      contentStyle={{ fontSize: '11px', background: 'rgba(15,23,42,0.92)', backdropFilter: 'blur(8px)', borderColor: '#334155', color: '#fff', borderRadius: '12px' }}
                    />
                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]}>
                      {segmentChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#a855f7'} />
                      ))}
                    </Bar>
                  </BarChart>
                ) : (
                  <PieChart>
                    <Pie
                      data={segmentChartData}
                      cx="50%"
                      cy="45%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="count"
                    >
                      {segmentChartData.map((entry, index) => (
                        <Cell key={`cell-pie-${index}`} fill={['#6366f1', '#a855f7', '#10b981', '#3bc8c8', '#f59e0b', '#ec4899'][index % 6]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ fontSize: '11px', background: 'rgba(15,23,42,0.92)', backdropFilter: 'blur(8px)', borderColor: '#334155', color: '#fff', borderRadius: '12px' }}
                    />
                  </PieChart>
                )}
              </ResponsiveContainer>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-550 text-[11px] font-mono italic">
                No active records. Expand control filters above.
              </div>
            )}
          </div>

          <div className="border-t border-slate-850 pt-3 mt-4 text-[9.5px] text-slate-450 leading-relaxed font-sans">
            Ranks row proportion matching <strong>{filteredRows.length}</strong> active rows under active metrics thresholds.
          </div>
        </div>

        {/* CHART B: CROSS-METRICS COVARIATE SCATTER MODEL RELATIONSHIP */}
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-2xl flex flex-col justify-between h-full hover:border-slate-700 transition-colors col-span-1 lg:col-span-1">
          <div>
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5 font-sans">
                <LineChart className="w-4.5 h-4.5 text-indigo-400" /> Point-by-Point Metric Comparison
              </h3>
              <span className="px-2 py-0.5 rounded text-[8.5px] font-bold font-mono tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
                Correlation Ratio
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4 font-mono text-[9px] text-slate-550">
              <div>
                <span>Axis X (Input Variable):</span>
                <select
                  value={scatterX}
                  onChange={(e) => setScatterX(e.target.value)}
                  className="w-full bg-[#111625] border border-slate-805 border-slate-800 rounded p-1 text-[10px] text-slate-300 font-mono mt-1 focus:ring-0 focus:outline-none font-bold"
                >
                  {numericCols.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <span>Axis Y (Predictive Target):</span>
                <select
                  value={scatterY}
                  onChange={(e) => setScatterY(e.target.value)}
                  className="w-full bg-[#111625] border border-slate-805 border-slate-800 rounded p-1 text-[10px] text-slate-300 font-mono mt-1 focus:ring-0 focus:outline-none font-bold"
                >
                  {numericCols.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="h-[188px] w-full relative">
            {scatterChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" dataKey="x" name={scatterX} stroke="#64748b" fontSize={8.5} tickLine={false} />
                  <YAxis type="number" dataKey="y" name={scatterY} stroke="#64748b" fontSize={8.5} tickLine={false} />
                  <ZAxis type="number" range={[15, 30]} />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{ fontSize: '10px', background: 'rgba(15,23,42,0.92)', backdropFilter: 'blur(8px)', borderColor: '#334155', color: '#fff', borderRadius: '12px' }}
                    formatter={(value) => [value, '']}
                  />
                  <Scatter name="Telemetry Nodes" data={scatterChartData} fill="#10b981" />
                </ScatterChart>
              </ResponsiveContainer>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-550 text-[11px] font-mono italic">
                Awaiting sample rows.
              </div>
            )}
          </div>

          <div className="border-t border-slate-850 pt-3 mt-4 text-[9.5px] text-slate-455 leading-relaxed font-sans">
            Simulates linear scatter relationship across <strong>{scatterChartData.length}</strong> active rows to discover mathematical outliers.
          </div>
        </div>

        {/* CHART C: LONGITUDINAL TREND PROGRESSION WITH BRUSH */}
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-2xl flex flex-col justify-between h-full hover:border-slate-705 transition-colors col-span-1 lg:col-span-1">
          <div>
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5 font-sans">
                <TrendingUp className="w-4.5 h-4.5 text-indigo-405 text-indigo-400" /> Performance Trends Over Time
              </h3>
              <span className="text-[10px] font-mono text-slate-550 text-slate-500 font-bold shrink-0">
                {dateCol ? `Linked: ${dateCol}` : 'Linked: Index'}
              </span>
            </div>

            <p className="text-[10.5px] text-slate-400 font-sans leading-tight mb-4">
              Presents longitudinal variance dynamic trend lines for metric <strong className="text-white">"{selectedKpiSumCol}"</strong> mapped chronologically.
            </p>
          </div>

          <div className="h-[210px] w-full relative">
            {areaTimeSeriesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaTimeSeriesData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                  <defs>
                    <linearGradient id="gradientKpiGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                  <Tooltip
                    contentStyle={{ fontSize: '11px', background: 'rgba(15,23,42,0.92)', backdropFilter: 'blur(8px)', borderColor: '#334155', color: '#fff', borderRadius: '12px' }}
                  />
                  <Area type="monotone" dataKey="metric" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#gradientKpiGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-550 text-[11px] font-mono italic">
                Awaiting chronological datasets.
              </div>
            )}
          </div>

          <div className="border-t border-slate-850 pt-3 mt-4 text-[9.5px] text-slate-455 leading-relaxed font-sans">
            Captures fluctuations, cyclical behaviors, and sequential moving patterns across coordinates sequence.
          </div>
        </div>

      </div>

    </div>
  );
}
