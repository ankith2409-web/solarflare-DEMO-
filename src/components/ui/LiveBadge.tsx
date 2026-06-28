import { cn } from '../../lib/utils';

interface LiveBadgeProps {
  label?: string;
  className?: string;
}

export function LiveBadge({ label = 'LIVE', className }: LiveBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 px-2.5 py-1 rounded-full',
        'bg-red-500/10 border border-red-500/30 text-red-400',
        'font-mono text-xs uppercase tracking-wider',
        className
      )}
      aria-label="Live data feed active"
    >
      <span className="live-dot" />
      {label}
    </span>
  );
}
