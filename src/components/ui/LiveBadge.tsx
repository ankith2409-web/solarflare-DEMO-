import { cn } from '../../lib/utils';

interface LiveBadgeProps {
  label?: string;
  className?: string;
}

export function LiveBadge({ label = 'SIMULATED', className }: LiveBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 px-2.5 py-1 rounded-full',
        'bg-solar-cyan/10 border border-solar-cyan/30 text-solar-cyan',
        'font-mono text-xs uppercase tracking-wider',
        className
      )}
      aria-label="Simulated data feed active"
    >
      <span className="sim-dot" />
      {label}
    </span>
  );
}
