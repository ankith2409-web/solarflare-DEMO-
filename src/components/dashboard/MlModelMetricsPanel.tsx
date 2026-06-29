import { Brain, Cpu, TrendingUp, BarChart2 } from 'lucide-react';
import { useSolarStore } from '../../store/solarStore';

export function MlModelMetricsPanel() {
  const metrics = useSolarStore((s) => s.metrics);
  const forecast = useSolarStore((s) => s.forecast);

  // Model features and their respective predictive weightings
  const features = [
    { name: 'HEL1OS/SoLEXS Flux Ratio (Precursor)', weight: 42, color: '#A78BFA' },
    { name: 'First Derivative dF/dt (Rise Cadence)', weight: 28, color: '#F59E0B' },
    { name: 'Rolling Signal Variance (15-min Std Dev)', weight: 18, color: '#34D399' },
    { name: 'Absolute soft X-ray baseline flux', weight: 12, color: '#38BDF8' },
  ];

  const classes = ['B', 'C', 'M', 'X'];

  // Helper to calculate cell color intensity in the confusion matrix heatmap
  const getMatrixCellBg = (val: number, actualIndex: number, predIndex: number) => {
    if (actualIndex === predIndex) {
      // Correct predictions (diagonal) — green hues
      if (val > 200) return 'rgba(52, 211, 153, 0.25)';
      if (val > 100) return 'rgba(52, 211, 153, 0.18)';
      return 'rgba(52, 211, 153, 0.10)';
    } else {
      // False alarms or missed detections — red/amber hues
      if (val > 25) return 'rgba(239, 68, 68, 0.25)';
      if (val > 10) return 'rgba(245, 158, 11, 0.15)';
      if (val > 0) return 'rgba(245, 158, 11, 0.06)';
      return 'transparent';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" id="pipeline">
      {/* Col 1: Model Diagnostics & Live Confidence */}
      <div className="solar-card border-l-4 border-l-solar-cyan flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="w-5 h-5 text-solar-cyan glow-cyan" />
            <h4 className="font-display font-semibold text-white text-sm">LSTM Forecaster Diagnostics</h4>
          </div>
          
          <div className="space-y-4 font-mono">
            <div className="flex justify-between border-b border-space-border/40 pb-2">
              <span className="text-xs text-text-secondary">True Skill Statistic (TSS)</span>
              <span className="text-sm font-bold text-solar-cyan">{(metrics.tss * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between border-b border-space-border/40 pb-2">
              <span className="text-xs text-text-secondary">Heidke Skill Score (HSS)</span>
              <span className="text-sm font-bold text-solar-cyan">{(metrics.hss * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between border-b border-space-border/40 pb-2">
              <span className="text-xs text-text-secondary">Predictions (Last 24h)</span>
              <span className="text-sm font-bold text-white">{metrics.totalPredictions24h}</span>
            </div>
            <div className="flex justify-between pb-1">
              <span className="text-xs text-text-secondary">Prediction Latency</span>
              <span className="text-sm font-bold text-success-green">&lt; 350ms</span>
            </div>
          </div>
        </div>

        {/* Live confidence bar */}
        <div className="mt-6 border-t border-space-border/40 pt-4">
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-xs text-text-secondary uppercase tracking-wider">Live Model Confidence</span>
            <span className="text-sm font-bold text-white font-mono">
              {( (forecast?.confidence ?? 0.82) * 100 ).toFixed(0)}%
            </span>
          </div>
          <div className="h-2 bg-space-black border border-space-border/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-solar-cyan to-[#A78BFA] transition-all duration-1000"
              style={{ width: `${((forecast?.confidence ?? 0.82) * 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-text-muted mt-2 leading-relaxed">
            Confidence interval based on real-time signal-to-noise ratio (SNR) across SoLEXS hard X-ray bands.
          </p>
        </div>
      </div>

      {/* Col 2: Feature Importance */}
      <div className="solar-card border-l-4 border-l-[#A78BFA]">
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 className="w-5 h-5 text-[#A78BFA] glow-violet" />
          <h4 className="font-display font-semibold text-white text-sm">Predictive Feature Weights</h4>
        </div>
        
        <div className="space-y-4">
          {features.map((f, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-text-secondary truncate pr-2">{f.name}</span>
                <span className="text-white font-bold">{f.weight}%</span>
              </div>
              <div className="h-1.5 bg-space-black rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full"
                  style={{ width: `${f.weight}%`, backgroundColor: f.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Col 3: Confusion Matrix / Heatmap */}
      <div className="solar-card border-l-4 border-l-[#F59E0B]">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-5 h-5 text-isro-orange glow-orange" />
          <h4 className="font-display font-semibold text-white text-sm">Validation Confusion Matrix</h4>
        </div>

        {/* Matrix grid */}
        <div className="space-y-2">
          <div className="grid grid-cols-5 text-center text-[10px] font-mono text-text-muted">
            <span></span>
            <span>Pred B</span>
            <span>Pred C</span>
            <span>Pred M</span>
            <span>Pred X</span>
          </div>

          {metrics.confusionMatrix.map((row, i) => (
            <div key={i} className="grid grid-cols-5 items-center text-center">
              <span className="text-[10px] font-mono text-text-muted font-bold text-left pl-1">
                Act {classes[i]}
              </span>
              {row.map((val, j) => (
                <div
                  key={j}
                  className="py-2.5 mx-0.5 rounded border border-space-border/20 font-mono text-xs text-white"
                  style={{
                    backgroundColor: getMatrixCellBg(val, i, j),
                    borderColor: i === j ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255,255,255,0.02)',
                  }}
                  title={`Actual ${classes[i]} predicted as ${classes[j]}: ${val} times`}
                >
                  {val}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3 text-[9px] font-mono text-text-muted">
          <span className="inline-block w-2.5 h-2.5 bg-success-green/20 border border-success-green/35 rounded-sm" />
          <span>Diagonal = Correct Predictions</span>
          <span className="inline-block w-2.5 h-2.5 bg-red-500/20 border border-red-500/35 rounded-sm ml-2" />
          <span>Off-diagonal = Error Cases</span>
        </div>
      </div>
    </div>
  );
}
