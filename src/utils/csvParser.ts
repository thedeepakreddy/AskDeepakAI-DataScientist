/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Dataset, DatasetColumn } from '../types';

export function parseCSV(text: string, filename: string): Dataset {
  const lines: string[] = [];
  let currentWord = '';
  let inQuotes = false;
  let currentLine: string[] = [];

  // Parse lines considering quoted commas
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1] || '';

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentWord += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentLine.push(currentWord.trim());
      currentWord = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentLine.push(currentWord.trim());
      if (currentLine.length > 0 && currentLine.some(cell => cell !== '')) {
        lines.push(JSON.stringify(currentLine));
      }
      currentLine = [];
      currentWord = '';
    } else {
      currentWord += char;
    }
  }
  // Add trailing line
  if (currentWord !== '' || currentLine.length > 0) {
    currentLine.push(currentWord.trim());
    lines.push(JSON.stringify(currentLine));
  }

  if (lines.length < 2) {
    throw new Error('Dataset must contain at least a header row and one data row.');
  }

  const parsedLines = lines.map(l => JSON.parse(l) as string[]);
  const headers = parsedLines[0].map(h => h.replace(/^"|"$/g, '').trim() || 'unnamed_column');
  
  // Deduplicate headers
  const headerCount: Record<string, number> = {};
  const cleanHeaders = headers.map(header => {
    let name = header;
    if (headerCount[name] !== undefined) {
      headerCount[name]++;
      name = `${name}_${headerCount[name]}`;
    } else {
      headerCount[name] = 0;
    }
    return name;
  });

  const rawRows = parsedLines.slice(1);
  const rows: Record<string, any>[] = [];

  rawRows.forEach(rowCells => {
    if (rowCells.length === 0 || rowCells.every(c => c === '')) return;
    const rowObj: Record<string, any> = {};
    cleanHeaders.forEach((header, index) => {
      rowObj[header] = rowCells[index] !== undefined ? rowCells[index] : '';
    });
    rows.push(rowObj);
  });

  // Extract columns metadata
  const columns: DatasetColumn[] = cleanHeaders.map(name => {
    // Collect non-empty values
    const values = rows.map(r => r[name]).filter(v => v !== undefined && v !== '');
    const missingCount = rows.length - values.length;

    // Detect Column Type
    // Try to parse as numbers
    let numberCount = 0;
    let booleanCount = 0;
    let dateCount = 0;

    const parsedValues = values.map(v => {
      const trimmed = String(v).trim().toLowerCase();
      // Boolean check
      if (trimmed === 'true' || trimmed === 'false' || trimmed === 'yes' || trimmed === 'no') {
        booleanCount++;
        return trimmed === 'true' || trimmed === 'yes';
      }
      // Number check
      const num = Number(v);
      if (!isNaN(num) && v !== '') {
        numberCount++;
        return num;
      }
      // Date check
      const d = Date.parse(v);
      if (!isNaN(d) && String(v).length > 5 && isNaN(Number(v))) {
        dateCount++;
        return new Date(d);
      }
      return v;
    });

    let detectedType: 'numeric' | 'categorical' | 'boolean' | 'datetime' = 'categorical';
    if (numberCount / values.length > 0.7) {
      detectedType = 'numeric';
    } else if (booleanCount / values.length > 0.7) {
      detectedType = 'boolean';
    } else if (dateCount / values.length > 0.7) {
      detectedType = 'datetime';
    }

    // Cast rows accordingly
    rows.forEach(r => {
      const val = r[name];
      if (val === undefined || val === '') {
        r[name] = null;
      } else if (detectedType === 'numeric') {
        const num = Number(val);
        r[name] = isNaN(num) ? null : num;
      } else if (detectedType === 'boolean') {
        const trm = String(val).trim().toLowerCase();
        r[name] = trm === 'true' || trm === 'yes' || trm === '1';
      } else if (detectedType === 'datetime') {
        const d = Date.parse(val);
        r[name] = isNaN(d) ? val : new Date(d).toISOString();
      } else {
        r[name] = String(val);
      }
    });

    // Compute Statistics
    const validCells = rows.map(r => r[name]).filter(v => v !== null && v !== undefined);
    const distinctSet = new Set(validCells);
    const distinctCount = distinctSet.size;

    const statistics: DatasetColumn['statistics'] = {};

    if (detectedType === 'numeric') {
      const numericCells = validCells as number[];
      if (numericCells.length > 0) {
        let min = numericCells[0];
        let max = numericCells[0];
        for (let idx = 1; idx < numericCells.length; idx++) {
          const v = numericCells[idx];
          if (v < min) min = v;
          if (v > max) max = v;
        }
        const sum = numericCells.reduce((a, b) => a + b, 0);
        const mean = sum / numericCells.length;
        
        // Median
        const sorted = [...numericCells].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

        // StdDev
        const sqDiffSum = numericCells.reduce((accum, val) => accum + Math.pow(val - mean, 2), 0);
        const stdDev = Math.sqrt(sqDiffSum / numericCells.length);

        statistics.min = parseFloat(min.toFixed(4));
        statistics.max = parseFloat(max.toFixed(4));
        statistics.mean = parseFloat(mean.toFixed(4));
        statistics.median = parseFloat(median.toFixed(4));
        statistics.stdDev = parseFloat(stdDev.toFixed(4));
      }
    }

    // Most Common of Categorical or Numeric
    const valueCounts: Record<string, number> = {};
    validCells.forEach(v => {
      const strVal = String(v);
      valueCounts[strVal] = (valueCounts[strVal] || 0) + 1;
    });

    const sortedFreq = Object.entries(valueCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([value, count]) => ({ value, count }));

    statistics.mostCommon = sortedFreq;

    return {
      name,
      type: detectedType,
      missingCount,
      distinctCount,
      statistics,
    };
  });

  return {
    filename,
    rows,
    columns,
    rowCount: rows.length,
    originalRowCount: rows.length,
  };
}

// Built-in Sample Datasets
export const SAMPlE_DATASETS: Record<string, string> = {
  // 1. Customer Churn Dataset
  churn: `CustomerID,Gender,Age,Tenure,MonthlyCharges,TotalCharges,ContractType,PaymentMethod,Target_Churn
C-10251,Male,42,12,65.85,790.2,Month-to-month,Credit Card,Yes
C-10252,Female,31,24,20.05,481.2,Two Year,,No
C-10253,Female,58,1,85.10,85.1,Month-to-month,Electronic Check,Yes
C-10254,Male,22,8,45.20,361.6,One Year,Bank Transfer,No
C-10255,Female,35,48,110.30,5294.4,Two Year,Credit Card,No
C-10256,Male,67,3,92.50,277.5,Month-to-month,Electronic Check,Yes
C-10257,Female,48,36,55.00,1980.0,One Year,Mailed Check,No
C-10258,Male,29,15,70.15,1052.25,Month-to-month,Bank Transfer,No
C-10259,Female,52,50,95.40,4770.0,Two Year,Electronic Check,No
C-10260,Male,73,6,89.90,539.4,Month-to-month,Electronic Check,Yes
C-10261,Female,19,4,30.50,122.0,Month-to-month,Mailed Check,No
C-10262,Male,34,18,60.45,1088.1,Month-to-month,Credit Card,No
C-10263,Female,41,10,75.00,750.0,One Year,Mailed Check,Yes
C-10264,Male,62,44,115.60,5086.4,Two Year,Bank Transfer,No
C-10265,Male,25,9,80.50,724.5,Month-to-month,Electronic Check,Yes`,

  // 2. SaaS Performance Analytics
  saas: `Date,Customer_Segment,Subscription_Tier,Monthly_Recurring_Revenue,Users_Active_Daily,Support_Tickets_Opened,Customer_Success_Rating,Target_ChurnProbability
2026-01-01,Enterprise,Premium,5200,95,2,4.8,0.05
2026-01-02,Mid-Market,Standard,1200,45,4,3.2,0.35
2026-01-03,SMB,Starter,250,12,6,2.1,0.78
2026-01-04,Enterprise,Premium,4800,88,1,4.9,0.04
2026-01-05,Mid-Market,Standard,1400,50,3,3.9,0.18
2026-01-06,Enterprise,Standard,3000,65,5,3.1,0.42
2026-01-07,SMB,Starter,280,15,5,2.5,0.65
2026-01-08,Enterprise,Premium,7500,140,2,4.7,0.02
2026-01-09,Mid-Market,Premium,2450,72,0,4.5,0.08
2026-01-10,SMB,Starter,210,8,8,1.8,0.91
2026-01-11,Mid-Market,Standard,1350,48,4,3.5,0.22
2026-01-12,Enterprise,Standard,3200,70,3,4.1,0.15
2026-01-13,SMB,Starter,290,18,2,3.8,0.45
2026-01-14,Enterprise,Premium,8100,165,1,4.9,0.01
2026-01-15,Mid-Market,Premium,2600,80,2,4.2,0.12`,

  // 3. Equipment Hardware Telemetry & Machinery Maintenance
  hardware: `Vibration_Level,Temperature_Celsius,Pressure_PSI,Usage_Hours_Continuous,Operator_Experience,Maintenance_Status,Target_HardwareFailure
4.2,78.5,120,4.5,Intermediate,Good,0
8.5,95.2,165,12.0,Novice,Overdue,1
3.1,65.0,110,2.1,Expert,Good,0
5.8,82.4,142,6.8,Intermediate,Good,0
7.9,91.8,158,10.5,Novice,Pending,1
2.5,60.2,95,1.5,Expert,Good,0
6.1,84.0,135,8.0,Intermediate,Pending,0
9.2,98.6,180,14.2,Novice,Overdue,1
4.0,72.1,118,5.0,Expert,Good,0
5.0,79.5,130,5.8,Intermediate,Good,0
7.1,89.0,150,9.1,Novice,Pending,1
3.4,68.2,105,3.2,Expert,Good,0
6.5,86.4,140,8.5,Intermediate,Pending,0
8.9,96.8,172,13.0,Novice,Overdue,1
4.5,75.0,122,6.0,Expert,Good,0`
};

export function loadSampleDataset(key: 'churn' | 'saas' | 'hardware'): Dataset {
  const text = SAMPlE_DATASETS[key];
  const filenames = {
    churn: 'customer_churn_and_retention.csv',
    saas: 'saas_company_performance.csv',
    hardware: 'predictive_hardware_maintenance.csv'
  };
  return parseCSV(text, filenames[key]);
}
