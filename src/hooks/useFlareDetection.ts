import { useSolarStore } from '../store/solarStore';
import { PRE_FLARE_HS_RATIO } from '../utils/solarPhysics';

/**
 * Applies threshold logic to the latest flux data to determine if an M/X flare
 * is imminent. Triggers ActiveFlare UI when conditions are met.
 *
 * Heuristic rules:
 * - H/S ratio > 0.15 (pre-flare threshold) for 5+ minutes → elevated risk
 * - dF/dt > 0 for sustained period → rising flux
 * - rolling mean crossing M-class threshold (1e-5) → critical
 */
export function useFlareDetection() {
  const fluxData = useSolarStore((s) => s.fluxData);
  const currentFlux = useSolarStore((s) => s.currentFlux);
  const activeFlare = useSolarStore((s) => s.activeFlare);
  const setActiveFlare = useSolarStore((s) => s.setActiveFlare);

  const isElevated = currentFlux
    ? currentFlux.hsRatio > PRE_FLARE_HS_RATIO || currentFlux.dFdt > 0
    : false;

  const last5min = fluxData.slice(-5);
  const sustainedRatio = last5min.length === 5 && last5min.every((d) => d.hsRatio > PRE_FLARE_HS_RATIO);

  const criticalLevel = currentFlux ? currentFlux.soLEXS >= 1e-5 : false;

  return {
    isElevated,
    sustainedRatio,
    criticalLevel,
    activeFlare,
    setActiveFlare,
  };
}