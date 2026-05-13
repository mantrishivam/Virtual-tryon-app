const STEPS = [
  { id: 'upload',    label: 'Upload' },
  { id: 'customize', label: 'Customize' },
  { id: 'result',    label: 'Result' },
];

export default function StepNav({ step, setStep, completedSteps }) {
  return (
    <nav className="flex fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-100 md:hidden" aria-label="Steps">
      {STEPS.map((s, i) => {
        const isDone    = completedSteps.has(s.id);
        const isCurrent = step === s.id;
        const isLocked  = !isDone && !isCurrent && !completedSteps.has(STEPS[i - 1]?.id);

        const numBg = isCurrent ? 'bg-gray-900 text-white' : isDone ? 'bg-green-500 text-white' : 'bg-gray-300 text-white';
        const btnColor = isCurrent ? 'text-gray-900 bg-gray-100' : isDone ? 'text-gray-600' : 'text-gray-300';

        return (
          <button
            key={s.id}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 min-h-[60px] border-none bg-transparent cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${btnColor}`}
            onClick={() => !isLocked && setStep(s.id)}
            disabled={isLocked}
            aria-current={isCurrent ? 'step' : undefined}
          >
            <span className={`flex items-center justify-center w-[22px] h-[22px] rounded-full text-[11px] font-bold ${numBg}`}>
              {i + 1}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wide">{s.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
