import { Github, Satellite } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-space-border bg-space-black">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-isro-orange to-isro-amber flex items-center justify-center">
            <Satellite className="w-5 h-5 text-space-black" aria-hidden />
          </div>
          <div>
            <div className="font-display font-bold text-white text-base">ISRO BAH 2026</div>
            <div className="text-xs text-text-secondary font-mono">Tech4fun — Team</div>
          </div>
        </div>

        <div className="text-center text-xs text-text-secondary">
          <div>Built for <span className="text-white font-medium">Bharatiya Antariksh Hackathon 2026</span></div>
          <div className="mt-1">Amity University Bengaluru · Leader: HB Mrudhal Ankith</div>
        </div>

        <div className="flex md:justify-end items-center gap-3">
          <a
            href="https://github.com/ankith2409-web/solarflare-DEMO-"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs text-text-secondary hover:text-white border border-space-border rounded-lg transition"
          >
            <Github className="w-3.5 h-3.5" aria-hidden />
            <span className="font-mono">TecH4FuN</span>
          </a>
        </div>
      </div>

      <div className="border-t border-space-border py-3 text-center text-[10px] text-text-muted font-mono uppercase tracking-wider">
        Data sources: ISRO Aditya-L1 · NOAA GOES XRS · Open-source stack
      </div>
    </footer>
  );
}