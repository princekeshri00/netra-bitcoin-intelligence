const STAGES = ['Search', 'Trace', 'Connect', 'Analyse', 'Detect', 'Explain', 'Prioritize'] as const;

// Maps each stage to the page/state where the investigator is actually
// doing that step, so the stepper reflects real navigation, not decoration.
export type Stage = (typeof STAGES)[number];

export default function WorkflowStepper({ active }: { active: Stage[] }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto">
      {STAGES.map((stage, i) => {
        const isActive = active.includes(stage);
        return (
          <div key={stage} className="flex items-center">
            <span
              className={`whitespace-nowrap rounded-sm px-2.5 py-1 text-[11px] font-medium ${
                isActive ? 'bg-stamp-soft text-stamp' : 'text-slate-400'
              }`}
            >
              {stage}
            </span>
            {i < STAGES.length - 1 && <span className="mx-0.5 text-slate-300">›</span>}
          </div>
        );
      })}
    </div>
  );
}
