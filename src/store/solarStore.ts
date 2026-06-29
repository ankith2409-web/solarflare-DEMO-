import { create } from 'zustand';
import type { SolarStore, FluxDataPoint, FlareEvent, ForecastOutput, AlertSettings } from '../types/solar';
import { INITIAL_METRICS } from '../utils/solarPhysics';

const DEFAULT_ALERT_SETTINGS: AlertSettings = {
  browserEnabled: false,
  slackEnabled: false,
  slackWebhookUrl: '',
  emailEnabled: false,
  emailAddress: '',
  smsEnabled: false,
  smsPhoneNumber: '',
  audioEnabled: true,
  notificationThreshold: 'M+',
};

const loadAlertSettings = (): AlertSettings => {
  try {
    const saved = localStorage.getItem('solar_alert_settings');
    return saved ? { ...DEFAULT_ALERT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_ALERT_SETTINGS;
  } catch {
    return DEFAULT_ALERT_SETTINGS;
  }
};

export const useSolarStore = create<SolarStore>((set) => ({
  fluxData: [],
  currentFlux: null,
  activeFlare: null,
  forecast: null,
  alertHistory: [],
  metrics: INITIAL_METRICS,
  isLive: true,
  lastUpdated: new Date(),
  dataSource: 'simulation',
  alertSettings: loadAlertSettings(),
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
  setDataSource: (dataSource) => set({ dataSource }),
  updateFluxData: (fluxData) =>
    set({
      fluxData,
      currentFlux: fluxData[fluxData.length - 1] ?? null,
      lastUpdated: new Date(),
    }),
  setAlertSettings: (settings) =>
    set((state) => {
      const updated = { ...state.alertSettings, ...settings };
      try {
        localStorage.setItem('solar_alert_settings', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save alert settings to localStorage:', e);
      }
      return { alertSettings: updated };
    }),
}));