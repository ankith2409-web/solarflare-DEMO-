import { Satellite, Radio, Activity } from 'lucide-react';
import { OrbitTracker } from '../dashboard/OrbitTracker';

const INFO_CARDS = [
  {
    icon: Satellite,
    title: 'About Aditya-L1',
    items: [
      "India's first solar observatory",
      'Launched September 2, 2023',
      'Halo orbit around Sun-Earth L1 point',
      '~1.5 million km from Earth',
    ],
  },
  {
    icon: Radio,
    title: 'SoLEXS Instrument',
    items: [
      'Solar Low Energy X-ray Spectrometer',
      'Energy range: 1–15 keV',
      'Soft X-ray monitoring',
      '1-minute cadence',
    ],
  },
  {
    icon: Activity,
    title: 'HEL1OS Instrument',
    items: [
      'High Energy L1 Orbiting X-ray Spectrometer',
      'Energy range: 10–150 keV',
      'Hard X-ray imaging',
      'Hard-soft ratio: key flare precursor',
    ],
  },
];

export function MissionInfo() {
  return (
    <section className="bg-gradient-to-b from-space-deep to-space-black border-t border-space-border">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {INFO_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-solar-cyan/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-solar-cyan" aria-hidden />
                </div>
                <h3 className="font-display font-bold text-white">{card.title}</h3>
              </div>
              <ul className="space-y-1.5">
                {card.items.map((item) => (
                  <li key={item} className="text-xs text-text-secondary flex items-start gap-2">
                    <span className="text-solar-cyan mt-1">›</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
        <div className="lg:col-span-1">
          <OrbitTracker />
        </div>
      </div>
    </section>
  );
}