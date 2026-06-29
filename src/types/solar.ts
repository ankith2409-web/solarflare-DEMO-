// All TypeScript interfaces for the solar flare forecasting dashboard

export type FlareClass = 'A' | 'B' | 'C' | 'M' | 'X';

export interface FluxDataPoint {
  timestamp: Date;
  timestampUTC: string; // "HH:mm UTC"
  soLEXS: number; // W/m², raw value
  hel1OS: number; // W/m², raw value
  soLEXSNorm: number; // Z-score normalized
  hel1OSNorm: number;
  hsRatio: number; // hel1OS / soLEXS
  dFdt: number; // first derivative of soLEXS
  rollingMean5: number;
  rollingMean15: number;
  rollingMean30: number;
  rollingStd15: number;
  rollingMax30: number;
  peakRiseRate: number;
  inferredClass: FlareClass;
}

export interface FlareEvent {
  id: string;
  detectedAt: Date;
  peakAt?: Date;
  predictedClass: FlareClass;
  predictedMagnitude: number; // e.g. 2.3 for M2.3
  confidence: number; // 0-1
  timeToPeakMin: number;
  timeToPeakUncertainty: number;
  actualClass?: FlareClass;
  actualMagnitude?: number;
  isCorrect?: boolean;
  isFalseAlarm?: boolean;
}

export interface ForecastOutput {
  timestamp: Date;
  horizon: 30; // minutes
  probB: number;
  probC: number;
  probM: number;
  probX: number;
  dominantClass: FlareClass;
  confidence: number;
  ciLow: Date;
  ciHigh: Date;
}

export interface ModelMetrics {
  tss: number;
  hss: number;
  totalPredictions24h: number;
  tssChange: number; // vs last cycle
  hssChange: number;
  confusionMatrix: number[][]; // 4x4: [B,C,M,X] actual vs predicted
  precisionPerClass: number[];
  recallPerClass: number[];
  f1PerClass: number[];
}

export interface AlertSettings {
  browserEnabled: boolean;
  slackEnabled: boolean;
  slackWebhookUrl: string;
  emailEnabled: boolean;
  emailAddress: string;
  smsEnabled: boolean;
  smsPhoneNumber: string;
  audioEnabled: boolean;
  notificationThreshold: 'M+' | 'X-only';
}

export interface SolarStore {
  fluxData: FluxDataPoint[];
  currentFlux: FluxDataPoint | null;
  activeFlare: FlareEvent | null;
  forecast: ForecastOutput | null;
  alertHistory: FlareEvent[];
  metrics: ModelMetrics;
  isLive: boolean;
  lastUpdated: Date;
  addFluxPoint: (point: FluxDataPoint) => void;
  setActiveFlare: (flare: FlareEvent | null) => void;
  setForecast: (forecast: ForecastOutput) => void;
  addToHistory: (flare: FlareEvent) => void;
  updateFluxData: (data: FluxDataPoint[]) => void;
  alertSettings: AlertSettings;
  setAlertSettings: (settings: Partial<AlertSettings>) => void;
}
