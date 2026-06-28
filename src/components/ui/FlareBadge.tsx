import { cn } from '../../lib/utils';
import type { FlareClass } from '../../types/solar';
import { CLASS_HEX } from '../../utils/solarPhysics';

interface FlareBadgeProps {
  flareClass: FlareClass;
  magnitude?: number;
  size?: 'sm' | 'md' | 'lg';
  showPulse?: boolean;
  onClick?: () => void;
}

const SIZES = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
  lg: 'text-2xl px-5 py-2',
};

export function FlareBadge({
  flareClass,
  magnitude,
  size = 'md',
  showPulse,
  onClick,
}: FlareBadgeProps) {
  const isAlert = flareClass === 'M' || flareClass === 'X';
  const color = CLASS_HEX[flareClass];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative inline-flex items-center justify-center rounded-full font-mono font-bold',
        'transition-all hover:scale-105 cursor-pointer',
        SIZES[size]
      )}
      style={{
        color,
        backgroundColor: `${color}20`,
        border: `1px solid ${color}80`,
      }}
      aria-label={`Flare class ${flareClass}${magnitude ? ` magnitude ${magnitude.toFixed(1)}` : ''}. Click for details.`}
    >
      {isAlert && showPulse && (
        <span
          className="flare-pulse-ring"
          style={{ color }}
          aria-hidden
        />
      )}
      <span>
        {flareClass}
        {magnitude !== undefined && magnitude.toFixed(1)}
      </span>
    </button>
  );
}
