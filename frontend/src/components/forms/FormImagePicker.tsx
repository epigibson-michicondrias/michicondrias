"use client";

/**
 * FormImagePicker — foto de perfil con previsualización (espejo del de la app, versión web con `<input type="file">`).
 */
import { useId, useRef } from "react";
import { Camera, X } from "lucide-react";
import f from "./forms.module.css";

interface FormImagePickerProps {
  label: string;
  preview: string | null;
  onChange: (file: File | null) => void;
}

export default function FormImagePicker({ label, preview, onChange }: FormImagePickerProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={f.imagePicker}>
      <label id={`${inputId}-label`} className={f.label}>{label}</label>
      <div className={f.imageRow}>
        <div className={f.imageCircle}>
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- previsualización de blob local
            <img src={preview} alt="Foto de la mascota" className={f.imageThumb} />
          ) : (
            <Camera size={28} aria-hidden />
          )}
        </div>
        <div className={f.imageActions}>
          <button type="button" className={f.imageBtn} onClick={() => inputRef.current?.click()}>
            {preview ? "Cambiar foto" : "Subir foto"}
          </button>
          {preview && (
            <button type="button" className={f.imageBtnGhost} onClick={() => onChange(null)}>
              <X size={16} aria-hidden /> Quitar
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/*"
          className={f.imageInput}
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </div>
    </div>
  );
}
