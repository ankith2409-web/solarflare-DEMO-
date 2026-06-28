import { create } from 'zustand';
import type { SolarStore, FluxDataPoint, FlareEvent, ForecastOutput } from '../types/solar';
import { INITIAL_METRICS } from '../utils/solarPhysics';

export const useSolarStore = create<SolarStore>((set) => ({
  fluxData: [],
  currentFlux: null,
  activeFlare: null,
  forecast: null,
  alertHistory: [],
  metrics: INITIAL_METRICS,
  isLive: true,
  lastUpdated: new Date(),
  addFluxPoint: (point) =>
    set((state) => ({
      fluxData: [...state.fluxData.slice(-239), point],
      currentFlux: point,
      lastUpdated: new Date(),
    })),
  setActiveFlare: (flare) => set({ activeFlare: flare }),
  setForecast: (forecast) => set({ forecast }),
  addToHistory: (flare) =>
    set((state) => ({
      alertHistory: [flare, ...state.alertHistory.slice(0, 49)],
    })),
}));