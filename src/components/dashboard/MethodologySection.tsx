import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Brain, GitBranch, Target, Layers } from 'lucide-react';

const SECTIONS = [
  {
    icon: Brain,
    title: 'Why TCN over LSTM',
    body: 'Temporal Convolutional Networks use dilated causal convolutions to capture multi-scale temporal patterns in a fixed-size receptive field. Unlike LSTMs, TCNs are fully parallelizable (faster training), handle long sequences without forgetting, and have a built-in inductive bias toward local pattern extraction — critical for identifying the 5-15 min precursor signature of M/X flares.',
  },
  {
    icon: GitBranch,
    title: 'Why TFT for forecasting',
    body: 'Temporal Fusion Transformer (TFT) uses multi-head attention to learn which historical timesteps matter most for each prediction. Variable selection networks automatically weigh the importance of each input feature (H/S ratio, dF/dt, etc.) per timestep. Quantile loss enables native prediction intervals — directly producing the 30-min CI shown in the forecast panel.',
  },
  {
    icon: Target,
    title: 'TSS calibration vs F1-score',
    body: 'F1-score is biased by class prevalence: in a dataset with 95% B-class and 1% M-class, a model that always predicts "B" achieves 0.95 F1. True Skill Statistic (TSS = TPR − FPR) is independent of class base rate, making it the standard metric in space-weather literature. Our thresholds are calibrated on the validation set to maximize TSS per class.',
  },
  {
    icon: Layers,
    title: 'Class imbalance & Focal Loss',
    body: 'The true B:C:M:X distribution is roughly 1000:100:10:1. Standard cross-entropy over-represents B-class during training. Focal Loss (γ=2) down-weights easy examples and emphasizes hard, rare M/X cases — directly improving recall on the events that matter for space-weather operations.',
  },
];

export function MethodologySection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display font-bold text-2xl text-white">Team & Methodology</h2>
        <p className="text-sm text-text-secondary mt-1">
          Key technical decisions behind the forecasting pipeline
        </p>
      </div>

      <div className="space-y-2">
        {SECTIONS.map((s, i) => {
          const Icon = s.icon;
          const isOpen = openIdx === i;
          return (
            <div key={s.title} className="solar-card p-0 overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : i)}
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-white/5 transition"
                {...{ 'aria-expanded': isOpen }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-solar-cyan/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-solar-cyan" aria-hidden />
                  </div>
                  <span className="font-display font-semibold text-white text-sm">{s.title}</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-text-secondary transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                  aria-hidden
                />
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-sm text-text-secondary leading-relaxed border-t border-space-border pt-4 ml-12">
                      {s.body}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}