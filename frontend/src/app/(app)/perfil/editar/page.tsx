"use client";

/**
 * Datos personales — formulario premium con FormActionsBar, validación inline y resumen de errores.
 * Espejo de `mobile/app/perfil/editar.tsx`.
 */
import { useEffect, useRef } from "react";
import { Check, AlertTriangle } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import FormField from "@/components/FormField";
import FormSection from "@/components/forms/FormSection";
import FormActionsBar from "@/components/forms/FormActionsBar";
import { Skeleton } from "@/components/Skeleton";
import { useProfile, BIO_MAX } from "@/hooks/perfil/useProfile";

export default function EditarPerfilPage() {
  const { formData, errors, updateField, isLoading, handleSave, isSaving } = useProfile();
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const errorList = Object.entries(errors).filter(([, v]) => !!v);

  // Enfocar resumen de errores tras submit fallido
  useEffect(() => {
    if (errorList.length > 0) {
      errorSummaryRef.current?.focus();
    }
  }, [errorList.length]);

  return (
    <ScreenContainer>
      <ScreenHeader title="Datos personales" />

      {isLoading ? (
        <>
          <Skeleton height={48} borderRadius={12} />
          <Skeleton height={48} borderRadius={12} />
          <Skeleton height={48} borderRadius={12} />
          <Skeleton height={96} borderRadius={12} />
        </>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} noValidate>
          {/* Resumen de errores accesible */}
          {errorList.length > 0 && (
            <div
              ref={errorSummaryRef}
              role="alert"
              tabIndex={-1}
              aria-labelledby="error-summary-title"
              style={{
                padding: "var(--space-md)",
                borderRadius: "var(--radius-lg)",
                background: "rgba(214, 69, 69, 0.08)",
                border: "1px solid rgba(214, 69, 69, 0.2)",
                marginBottom: "var(--space-lg)",
              }}
            >
              <h2 id="error-summary-title" style={{ margin: 0, fontSize: "var(--font-md)", fontWeight: 700, color: "var(--color-error)", display: "flex", alignItems: "center", gap: 6 }}>
                <AlertTriangle size={18} /> Corrige {errorList.length} {errorList.length === 1 ? "campo" : "campos"}
              </h2>
              <ul style={{ margin: "8px 0 0", paddingLeft: 20 }}>
                {errorList.map(([field, msg]) => (
                  <li key={field}>
                    <a href={`#${field}`} style={{ color: "var(--color-error)", fontSize: "var(--font-sm)" }}>{msg}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <FormSection title="Tus datos">
            <FormField
              id="full_name"
              label="Nombre completo"
              value={formData.full_name}
              onChangeText={(v) => updateField("full_name", v)}
              error={errors.full_name}
              hint="Como quieres que te llamen en la app."
            />
            <FormField
              id="email"
              label="Correo electrónico"
              value={formData.email}
              onChangeText={() => {}}
              editable={false}
              hint="Es tu acceso a la cuenta; no se puede cambiar desde la app."
            />
            <FormField
              id="phone"
              label="Teléfono (opcional)"
              value={formData.phone}
              onChangeText={(v) => updateField("phone", v)}
              keyboardType="phone-pad"
              error={errors.phone}
              hint="Para que las clínicas te contacten."
            />
            <FormField
              id="location"
              label="Ubicación (opcional)"
              value={formData.location}
              onChangeText={(v) => updateField("location", v)}
              hint="Ciudad o colonia. Ayuda a encontrar servicios cercanos."
            />
            <FormField
              id="bio"
              label={`Sobre mí (opcional) · ${formData.bio.length}/${BIO_MAX}`}
              value={formData.bio}
              onChangeText={(v) => updateField("bio", v)}
              multiline
              numberOfLines={3}
              error={errors.bio}
              hint="Una breve presentación que verán los profesionales."
            />
          </FormSection>

          <FormActionsBar
            submitLabel={isSaving ? "Guardando…" : "Guardar cambios"}
            busy={isSaving}
            onCancel={() => window.history.back()}
            icon={<Check size={18} />}
            note="* Obligatorio"
          />
        </form>
      )}
    </ScreenContainer>
  );
}
