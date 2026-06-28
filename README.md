# ISRO BAH 2026 — Solar Flare Forecasting Dashboard

A real-time M/X-class solar flare forecasting web application built for the **ISRO Bharatiya Antariksh Hackathon (BAH) 2026** by **Team TecH4FuN** (Leader: HB Mrudhal Ankith, Amity University Bengaluru).

Powered by simulated Aditya-L1 **SoLEXS** (soft X-ray) and **HEL1OS** (hard X-ray) dual-channel data, the dashboard runs two parallel ML models:

- **TCN Nowcaster** → real-time binary P(flare) ∈ [0,1]
- **TFT Forecaster** → 30-min ahead multiclass P(B), P(C), P(M), P(X)

A confidence-weighted ensemble (TSS-calibrated) produces flare class, confidence, and time-to-peak estimates for ISS / aviation / GPS / power-grid stakeholders.

## Problem Statement

> Solar Flare Forecasting and Nowcasting Using Aditya-L1 (SoLEXS and HEL1OS) Dual-Channel X-ray Time-Series Data

**Success metrics:** TSS > 0.65, HSS > 0.50, 30-min forecast horizon for M/X-class flares, < 60s nowcasting latency.

## Tech Stack

- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v3 (custom design system)
- **Charts:** Recharts (ComposedChart, AreaChart, LineChart, BarChart)
- **3D:** Three.js + @react-three/fiber + @react-three/drei (animated sun + Aditya-L1 orbit tracker)
- **Animation:** Framer Motion
- **Icons:** Lucide React
- **State:** Zustand
- **Data:** Simulated real-time solar physics (correct W/m² orders of magnitude, log-normal flux distribution, realistic flare morphology)
- **Fonts:** Space Grotesk (display), Inter (body), JetBrains Mono (telemetry)

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Build

```bash
npm run build
npm run preview
```

## Features

### Core Dashboard (9 sections)
1. **Hero** — Split layout: animated 3D sun, live ticker, stat pills
2. **Live Dashboard** — Dual-channel flux chart (log scale), ActiveFlareCard, 30-min probability forecast
3. **Feature Intelligence** — H/S ratio, dF/dt, rolling std, peak rise rate
4. **Alert History** — Table with CSV export
5. **Model Metrics** — TSS, HSS, confusion matrix, precision/recall
6. **Space Weather Impact** — Satellites, aviation, GPS, power grid
7. **Pipeline Architecture** — Interactive SVG diagram
8. **Mission Info** — Aditya-L1, SoLEXS, HEL1OS + orbit tracker
9. **Methodology** — Why TCN, why TFT, TSS, Focal Loss

### Differentiators (beyond spec)
- **Flare Class Education Modal** — Click any badge to learn energy range, effects, historical examples
- **Aditya-L1 Live Orbit Tracker** — Mini Three.js scene showing Sun–L1–Earth–satellite
- **Alert Export & Notification Simulation** — Browser notification permission flow
- **GOES vs Aditya-L1 Comparison** — Side-by-side, with HEL1OS unique value
- **Solar Cycle 25 context banner** — Why now matters
- **Team & Methodology accordion** — Technical decisions explained

## Physics Correctness

- All flux values in **W/m²** with correct orders of magnitude (10⁻⁹ to 10⁻³)
- Y-axis is **logarithmic** (linear is "physically wrong" per spec)
- GOES class thresholds hardcoded: B=10⁻⁷, C=10⁻⁶, M=10⁻⁵, X=10⁻⁴ W/m²
- All timestamps in **UTC** (no local time)
- H/S ratio = HEL1OS / SoLEXS — hard X-ray to soft X-ray precursor
- Realistic flare morphology: rise (3-8 min) → peak (1-3 min) → decay (10-20 min)
- Quiet sun baseline: ~2×10⁻⁸ W/m²
- HEL1OS = 8-15× lower than SoLEXS at quiet; H/S ratio 0.3-0.8 during flares

## Data Simulation

`src/utils/dataGenerator.ts` generates 4-hour history (240 points at 1-min cadence) on mount, then appends a new point every 10 seconds. Flare events injected with realistic per-tick probability (0.003).

## Project Structure

```
src/
├── App.tsx
├── main.tsx
├── index.css
├── components/
│   ├── layout/         (Navbar, Footer)
│   ├── hero/           (HeroSection, AnimatedSun)
│   ├── dashboard/      (DualChannelChart, ActiveFlareCard, ForecastChart, FeaturePanel, AlertTimeline, ModelMetrics, MethodologySection, GoesComparison, AlertSimulator, SolarCycleBanner, OrbitTracker)
│   ├── impact/         (SpaceWeatherImpact, MissionInfo, FlareClassModal)
│   ├── pipeline/       (PipelineDiagram)
│   └── ui/             (LiveBadge, FlareBadge, ConfidenceBar, MetricCard, GlowCard)
├── hooks/              (useSimulatedData, useFlareDetection)
├── store/              (Zustand solarStore)
├── types/              (solar.ts)
├── utils/              (solarPhysics, dataGenerator)
└── lib/                (utils)
```

## License

© 2026 Team TecH4FuN · Built for ISRO BAH 2026 Hackathon.
