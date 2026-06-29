import { useEffect, useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HeroSection } from './components/hero/HeroSection';
import { SolarCycleBanner } from './components/dashboard/SolarCycleBanner';
import { DualChannelChart } from './components/dashboard/DualChannelChart';
import { SingleChannelChart } from './components/dashboard/SingleChannelChart';
import { ActiveFlareCard } from './components/dashboard/ActiveFlareCard';
import { ForecastChart } from './components/dashboard/ForecastChart';
import { FeaturePanel } from './components/dashboard/FeaturePanel';
import { AlertTimeline } from './components/dashboard/AlertTimeline';
import { ModelMetrics } from './components/dashboard/ModelMetrics';
import { SpaceWeatherImpact } from './components/impact/SpaceWeatherImpact';
import { MissionInfo } from './components/impact/MissionInfo';
import { PipelineDiagram } from './components/pipeline/PipelineDiagram';
import { MethodologySection } from './components/dashboard/MethodologySection';
import { GoesComparison } from './components/dashboard/GoesComparison';
import { AlertSimulator } from './components/dashboard/AlertSimulator';
import { AlertToastHost } from './components/dashboard/AlertToastHost';
import { LiveBadge } from './components/ui/LiveBadge';
import { useSimulatedData } from './hooks/useSimulatedData';
import { useSolarStore } from './store/solarStore';
import { formatUTCLong } from './utils/solarPhysics';
import { AlertSettingsModal } from './components/dashboard/AlertSettingsModal';
import { MlModelMetricsPanel } from './components/dashboard/MlModelMetricsPanel';

function App() {
  useSimulatedData();
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  // Lock scroll restoration
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // Live UTC clock — ticks once per second so the display never freezes
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const todayLabel = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
  const fluxCount = useSolarStore((s) => s.fluxData.length);

  return (
    <div className="min-h-screen bg-space-black text-text-primary">
      <Navbar onOpenAlertSettings={() => setIsAlertModalOpen(true)} />

      <HeroSection />
      <SolarCycleBanner />

      {/* Section 2: Live Dashboard */}
      <section id="dashboard" className="py-12 lg:py-16 px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="font-display font-bold text-2xl lg:text-3xl text-white">
                Live Solar Monitoring Dashboard
              </h2>
              <LiveBadge label="LIVE" />
            </div>
            <p className="text-sm text-text-secondary">
              Dual-channel X-ray flux · Aditya-L1 SoLEXS + HEL1OS · {todayLabel} · All times UTC
            </p>
          </div>
          <div className="flex items-center gap-2">
            <AlertSimulator />
            <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg border border-space-border bg-space-deep">
              <span className="text-[10px] uppercase tracking-wider text-text-secondary font-mono">
                UTC
              </span>
              <span className="text-sm font-mono text-white">
                {String(now.getUTCHours()).padStart(2, '0')}:
                {String(now.getUTCMinutes()).padStart(2, '0')}:
                {String(now.getUTCSeconds()).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
          <div className="solar-card lg:col-span-7">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold text-white">
                SoLEXS + HEL1OS — Dual-Channel Flux
              </h3>
              <span className="text-[10px] font-mono text-text-secondary">
                Log scale · W/m² · {fluxCount} pts · 4h rolling window
              </span>
            </div>
            <DualChannelChart />
          </div>
          <div className="lg:col-span-5">
            <ActiveFlareCard />
          </div>
        </div>

        {/* Single-channel breakdown — SoLEXS + HEL1OS separately */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <SingleChannelChart channel="soLEXS" />
          <SingleChannelChart channel="hel1OS" />
        </div>

        <ForecastChart />
      </section>

      {/* Section 3: Feature Intelligence */}
      <section id="features" className="py-12 lg:py-16 px-4 lg:px-8 max-w-7xl mx-auto border-t border-space-border">
        <div className="mb-6">
          <h2 className="font-display font-bold text-2xl text-white">Real-time Feature Engineering & ML Diagnostics</h2>
          <p className="text-sm text-text-secondary mt-1">
            Engineered signals and forecasting diagnostics driving the predictive model
          </p>
        </div>
        <div className="space-y-6">
          <FeaturePanel />
          <MlModelMetricsPanel />
        </div>
      </section>

      {/* Section 4: Alert History */}
      <section id="alerts" className="py-12 lg:py-16 px-4 lg:px-8 max-w-7xl mx-auto border-t border-space-border">
        <AlertTimeline />
      </section>

      {/* Section 5: Model Metrics */}
      <section id="metrics" className="py-12 lg:py-16 px-4 lg:px-8 max-w-7xl mx-auto border-t border-space-border">
        <ModelMetrics />
      </section>

      {/* Section 6: Space Weather Impact */}
      <section id="impact" className="py-12 lg:py-16 px-4 lg:px-8 max-w-7xl mx-auto border-t border-space-border">
        <SpaceWeatherImpact />
      </section>

      {/* Section 7: Pipeline Architecture */}
      <section id="pipeline" className="py-12 lg:py-16 px-4 lg:px-8 max-w-7xl mx-auto border-t border-space-border">
        <div className="mb-6">
          <h2 className="font-display font-bold text-2xl text-white">System Architecture</h2>
          <p className="text-sm text-text-secondary mt-1">
            From FITS ingestion to alert — full ML pipeline visualization
          </p>
        </div>
        <PipelineDiagram />
      </section>

      {/* Section 7.5: GOES vs Aditya-L1 (differentiator) */}
      <section className="py-12 lg:py-16 px-4 lg:px-8 max-w-7xl mx-auto border-t border-space-border">
        <GoesComparison />
      </section>

      {/* Section 8: Mission Info */}
      <MissionInfo />

      {/* Section 8.5: Methodology (differentiator) */}
      <section className="py-12 lg:py-16 px-4 lg:px-8 max-w-7xl mx-auto border-t border-space-border">
        <MethodologySection />
      </section>

      <Footer />

      {/* Top-of-screen flare alert toasts — slides in when a new M/X flare is detected */}
      <AlertToastHost />

      {/* Alert Settings Modal */}
      <AlertSettingsModal isOpen={isAlertModalOpen} onClose={() => setIsAlertModalOpen(false)} />
    </div>
  );
}

export default App;