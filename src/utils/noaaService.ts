import type { FluxDataPoint } from '../types/solar';
import { classifyFlux, formatUTCShort } from './solarPhysics';

interface NoaaRawEntry {
  time_tag: string;
  energy: string;
  observed_flux?: number;
  flux?: number;
}

// Rolling helpers
function rollingMean(data: number[], window: number): number {
  if (data.length === 0) return 0;
  const slice = data.slice(-window);
  return slice.reduce((a, b) => a + b, 0) / slice.length;
}

function rollingStd(data: number[], window: number): number {
  if (data.length < 2) return 0;
  const slice = data.slice(-window);
  const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
  const variance = slice.reduce((s, v) => s + (v - mean) ** 2, 0) / slice.length;
  return Math.sqrt(variance);
}

function rollingMax(data: number[], window: number): number {
  if (data.length === 0) return 0;
  const slice = data.slice(-window);
  return Math.max(...slice);
}

function zscore(value: number, data: number[]): number {
  if (data.length < 5) return 0;
  const mean = rollingMean(data, 60);
  const std = rollingStd(data, 60);
  return std > 0 ? (value - mean) / std : 0;
}

/**
 * Fetches GOES-18 primary X-ray telemetry from NOAA Space Weather Prediction Center.
 * Maps:
 * - 0.1-0.8nm (long channel) -> SoLEXS
 * - 0.05-0.4nm (short channel) -> HEL1OS
 */
export async function fetchNoaaXrayFlux(): Promise<FluxDataPoint[]> {
  const url = 'https://services.swpc.noaa.gov/json/goes/primary/xrays-7-day.json';
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch NOAA data: ${response.statusText}`);
  }

  const rawData: NoaaRawEntry[] = await response.json();

  // Group by time_tag
  const grouped: Record<string, { timestamp: Date; soLEXS?: number; hel1OS?: number }> = {};
  for (const entry of rawData) {
    const t = entry.time_tag;
    if (!grouped[t]) {
      grouped[t] = { timestamp: new Date(t) };
    }
    const val = entry.observed_flux ?? entry.flux ?? 0;
    if (entry.energy === '0.1-0.8nm') {
      grouped[t].soLEXS = val;
    } else if (entry.energy === '0.05-0.4nm') {
      grouped[t].hel1OS = val;
    }
  }

  // Convert to sorted list
  const basePoints = Object.values(grouped)
    .filter((p) => p.soLEXS !== undefined || p.hel1OS !== undefined)
    .map((p) => ({
      timestamp: p.timestamp,
      soLEXS: p.soLEXS ?? (p.hel1OS ? p.hel1OS / 0.08 : 2e-8),
      hel1OS: p.hel1OS ?? (p.soLEXS ? p.soLEXS * 0.08 : 1.6e-9),
    }))
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  // We only need the last 240 minutes of data for the 4-hour window
  const recentPoints = basePoints.slice(-240);

  // Sequentially calculate derived parameters (Z-scores, dF/dt, rolling stats)
  const processedPoints: FluxDataPoint[] = [];
  
  for (let i = 0; i < recentPoints.length; i++) {
    const p = recentPoints[i];
    const prevPoints = processedPoints;
    const soLEXSHistory = prevPoints.map((d) => d.soLEXS);
    const dFdtHistory = prevPoints.map((d) => d.dFdt);

    let dFdt = 0;
    if (prevPoints.length > 0) {
      const prev = prevPoints[prevPoints.length - 1];
      const dtMs = p.timestamp.getTime() - prev.timestamp.getTime();
      const dtMin = dtMs / (60 * 1000);
      const effectiveDtMin = dtMin > 0.016 ? dtMin : 1.0; // default to 1 min if delta is tiny/zero
      dFdt = (p.soLEXS - prev.soLEXS) / effectiveDtMin;
    }

    const hsRatio = p.soLEXS > 0 ? p.hel1OS / p.soLEXS : 0;
    const soLEXSValues = soLEXSHistory.slice(-240);

    processedPoints.push({
      timestamp: p.timestamp,
      timestampUTC: formatUTCShort(p.timestamp),
      soLEXS: p.soLEXS,
      hel1OS: p.hel1OS,
      soLEXSNorm: zscore(p.soLEXS, soLEXSValues),
      hel1OSNorm: zscore(p.hel1OS, soLEXSValues.map((s) => s * 0.08)),
      hsRatio,
      dFdt,
      rollingMean5: rollingMean(soLEXSHistory, 5),
      rollingMean15: rollingMean(soLEXSHistory, 15),
      rollingMean30: rollingMean(soLEXSHistory, 30),
      rollingStd15: rollingStd(soLEXSHistory, 15),
      rollingMax30: rollingMax(soLEXSHistory, 30),
      peakRiseRate: dFdtHistory.length > 0 ? Math.max(dFdt, ...dFdtHistory.slice(-60)) : 0,
      inferredClass: classifyFlux(p.soLEXS),
    });
  }

  return processedPoints;
}
