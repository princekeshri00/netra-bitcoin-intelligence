import { Check } from 'lucide-react';

const STAGES = ['Search', 'Trace', 'Connect', 'Analyse', 'Detect', 'Explain', 'Prioritize'] as const;

export type Stage = (typeof STAGES)[number];

export default function WorkflowStepper({ active }: { active: Stage[] }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto rounded-lg bg-slate-900/90 border border-slate-800 px-3 py-1.5 backdrop-blur-md">
      {STAGES.map((stage, i) => {
        const isActive = active.includes(stage);
        return (
          <div key={stage} className="flex items-center">
            <span
              className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2.5 py-0.5 text-[10.5px] font-mono font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : 'text-slate-500 hover:text-slate-400'
              }`}
            >
              {isActive && <Check className="h-3 w-3 text-cyan-400" />}
              {stage}
            </span>
            {i < STAGES.length - 1 && <span className="mx-1 text-slate-700 text-xs">›</span>}
          </div>
        );
      })}
    </div>
  );
}
