"use client";

/** Agrupación de campos con título (espejo de `mobile/src/components/forms/FormSection.tsx`). */
import { createContext, useContext, type ReactNode } from "react";
import f from "./forms.module.css";

const InFormSection = createContext(false);
export const useInFormSection = () => useContext(InFormSection);

interface FormSectionProps {
  title?: string;
  children: ReactNode;
}

export default function FormSection({ title, children }: FormSectionProps) {
  return (
    <fieldset className={f.section} style={{ border: 0, padding: 0, minWidth: 0 }}>
      {title ? <legend className={f.sectionTitle}>{title}</legend> : null}
      <InFormSection.Provider value>
        <div className={f.sectionBody}>{children}</div>
      </InFormSection.Provider>
    </fieldset>
  );
}
