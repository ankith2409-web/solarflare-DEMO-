import { Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSolarStore } from '../../store/solarStore';
import { FlareBadge } from '../ui/FlareBadge';
import { ConfidenceBar } from '../ui/ConfidenceBar';
import { CLASS_HEX, formatUTCLong, classifyFlux, FLUX_THRESHOLDS } from '../../utils/solarPhysics';
import { useState } from 'react';
import { FlareClassModal } from '../impact/FlareClassModal';

export function ActiveFlareCard() {
  const activeFlare = useSolarStore((s) => s.activeFlare);
  const currentFlux = useSolarStore((s) => s.currentFlux);
  const [modalOpen, setModalOpen] = useState(false);

  const cls = activeFlare?.predictedClass ?? currentFlux?.inferredClass ?? 'A';
  const magnitude = activeFlare?.predictedMagnitude ?? (currentFlux ? currentFlux.soLEXS / FLUX_THRESHOLDS[cls].min : 0);
  const color = CLASS_HEX[cls];

  const confidence = activeFlare?.confidence ?? (currentFlux ? Math.min(0.95, 0.5 + currentFlux.soLEXS * 1e6) : 0);
  const timeToPeak = activeFlare && activeFlare.peakAt
    ? Math.max(0, Math.ceil((new Date(activeFlare.peakAt).getTime() - Date.now()) / 60000))
    : null;
  const uncertainty = activeFlare?.timeToPeakUncertainty ?? 0;

  const statusLabel = confidence >= 0.85 ? 'High Confidence' : confidence >= 0.65 ? 'Medium Confidence' : 'Low Confidence';
  const statusColor = confidence >= 0.85 ? '#00E676' : confidence >= 0.65 ? '#FFC107' : '#FF4560';

  const isAlert = cls === 'M' || cls === 'X';

  return (
    <>
      <motion.div
        className={`solar-card relative overflow-hidden ${isAlert ? 'animate-flare-alert' : ''}`}
        style={{ borderColor: `${color}50` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Bottom border glow */}
        <div
          className="absolute bottom-0 inset-x-0 h-0.5"
          style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
        />

        <div className="text-[10px] uppercase tracking-widest text-text-secondary font-mono mb-4">
          ACTIVE FLARE CLASS
        </div>

        <div className="flex items-baseline gap-3 mb-2">
          <motion.div
            key={cls + magnitude.toFixed(1)}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="font-display font-bold text-7xl leading-none"
            style={{ color }}
          >
            {cls}
            {magnitude.toFixed(1)}
          </motion.div>
          <FlareBadge flareClass={cls} magnitude={magnitude} size="md" onClick={() => setModalOpen(true)} />
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono text-text-secondary mb-5">
          <AlertCircle className="w-3 h-3" aria-hidden />
          <span>Inferred class · click badge for details</span>
        </div>

        <div className="space-y-4 mb-5">
          <ConfidenceBar value={confidence} label="MODEL CONFIDENCE" />
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-[10px] uppercase tracking-wider text-text-secondary font-mono">
                EST. TIME-TO-PEAK
              </span>
              <span className="text-sm font-mono font-bold text-white">
                {timeToPeak !== null ? (timeToPeak > 0 ? `${timeToPeak} min` : 'Peaking') : '—'}
                {uncertainty > 0 && <span className="text-text-muted ml-1.5">±{uncertainty}</span>}
              </span>
            </div>
            <div className="h-2 bg-space-mid rounded-full overflow-hidden flex items-center px-1">
              <Clock className="w-3 h-3 text-text-secondary" aria-hidden />
              <div className="flex-1 mx-2 h-px bg-space-border" />
              <span className="text-[9px] text-text-muted font-mono">±window</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs font-mono pt-3 border-t border-space-border">
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: statusColor, boxShadow: `0 0 6px ${statusColor}` }}
            />
            <span className="text-text-secondary">{statusLabel}</span>
          </div>
          <div className="text-text-muted text-[10px]">
            Detected: {formatUTCLong(activeFlare?.detectedAt ?? new Date())}
          </div>
        </div>
      </motion.div>

      <FlareClassModal flareClass={cls} open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}