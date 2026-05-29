/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Dataset, DatasetColumn } from '../types';

export interface NumericSummary {
  columnName: string;
  min: number;
  max: number;
  mean: number;
  median: number;
  stdDev: number;
  q1: number;
  q3: number;
  count: number;
}

export interface MissingValueDetails {
  columnName: string;
  count: number;
  percent: number;
  locations: number[]; // 1-indexed row numbers for end user readability
}

export interface DuplicateGroup {
  rowString: string;
  indices: number[]; // 1-indexed row numbers
}

export interface OutlierDetail {
  columnName: string;
  q1: number;
  q3: number;
  iqr: number;
  lowerBound: number;
  upperBound: number;
  outliers: { rowIndex: number; value: number }[]; // rowIndex is 1-indexed
}

export interface CategoricalValue {
  value: string;
  count: number;
  percent: number;
}

/**
 * Computes statistical quartiles and summary metrics for numerical values
 */
export function getQuartiles(values: number[]): { q1: number; q2: number; q3: number } {
  if (values.length === 0) return { q1: 0, q2: 0, q3: 0 };
  
  const sorted = [...values].sort((a, b) => a - b);
  
  const getPercentile = (p: number) => {
    const pos = (sorted.length - 1) * p;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sorted[base + 1] !== undefined) {
      return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    } else {
      return sorted[base];
    }
  };

  return {
    q1: parseFloat(getPercentile(0.25).toFixed(4)),
    q2: parseFloat(getPercentile(0.50).toFixed(4)),
    q3: parseFloat(getPercentile(0.75).toFixed(4))
  };
}

/**
 * Formulate full summary statistics for all numeric columns
 */
export function calculateFullNumericSummaries(rows: any[], columns: DatasetColumn[]): NumericSummary[] {
  const numericCols = columns.filter(col => col.type === 'numeric');
  
  return numericCols.map(col => {
    const vals = rows
      .map(r => r[col.name])
      .filter((v): v is number => typeof v === 'number' && !isNaN(v) && v !== null);

    if (vals.length === 0) {
      return {
        columnName: col.name,
        min: 0,
        max: 0,
        mean: 0,
        median: 0,
        stdDev: 0,
        q1: 0,
        q3: 0,
        count: 0
      };
    }

    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const sum = vals.reduce((a, b) => a + b, 0);
    const mean = sum / vals.length;
    
    // Std dev
    const variance = vals.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / vals.length;
    const stdDev = Math.sqrt(variance);
    
    const { q1, q2: median, q3 } = getQuartiles(vals);

    return {
      columnName: col.name,
      min: parseFloat(min.toFixed(4)),
      max: parseFloat(max.toFixed(4)),
      mean: parseFloat(mean.toFixed(4)),
      median: parseFloat(median.toFixed(4)),
      stdDev: parseFloat(stdDev.toFixed(4)),
      q1,
      q3,
      count: vals.length
    };
  });
}

/**
 * Maps all missing value percentages and exact cell locations (1-indexed row numbers)
 */
export function mapAllMissingValues(rows: any[], columns: DatasetColumn[]): MissingValueDetails[] {
  return columns.map(col => {
    const colName = col.name;
    const locations: number[] = [];
    
    rows.forEach((row, idx) => {
      const val = row[colName];
      if (val === undefined || val === null || val === '') {
        locations.push(idx + 1); // 1-indexed row numbers for business users
      }
    });

    const percent = rows.length > 0 ? (locations.length / rows.length) * 100 : 0;

    return {
      columnName: colName,
      count: locations.length,
      percent: parseFloat(percent.toFixed(2)),
      locations
    };
  });
}

/**
 * Explicitly detects duplicate records. Counts and tracks index lists of identical rows.
 */
export function detectDuplicateRecords(rows: any[]): DuplicateGroup[] {
  const rowHashMaps: Record<string, number[]> = {};

  rows.forEach((row, idx) => {
    // Sort keys to normalize row string signature across any potential key ordering
    const sortedKeys = Object.keys(row).sort();
    const normalizedObj = sortedKeys.reduce((acc, key) => {
      const val = row[key];
      // Normalize dates or nested structures slightly to ensure consistent string comparing
      if (val instanceof Date) {
        acc[key] = val.toISOString();
      } else if (typeof val === 'object' && val !== null) {
        acc[key] = JSON.stringify(val);
      } else {
        acc[key] = val;
      }
      return acc;
    }, {} as any);

    const serialized = JSON.stringify(normalizedObj);
    if (!rowHashMaps[serialized]) {
      rowHashMaps[serialized] = [];
    }
    rowHashMaps[serialized].push(idx + 1); // 1-indexed for reader
  });

  // Filter to find row collections where string representation exists more than once
  return Object.entries(rowHashMaps)
    .filter(([_, indices]) => indices.length > 1)
    .map(([rowString, indices]) => ({
      rowString,
      indices
    }));
}

/**
 * Discovers outliers using the Interquartile Range (IQR) method
 */
export function findExtremeOutliers(rows: any[], columns: DatasetColumn[]): OutlierDetail[] {
  const numericCols = columns.filter(col => col.type === 'numeric');
  
  return numericCols.map(col => {
    const colName = col.name;
    const vals = rows
      .map(r => r[colName])
      .filter((v): v is number => typeof v === 'number' && !isNaN(v) && v !== null);

    if (vals.length === 0) {
      return {
        columnName: colName,
        q1: 0,
        q3: 0,
        iqr: 0,
        lowerBound: 0,
        upperBound: 0,
        outliers: []
      };
    }

    const { q1, q3 } = getQuartiles(vals);
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    const outliers: { rowIndex: number; value: number }[] = [];
    rows.forEach((row, idx) => {
      const val = row[colName];
      if (typeof val === 'number' && !isNaN(val) && val !== null) {
        if (val < lowerBound || val > upperBound) {
          outliers.push({
            rowIndex: idx + 1,
            value: val
          });
        }
      }
    });

    return {
      columnName: colName,
      q1: parseFloat(q1.toFixed(4)),
      q3: parseFloat(q3.toFixed(4)),
      iqr: parseFloat(iqr.toFixed(4)),
      lowerBound: parseFloat(lowerBound.toFixed(4)),
      upperBound: parseFloat(upperBound.toFixed(4)),
      outliers
    };
  });
}

/**
 * Calculates Pearson Correlation Matrix between numeric features
 */
export function computeCorrelationMatrix(rows: any[], columns: DatasetColumn[]): {
  features: string[];
  matrix: Record<string, Record<string, number>>;
} {
  const numericCols = columns.filter(col => col.type === 'numeric').map(col => col.name);
  const matrix: Record<string, Record<string, number>> = {};
  
  if (numericCols.length === 0) {
    return { features: [], matrix: {} };
  }

  // Pre-extract and clean valid arrays
  const columnData: Record<string, number[]> = {};
  numericCols.forEach(colName => {
    columnData[colName] = rows.map(r => {
      const val = r[colName];
      return typeof val === 'number' && !isNaN(val) && val !== null ? val : 0;
    });
  });

  const rowCount = rows.length;

  // Initialize matrix
  numericCols.forEach(colA => {
    matrix[colA] = {};
    numericCols.forEach(colB => {
      if (colA === colB) {
        matrix[colA][colB] = 1.0;
        return;
      }

      const arrA = columnData[colA];
      const arrB = columnData[colB];

      const meanA = arrA.reduce((sum, v) => sum + v, 0) / rowCount;
      const meanB = arrB.reduce((sum, v) => sum + v, 0) / rowCount;

      let num = 0;
      let denA = 0;
      let denB = 0;

      for (let i = 0; i < rowCount; i++) {
        const diffA = arrA[i] - meanA;
        const diffB = arrB[i] - meanB;
        num += diffA * diffB;
        denA += diffA * diffA;
        denB += diffB * diffB;
      }

      const denom = Math.sqrt(denA * denB);
      const coefficient = denom === 0 ? 0 : num / denom;
      matrix[colA][colB] = parseFloat(coefficient.toFixed(4));
    });
  });

  return {
    features: numericCols,
    matrix
  };
}

/**
 * Computes categorical frequencies and unique values
 */
export function computeCategoricalFrequencies(rows: any[], columnName: string): CategoricalValue[] {
  const values = rows
    .map(r => r[columnName])
    .filter(v => v !== undefined && v !== null && v !== '');

  const counts: Record<string, number> = {};
  values.forEach(v => {
    const str = String(v);
    counts[str] = (counts[str] || 0) + 1;
  });

  const total = values.length;

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([value, count]) => ({
      value,
      count,
      percent: total > 0 ? parseFloat(((count / total) * 100).toFixed(2)) : 0
    }));
}
