const BORDER = 'rgba(26,8,16,0.1)';
const CREAM  = '#F0E4EC';
const MUTED  = 'rgba(26,8,16,0.4)';

const DEFAULT_STEPS = [
  { id: 'upload',    label: 'Upload' },
  { id: 'customize', label: 'Customize' },
  { id: 'result',    label: 'Result' },
];

export default function StepNav({ step, setStep, completedSteps, steps = DEFAULT_STEPS }) {
  return (
    <nav
      className="flex fixed bottom-0 left-0 right-0 z-100 md:hidden"
      style={{ background: '#F5F0EB', borderTop: `1px solid ${BORDER}` }}
      aria-label="Steps"
    >
      {steps.map((s, i) => {
        const isDone    = completedSteps.has(s.id);
        const isCurrent = step === s.id;
        const isLocked  = !isDone && !isCurrent && !completedSteps.has(steps[i - 1]?.id);

        return (
          <button
            key={s.id}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 min-h-15 border-none cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: isCurrent ? 'rgba(44,12,26,0.05)' : 'transparent' }}
            onClick={() => !isLocked && setStep(s.id)}
            disabled={isLocked}
            aria-current={isCurrent ? 'step' : undefined}
          >
            <span
              className="flex items-center justify-center w-5.5 h-5.5 rounded-full text-[11px] font-black transition-all"
              style={
                isCurrent
                  ? { background: '#2C0C1A', color: '#F0E4EC' }
                  : isDone
                  ? { background: 'rgba(74,222,128,0.2)', color: '#16a34a' }
                  : { background: 'rgba(26,8,16,0.1)', color: MUTED }
              }
            >
              {i + 1}
            </span>
            <span
              className="text-[10px] font-bold uppercase tracking-wide"
              style={{ color: isCurrent ? '#2C0C1A' : MUTED }}
            >
              {s.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
