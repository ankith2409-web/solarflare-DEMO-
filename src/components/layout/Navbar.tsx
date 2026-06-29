import { Satellite, Github, Activity, Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';
import { useSolarStore } from '../../store/solarStore';

interface NavbarProps {
  onOpenAlertSettings: () => void;
}

export function Navbar({ onOpenAlertSettings }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const dataSource = useSolarStore((s) => s.dataSource);
  const setDataSource = useSolarStore((s) => s.setDataSource);
  const alertSettings = useSolarStore((s) => s.alertSettings);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { href: '#dashboard', label: 'Dashboard' },
    { href: '#features', label: 'Features' },
    { href: '#alerts', label: 'Alerts' },
    { href: '#metrics', label: 'Metrics' },
    { href: '#impact', label: 'Impact' },
    { href: '#pipeline', label: 'Architecture' },
  ];

  const anyAlertsActive =
    alertSettings.browserEnabled ||
    alertSettings.slackEnabled ||
    alertSettings.emailEnabled ||
    alertSettings.smsEnabled;

  return (
    <nav
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        scrolled ? 'bg-space-black/85 backdrop-blur-md border-b border-space-border' : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-isro-orange to-isro-amber flex items-center justify-center group-hover:rotate-12 transition">
            <Satellite className="w-4 h-4 text-space-black" aria-hidden />
          </div>
          <div className="leading-tight">
            <div className="font-display font-bold text-white text-sm">ISRO BAH 2026</div>
            <div className="text-[10px] uppercase tracking-widest text-text-secondary font-mono">
              Solar Flare EWS
            </div>
          </div>
        </a>

        <ul className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="px-3 py-2 text-sm text-text-secondary hover:text-white transition font-medium"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          {/* Data source selection pills */}
          <div className="hidden md:flex items-center bg-space-black border border-space-border rounded-full p-0.5 font-mono text-[10px] uppercase mr-1">
            <button
              onClick={() => setDataSource('simulation')}
              className={cn(
                'px-2.5 py-1 rounded-full transition-all font-bold',
                dataSource === 'simulation'
                  ? 'bg-isro-orange text-space-black font-semibold'
                  : 'text-text-secondary hover:text-white'
              )}
            >
              Sim
            </button>
            <button
              onClick={() => setDataSource('live-noaa')}
              className={cn(
                'px-2.5 py-1 rounded-full transition-all font-bold',
                dataSource === 'live-noaa'
                  ? 'bg-solar-cyan text-space-black font-semibold'
                  : 'text-text-secondary hover:text-white'
              )}
            >
              NOAA Live
            </button>
          </div>

          <button
            onClick={onOpenAlertSettings}
            className="p-2 text-text-secondary hover:text-white hover:bg-space-mid rounded-full transition relative mr-1"
            title="Configure Alert Channels"
            aria-label="Configure Alert Channels"
          >
            <Bell className="w-4 h-4" />
            {anyAlertsActive && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-success-green" />
            )}
          </button>

          <a
            href="https://github.com/ankith2409-web/solarflare-DEMO-"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 text-xs text-text-secondary hover:text-white border border-space-border rounded-lg transition"
            aria-label="GitHub repository"
          >
            <Github className="w-3.5 h-3.5" aria-hidden />
            <span className="font-mono">TecH4FuN</span>
          </a>
          <a
            href="#dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-isro-orange text-space-black text-sm font-bold hover:bg-isro-amber transition"
          >
            <Activity className="w-4 h-4" aria-hidden />
            Live Dashboard
          </a>
          <button
            type="button"
            className="lg:hidden p-2 text-text-secondary"
            aria-label="Open menu"
            {...{ 'aria-expanded': open }}
            onClick={() => setOpen(!open)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <ul className="lg:hidden bg-space-deep border-t border-space-border py-2 space-y-2">
          {/* Mobile source toggle */}
          <li className="px-6 py-2 flex items-center justify-between border-b border-space-border/50">
            <span className="text-xs font-mono text-text-secondary">DATA SOURCE</span>
            <div className="flex bg-space-black border border-space-border rounded-full p-0.5 font-mono text-[9px] uppercase">
              <button
                onClick={() => setDataSource('simulation')}
                className={cn(
                  'px-2 py-0.5 rounded-full transition-all font-bold',
                  dataSource === 'simulation' ? 'bg-isro-orange text-space-black' : 'text-text-secondary'
                )}
              >
                Sim
              </button>
              <button
                onClick={() => setDataSource('live-noaa')}
                className={cn(
                  'px-2 py-0.5 rounded-full transition-all font-bold',
                  dataSource === 'live-noaa' ? 'bg-solar-cyan text-space-black' : 'text-text-secondary'
                )}
              >
                NOAA
              </button>
            </div>
          </li>
          <li className="px-6 py-2 border-b border-space-border/50">
            <button
              onClick={() => {
                setOpen(false);
                onOpenAlertSettings();
              }}
              className="flex items-center gap-2 text-sm text-text-secondary hover:text-white transition w-full text-left"
            >
              <Bell className="w-4 h-4" />
              Configure Alerts
            </button>
          </li>
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="block px-6 py-3 text-sm text-text-secondary hover:text-white border-b border-space-border"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}