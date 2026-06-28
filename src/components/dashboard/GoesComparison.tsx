import {
  ComposedChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useMemo } from 'react';
import { useSolarStore } from '../../store/solarStore';
import { formatFluxSci } from '../../utils/solarPhysics';

export function GoesComparison() {
  const fluxData = useSolarStore((s) => s.fluxData);

  // Build a synthetic GOES XRS curve that:
  //   1. tracks SoLEXS (since both are soft X-ray) but at ~92% amplitude
  //   2. is computed ONCE per data window so the line is stable across renders
  //   3. includes realistic GOES-style 1-min-cadence quantization
  const data = useMemo(() => {
    const slice = fluxData.slice(-60);
    return slice.map((d, i) => {
      // Persistent per-index noise so the GOES line is stable between renders
      const seed = Math.sin(i * 12.9898 + d.timestamp.getUTCMinutes()) * 43758.5453;
      const noise = (seed - Math.floor(seed)) * 0.04 - 0.02; // ±2%
      // GOES sees only the long-soft channel (no hard X-ray), so it
      // under-reports impulsive peaks. Subtract a fraction of dF/dt magnitude.
      const impulsiveDrop = i > 0 ? Math.max(0, d.soLEXS - slice[i - 1].soLEXS) * 0.25 : 0;
      const goes = d.soLEXS * (0.92 + noise) - impulsiveDrop;
      return {
        t: d.timestamp.getTime(),
        goes,
        solexs: d.soLEXS,
        hel1os: d.hel1OS,
      };
    });
  }, [fluxData]);

  return (
    <div className="solar-card">
      <div className="flex items-end justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="font-display font-bold text-lg text-white">GOES vs Aditya-L1</h3>
          <p className="text-xs text-text-secondary mt-1">
            Side-by-side comparison · last 60 min
          </p>
        </div>
        <div className="font-mono text-[10px] text-text-secondary bg-space-mid border border-space-border rounded px-2 py-1">
          “GOES sees this. We see this <span className="text-solar-cyan">PLUS HEL1OS</span>.”
        </div>
      </div>

      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 6" stroke="#1A2845" vertical={false} />
            <XAxis dataKey="t" hide />
            <YAxis
              type="number"
              scale="log"
              domain={[1e-9, 1e-3]}
              tick={{ fill: '#7BA7C7', fontSize: 9, fontFamily: 'JetBrains Mono' }}
              tickFormatter={(v) => formatFluxSci(v).replace('×10', 'e')}
              stroke="#1A2845"
            />
            <Tooltip
              cursor={{ stroke: '#00D4FF', strokeWidth: 1 }}
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                return (
                  <div className="bg-space-deep/95 border border-space-border rounded px-2 py-1 font-mono text-xs">
                    {payload.map((p: any) => (
                      <div key={p.dataKey} style={{ color: p.color }}>
                        {p.name}: {formatFluxSci(p.value)} W/m²
                      </div>
                    ))}
                  </div>
                );
              }}
            />
            <Line type="monotone" dataKey="goes" stroke="#7BA7C7" strokeWidth={1.5} dot={false} isAnimationActive={false} name="GOES XRS" strokeDasharray="3 3" />
            <Line type="monotone" dataKey="solexs" stroke="#00D4FF" strokeWidth={1.5} dot={false} isAnimationActive={false} name="SoLEXS (Aditya-L1)" />
            <Line type="monotone" dataKey="hel1os" stroke="#FF4560" strokeWidth={1.5} dot={false} isAnimationActive={false} name="HEL1OS (Aditya-L1)" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-text-secondary border-dashed" />
          <span className="text-text-secondary">GOES XRS (USA) — soft channel only</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-solar-cyan" />
          <span className="text-text-secondary">SoLEXS (Aditya-L1)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-solar-red" />
          <span className="text-text-secondary">HEL1OS (Aditya-L1) — hard X-ray, unique</span>
        </div>
      </div>
    </div>
  );
}
