"use client";

/** Pestañas segmentadas de 2 a 4 opciones (espejo de `mobile/src/components/SegmentedControl.tsx`). */
import type { ComponentType } from "react";
import s from "./kit.module.css";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: ComponentType<{ size?: number; color?: string }>;
}

interface SegmentedControlProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: SegmentOption<T>[];
  accessibilityLabel?: string;
}

export default function SegmentedControl<T extends string>({ value, onChange, options, accessibilityLabel }: SegmentedControlProps<T>) {
  return (
    <div className={s.track} role="tablist" aria-label={accessibilityLabel}>
      {options.map((opt) => {
        const active = opt.value === value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            className={`${s.segment} ${active ? s.segmentActive : ""}`}
            onClick={() => onChange(opt.value)}
          >
            {Icon ? <Icon size={14} /> : null}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
