import { Satellite, Plane, Compass, Zap, Activity } from 'lucide-react';

const IMPACTS = [
  {
    icon: Satellite,
    title: 'Satellite Operations',
    severity: 'At Risk during X-class events',
    color: 'orange',
    status: 'MONITORING',
    statusColor: 'isro-amber',
    body: 'Surface charging, orbital drag, instrument damage to LEO satellites including RESOURCESAT, CARTOSAT, and communication assets.',
  },
  {
    icon: Plane,
    title: 'Aviation & HF Communications',
    severity: 'Radio Blackouts during M/X events',
    color: 'amber',
    status: 'LOW RISK',
    statusColor: 'success-green',
    body: 'Polar route disruptions, HF communication degradation for 30-90 minutes. ISRO’s 30-min warning enables rerouting decisions.',
  },
  {
    icon: Compass,
    title: 'GPS & Navigation',
    severity: 'Ionospheric Scintillation',
    color: 'cyan',
    status: 'NOMINAL',
    statusColor: 'solar-cyan',
    body: 'X-ray induced ionospheric changes degrade GPS positioning accuracy by 10-50 m during strong events.',
  },
  {
    icon: Zap,
    title: 'Power Grid Resilience',
    severity: 'GIC Risk for Strong Events',
    color: 'green',
    status: 'SAFE',
    statusColor: 'success-green',
    body: 'Geomagnetically induced currents in transmission lines. X-class events can cause transformer damage.',
  },
];

const COLOR_MAP: Record<string, string> = {
  orange: 'border-isro-orange/30 hover:border-isro-orange/60',
  amber: 'border-isro-amber/30 hover:border-isro-amber/60',
  cyan: 'border-solar-cyan/30 hover:border-solar-cyan/60',
  green: 'border-success-green/30 hover:border-success-green/60',
};

const ICON_BG: Record<string, string> = {
  orange: 'bg-isro-orange/15 text-isro-orange',
  amber: 'bg-isro-amber/15 text-isro-amber',
  cyan: 'bg-solar-cyan/15 text-solar-cyan',
  green: 'bg-success-green/15 text-success-green',
};

const STATUS_BG: Record<string, string> = {
  'isro-amber': 'bg-isro-amber/20 text-isro-amber border-isro-amber/40',
  'success-green': 'bg-success-green/20 text-success-green border-success-green/40',
  'solar-cyan': 'bg-solar-cyan/20 text-solar-cyan border-solar-cyan/40',
};

export function SpaceWeatherImpact() {
  return (
    <div>
      <div className="flex items-end justify-between mb-6 flex-wrap gap-2">
        <div>
          <h2 className="font-display font-bold text-2xl text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-isro-orange" aria-hidden />
            Why This Matters — Space Weather Impact
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Downstream effects of solar activity monitored by this system
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {IMPACTS.map((impact) => {
          const Icon = impact.icon;
          return (
            <div
              key={impact.title}
              className={`solar-card transition-colors ${COLOR_MAP[impact.color]}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${ICON_BG[impact.color]}`}>
                  <Icon className="w-5 h-5" aria-hidden />
                </div>
                <span
                  className={`text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded border ${
                    STATUS_BG[impact.statusColor]
                  }`}
                >
                  {impact.status}
                </span>
              </div>
              <h3 className="font-display font-semibold text-white mb-1">{impact.title}</h3>
              <p className="text-[10px] font-mono uppercase tracking-wider text-text-secondary mb-3">
                {impact.severity}
              </p>
              <p className="text-xs text-text-secondary leading-relaxed">{impact.body}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}