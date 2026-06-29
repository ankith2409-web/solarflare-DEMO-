import { useState, useEffect } from 'react';
import { Bell, X, Check, BellOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSolarStore } from '../../store/solarStore';
import { CLASS_HEX } from '../../utils/solarPhysics';

type PermissionState = 'unsupported' | 'default' | 'granted' | 'denied';

export function AlertSimulator() {
  const [open, setOpen] = useState(false);
  const alertSettings = useSolarStore((s) => s.alertSettings);
  const setAlertSettings = useSolarStore((s) => s.setAlertSettings);
  const threshold = alertSettings.notificationThreshold ?? 'M+';
  const [permission, setPermission] = useState<PermissionState>('default');

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPermission('unsupported');
      return;
    }
    setPermission(Notification.permission as PermissionState);
  }, []);

  async function requestPermission() {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPermission('unsupported');
      return;
    }
    try {
      const result = await Notification.requestPermission();
      setPermission(result as PermissionState);
    } catch {
      setPermission('denied');
    }
  }

  function fireTestNotification() {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    try {
      // eslint-disable-next-line no-new
      new Notification('Solar flare test alert', {
        body: 'This is a test notification from the Aditya-L1 Solar Flare Dashboard. You will receive alerts like this when M/X-class flares are predicted.',
        icon: '/favicon.ico',
        tag: 'test-notification',
      });
    } catch {
      /* ignore */
    }
  }

  const activeFlare = useSolarStore((s) => s.activeFlare);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-isro-orange/40 text-isro-orange hover:bg-isro-orange/10 font-mono text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-isro-orange/60"
      >
        <Bell className="w-3.5 h-3.5" aria-hidden />
        SET ALERT
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-space-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              className="solar-card max-w-md w-full"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                    <Bell className="w-4 h-4 text-isro-orange" aria-hidden />
                    Set Flare Alert
                  </h3>
                  <p className="text-xs text-text-secondary mt-1">
                    Configure browser notification threshold
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-1 text-text-secondary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solar-cyan/60 rounded"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" aria-hidden />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-text-secondary font-mono mb-2">
                    Threshold
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {(['M+', 'X-only'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setAlertSettings({ notificationThreshold: t })}
                        className={`px-3 py-2 rounded-lg border text-sm font-mono transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-isro-orange/60 ${
                          threshold === t
                            ? 'border-isro-orange bg-isro-orange/15 text-isro-orange'
                            : 'border-space-border text-text-secondary hover:border-solar-cyan/40'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-space-border pt-4">
                  <div className="text-[10px] uppercase tracking-wider text-text-secondary font-mono mb-2">
                    Browser Notifications
                  </div>
                  {permission === 'unsupported' ? (
                    <div className="flex items-center gap-2 text-text-secondary text-xs font-mono">
                      <BellOff className="w-4 h-4" aria-hidden />
                      Not supported in this browser
                    </div>
                  ) : permission === 'granted' ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-success-green text-sm">
                        <Check className="w-4 h-4" aria-hidden />
                        <span className="font-mono">Permission granted</span>
                      </div>
                      <button
                        type="button"
                        onClick={fireTestNotification}
                        className="w-full px-3 py-2 rounded-lg bg-solar-cyan/10 border border-solar-cyan/40 text-solar-cyan hover:bg-solar-cyan/20 text-xs font-mono transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solar-cyan/60"
                      >
                        Send test notification
                      </button>
                    </div>
                  ) : permission === 'denied' ? (
                    <div className="text-xs text-text-secondary font-mono">
                      Permission denied — enable notifications in your browser's site settings to receive alerts.
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={requestPermission}
                      className="w-full px-3 py-2 rounded-lg bg-solar-cyan/10 border border-solar-cyan/40 text-solar-cyan hover:bg-solar-cyan/20 text-sm font-mono transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solar-cyan/60"
                    >
                      Allow notifications
                    </button>
                  )}
                </div>

                {activeFlare && (
                  <div className="border-t border-space-border pt-4 text-xs text-text-secondary">
                    <div className="font-mono text-text-primary mb-1">Currently Active:</div>
                    <div className="text-text-secondary">
                      <span style={{ color: CLASS_HEX[activeFlare.predictedClass] }} className="font-bold">
                        {activeFlare.predictedClass}
                        {activeFlare.predictedMagnitude.toFixed(1)}
                      </span>{' '}
                      · {(activeFlare.confidence * 100).toFixed(0)}% confidence · peak in ~{activeFlare.timeToPeakMin} min
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}