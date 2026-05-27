/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DatasetColumn {
  name: string;
  type: 'numeric' | 'categorical' | 'boolean' | 'datetime';
  missingCount: number;
  distinctCount: number;
  statistics: {
    min?: number;
    max?: number;
    mean?: number;
    median?: number;
    stdDev?: number;
    mostCommon?: { value: string; count: number }[];
  };
}

export interface Dataset {
  filename: string;
  rows: Record<string, any>[];
  columns: DatasetColumn[];
  rowCount: number;
  originalRowCount: number;
}

export interface CleaningOperation {
  id: string;
  type: 'drop_column' | 'fill_missing' | 'type_convert' | 'filter_rows';
  column: string;
  params: Record<string, any>;
}

export interface MLConfig {
  targetColumn: string;
  featureColumns: string[];
  modelType: 'classification' | 'regression' | 'timeseries';
  modelAlgorithm: string;
  trainRatio: number; // e.g., 0.8 for 80/20 train/test split
  hyperparameters: Record<string, string | number | boolean>;
}

export interface MLResult {
  modelType: 'classification' | 'regression' | 'timeseries';
  modelAlgorithm: string;
  hyperparameters: Record<string, any>;
  metrics: {
    accuracy?: number; // classification
    precision?: number;
    recall?: number;
    f1Score?: number;
    r2Score?: number; // regression
    mae?: number;
    rmse?: number;
    mape?: number; // timeseries
  };
  featureImportance: { feature: string; score: number }[];
  tuningHistory: { iteration: number; score: number; params: string }[];
  predictions: {
    id: number;
    actual: number | string;
    predicted: number | string;
    residual?: number;
    featureValues: Record<string, any>;
  }[];
  modelReportMarkdown: string;
  markdownReport?: string;
  risks?: { title: string; riskLevel: 'High' | 'Medium' | 'Low'; description: string }[];
  recommendations?: { title: string; impact: 'High' | 'Medium' | 'Low'; details: string }[];
  scientistCallout?: {
    focusColumns: string[];
    justification: string;
    pathways: string[];
  };
}

export interface StakeholderInsightReport {
  summary: string;
  potentialRisks: { title: string; riskLevel: 'High' | 'Medium' | 'Low'; description: string }[];
  strategicRecommendations: { title: string; impact: 'High' | 'Medium' | 'Low'; details: string }[];
  scientistCallout: {
    focusColumns: string[];
    justification: string;
    potentialAnalysisPathways: string[];
  };
}

export interface DashboardFilterState {
  slicers: Record<string, string[]>; // column -> list of selected categorical values
  rangeFilters: Record<string, { min: number; max: number; currentMin: number; currentMax: number }>; // numeric filter ranges
}
