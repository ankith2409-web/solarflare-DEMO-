import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { useSolarStore } from '../../store/solarStore';
import { MetricCard } from '../ui/MetricCard';
import { Info } from 'lucide-react';
import { useState } from 'react';

const CLASS_LABELS = ['B', 'C', 'M', 'X'] as const;

export function ModelMetrics() {
  const metrics = useSolarStore((s) => s.metrics);
  const [showInfo, setShowInfo] = useState(false);

  // Confusion matrix display
  const matrix = metrics.confusionMatrix;
  const maxVal = Math.max(...matrix.flat());

  // Precision/Recall data
  const prData = CLASS_LABELS.map((c, i) => ({
    name: c,
    precision: metrics.precisionPerClass[i] * 100,
    recall: metrics.recallPerClass[i] * 100,
  }));

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="font-display font-bold text-2xl text-white">Model Performance Metrics</h2>
          <button
            type="button"
            onClick={() => setShowInfo(!showInfo)}
            className="text-text-secondary hover:text-white"
            aria-label="Information about evaluation methodology"
          >
            <Info className="w-4 h-4" aria-hidden />
          </button>
        </div>
        <p className="text-sm text-text-secondary">
          Evaluated on GOES XRS validation set — 6-month holdout · {metrics.totalPredictions24h.toLocaleString()} predictions in last 24 h
        </p>
        {showInfo && (
          <p className="text-xs text-text-secondary mt-2 max-w-3xl leading-relaxed border-l-2 border-solar-cyan/40 pl-3">
            The <span className="text-solar-cyan font-mono">True Skill Statistic (TSS)</span> is
            the standard metric for solar flare forecasting because it is unbiased by class
            imbalance. <span className="text-success-green font-mono">HSS</span> is a related
            score that accounts for correct random hits. Both exceed problem-statement targets
            (TSS&gt;0.65, HSS&gt;0.50).
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          label="TSS"
          value={metrics.tss}
          change={{ delta: metrics.tssChange, label: 'vs last cycle' }}
          accent="cyan"
          tooltip="True Skill Statistic = TPR − FPR. Unbiased by class imbalance. Target > 0.65."
        />
        <MetricCard
          label="HSS"
          value={metrics.hss}
          change={{ delta: metrics.hssChange, label: 'vs last cycle' }}
          accent="green"
          tooltip="Heidke Skill Score — accounts for correct random predictions. Target > 0.50."
        />
        <MetricCard
          label="Total Predictions (24h)"
          value={metrics.totalPredictions24h}
          accent="orange"
          tooltip="Number of model predictions issued in the last 24 hours"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Confusion Matrix */}
        <div className="solar-card">
          <h3 className="font-display font-semibold text-white mb-4">Confusion Matrix (All Classes)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr>
                  <th className="p-2 text-text-secondary text-right">Actual ↓ / Predicted →</th>
                  {CLASS_LABELS.map((c) => (
                    <th key={c} className="p-2 text-text-secondary text-center">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CLASS_LABELS.map((actual, i) => (
                  <tr key={actual}>
                    <td className="p-2 text-text-secondary text-right font-bold">{actual}</td>
                    {CLASS_LABELS.map((predicted, j) => {
                      const v = matrix[i][j];
                      const isDiagonal = i === j;
                      const intensity = v / maxVal;
                      const bg = isDiagonal
                        ? `rgba(0, 230, 118, ${0.15 + intensity * 0.6})`
                        : `rgba(255, 69, 96, ${0.05 + (1 - intensity) * 0.15})`;
                      return (
                        <td
                          key={predicted}
                          className="p-2 text-center border border-space-border/30"
                          style={{ background: bg, color: isDiagonal ? '#00E676' : '#FF4560' }}
                        >
                          {v}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-4 mt-4 text-[10px] font-mono text-text-secondary">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded" style={{ background: 'rgba(0, 230, 118, 0.5)' }} />
              Diagonal = correct
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded" style={{ background: 'rgba(255, 69, 96, 0.3)' }} />
              Off-diagonal = misclassification
            </div>
          </div>
        </div>

        {/* Precision / Recall */}
        <div className="solar-card">
          <h3 className="font-display font-semibold text-white mb-4">Precision / Recall per Class</h3>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={prData} margin={{ top: 10, right: 5, bottom: 0, left: 0 }}>
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
                    return (
                      <div className="bg-space-deep/95 border border-space-border rounded px-2 py-1 font-mono text-xs">
                        {payload.map((p: any) => (
                          <div key={p.dataKey} style={{ color: p.color }}>
                            {p.name}: {p.value.toFixed(0)}%
                          </div>
                        ))}
                      </div>
                    );
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                <Bar dataKey="precision" fill="#00D4FF" radius={[2, 2, 0, 0]} />
                <Bar dataKey="recall" fill="#00E676" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}