import './StepNav.css';

const STEPS = [
  { id: 'upload',    label: 'Upload' },
  { id: 'customize', label: 'Customize' },
  { id: 'result',    label: 'Result' },
];

export default function StepNav({ step, setStep, completedSteps }) {
  return (
    <nav className="step-nav" aria-label="Steps">
      {STEPS.map((s, i) => {
        const isDone    = completedSteps.has(s.id);
        const isCurrent = step === s.id;
        const isLocked  = !isDone && !isCurrent && !completedSteps.has(STEPS[i - 1]?.id);

        return (
          <button
            key={s.id}
            className={`step-btn ${isCurrent ? 'current' : ''} ${isDone ? 'done' : ''}`}
            onClick={() => !isLocked && setStep(s.id)}
            disabled={isLocked}
            aria-current={isCurrent ? 'step' : undefined}
          >
            <span className="step-num">{i + 1}</span>
            <span className="step-label">{s.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
