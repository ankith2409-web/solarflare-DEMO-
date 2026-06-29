import { useEffect, useRef, useState } from 'react';
import { useSolarStore } from '../store/solarStore';
import {
  generateNextFluxPoint,
  detectActiveFlare,
  generateForecast,
  generateInitialHistory,
} from '../utils/dataGenerator';
import { audioAlert } from '../utils/audioAlert';
import type { FlareEvent } from '../types/solar';

const triggerAlertNotifications = (flare: FlareEvent, settings: any) => {
  const threshold = settings.notificationThreshold ?? 'M+';
  if (threshold === 'X-only' && flare.predictedClass !== 'X') return;

  const title = `🚨 SOLAR FLARE ALERT: Class ${flare.predictedClass}${flare.predictedMagnitude.toFixed(1)} Inbound!`;
  const message = `Precursor activity indicates an energetic flare. Est. time to peak: ${flare.timeToPeakMin} min. Confidence: ${(flare.confidence * 100).toFixed(0)}%.`;

  // Audio Siren
  if (settings.audioEnabled) {
    audioAlert.playSiren();
  }

  // Browser Notification
  if (settings.browserEnabled && 'Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body: message, icon: '/sun.svg' });
  }

  // Webhook Integration
  if (settings.slackEnabled && settings.slackWebhookUrl) {
    fetch(settings.slackWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `*${title}*\n${message}\n_Solar Flare Warning System_`
      }),
      mode: 'no-cors' // bypass CORS restriction on webhook endpoints
    }).catch((err) => console.error('Slack Webhook post failed:', err));
  }
};

export function useSimulatedData() {
  const addFluxPoint = useSolarStore((s) => s.addFluxPoint);
  const setActiveFlare = useSolarStore((s) => s.setActiveFlare);
  const setForecast = useSolarStore((s) => s.setForecast);
  const addToHistory = useSolarStore((s) => s.addToHistory);
  
  const isLive = useSolarStore((s) => s.isLive);
  const updateFluxData = useSolarStore((s) => s.updateFluxData);

  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const history = generateInitialHistory();
    updateFluxData(history);
    const latestPoint = history[history.length - 1] ?? null;
    const forecast = generateForecast(latestPoint, new Date());
    setForecast(forecast);
    setActiveFlare(null);
    setIsLoading(false);
  }, [updateFluxData, setForecast, setActiveFlare]);

  // Polling / Tick loop
  useEffect(() => {
    if (!isLive || isLoading) return;

    const intervalTime = 10_000; // 10 seconds simulation ticks

    intervalRef.current = window.setInterval(() => {
      const currentStore = useSolarStore.getState();
      
      const point = generateNextFluxPoint(currentStore.fluxData, new Date());
      addFluxPoint(point);

      // Detect flare
      const currentActive = currentStore.activeFlare;
      const flare = detectActiveFlare(point);
      if (flare) {
        if (!currentActive || flare.predictedClass !== currentActive.predictedClass) {
          setActiveFlare(flare);
          addToHistory(flare);
          triggerAlertNotifications(flare, currentStore.alertSettings);
        }
      } else if (currentActive) {
        setActiveFlare(null);
      }

      // Update forecast
      const forecast = generateForecast(point, new Date());
      setForecast(forecast);
    }, intervalTime);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [isLive, isLoading, addFluxPoint, setActiveFlare, addToHistory, setForecast]);

  return { isLoading };
}