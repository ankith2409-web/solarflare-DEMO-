import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, LabelList } from 'recharts';
import { Info } from 'lucide-react';
import { useSolarStore } from '../../store/solarStore';
import { CLASS_HEX } from '../../utils/solarPhysics';
import { useState } from 'react';

export function ForecastChart() {
  const forecast = useSolarStore((s) => s.forecast);
  const [showInfo, setShowInfo] = useState(false);

  const data = forecast
    ? [
        { name: 'B', value: forecast.probB * 100, color: CLASS_HEX.B },
        { name: 'C', value: forecast.probC * 100, color: CLASS_HEX.C },
        { name: 'M', value: forecast.probM * 100, color: CLASS_HEX.M },
        { name: 'X', value: forecast.probX * 100, color: CLASS_HEX.X },
      ]
    : [
        { name: 'B', value: 65, color: CLASS_HEX.B },
        { name: 'C', value: 25, color: CLASS_HEX.C },
        { name: 'M', value: 8, color: CLASS_HEX.M },
        { name: 'X', value: 2, color: CLASS_HEX.X },
      ];

  const dominant = data.reduce((a, b) => (b.value > a.value ? b : a));

  const ciLow = forecast?.ciLow ?? new Date();
  const ciHigh = forecast?.ciHigh ?? new Date();
  const fmtT = (d: Date) =>
    `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')} UTC`;

  return (
    <div className="solar-card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display font-bold text-xl text-white">
              30-Minute Probability Forecast
            </h3>
            <button
              type="button"
              onClick={() => setShowInfo(!showInfo)}
              className="text-text-secondary hover:text-white"
              aria-label="Information about TSS calibration"
            >
              <Info className="w-4 h-4" aria-hidden />
            </button>
          </div>
          {showInfo && (
            <p className="text-xs text-text-secondary mt-2 max-w-2xl">
              <span className="text-solar-cyan font-mono">TSS (True Skill Statistic)</span> is the
              primary metric for space-weather forecasting. It is computed as{' '}
              <code className="font-mono text-white">TPR − FPR</code> where TPR is the true
              positive rate (recall) and FPR is the false positive rate. Unlike F1, TSS is not
              skewed by class imbalance, which is critical for rare M/X events.
            </p>
          )}
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider text-text-secondary font-mono">
            CONFIDENCE
          </div>
          <div className="font-mono font-bold text-white">
            {((forecast?.confidence ?? 0.78) * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 10, bottom: 0, left: 0 }}>
            <XAxis dataKey="name" tick={{ fill: '#7BA7C7', fontSize: 12, fontFamily: 'JetBrains Mono' }} stroke="#1A2845" />
            <YAxis
              tick={{ fill: '#7BA7C7', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              tickFormatter={(v) => `${v}%`}
              domain={[0, 100]}
              stroke="#1A2845"
            />
            <Tooltip
              cursor={{ fill: 'rgba(0, 212, 255, 0.05)' }}
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const p = payload[0].payload;
                return (
                  <div className="bg-space-deep/95 border border-space-border rounded px-2 py-1 font-mono text-xs">
                    <span className="font-bold" style={{ color: p.color }}>
                      Class {p.name}
                    </span>
                    : {p.value.toFixed(1)}%
                  </div>
                );
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={500}>
              {data.map((entry, idx) => (
                <Cell
                  key={idx}
                  fill={entry.color}
                  fillOpacity={dominant.name === entry.name ? 1 : 0.55}
                  stroke={dominant.name === entry.name ? entry.color : 'none'}
                  strokeWidth={dominant.name === entry.name ? 1.5 : 0}
                />
              ))}
              <LabelList
                dataKey="value"
                position="top"
                fill="#E8F4FD"
                fontSize={11}
                fontFamily="JetBrains Mono"
                formatter={(v: number) => `${v.toFixed(0)}%`}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* CI bar */}
      <div className="mt-4 pt-4 border-t border-space-border">
        <div className="flex items-center justify-between mb-2 text-[10px] font-mono text-text-secondary uppercase tracking-wider">
          <span>{fmtT(ciLow)}</span>
          <span className="text-solar-cyan">Predicted Peak Window</span>
          <span>{fmtT(ciHigh)}</span>
        </div>
        <div className="h-3 bg-space-mid rounded-full relative overflow-hidden">
          <div
            className="absolute inset-y-0 left-[35%] right-[35%] rounded-full"
            style={{
              background: `linear-gradient(90deg, ${dominant.color}60, ${dominant.color}, ${dominant.color}60)`,
              boxShadow: `0 0 12px ${dominant.color}80`,
            }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded"
            style={{ left: '50%', transform: 'translate(-50%, -50%)' }}
          />
        </div>
        <div className="text-center text-[10px] font-mono text-text-muted mt-1.5">
          ±4 min uncertainty · Updated every 10 s
        </div>
      </div>
    </div>
  );
}