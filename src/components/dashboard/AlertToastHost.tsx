import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Activity, Clock } from 'lucide-react';
import { useSolarStore } from '../../store/solarStore';
import { CLASS_HEX } from '../../utils/solarPhysics';
import type { FlareEvent } from '../../types/solar';

interface ToastEntry {
  id: string;
  flare: FlareEvent;
  shownAt: number;
}

/**
 * Top-of-screen alert toasts that fire when a new M/X-class flare is detected.
 * Auto-dismisses after 12 seconds. Also fires the browser Notification API
 * once the user has granted permission via AlertSimulator.
 */
export function AlertToastHost() {
  const activeFlare = useSolarStore((s) => s.activeFlare);
  const alertHistory = useSolarStore((s) => s.alertHistory);
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const lastFiredRef = useRef<string | null>(null);
  const notifPref = useRef<'default' | 'granted' | 'denied'>('default');

  // Mirror browser permission state (so we don't fire system notifications
  // unless the user explicitly granted them via AlertSimulator)
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    notifPref.current = Notification.permission as typeof notifPref.current;
  }, []);

  // Watch activeFlare for new M/X events and queue a toast + system notification
  useEffect(() => {
    if (!activeFlare) return;
    const cls = activeFlare.predictedClass;
    if (cls !== 'M' && cls !== 'X') return;
    // De-dupe by predictedClass+magnitude+minute so the same event only fires once
    const key = `${cls}-${activeFlare.predictedMagnitude.toFixed(1)}-${activeFlare.detectedAt.getMinutes()}`;
    if (lastFiredRef.current === key) return;
    lastFiredRef.current = key;

    const entry: ToastEntry = {
      id: `toast-${activeFlare.id}`,
      flare: activeFlare,
      shownAt: Date.now(),
    };
    setToasts((prev) => [...prev, entry]);

    // Fire browser notification if permission granted
    if (notifPref.current === 'granted' && 'Notification' in window) {
      try {
        // eslint-disable-next-line no-new
        new Notification(`${cls}-class flare detected`, {
          body: `Predicted ${cls}${activeFlare.predictedMagnitude.toFixed(1)} · ${(activeFlare.confidence * 100).toFixed(0)}% confidence · peak in ~${activeFlare.timeToPeakMin} min`,
          icon: '/favicon.ico',
          tag: entry.id,
        });
      } catch {
        // ignore — some browsers throw on inactive tabs
      }
    }

    // Auto-dismiss after 12 seconds
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== entry.id));
    }, 12_000);
  }, [activeFlare]);

  function dismiss(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-20 right-4 z-[90] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      role="region"
      aria-label="Solar flare alerts"
    >
      <AnimatePresence>
        {toasts.map((t) => {
          const c = CLASS_HEX[t.flare.predictedClass];
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 240, damping: 22 }}
              className="pointer-events-auto solar-card p-3 pr-9 relative overflow-hidden"
              style={{ borderColor: c, boxShadow: `0 0 24px ${c}40` }}
              role="alert"
              aria-live="assertive"
            >
              <div
                className="absolute inset-y-0 left-0 w-1"
                style={{ background: c, boxShadow: `0 0 8px ${c}` }}
                aria-hidden
              />
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="absolute top-2 right-2 text-text-secondary hover:text-white"
                aria-label="Dismiss alert"
              >
                <X className="w-3.5 h-3.5" aria-hidden />
              </button>
              <div className="flex items-center gap-2 mb-1.5">
                <AlertTriangle className="w-4 h-4" style={{ color: c }} aria-hidden />
                <span
                  className="text-[10px] font-mono uppercase tracking-wider font-bold"
                  style={{ color: c }}
                >
                  {t.flare.predictedClass}-class flare detected
                </span>
              </div>
              <div className="font-display font-bold text-xl text-white leading-tight mb-2">
                {t.flare.predictedClass}
                {t.flare.predictedMagnitude.toFixed(1)}{' '}
                <span className="text-text-secondary text-xs font-mono">
                  · {(t.flare.confidence * 100).toFixed(0)}% confidence
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono text-text-secondary">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" aria-hidden />
                  Peak in ~{t.flare.timeToPeakMin} min
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="w-3 h-3" aria-hidden />
                  ±{t.flare.timeToPeakUncertainty} min
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}