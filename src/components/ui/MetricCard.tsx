import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  change?: { delta: number; label?: string };
  accent?: 'cyan' | 'green' | 'orange' | 'red' | 'amber';
  tooltip?: string;
}

const ACCENTS: Record<string, string> = {
  cyan: 'text-solar-cyan glow-cyan',
  green: 'text-success-green glow-green',
  orange: 'text-isro-orange glow-orange',
  red: 'text-solar-red glow-red',
  amber: 'text-isro-amber glow-amber',
};

export function MetricCard({ label, value, unit, change, accent = 'cyan', tooltip }: MetricCardProps) {
  const [displayed, setDisplayed] = useState(typeof value === 'number' ? 0 : (value as string));

  useEffect(() => {
    if (typeof value === 'number') {
      const start = 0;
      const duration = 900;
      const startTime = performance.now();
      let rafId: number;
      const step = (now: number) => {
        const t = Math.min(1, (now - startTime) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        setDisplayed(start + (value - start) * eased);
        if (t < 1) rafId = requestAnimationFrame(step);
      };
      rafId = requestAnimationFrame(step);
      return () => cancelAnimationFrame(rafId);
    } else {
      setDisplayed(value);
    }
  }, [value]);

  return (
    <div
      className="solar-card"
      title={tooltip}
      aria-label={`${label}: ${value}${unit ?? ''}${change ? `, change ${change.delta}` : ''}`}
    >
      <div className="text-[10px] uppercase tracking-wider text-text-secondary font-mono mb-1">
        {label}
      </div>
      <motion.div
        className={`font-display font-bold text-4xl lg:text-5xl ${ACCENTS[accent]}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {typeof displayed === 'number'
          ? displayed.toFixed(displayed < 10 ? 2 : 0)
          : displayed}
        {unit && <span className="text-base text-text-secondary ml-1">{unit}</span>}
      </motion.div>
      {change && (
        <div className={`text-xs font-mono mt-2 ${change.delta >= 0 ? 'text-success-green' : 'text-solar-red'}`}>
          {change.delta >= 0 ? '↑' : '↓'} {Math.abs(change.delta).toFixed(2)}
          {change.label && <span className="text-text-muted ml-1">{change.label}</span>}
        </div>
      )}
    </div>
  );
}
