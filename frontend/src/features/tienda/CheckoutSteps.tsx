"use client";

/**
 * CheckoutSteps — barra Envío → Pago. Espejo de `mobile/src/features/tienda/CheckoutSteps.tsx`.
 * `current`: 1 = dirección, 2 = pago.
 */
import s from "./checkout.module.css";

export default function CheckoutSteps({ current }: { current: 1 | 2 }) {
  const renderStep = (step: 1 | 2, label: string) => {
    const done = current > step;
    const active = current === step;
    const state = done || active ? "active" : "idle";

    return (
      <div className={s.stepItem} key={label}>
        <span className={`${s.stepCircle} ${state === "active" ? s.stepCircleActive : s.stepCircleIdle}`} aria-hidden>
          {done ? "✓" : step}
        </span>
        <span className={`${s.stepLabel} ${state === "active" ? s.stepLabelActive : s.stepLabelIdle}`}>{label}</span>
      </div>
    );
  };

  return (
    <div
      className={s.stepsBar}
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={2}
      aria-valuenow={current}
      aria-label={`Paso ${current} de 2`}
    >
      {renderStep(1, "Envío")}
      <span className={`${s.stepLine} ${current > 1 ? s.stepLineDone : s.stepLineIdle}`} aria-hidden />
      {renderStep(2, "Pago")}
    </div>
  );
}
