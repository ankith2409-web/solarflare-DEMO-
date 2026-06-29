import type { FluxDataPoint, FlareClass, FlareEvent, ForecastOutput } from '../types/solar';
import {
  QUIET_SUN_FLUX,
  FLUX_THRESHOLDS,
  classifyFlux,
  formatUTCShort,
  gaussianNoise,
} from './solarPhysics';

interface FlareInjection {
  startTime: number; // ms epoch
  peakTime: number;
  endTime: number;
  peakFlux: number; // peak SoLEXS flux
  class: FlareClass;
  magnitude: number; // 1.0 to 9.9
}

// Internal state of the simulator (kept across ticks)
interface SimState {
  currentFluxSoLEXS: number;
  currentFluxHel1OS: number;
  baseLevel: number; // slow baseline drift
  activeFlare: FlareInjection | null;
  nextFlareAt: number; // when next flare should start
  flareHistory: FlareInjection[]; // for peak rise rate chart
}

const state: SimState = {
  currentFluxSoLEXS: QUIET_SUN_FLUX,
  currentFluxHel1OS: QUIET_SUN_FLUX * 0.08,
  baseLevel: QUIET_SUN_FLUX,
  activeFlare: null,
  nextFlareAt: Date.now() + 60 * 60 * 1000, // first flare in ~1 hour
  flareHistory: [],
};

// Schedule the next flare (45-90 min from now)
function scheduleNextFlare() {
  const delay = (45 + Math.random() * 45) * 60 * 1000;
  state.nextFlareAt = Date.now() + delay;
}

// Possibly inject a flare event now (low probability per tick)
function maybeInjectFlare(): FlareInjection | null {
  if (state.activeFlare) return null;
  if (Date.now() < state.nextFlareAt) return null;

  // Pick a flare class with realistic distribution:
  // B: 70%, C: 25%, M: 4.5%, X: 0.5%
  const r = Math.random();
  let cls: FlareClass;
  let magnitude: number;
  if (r < 0.005) {
    cls = 'X';
    magnitude = 1 + Math.random() * 8.9;
  } else if (r < 0.05) {
    cls = 'M';
    magnitude = 1 + Math.random() * 8.9;
  } else if (r < 0.30) {
    cls = 'C';
    magnitude = 1 + Math.random() * 8.9;
  } else {
    cls = 'B';
    magnitude = 1 + Math.random() * 8.9;
  }

  const peakFlux = FLUX_THRESHOLDS[cls].min * magnitude;
  const riseDur = (3 + Math.random() * 5) * 60 * 1000; // 3-8 min
  const peakDur = (1 + Math.random() * 2) * 60 * 1000; // 1-3 min
  const decayDur = (10 + Math.random() * 10) * 60 * 1000; // 10-20 min
  const now = Date.now();

  const flare: FlareInjection = {
    startTime: now,
    peakTime: now + riseDur,
    endTime: now + riseDur + peakDur + decayDur,
    peakFlux,
    class: cls,
    magnitude,
  };

  state.activeFlare = flare;
  state.flareHistory.push(flare);
  if (state.flareHistory.length > 30) state.flareHistory.shift();
  scheduleNextFlare();
  return flare;
}

// Compute current SoLEXS flux given time + active flare
function computeSoLEXSFlux(now: number): number {
  let flux = state.baseLevel;

  if (state.activeFlare) {
    const f = state.activeFlare;
    if (now >= f.startTime && now <= f.endTime) {
      if (now <= f.peakTime) {
        // Rise phase — exponential increase
        const t = (now - f.startTime) / (f.peakTime - f.startTime);
        flux = state.baseLevel + (f.peakFlux - state.baseLevel) * Math.pow(t, 1.5);
      } else if (now <= f.peakTime + (f.endTime - f.peakTime) * 0.3) {
        // Peak hold
        flux = f.peakFlux;
      } else {
        // Decay phase — exponential decay
        const t = (now - f.peakTime) / (f.endTime - f.peakTime);
        flux = f.peakFlux * Math.exp(-3 * t) + state.baseLevel * 0.5;
      }
    } else if (now > f.endTime) {
      // Flare complete — return to base
      state.activeFlare = null;
    }
  }

  // Add Brownian motion on log scale (slow drift)
  state.baseLevel *= 1 + gaussianNoise(0, 0.0008);
  state.baseLevel = Math.max(QUIET_SUN_FLUX * 0.7, Math.min(QUIET_SUN_FLUX * 1.5, state.baseLevel));

  // Add ±5% Gaussian noise
  flux *= 1 + gaussianNoise(0, 0.05);

  // Clamp to physical range
  flux = Math.max(1e-9, Math.min(1e-3, flux));
  state.currentFluxSoLEXS = flux;
  return flux;
}

// HEL1OS = SoLEXS × ratio; ratio increases during flares
function computeHel1OSFlux(soLEXSFlux: number, now: number): number {
  let ratio = 0.08; // quiet sun: HEL1OS is 8-15× lower

  if (state.activeFlare) {
    const f = state.activeFlare;
    if (now >= f.startTime && now <= f.endTime) {
      // Hard X-ray emission rises faster than soft during flare onset
      const t = (now - f.startTime) / (f.peakTime - f.startTime);
      ratio = 0.08 + 0.4 * Math.pow(t, 2); // 0.08 → ~0.48
      if (now > f.peakTime) {
        ratio *= 1.2; // hard X-rays decay slower
      }
    }
  }

  let hel1OS = soLEXSFlux * ratio;
  hel1OS *= 1 + gaussianNoise(0, 0.05);
  hel1OS = Math.max(1e-10, Math.min(1e-3, hel1OS));
  state.currentFluxHel1OS = hel1OS;
  return hel1OS;
}

// Rolling statistics helpers (applied to last N data points)
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

// Compute Z-score normalization over recent window
function zscore(value: number, data: number[]): number {
  if (data.length < 5) return 0;
  const mean = rollingMean(data, 60);
  const std = rollingStd(data, 60);
  return std > 0 ? (value - mean) / std : 0;
}

// Main entry: generate a single new FluxDataPoint given current store data
export function generateNextFluxPoint(
  store: FluxDataPoint[],
  now: Date = new Date()
): FluxDataPoint {
  maybeInjectFlare();
  const ts = now.getTime();
  const soLEXS = computeSoLEXSFlux(ts);
  const hel1OS = computeHel1OSFlux(soLEXS, ts);

  // Build arrays of recent values for rolling stats
  const soLEXSHistory = store.map((d) => d.soLEXS);
  const dFdtHistory = store.map((d) => d.dFdt);
  const hsRatioHistory = store.map((d) => d.hsRatio);

  let dFdt = 0;
  if (store.length > 0) {
    const prev = store[store.length - 1];
    const dtMs = now.getTime() - prev.timestamp.getTime();
    const dtMin = dtMs / (60 * 1000);
    const effectiveDtMin = dtMin > 0.016 ? dtMin : 0.1667; // default to 10s if delta is tiny/zero
    dFdt = (soLEXS - prev.soLEXS) / effectiveDtMin;
  }
  const hsRatio = soLEXS > 0 ? hel1OS / soLEXS : 0;

  // For Z-score, use longer history
  const soLEXSValues = soLEXSHistory.slice(-240);

  return {
    timestamp: now,
    timestampUTC: formatUTCShort(now),
    soLEXS,
    hel1OS,
    soLEXSNorm: zscore(soLEXS, soLEXSValues),
    hel1OSNorm: zscore(hel1OS, soLEXSValues.map((s) => s * 0.08)),
    hsRatio,
    dFdt,
    rollingMean5: rollingMean(soLEXSHistory, 5),
    rollingMean15: rollingMean(soLEXSHistory, 15),
    rollingMean30: rollingMean(soLEXSHistory, 30),
    rollingStd15: rollingStd(soLEXSHistory, 15),
    rollingMax30: rollingMax(soLEXSHistory, 30),
    peakRiseRate: dFdtHistory.length > 0 ? Math.max(...dFdtHistory.slice(-60)) : 0,
    inferredClass: classifyFlux(soLEXS),
  };
}

// Bootstrap initial 4-hour history (240 points at 1-min cadence)
export function generateInitialHistory(now: Date = new Date()): FluxDataPoint[] {
  const points: FluxDataPoint[] = [];
  let store: FluxDataPoint[] = [];
  // Reset simulator state for fresh bootstrap
  state.currentFluxSoLEXS = QUIET_SUN_FLUX;
  state.currentFluxHel1OS = QUIET_SUN_FLUX * 0.08;
  state.baseLevel = QUIET_SUN_FLUX;
  state.activeFlare = null;
  state.nextFlareAt = Date.now() + 45 * 60 * 1000; // first flare soon
  state.flareHistory = [];

  // Generate 240 points, going BACKWARDS in 1-minute steps,
  // then reverse. While generating, seed flare events at random points.
  const eventsToInject: { offsetMin: number; class: FlareClass; magnitude: number }[] = [];
  // Randomly place 2-4 historical flares across the 4 hours
  const numEvents = 2 + Math.floor(Math.random() * 3);
  for (let i = 0; i < numEvents; i++) {
    const r = Math.random();
    let cls: FlareClass;
    let magnitude: number;
    if (r < 0.05) {
      cls = 'M';
      magnitude = 1 + Math.random() * 3;
    } else if (r < 0.3) {
      cls = 'C';
      magnitude = 1 + Math.random() * 5;
    } else {
      cls = 'B';
      magnitude = 1 + Math.random() * 5;
    }
    eventsToInject.push({
      offsetMin: Math.floor(Math.random() * 230) + 5,
      class: cls,
      magnitude,
    });
  }
  eventsToInject.sort((a, b) => a.offsetMin - b.offsetMin);

  // Generate points
  for (let i = 239; i >= 0; i--) {
    const ts = new Date(now.getTime() - i * 60 * 1000);

    // Check if a flare should be active at this point
    const event = eventsToInject.find(
      (e) => e.offsetMin === i + 1 // flare started 1 min before this point
    );
    if (event) {
      const peakFlux = FLUX_THRESHOLDS[event.class].min * event.magnitude;
      const riseDur = (3 + Math.random() * 5) * 60 * 1000;
      const peakDur = (1 + Math.random() * 2) * 60 * 1000;
      const decayDur = (10 + Math.random() * 10) * 60 * 1000;
      state.activeFlare = {
        startTime: ts.getTime() - 60 * 1000,
        peakTime: ts.getTime() - 60 * 1000 + riseDur,
        endTime: ts.getTime() - 60 * 1000 + riseDur + peakDur + decayDur,
        peakFlux,
        class: event.class,
        magnitude: event.magnitude,
      };
    }

    const soLEXS = computeSoLEXSFlux(ts.getTime());
    const hel1OS = computeHel1OSFlux(soLEXS, ts.getTime());

    const soLEXSHistory = store.map((d) => d.soLEXS);
    let dFdt = 0;
    if (store.length > 0) {
      const prev = store[store.length - 1];
      const dtMs = ts.getTime() - prev.timestamp.getTime();
      const dtMin = dtMs / (60 * 1000);
      const effectiveDtMin = dtMin > 0.016 ? dtMin : 1.0; // default to 1 min for bootstrap
      dFdt = (soLEXS - prev.soLEXS) / effectiveDtMin;
    }
    const hsRatio = soLEXS > 0 ? hel1OS / soLEXS : 0;
    const soLEXSValues = soLEXSHistory.slice(-240);

    const point: FluxDataPoint = {
      timestamp: ts,
      timestampUTC: formatUTCShort(ts),
      soLEXS,
      hel1OS,
      soLEXSNorm: zscore(soLEXS, soLEXSValues),
      hel1OSNorm: zscore(hel1OS, soLEXSValues.map((s) => s * 0.08)),
      hsRatio,
      dFdt,
      rollingMean5: rollingMean(soLEXSHistory, 5),
      rollingMean15: rollingMean(soLEXSHistory, 15),
      rollingMean30: rollingMean(soLEXSHistory, 30),
      rollingStd15: rollingStd(soLEXSHistory, 15),
      rollingMax30: rollingMax(soLEXSHistory, 30),
      peakRiseRate: store.length > 0 ? Math.max(dFdt, ...store.slice(-60).map((p) => p.dFdt)) : 0,
      inferredClass: classifyFlux(soLEXS),
    };
    store.push(point);
    points.push(point);
  }

  // Reset state for live operation
  state.activeFlare = null;
  state.nextFlareAt = Date.now() + 30 * 60 * 1000;

  return points;
}

// Check if the latest data warrants a flare event for the alert system
export function detectActiveFlare(latest: FluxDataPoint | null): FlareEvent | null {
  if (!latest) return null;
  const cls = latest.inferredClass;
  if (cls === 'A' || cls === 'B') return null;

  const now = latest.timestamp;
  return {
    id: `flare-${now.getTime()}`,
    detectedAt: now,
    peakAt: new Date(now.getTime() + 15 * 60 * 1000),
    predictedClass: cls,
    predictedMagnitude: latest.soLEXS / FLUX_THRESHOLDS[cls].min,
    confidence: 0.65 + Math.random() * 0.3,
    timeToPeakMin: 15 + Math.floor(Math.random() * 12),
    timeToPeakUncertainty: 5 + Math.floor(Math.random() * 5),
  };
}

// Generate 30-min forecast probabilities
export function generateForecast(latest: FluxDataPoint | null, now: Date): ForecastOutput {
  const cls = latest?.inferredClass ?? 'A';
  const baseProb: Record<FlareClass, number> = { A: 0.7, B: 0.2, C: 0.08, M: 0.018, X: 0.002 };
  // Bias toward current class when elevated
  if (cls === 'C') { baseProb.C = 0.55; baseProb.B = 0.3; baseProb.M = 0.12; baseProb.X = 0.03; }
  if (cls === 'M') { baseProb.M = 0.55; baseProb.C = 0.25; baseProb.X = 0.15; baseProb.B = 0.05; }
  if (cls === 'X') { baseProb.X = 0.6; baseProb.M = 0.25; baseProb.C = 0.1; baseProb.B = 0.05; }

  const dominantClass = (
    Object.entries(baseProb) as [FlareClass, number][]
  ).reduce((a, b) => (b[1] > a[1] ? b : a))[0];

  return {
    timestamp: now,
    horizon: 30,
    probB: baseProb.B,
    probC: baseProb.C,
    probM: baseProb.M,
    probX: baseProb.X,
    dominantClass,
    confidence: 0.6 + Math.random() * 0.35,
    ciLow: new Date(now.getTime() + 26 * 60 * 1000),
    ciHigh: new Date(now.getTime() + 34 * 60 * 1000),
  };
}

// Generate realistic alert history (10 entries spanning 1-2 hours back)
export function generateAlertHistory(now: Date = new Date()): FlareEvent[] {
  const history: FlareEvent[] = [];
  const classes: FlareClass[] = ['B', 'B', 'C', 'C', 'C', 'B', 'M', 'B', 'C', 'X'];
  for (let i = 0; i < classes.length; i++) {
    const cls = classes[i];
    const offsetMin = (i + 1) * 6 + Math.floor(Math.random() * 4);
    const detectedAt = new Date(now.getTime() - offsetMin * 60 * 1000);
    const isCorrect = Math.random() > 0.15;
    const actualClass = isCorrect ? cls : (Math.random() > 0.5 ? 'B' : 'C');
    history.push({
      id: `hist-${i}`,
      detectedAt,
      peakAt: new Date(detectedAt.getTime() + 15 * 60 * 1000),
      predictedClass: cls,
      predictedMagnitude: 1 + Math.random() * 5,
      confidence: 0.7 + Math.random() * 0.25,
      timeToPeakMin: 12 + Math.floor(Math.random() * 15),
      timeToPeakUncertainty: 4 + Math.floor(Math.random() * 6),
      actualClass,
      actualMagnitude: 1 + Math.random() * 5,
      isCorrect,
      isFalseAlarm: !isCorrect,
    });
  }
  return history;
}

// Get peak rise rates from history for the feature panel
// Returns rise rate in W/m²/min, scaled realistically per flare class:
//   B-class: 1e-8 to 1e-7 W/m²/min
//   C-class: 1e-7 to 1e-6 W/m²/min
//   M-class: 1e-6 to 1e-5 W/m²/min  ← benchmark average ~5e-6
//   X-class: 1e-5 to 1e-4 W/m²/min  ← benchmark average ~5e-5
export function getPeakRiseRates(history: FlareEvent[]) {
  const CLASS_MIN_RATE: Record<string, number> = {
    B: 1e-8, C: 1e-7, M: 1e-6, X: 1e-5,
  };
  const CLASS_MAX_RATE: Record<string, number> = {
    B: 1e-7, C: 1e-6, M: 1e-5, X: 1e-4,
  };

  return history.slice(-12).map((e, i) => {
    const cls = e.predictedClass ?? 'B';
    const min = CLASS_MIN_RATE[cls] ?? 1e-8;
    const max = CLASS_MAX_RATE[cls] ?? 1e-7;
    // Random rise rate within class range (log-uniform distribution)
    const logMin = Math.log10(min);
    const logMax = Math.log10(max);
    const rate = Math.pow(10, logMin + Math.random() * (logMax - logMin));
    return {
      event: i,
      rate,
      class: cls,
      timestamp: e.detectedAt,
    };
  });
}

// Historical M/X-class average rise rate (W/m²/min) — used as the benchmark line
export const MX_CLASS_AVG_RISE_RATE = 5e-6;
// The display range covers B-class (1e-8) up to X-class (1e-4)
export const RISE_RATE_DISPLAY_MIN = 1e-9;
export const RISE_RATE_DISPLAY_MAX = 1e-3;