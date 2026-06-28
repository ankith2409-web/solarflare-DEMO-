import { useState } from 'react';
import {
  Satellite,
  FileText,
  Loader,
  Cpu,
  Layers,
  Database,
  Activity,
  GitBranch,
  Brain,
  TrendingUp,
  Bell,
  Monitor,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface NodeSpec {
  id: string;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  tech: string[];
}

const NODES: Record<string, NodeSpec> = {
  solexs: { id: 'solexs', label: 'SoLEXS FITS', subtitle: 'Soft X-ray, 1-15 keV', icon: Satellite, tech: ['ISRO SoLEXS', 'FITS format', '1-min cadence'] },
  hel1os: { id: 'hel1os', label: 'HEL1OS FITS', subtitle: 'Hard X-ray, 10-150 keV', icon: Satellite, tech: ['ISRO HEL1OS', 'FITS format', '1-min cadence'] },
  astropy: { id: 'astropy', label: 'Astropy Loader', subtitle: 'FITS → NumPy', icon: FileText, tech: ['Astropy.io.fits', 'Calibration DB', 'Quality flags'] },
  preprocess: { id: 'preprocess', label: 'Preprocessing', subtitle: '1-min resample, gap impute, z-score', icon: Loader, tech: ['Pandas', 'scikit-learn', 'Linear interp'] },
  features: { id: 'features', label: 'Feature Extractor', subtitle: 'H/S ratio, dF/dt, rolling stats', icon: Layers, tech: ['NumPy', 'Custom kernels', '60-min lookback'] },
  torch: { id: 'torch', label: 'PyTorch Dataset', subtitle: 'Tensor (B, T, F)', icon: Database, tech: ['torch.utils.data', '60-min lookback', 'Float32'] },
  tcn: { id: 'tcn', label: 'TCN Nowcaster', subtitle: 'Real-time binary P(flare)', icon: Brain, tech: ['PyTorch', 'Dilated conv', 'Causal conv'] },
  tft: { id: 'tft', label: 'TFT Forecaster', subtitle: '30-min multiclass P(B/C/M/X)', icon: TrendingUp, tech: ['PyTorch Forecasting', 'Multi-head attention', 'Quantile loss'] },
  ensemble: { id: 'ensemble', label: 'Ensemble Combiner', subtitle: 'Confidence-weighted, TSS-calibrated', icon: GitBranch, tech: ['Logistic stacker', 'TSS threshold', 'Focal loss'] },
  alert: { id: 'alert', label: 'Alert Generator', subtitle: 'Class + confidence + time-to-peak', icon: Bell, tech: ['PostgreSQL', 'Resend email', 'SMS gateway'] },
  dashboard: { id: 'dashboard', label: 'Web Dashboard', subtitle: 'This interface', icon: Monitor, tech: ['React 19', 'Vite', 'Recharts + R3F'] },
};

const FLOW_LAYOUT: { x: number; y: number }[] = [
  { x: 60, y: 80 }, { x: 60, y: 200 },
  { x: 220, y: 140 },
  { x: 380, y: 140 },
  { x: 540, y: 140 },
  { x: 700, y: 140 },
  { x: 860, y: 70 }, { x: 860, y: 210 },
  { x: 1020, y: 140 },
  { x: 1180, y: 140 },
  { x: 1340, y: 140 },
];

const CONNECTIONS: [string, string][] = [
  ['solexs', 'astropy'],
  ['hel1os', 'astropy'],
  ['astropy', 'preprocess'],
  ['preprocess', 'features'],
  ['features', 'torch'],
  ['torch', 'tcn'],
  ['torch', 'tft'],
  ['tcn', 'ensemble'],
  ['tft', 'ensemble'],
  ['ensemble', 'alert'],
  ['alert', 'dashboard'],
];

export function PipelineDiagram() {
  const [hovered, setHovered] = useState<string | null>(null);

  const layoutMap: Record<string, { x: number; y: number }> = {
    solexs: FLOW_LAYOUT[0], hel1os: FLOW_LAYOUT[1],
    astropy: FLOW_LAYOUT[2], preprocess: FLOW_LAYOUT[3],
    features: FLOW_LAYOUT[4], torch: FLOW_LAYOUT[5],
    tcn: FLOW_LAYOUT[6], tft: FLOW_LAYOUT[7],
    ensemble: FLOW_LAYOUT[8], alert: FLOW_LAYOUT[9],
    dashboard: FLOW_LAYOUT[10],
  };

  return (
    <div className="solar-card overflow-x-auto">
      <div className="mb-4">
        <h3 className="font-display font-bold text-xl text-white">System Architecture</h3>
        <p className="text-xs text-text-secondary mt-1">
          Click any node to view the technology stack used at that stage
        </p>
      </div>

      <div className="relative" style={{ minWidth: 1400, height: 290 }}>
        <svg
          className="absolute inset-0 pointer-events-none"
          width="100%"
          height="100%"
          viewBox="0 0 1400 290"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#00D4FF" />
            </marker>
          </defs>
          {CONNECTIONS.map(([from, to]) => {
            const a = layoutMap[from];
            const b = layoutMap[to];
            return (
              <line
                key={`${from}-${to}`}
                x1={a.x + 80}
                y1={a.y + 20}
                x2={b.x}
                y2={b.y + 20}
                stroke="#00D4FF"
                strokeWidth={1.5}
                strokeDasharray="5 5"
                className="flow-line"
                markerEnd="url(#arrow)"
                opacity={hovered === from || hovered === to ? 0.9 : 0.4}
              />
            );
          })}
        </svg>

        {Object.values(NODES).map((node, i) => {
          const pos = FLOW_LAYOUT[i];
          const Icon = node.icon;
          const isActive = hovered === node.id;
          const isAlert = node.id === 'dashboard' || node.id === 'alert';
          return (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              onMouseEnter={() => setHovered(node.id)}
              onMouseLeave={() => setHovered(null)}
              className={`absolute cursor-pointer rounded-lg p-2 w-[80px] text-center transition-all ${
                isAlert ? 'bg-gradient-to-br from-isro-orange/20 to-isro-amber/10 border-isro-orange/40' : 'bg-space-mid border-space-border hover:border-solar-cyan/60'
              } border ${isActive ? 'glow-cyan' : ''}`}
              style={{ left: pos.x, top: pos.y, height: 80 }}
            >
              <div className={`w-7 h-7 mx-auto rounded-md flex items-center justify-center mb-1 ${
                isAlert ? 'bg-isro-orange/20' : 'bg-solar-cyan/10'
              }`}>
                <Icon className={`w-3.5 h-3.5 ${isAlert ? 'text-isro-orange' : 'text-solar-cyan'}`} aria-hidden />
              </div>
              <div className="text-[10px] font-mono font-bold text-white leading-tight">
                {node.label}
              </div>
            </motion.div>
          );
        })}

        {/* Tooltip */}
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute z-10 bg-space-deep/95 border border-solar-cyan/40 rounded-lg p-3 backdrop-blur-sm shadow-2xl"
            style={{
              left: Math.min(layoutMap[hovered].x + 100, 1200),
              top: Math.max(0, layoutMap[hovered].y - 10),
              maxWidth: 240,
            }}
          >
            <div className="text-xs font-display font-bold text-solar-cyan mb-1">
              {NODES[hovered].label}
            </div>
            <div className="text-[11px] text-text-secondary mb-2">
              {NODES[hovered].subtitle}
            </div>
            <div className="flex flex-wrap gap-1">
              {NODES[hovered].tech.map((t) => (
                <span key={t} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-space-mid text-text-primary">
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}