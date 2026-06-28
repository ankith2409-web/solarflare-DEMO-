import { useMemo } from 'react';
import { Target } from 'lucide-react';
import { useSolarStore } from '../../store/solarStore';
import {
  getPeakRiseRates,
  MX_CLASS_AVG_RISE_RATE,
  RISE_RATE_DISPLAY_MIN,
  RISE_RATE_DISPLAY_MAX,
} from '../../utils/dataGenerator';
import { CLASS_HEX, formatFluxSci, classifyFlux } from '../../utils/solarPhysics';
import type { FlareClass } from '../../types/solar';

/**
 * Bullet/Gauge chart for Peak Rise Rate.
 * - Horizontal filled bar shows the **current** rise rate (W/m²/min)
 * - Benchmark line at the historical M/X-class average (5e-6 W/m²/min)
 * - Background bands indicate B/C/M/X class thresholds
 * - Mini-distribution strip below shows the last 12 events as colored dots
 */
export function PeakRiseRateChart() {
  const fluxData = useSolarStore((s) => s.fluxData);
  const alertHistory = useSolarStore((s) => s.alertHistory);

  // Compute current rise rate (W/m²/min) from latest dF/dt of SoLEXS
  // The data points are spaced 1 minute apart, so the diff between the last
  // two points IS already the per-minute rise rate.
  const currentRate = useMemo(() => {
    if (fluxData.length < 2) return 0;
    const latest = fluxData[fluxData.length - 1];
    const prev = fluxData[fluxData.length - 2];
    return Math.max(0, latest.soLEXS - prev.soLEXS);
  }, [fluxData]);

  const historyRates = useMemo(() => getPeakRiseRates(alertHistory), [alertHistory]);

  // Map current rate to position on the log-scaled bar (0 to 1)
  const position = useMemo(() => {
    if (currentRate <= 0) return 0;
    const logMin = Math.log10(RISE_RATE_DISPLAY_MIN);
    const logMax = Math.log10(RISE_RATE_DISPLAY_MAX);
    const logRate = Math.log10(currentRate);
    return Math.max(0, Math.min(1, (logRate - logMin) / (logMax - logMin)));
  }, [currentRate]);

  // Position of the M/X-class benchmark line (in %)
  const benchmarkPosition = useMemo(() => {
    const logMin = Math.log10(RISE_RATE_DISPLAY_MIN);
    const logMax = Math.log10(RISE_RATE_DISPLAY_MAX);
    const logBench = Math.log10(MX_CLASS_AVG_RISE_RATE);
    return Math.max(0, Math.min(1, (logBench - logMin) / (logMax - logMin)));
  }, []);

  // Determine current "zone" based on rate magnitude
  // Use classifyFlux to map to a class — but the rates are per-minute deltas
  // which are smaller than absolute flux, so we use a simple bucketing.
  const currentClass: FlareClass = (() => {
    if (currentRate >= 1e-5) return 'X';
    if (currentRate >= 1e-6) return 'M';
    if (currentRate >= 1e-7) return 'C';
    if (currentRate >= 1e-8) return 'B';
    return 'A';
  })();
  const zoneColor = CLASS_HEX[currentClass];

  // % of M/X average
  const percentOfBenchmark = (currentRate / MX_CLASS_AVG_RISE_RATE) * 100;

  return (
    <div className="solar-card" style={{ borderColor: '#00D4FF40' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ background: '#00D4FF', boxShadow: '0 0 8px #00D4FF' }}
            aria-hidden
          />
          <h4 className="font-display font-semibold text-white text-sm">Peak Rise Rate</h4>
          <span className="text-[10px] text-text-secondary font-mono hidden sm:inline">vs M/X benchmark</span>
        </div>
        <span
          className="text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider"
          style={{
            color: zoneColor,
            backgroundColor: `${zoneColor}15`,
            borderColor: `${zoneColor}60`,
          }}
        >
          {currentClass === 'A' ? 'QUIET' : `${currentClass}-zone`}
        </span>
      </div>

      {/* Big numeric readout */}
      <div className="flex items-baseline gap-2 mb-4 flex-wrap">
        <span
          className="font-mono font-bold text-3xl leading-none"
          style={{ color: zoneColor }}
        >
          {formatFluxSci(currentRate)}
        </span>
        <span className="text-xs text-text-secondary font-mono">W/m²/min</span>
        <span className="ml-auto text-[10px] font-mono text-text-secondary">
          <span className="text-white font-bold">{percentOfBenchmark.toFixed(0)}%</span>{' '}
          of M/X avg
        </span>
      </div>

      {/* Bullet bar */}
      <div className="relative" aria-label="Bullet chart: current rise rate vs M/X benchmark">
        <div className="relative h-9">
          {/* Background class-zone bands */}
          <div className="absolute inset-0 rounded-md overflow-hidden flex">
            <ClassBand flareClass="A" widthPct={20} />
            <ClassBand flareClass="B" widthPct={20} />
            <ClassBand flareClass="C" widthPct={20} />
            <ClassBand flareClass="M" widthPct={20} />
            <ClassBand flareClass="X" widthPct={20} />
          </div>

          {/* Filled bar (current value) */}
          <div
            className="absolute inset-y-0 left-0 rounded-l-md transition-all duration-700 ease-out"
            style={{
              width: `${position * 100}%`,
              background: `linear-gradient(90deg, rgba(0, 230, 118, 0.55) 0%, rgba(255, 193, 7, 0.55) 40%, rgba(255, 179, 0, 0.7) 70%, rgba(255, 107, 0, 0.9) 100%)`,
              boxShadow: `0 0 14px ${zoneColor}90`,
            }}
            aria-hidden
          />

          {/* Benchmark line at M/X average */}
          <div
            className="absolute inset-y-[-4px] w-0.5 bg-white z-10"
            style={{
              left: `${benchmarkPosition * 100}%`,
              boxShadow: '0 0 6px rgba(255,255,255,0.9)',
            }}
            aria-label="M/X-class benchmark line"
          >
            {/* Benchmark flag */}
            <div
              className="absolute -top-5 -translate-x-1/2 whitespace-nowrap text-[9px] font-mono bg-white text-space-black px-1.5 py-0.5 rounded font-bold"
              style={{ left: 0 }}
            >
              M/X avg
            </div>
          </div>

          {/* Current value needle */}
          {currentRate > 0 && (
            <div
              className="absolute inset-y-[-2px] w-1 rounded-sm z-20 transition-all duration-700 ease-out"
              style={{
                left: `calc(${position * 100}% - 2px)`,
                background: zoneColor,
                boxShadow: `0 0 8px ${zoneColor}`,
              }}
              aria-hidden
            />
          )}
        </div>

        {/* Class label ticks below */}
        <div className="flex justify-between text-[8px] font-mono text-text-muted mt-1 px-px">
          <span>A</span>
          <span>B</span>
          <span>C</span>
          <span>M</span>
          <span>X</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-mono text-text-secondary my-3">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-1.5 rounded-sm" style={{ background: 'linear-gradient(90deg, #00E676, #FF6B00)' }} />
          Current rise rate
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-0.5 h-3 bg-white" />
          M/X benchmark ({formatFluxSci(MX_CLASS_AVG_RISE_RATE)} W/m²/min)
        </div>
      </div>

      {/* Mini-distribution: last 12 historical events */}
      <div className="border-t border-space-border pt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-wider text-text-secondary font-mono">
            Last 12 events
          </span>
          <span className="text-[10px] text-text-muted font-mono">
            dot size ∝ magnitude
          </span>
        </div>
        <div className="relative h-6">
          {/* Background guide at benchmark */}
          <div
            className="absolute inset-y-0 w-px bg-white/30"
            style={{ left: `${benchmarkPosition * 100}%` }}
          />
          {historyRates.map((d, i) => {
            const logMin = Math.log10(RISE_RATE_DISPLAY_MIN);
            const logMax = Math.log10(RISE_RATE_DISPLAY_MAX);
            const pos = (Math.log10(d.rate) - logMin) / (logMax - logMin);
            const c = CLASS_HEX[d.class as FlareClass];
            const size = 4 + Math.min(8, (d.rate / 1e-4) * 8); // 4-12 px
            return (
              <div
                key={i}
                className="absolute rounded-full transition-all hover:scale-150"
                style={{
                  left: `${pos * 100}%`,
                  top: '50%',
                  width: size,
                  height: size,
                  background: c,
                  boxShadow: `0 0 4px ${c}`,
                  transform: 'translate(-50%, -50%)',
                }}
                title={`${d.class} · ${formatFluxSci(d.rate)} W/m²/min`}
                aria-label={`Event ${i + 1}: class ${d.class}, rise rate ${formatFluxSci(d.rate)} W/m² per minute`}
              />
            );
          })}
        </div>
      </div>

      {/* Insight footer */}
      <div className="mt-3 pt-3 border-t border-space-border flex items-start gap-2 text-[10px] text-text-secondary">
        <Target className="w-3 h-3 mt-0.5 flex-shrink-0 text-solar-cyan" aria-hidden />
        <p className="leading-relaxed">
          {currentRate > MX_CLASS_AVG_RISE_RATE ? (
            <>
              <span className="text-isro-orange font-mono font-bold">Above M/X benchmark</span> —
              current rise rate exceeds historical M/X-class average. Sustained elevation is a
              precursor for energetic events.
            </>
          ) : currentRate > 1e-7 ? (
            <>
              <span className="text-caution-yellow font-mono font-bold">Elevated</span> — current
              rise rate is above background but below M/X-class threshold.
            </>
          ) : (
            <>
              <span className="text-success-green font-mono font-bold">Background level</span> —
              flux is varying within quiet-sun noise. No precursor activity detected.
            </>
          )}
        </p>
      </div>
    </div>
  );
}

function ClassBand({ flareClass, widthPct }: { flareClass: FlareClass; widthPct: number }) {
  const color = CLASS_HEX[flareClass];
  return (
    <div
      className="h-full border-r border-space-black/30 last:border-r-0"
      style={{
        width: `${widthPct}%`,
        background: `${color}12`,
      }}
      title={`${flareClass}-class range`}
      aria-hidden
    />
  );
}
