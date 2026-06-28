import { motion } from 'framer-motion';

interface ConfidenceBarProps {
  value: number; // 0-1
  label?: string;
  showPercent?: boolean;
}

export function ConfidenceBar({ value, label, showPercent = true }: ConfidenceBarProps) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  // Gradient from green (low confidence) to orange (high)
  const color = value < 0.5 ? '#00E676' : value < 0.75 ? '#FFC107' : '#FF6B00';

  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex justify-between items-baseline">
          <span className="text-[10px] uppercase tracking-wider text-text-secondary font-mono">
            {label}
          </span>
          {showPercent && (
            <span
              className="text-sm font-mono font-bold"
              style={{ color }}
            >
              {pct.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <div className="h-2 bg-space-mid rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            background: `linear-gradient(90deg, #00E676 0%, #FFC107 60%, ${color} 100%)`,
            boxShadow: `0 0 12px ${color}80`,
          }}
        />
      </div>
    </div>
  );
}
