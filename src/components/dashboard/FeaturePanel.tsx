import { LineChart, Line, AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';
import { useSolarStore } from '../../store/solarStore';
import { PRE_FLARE_HS_RATIO, CLASS_HEX } from '../../utils/solarPhysics';
import { PeakRiseRateChart } from './PeakRiseRateChart';

export function FeaturePanel() {
  const fluxData = useSolarStore((s) => s.fluxData);

  if (fluxData.length === 0) {
    return (
      <div className="text-text-secondary text-sm text-center py-12">Loading features…</div>
    );
  }

  // H/S ratio last 2 hours (120 points)
  const hsData = fluxData.slice(-120).map((d) => ({
    t: d.timestamp.getTime(),
    ratio: parseFloat(d.hsRatio.toFixed(4)),
  }));

  // dF/dt
  const dfdtData = fluxData.slice(-120).map((d) => ({
    t: d.timestamp.getTime(),
    rate: parseFloat(d.dFdt.toExponential(2)),
  }));

  // Rolling std
  const stdData = fluxData.slice(-120).map((d) => ({
    t: d.timestamp.getTime(),
    std: parseFloat(d.rollingStd15.toExponential(2)),
  }));

  return (
    <div className="space-y-4">
      {/* Top row: 3 standard feature charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FeatureCard
          title="H/S Flux Ratio"
          caption="HEL1OS/SoLEXS ratio — spikes 8-15 min before M/X flares"
          color="#A78BFA"
          data={hsData}
          dataKey="ratio"
          scale="log"
          threshold={PRE_FLARE_HS_RATIO}
          thresholdLabel="Pre-flare threshold = 0.15"
        />

        <FeatureCard
          title="First Derivative dF/dt"
          caption="Flux rise rate — key pre-flare indicator"
          color="#F59E0B"
          data={dfdtData}
          dataKey="rate"
          scale="linear"
          isArea
          threshold={0}
          thresholdLabel="zero crossing"
        />

        <FeatureCard
          title="Rolling Std (15-min)"
          caption="Signal variance — elevated before energetic events"
          color="#34D399"
          data={stdData}
          dataKey="std"
          scale="log"
          valueFormatter={(v) => v.toExponential(2)}
        />
      </div>

      {/* Bottom row: dedicated bullet/gauge chart for Peak Rise Rate */}
      <PeakRiseRateChart />
    </div>
  );
}

interface FeatureCardProps {
  title: string;
  caption: string;
  color: string;
  data: any[];
  dataKey: string;
  scale: 'linear' | 'log';
  threshold?: number;
  thresholdLabel?: string;
  isArea?: boolean;
  valueFormatter?: (value: number) => string;
}

function FeatureCard({
  title,
  caption,
  color,
  data,
  dataKey,
  scale,
  threshold,
  thresholdLabel,
  isArea,
  valueFormatter,
}: FeatureCardProps) {
  return (
    <div className="solar-card" style={{ borderColor: `${color}30` }}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-display font-semibold text-white text-sm">{title}</h4>
        <span
          className="w-2 h-2 rounded-full"
          style={{ background: color, boxShadow: `0 0 6px ${color}` }}
        />
      </div>
      <div className="h-[120px] -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          {isArea ? (
            <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.6} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="t" hide />
              <YAxis hide scale={scale} domain={['auto', 'auto']} />
              {threshold !== undefined && (
                <ReferenceLine
                  y={threshold}
                  stroke={color}
                  strokeDasharray="2 2"
                  strokeOpacity={0.6}
                />
              )}
              <Tooltip
                cursor={{ stroke: color, strokeWidth: 1 }}
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const val = Number(payload[0].value);
                  return (
                    <div className="bg-space-deep/95 border border-space-border rounded px-2 py-1 font-mono text-xs">
                      {valueFormatter ? valueFormatter(val) : val.toExponential(2)}
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={1.5}
                fill={`url(#grad-${title})`}
                isAnimationActive={false}
              />
            </AreaChart>
          ) : (
            <LineChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <XAxis dataKey="t" hide />
              <YAxis hide scale={scale} domain={['auto', 'auto']} />
              {threshold !== undefined && (
                <ReferenceLine
                  y={threshold}
                  stroke={color}
                  strokeDasharray="2 2"
                  strokeOpacity={0.6}
                />
              )}
              <Tooltip
                cursor={{ stroke: color, strokeWidth: 1 }}
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const val = Number(payload[0].value);
                  return (
                    <div className="bg-space-deep/95 border border-space-border rounded px-2 py-1 font-mono text-xs">
                      {valueFormatter ? valueFormatter(val) : val.toFixed(4)}
                    </div>
                  );
                }}
              />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
      {thresholdLabel && (
        <div className="text-[10px] font-mono text-text-muted mb-1">
          — — {thresholdLabel}
        </div>
      )}
      <p className="text-[10px] text-text-secondary leading-relaxed">{caption}</p>
    </div>
  );
}