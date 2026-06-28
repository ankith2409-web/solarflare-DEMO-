import { useEffect, useRef } from 'react';
import { useSolarStore } from '../store/solarStore';
import {
  generateNextFluxPoint,
  detectActiveFlare,
  generateForecast,
  generateInitialHistory,
  generateAlertHistory,
} from '../utils/dataGenerator';

/**
 * Drives the simulated real-time data feed.
 * - On mount: bootstraps 4 hours of history
 * - Every 10s: appends a new FluxDataPoint, updates forecast
 * - When flare detected: triggers ActiveFlareCard UI
 */
export function useSimulatedData() {
  const addFluxPoint = useSolarStore((s) => s.addFluxPoint);
  const setActiveFlare = useSolarStore((s) => s.setActiveFlare);
  const setForecast = useSolarStore((s) => s.setForecast);
  const addToHistory = useSolarStore((s) => s.addToHistory);
  const isLive = useSolarStore((s) => s.isLive);

  const intervalRef = useRef<number | null>(null);
  const initialized = useRef(false);

  // Bootstrap 4-hour history once on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Bootstrap 4-hour history
    const history = generateInitialHistory();
    useSolarStore.setState({ fluxData: history, currentFlux: history[history.length - 1] ?? null });
    useSolarStore.setState({ alertHistory: generateAlertHistory() });
    const forecast = generateForecast(history[history.length - 1] ?? null, new Date());
    setForecast(forecast);
  }, [setForecast]);

  // Real-time tick loop — only re-creates the interval when `isLive` flips,
  // NOT on every flare event (which would cause the cadence to drift).
  useEffect(() => {
    if (!isLive) return;

    intervalRef.current = window.setInterval(() => {
      const currentStore = useSolarStore.getState();
      const point = generateNextFluxPoint(currentStore.fluxData, new Date());
      addFluxPoint(point);

      // Detect flare — read current active flare inside the tick to avoid
      // depending on it (and tearing down + recreating the interval)
      const currentActive = currentStore.activeFlare;
      const flare = detectActiveFlare(point);
      if (flare) {
        if (!currentActive || flare.predictedClass !== currentActive.predictedClass) {
          setActiveFlare(flare);
          addToHistory(flare);
        }
      } else if (currentActive) {
        setActiveFlare(null);
      }

      // Update forecast
      const forecast = generateForecast(point, new Date());
      setForecast(forecast);
    }, 10_000);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [isLive, addFluxPoint, setActiveFlare, addToHistory, setForecast]);

  return { fluxData: useSolarStore((s) => s.fluxData) };
}