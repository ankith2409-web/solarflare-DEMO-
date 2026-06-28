import {
  ComposedChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  CartesianGrid,
} from 'recharts';
import { useMemo } from 'react';
import { useSolarStore } from '../../store/solarStore';
import { formatFluxSci, classifyFlux, CLASS_HEX } from '../../utils/solarPhysics';

export function DualChannelChart() {
  const fluxData = useSolarStore((s) => s.fluxData);
  const activeFlare = useSolarStore((s) => s.activeFlare);

  // Pre-compute chart data with formatted time
  const chartData = useMemo(() => {
    return fluxData.map((d) => ({
      ...d,
      // Need a serializable time string for the x-axis numeric axis
      timeMs: d.timestamp.getTime(),
      timeLabel: d.timestampUTC,
    }));
  }, [fluxData]);

  // Forecast window: last 30 min
  const lastTs = chartData.length > 0 ? chartData[chartData.length - 1].timeMs : 0;
  const forecastStart = lastTs - 30 * 60 * 1000;

  // Tooltip
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: number }) => {
    if (!active || !payload || payload.length === 0) return null;
    const point = chartData.find((d) => d.timeMs === label);
    if (!point) return null;
    return (
      <div className="bg-space-deep/95 border border-space-border rounded-lg p-3 shadow-2xl backdrop-blur-sm">
        <div className="text-[10px] uppercase tracking-wider text-text-secondary mb-2 font-mono">
          {point.timestampUTC}
        </div>
        <div className="space-y-1.5 font-mono text-xs">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-solar-cyan" />
              SoLEXS
            </span>
            <span className="text-white">{formatFluxSci(point.soLEXS)} W/m²</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-solar-red" />
              HEL1OS
            </span>
            <span className="text-white">{formatFluxSci(point.hel1OS)} W/m²</span>
          </div>
          <div className="flex items-center justify-between gap-4 pt-1 border-t border-space-border">
            <span className="text-text-secondary">Class</span>
            <span style={{ color: CLASS_HEX[point.inferredClass] }} className="font-bold">
              {point.inferredClass}
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (chartData.length === 0) {
    return (
      <div className="h-[320px] flex items-center justify-center text-text-secondary text-sm">
        Loading flux data…
      </div>
    );
  }

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 10, right: 50, bottom: 20, left: 0 }}>
          <defs>
            <linearGradient id="solexsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00D4FF" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#00D4FF" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 6" stroke="#1A2845" vertical={false} />

          <XAxis
            dataKey="timeMs"
            type="number"
            domain={['dataMin', 'dataMax']}
            tick={{ fill: '#7BA7C7', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            tickFormatter={(t) => {
              const d = new Date(t);
              return `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}`;
            }}
            interval={29}
            stroke="#1A2845"
          />

          <YAxis
            type="number"
            scale="log"
            domain={[1e-9, 1e-3]}
            tick={{ fill: '#7BA7C7', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            tickFormatter={(v) => formatFluxSci(v).replace('×10', 'e')}
            ticks={[1e-9, 1e-8, 1e-7, 1e-6, 1e-5, 1e-4, 1e-3]}
            stroke="#1A2845"
          />

          {/* Right Y-axis: GOES class labels */}
          {/* We'll overlay via reference lines instead */}

          <Tooltip content={<CustomTooltip />} />

          {/* Recent 30-min lookback shaded region */}
          <ReferenceArea
            x1={forecastStart}
            x2={lastTs}
            fill="#00D4FF"
            fillOpacity={0.05}
            stroke="#00D4FF"
            strokeOpacity={0.3}
            strokeDasharray="2 4"
            label={{
              value: 'Recent 30 min',
              position: 'insideTopLeft',
              fill: '#7BA7C7',
              fontSize: 10,
              fontFamily: 'JetBrains Mono',
            }}
          />

          {/* GOES class threshold lines */}
          <ReferenceLine
            y={1e-5}
            stroke="#FFB300"
            strokeDasharray="4 4"
            strokeWidth={1}
            label={{ value: 'M', position: 'right', fill: '#FFB300', fontSize: 10, fontFamily: 'JetBrains Mono' }}
          />
          <ReferenceLine
            y={1e-4}
            stroke="#FF6B00"
            strokeDasharray="4 4"
            strokeWidth={1}
            label={{ value: 'X', position: 'right', fill: '#FF6B00', fontSize: 10, fontFamily: 'JetBrains Mono' }}
          />
          <ReferenceLine
            y={1e-6}
            stroke="#FFC107"
            strokeDasharray="2 4"
            strokeWidth={0.5}
            label={{ value: 'C', position: 'right', fill: '#FFC107', fontSize: 9, fontFamily: 'JetBrains Mono' }}
          />
          <ReferenceLine
            y={1e-7}
            stroke="#00E676"
            strokeDasharray="2 4"
            strokeWidth={0.5}
            label={{ value: 'B', position: 'right', fill: '#00E676', fontSize: 9, fontFamily: 'JetBrains Mono' }}
          />

          <Line
            type="monotone"
            dataKey="soLEXS"
            stroke="#00D4FF"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="SoLEXS (Soft X-ray)"
          />
          <Line
            type="monotone"
            dataKey="hel1OS"
            stroke="#FF4560"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="HEL1OS (Hard X-ray)"
          />

          {/* Active flare annotation */}
          {activeFlare && (
            <ReferenceLine
              x={activeFlare.detectedAt.getTime()}
              stroke="#FF6B00"
              strokeDasharray="3 3"
              strokeWidth={1.5}
              label={{
                value: `${activeFlare.predictedClass}${activeFlare.predictedMagnitude.toFixed(1)}`,
                position: 'top',
                fill: '#FF6B00',
                fontSize: 11,
                fontFamily: 'JetBrains Mono',
              }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-2 px-2 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-solar-cyan" />
          <span className="font-mono text-text-secondary">SoLEXS (Soft X-ray)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-solar-red" />
          <span className="font-mono text-text-secondary">HEL1OS (Hard X-ray)</span>
        </div>
        <div className="ml-auto text-[10px] text-text-muted font-mono">Logarithmic scale · W/m²</div>
      </div>
    </div>
  );
}