import { TrendingUp } from 'lucide-react';

export function SolarCycleBanner() {
  return (
    <div className="bg-gradient-to-r from-isro-orange/10 via-isro-amber/10 to-solar-cyan/10 border-y border-isro-orange/30 py-3 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-isro-orange/20 border border-isro-orange/40 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-4 h-4 text-isro-orange" aria-hidden />
          </div>
          <div>
            <div className="text-sm font-display font-bold text-white">
              Solar Cycle 25 — Near Maximum (2025-2026)
            </div>
            <div className="text-xs text-text-secondary">
              Peak X-class frequency period · <span className="text-isro-amber font-mono">3-5×</span> elevated flare risk vs solar minimum
            </div>
          </div>
        </div>
        <div className="text-right text-xs font-mono text-text-secondary">
          <div>Solar Max: <span className="text-white">SC25 peak · Oct 2024 – Mar 2026</span></div>
          <div>NOAA SWPC · SWMF</div>
        </div>
      </div>
    </div>
  );
}