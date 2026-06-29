import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Clock, Zap } from 'lucide-react';
import { AnimatedSun } from './AnimatedSun';
import { LiveBadge } from '../ui/LiveBadge';
import { useSolarStore } from '../../store/solarStore';
import { formatFluxSci } from '../../utils/solarPhysics';

export function HeroSection() {
  const currentFlux = useSolarStore((s) => s.currentFlux);
  const activeFlare = useSolarStore((s) => s.activeFlare);
  const lastUpdated = useSolarStore((s) => s.lastUpdated);
  const alertHistory = useSolarStore((s) => s.alertHistory);
  const soLEXSLive = formatFluxSci(currentFlux?.soLEXS ?? 2.34e-6);
  const hel1OSLive = formatFluxSci(currentFlux?.hel1OS ?? 1.12e-7);

  // LAST FLARE — show the active flare, otherwise the most recent entry from history
  let lastFlareLabel: string;
  if (activeFlare) {
    lastFlareLabel = `${activeFlare.predictedClass}${activeFlare.predictedMagnitude.toFixed(1)} @ ${lastUpdated.getUTCHours().toString().padStart(2, '0')}:${lastUpdated.getUTCMinutes().toString().padStart(2, '0')} UTC`;
  } else if (alertHistory.length > 0) {
    const last = alertHistory[alertHistory.length - 1];
    const hh = last.detectedAt.getUTCHours().toString().padStart(2, '0');
    const mm = last.detectedAt.getUTCMinutes().toString().padStart(2, '0');
    lastFlareLabel = `${last.predictedClass}${last.predictedMagnitude.toFixed(1)} @ ${hh}:${mm} UTC`;
  } else {
    lastFlareLabel = 'No events in last 24h';
  }

  const tickerItems = [
    { icon: '●', label: 'SoLEXS (Simulated)', value: soLEXSLive, unit: 'W/m²', color: 'text-solar-cyan' },
    { icon: '●', label: 'HEL1OS (Simulated)', value: hel1OSLive, unit: 'W/m²', color: 'text-solar-red' },
    { icon: '●', label: 'STATUS', value: 'MONITORING', color: 'text-success-green' },
    { icon: '●', label: 'LAST FLARE', value: lastFlareLabel, color: 'text-isro-amber' },
    { icon: '●', label: 'NEXT PREDICTION', value: '30 MIN', color: 'text-solar-cyan' },
  ];

  return (
    <section id="top" className="relative min-h-screen flex flex-col pt-24 pb-0 overflow-hidden">
      <div className="starfield" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 grid lg:grid-cols-12 gap-10 items-center flex-1">
        {/* Left: text content */}
        <motion.div
          className="lg:col-span-7"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <LiveBadge label="ADITYA-L1 MISSION • SIMULATED" />
            <span className="text-xs font-mono text-text-secondary uppercase tracking-wider">
              ISRO BAH 2026
            </span>
          </div>

          <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-white leading-[1.05] mb-5">
            <span className="text-gradient-accent">Solar Flare Warning System</span>
          </h1>

          <p className="text-lg text-text-secondary max-w-2xl leading-relaxed mb-8">
            Real-time M/X-class flare forecasting powered by <span className="text-solar-cyan">SoLEXS</span> +  
            <span className="text-solar-red">HEL1OS</span> dual-channel X-ray analysis. 30-minute advance warnings.
            TSS-calibrated.
          </p>

          <div className="flex flex-wrap gap-3 mb-10">
            <Pill label="TSS" value="0.76 ↑" color="cyan" />
            <Pill label="30-min Horizon" value="30 min" color="orange" />
            <Pill label="Latency" value="< 60s" color="green" />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href="#dashboard"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-isro-orange text-space-black font-bold hover:bg-isro-amber hover:glow-orange transition-all"
            >
              View Simulated Dashboard
              <ArrowRight className="w-4 h-4" aria-hidden />
            </a>
            <a
              href="#pipeline"
              className="inline-flex items-center gap-2 text-text-secondary hover:text-white font-medium transition"
            >
              <Sparkles className="w-4 h-4" aria-hidden />
              See How It Works
            </a>
          </div>
        </motion.div>

        {/* Right: 3D sun */}
        <motion.div
          className="lg:col-span-5 hidden lg:block"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <AnimatedSun />
        </motion.div>
      </div>

      {/* Bottom ticker */}
      <div className="relative z-10 mt-12 border-t border-b border-space-border bg-space-deep/80 backdrop-blur-sm py-3 overflow-hidden">
        <div className="ticker-wrap">
          <div className="ticker-content">
            {[...tickerItems, ...tickerItems, ...tickerItems].map((item, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-2 px-6 font-mono text-xs uppercase tracking-wider whitespace-nowrap"
              >
                <span className={item.color}>{item.icon}</span>
                <span className="text-text-muted">{item.label}</span>
                <span className="text-white font-medium">{item.value}{item.unit ? ` ${item.unit}` : ''}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Stat strip just below ticker */}
      <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 border-t border-space-border">
        <StatItem icon={<Clock className="w-4 h-4" aria-hidden />} label="Forecast Horizon" value="30 min" />
        <StatItem icon={<Zap className="w-4 h-4" aria-hidden />} label="Update Rate" value="10 sec" />
        <StatItem icon={<span className="font-mono text-xs">TSS</span>} label="Skill Score" value="0.76" />
        <StatItem icon={<span className="font-mono text-xs">HSS</span>} label="Heidke" value="0.68" />
      </div>
    </section>
  );
}

function Pill({ label, value, color }: { label: string; value: string; color: 'cyan' | 'orange' | 'green' }) {
  const map = {
    cyan: 'border-solar-cyan/40 text-solar-cyan glow-cyan',
    orange: 'border-isro-orange/40 text-isro-orange glow-orange',
    green: 'border-success-green/40 text-success-green glow-green',
  };
  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-space-deep/80 backdrop-blur-sm font-mono text-sm ${map[color]}`}
    >
      <span className="text-text-secondary text-xs uppercase tracking-wider">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="px-4 py-4 border-r border-space-border last:border-r-0 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-space-mid border border-space-border flex items-center justify-center text-solar-cyan">
        {icon}
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-wider text-text-secondary font-mono">{label}</div>
        <div className="text-base font-bold text-white font-mono">{value}</div>
      </div>
    </div>
  );
}