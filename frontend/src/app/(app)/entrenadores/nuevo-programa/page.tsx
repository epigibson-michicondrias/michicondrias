"use client";

/**
 * Nuevo programa de entrenamiento (`/entrenadores/nuevo-programa`).
 * Espejo de `mobile/app/entrenadores/nuevo-programa.tsx`.
 */
import { Dumbbell, Sparkles, Check } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Button from "@/components/Button";
import FormField from "@/components/FormField";
import FormSection from "@/components/forms/FormSection";
import RoleGuard from "@/components/RoleGuard";
import { useTrainerDashboard } from "@/hooks/training/useTrainerDashboard";
import l from "../entrenadores.module.css";

function NuevoProgramaContent() {
  const { programForm, updateProgramField, handleCreateProgram, isCreatingProgram } = useTrainerDashboard();

  return (
    <ScreenContainer>
      <ScreenHeader title="Nuevo Programa" />

      <div className={l.hero}>
        <div className={l.heroIcon}>
          <Dumbbell size={32} />
        </div>
        <h2 className={l.heroTitle}>Crea tu programa</h2>
        <p className={l.heroSub}>Define los detalles del programa de entrenamiento</p>
      </div>

      <FormSection title="Programa">
        <FormField
          label="Nombre del programa *"
          value={programForm.title}
          onChangeText={(v) => updateProgramField("title", v)}
          placeholder="Ej. Obediencia básica"
          maxLength={120}
        />
        <FormField
          label="Descripción"
          value={programForm.description}
          onChangeText={(v) => updateProgramField("description", v)}
          placeholder="Describe qué incluye el programa..."
          multiline
        />
      </FormSection>

      <FormSection title="Precio y duración">
        <div style={{ display: "flex", gap: "var(--space-md)" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <FormField
              label="Precio (MXN) *"
              value={programForm.price}
              onChangeText={(v) => updateProgramField("price", v)}
              placeholder="0.00"
              keyboardType="decimal-pad"
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <FormField
              label="Duración (semanas)"
              value={programForm.duration_weeks}
              onChangeText={(v) => updateProgramField("duration_weeks", v.replace(/\D/g, ""))}
              placeholder="8"
              keyboardType="number-pad"
              maxLength={2}
            />
          </div>
        </div>
      </FormSection>

      <Button
        label="Crear programa"
        icon={<Check size={18} />}
        onPress={handleCreateProgram}
        loading={isCreatingProgram}
        style={{ marginTop: "var(--space-xl)" }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "var(--space-sm)",
          padding: "var(--space-md)",
          borderRadius: 12,
          background: "color-mix(in srgb, var(--color-primary) 8%, transparent)",
          color: "var(--color-text-muted)",
          fontSize: "var(--font-sm)",
          marginTop: "var(--space-lg)",
        }}
      >
        <Sparkles size={16} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: 2 }} />
        <span>Los clientes podrán inscribir a sus mascotas en cuanto publiques el programa.</span>
      </div>
    </ScreenContainer>
  );
}

export default function NuevoProgramaPage() {
  return (
    <RoleGuard roles={["entrenador"]} message="Crear programas es solo para cuentas de entrenador.">
      <NuevoProgramaContent />
    </RoleGuard>
  );
}
