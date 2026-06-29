import {
  ComposedChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { useMemo } from 'react';
import { useSolarStore } from '../../store/solarStore';
import {
  formatFluxSci,
  classifyFlux,
  CLASS_HEX,
} from '../../utils/solarPhysics';

type Channel = 'soLEXS' | 'hel1OS';

interface SingleChannelChartProps {
  channel: Channel;
}

const CHANNEL_INFO: Record<Channel, {
  color: string;
  label: string;
  subtitle: string;
  channelKey: 'soLEXS' | 'hel1OS';
}> = {
  soLEXS: {
    color: '#00D4FF',
    label: 'SoLEXS',
    subtitle: 'Solar Low Energy X-ray Spectrometer · 1–15 keV',
    channelKey: 'soLEXS',
  },
  hel1OS: {
    color: '#FF4560',
    label: 'HEL1OS',
    subtitle: 'High Energy L1 Orbiting X-ray Spectrometer · 10–150 keV',
    channelKey: 'hel1OS',
  },
};

export function SingleChannelChart({ channel }: SingleChannelChartProps) {
  const info = CHANNEL_INFO[channel];
  const fluxData = useSolarStore((s) => s.fluxData);
  const activeFlare = useSolarStore((s) => s.activeFlare);

  const { chartData, stats, currentClass, currentValue } = useMemo(() => {
    const data = fluxData.map((d) => ({
      timeMs: d.timestamp.getTime(),
      value: d[info.channelKey],
      valueLabel: formatFluxSci(d[info.channelKey]),
      inferredClass: d.inferredClass,
    }));

    const values = data.map((d) => d.value);
    const minVal = values.length ? Math.min(...values) : 0;
    const maxVal = values.length ? Math.max(...values) : 0;
    const meanVal = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;

    const latest = data[data.length - 1];
    const cls = latest ? classifyFlux(latest.value) : 'A';
    const cur = latest ? latest.value : 0;

    return {
      chartData: data,
      stats: { minVal, maxVal, meanVal },
      currentClass: cls,
      currentValue: cur,
    };
  }, [fluxData, info.channelKey]);

  const lastTs = chartData.length > 0 ? chartData[chartData.length - 1].timeMs : 0;

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: number }) => {
    if (!active || !payload || !payload.length) return null;
    const point = chartData.find((d) => d.timeMs === label);
    if (!point) return null;
    return (
      <div className="bg-space-deep/95 border border-space-border rounded-lg p-3 shadow-2xl backdrop-blur-sm">
        <div className="text-[10px] uppercase tracking-wider text-text-secondary mb-2 font-mono">
          {new Date(label!).toISOString().slice(11, 16)} UTC
        </div>
        <div className="space-y-1.5 font-mono text-xs">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: info.color }} />
              {info.label}
            </span>
            <span className="text-white">{formatFluxSci(point.value)} W/m²</span>
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
      <div className="h-[260px] flex items-center justify-center text-text-secondary text-sm">
        Loading {info.label} data…
      </div>
    );
  }

  return (
    <div className="solar-card" style={{ borderColor: `${info.color}40` }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3 gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: info.color, boxShadow: `0 0 8px ${info.color}` }}
              aria-hidden
            />
            <h3 className="font-display font-semibold text-white text-base">{info.label}</h3>
            <span
              className="text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider"
              style={{
                color: CLASS_HEX[currentClass],
                backgroundColor: `${CLASS_HEX[currentClass]}15`,
                borderColor: `${CLASS_HEX[currentClass]}60`,
              }}
            >
              {currentClass}
            </span>
          </div>
          <p className="text-[10px] text-text-secondary font-mono mt-1 leading-tight">
            {info.subtitle}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-[10px] uppercase tracking-wider text-text-secondary font-mono">
            Simulated Value
          </div>
          <div
            className="font-mono font-bold text-xl leading-tight"
            style={{ color: info.color }}
          >
            {formatFluxSci(currentValue)}
          </div>
          <div className="text-[9px] text-text-muted font-mono">W/m²</div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 35, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 6" stroke="#1A2845" vertical={false} />
            <XAxis
              dataKey="timeMs"
              type="number"
              domain={['dataMin', 'dataMax']}
              tick={{ fill: '#7BA7C7', fontSize: 9, fontFamily: 'JetBrains Mono' }}
              tickFormatter={(t) => {
                const d = new Date(t);
                return `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}`;
              }}
              interval={49}
              stroke="#1A2845"
            />
            <YAxis
              type="number"
              scale="log"
              domain={[1e-9, 1e-3]}
              tick={{ fill: '#7BA7C7', fontSize: 9, fontFamily: 'JetBrains Mono' }}
              tickFormatter={(v) => formatFluxSci(v).replace('×10', 'e')}
              ticks={[1e-9, 1e-8, 1e-7, 1e-6, 1e-5, 1e-4, 1e-3]}
              stroke="#1A2845"
            />

            <Tooltip content={<CustomTooltip />} />

            {/* GOES class threshold lines */}
            <ReferenceLine
              y={1e-5}
              stroke="#FFB300"
              strokeDasharray="3 3"
              strokeWidth={0.8}
              label={{ value: 'M', position: 'right', fill: '#FFB300', fontSize: 9, fontFamily: 'JetBrains Mono' }}
            />
            <ReferenceLine
              y={1e-4}
              stroke="#FF6B00"
              strokeDasharray="3 3"
              strokeWidth={0.8}
              label={{ value: 'X', position: 'right', fill: '#FF6B00', fontSize: 9, fontFamily: 'JetBrains Mono' }}
            />
            <ReferenceLine
              y={1e-6}
              stroke="#FFC107"
              strokeDasharray="2 3"
              strokeWidth={0.5}
              label={{ value: 'C', position: 'right', fill: '#FFC107', fontSize: 8, fontFamily: 'JetBrains Mono' }}
            />
            <ReferenceLine
              y={1e-7}
              stroke="#00E676"
              strokeDasharray="2 3"
              strokeWidth={0.5}
              label={{ value: 'B', position: 'right', fill: '#00E676', fontSize: 8, fontFamily: 'JetBrains Mono' }}
            />

            <Line
              type="monotone"
              dataKey="value"
              stroke={info.color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              name={info.label}
            />

            {activeFlare && (
              <ReferenceLine
                x={activeFlare.detectedAt.getTime()}
                stroke="#FF6B00"
                strokeDasharray="2 4"
                strokeWidth={1}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Stats footer */}
      <div className="mt-3 pt-3 border-t border-space-border grid grid-cols-3 gap-2 text-[10px] font-mono">
        <StatBlock label="Min" value={formatFluxSci(stats.minVal)} sub="4h window" color={info.color} />
        <StatBlock label="Mean" value={formatFluxSci(stats.meanVal)} sub="4h window" color={info.color} />
        <StatBlock label="Max" value={formatFluxSci(stats.maxVal)} sub="4h window" color={info.color} />
      </div>
    </div>
  );
}

function StatBlock({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-text-muted uppercase tracking-wider">{label}</span>
      <span className="text-white font-bold text-xs" style={{ color }}>
        {value}
      </span>
      <span className="text-text-muted text-[9px]">{sub}</span>
    </div>
  );
}