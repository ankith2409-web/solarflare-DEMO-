import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Clock, Zap } from 'lucide-react';
import type { FlareClass } from '../../types/solar';
import { FLARE_CLASS_INFO, CLASS_HEX, CLASS_BG_COLOR, CLASS_TEXT_COLOR } from '../../utils/solarPhysics';

interface FlareClassModalProps {
  flareClass: FlareClass;
  open: boolean;
  onClose: () => void;
}

export function FlareClassModal({ flareClass, open, onClose }: FlareClassModalProps) {
  const info = FLARE_CLASS_INFO[flareClass];
  const color = CLASS_HEX[flareClass];

  // Severity 0-4
  const severity = { A: 0, B: 1, C: 2, M: 3, X: 4 }[flareClass];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-space-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`Information about class ${flareClass} solar flares`}
        >
          <motion.div
            className="solar-card max-w-lg w-full relative"
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            style={{ borderColor: `${color}50` }}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 text-text-secondary hover:text-white"
              aria-label="Close"
            >
              <X className="w-4 h-4" aria-hidden />
            </button>

            <div className={`inline-block px-3 py-1 rounded-full font-mono font-bold text-sm mb-4 ${CLASS_BG_COLOR[flareClass]} ${CLASS_TEXT_COLOR[flareClass]}`}>
              CLASS {flareClass}
            </div>

            <h2 className="font-display font-bold text-2xl text-white mb-3">
              Class {flareClass} Solar Flare
            </h2>

            <div className="space-y-3 mb-5">
              <div className="flex items-start gap-2 text-sm">
                <Zap className="w-4 h-4 text-solar-cyan mt-0.5 flex-shrink-0" aria-hidden />
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-text-secondary font-mono">Energy Range</div>
                  <div className="text-white font-mono">{info.energy}</div>
                </div>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Clock className="w-4 h-4 text-solar-cyan mt-0.5 flex-shrink-0" aria-hidden />
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-text-secondary font-mono">Typical Duration</div>
                  <div className="text-white font-mono">{info.duration}</div>
                </div>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-solar-cyan mt-0.5 flex-shrink-0" aria-hidden />
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-text-secondary font-mono">Effects on Earth</div>
                  <div className="text-text-primary leading-relaxed">{info.effects}</div>
                </div>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <span className="text-isro-orange mt-0.5">★</span>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-text-secondary font-mono">Historical Example</div>
                  <div className="text-text-primary leading-relaxed font-mono text-xs">{info.historical}</div>
                </div>
              </div>
            </div>

            {/* Severity scale */}
            <div>
              <div className="text-[10px] uppercase tracking-wider text-text-secondary font-mono mb-2">Severity Scale</div>
              <div className="flex gap-1">
                {['A', 'B', 'C', 'M', 'X'].map((c, i) => {
                  const cKey = c as FlareClass;
                  const active = i <= severity;
                  return (
                    <div
                      key={c}
                      className="flex-1 h-2 rounded-full transition-all"
                      style={{
                        background: active ? CLASS_HEX[cKey] : '#1A2845',
                        boxShadow: active ? `0 0 8px ${CLASS_HEX[cKey]}80` : 'none',
                      }}
                      aria-label={`Severity level ${c}${active ? ' (active)' : ''}`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-[9px] font-mono text-text-muted mt-1">
                <span>A · background</span>
                <span>X · extreme</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}