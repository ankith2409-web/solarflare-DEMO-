import { cn } from '../../lib/utils';

interface GlowCardProps {
  children: React.ReactNode;
  accent?: 'cyan' | 'green' | 'orange' | 'red' | 'amber' | 'none';
  className?: string;
  glow?: boolean;
}

const GLOW_CLASS: Record<string, string> = {
  cyan: 'hover:border-solar-cyan/50 hover:glow-cyan',
  green: 'hover:border-success-green/50 hover:glow-green',
  orange: 'hover:border-isro-orange/50 hover:glow-orange',
  red: 'hover:border-solar-red/50 hover:glow-red',
  amber: 'hover:border-isro-amber/50 hover:glow-amber',
  none: '',
};

export function GlowCard({
  children,
  accent = 'none',
  className,
  glow = false,
}: GlowCardProps) {
  return (
    <div
      className={cn(
        'solar-card transition-all duration-300',
        GLOW_CLASS[accent],
        glow && 'animate-flare-alert',
        className
      )}
    >
      {children}
    </div>
  );
}