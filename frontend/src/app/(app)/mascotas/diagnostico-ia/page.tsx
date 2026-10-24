"use client";

/**
 * Michi-IA Asistente — análisis de síntomas y plan de nutrición.
 * Espejo de `mobile/app/mascotas/diagnostico-ia.tsx` (U6): dos pestañas, resultados con urgencia
 * coloreada y el aviso de que no sustituye al veterinario.
 */
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  Clipboard,
  Heart,
  Info,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import SegmentedControl from "@/components/SegmentedControl";
import FormField from "@/components/FormField";
import FormSelect from "@/components/forms/FormSelect";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import { useAIDiagnosis } from "@/hooks/mascotas/useAIDiagnosis";
import { validateRequired } from "@/utils/validators";
import s from "./diagnostico.module.css";

const ACTIVITY_OPTIONS = [
  { value: "bajo", label: "Bajo (casa, paseos cortos)" },
  { value: "medio", label: "Medio (paseos diarios)" },
  { value: "alto", label: "Alto (deporte, trabajo)" },
];

function DiagnosticoContent({ petId }: { petId?: string }) {
  const {
    activeTab, setActiveTab,
    symptoms, setSymptoms,
    durationHours, setDurationHours,
    triagePetId, setTriagePetId, triageLoading, triageResult, handleSymptomCheck,
    selectedPetId, setSelectedPetId, activityLevel, setActivityLevel,
    allergies, setAllergies, targetWeight, setTargetWeight,
    dietLoading, dietResult, handleDietPlan,
    pets, loadingPets, getTriageColor, goAddPet,
  } = useAIDiagnosis(petId);

  const [symptomsError, setSymptomsError] = useState<string | null>(null);
  const [durationError, setDurationError] = useState<string | null>(null);

  const petOptions = [
    { value: "", label: "Sin especificar" },
    ...pets.map((p) => ({ value: p.id, label: p.name })),
  ];
  const dietPetOptions = pets.map((p) => ({ value: p.id, label: p.name }));

  const submitSymptomCheck = () => {
    const e1 = validateRequired(symptoms, "La descripción de los síntomas", "f");
    const e2 = validateRequired(durationHours, "El tiempo de evolución");
    setSymptomsError(e1.valid ? null : e1.message!);
    setDurationError(e2.valid ? null : e2.message!);
    if (!e1.valid || !e2.valid) return;
    handleSymptomCheck();
  };

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Michi-IA Asistente"
        subtitle="Orientación por síntomas y plan de nutrición. No sustituye al veterinario."
      />

      <div className={s.tabs}>
        <SegmentedControl
          value={activeTab}
          onChange={setActiveTab}
          options={[
            { value: "triage", label: "Sintomatología", icon: Activity },
            { value: "diet", label: "Nutrición", icon: Heart },
          ]}
          accessibilityLabel="Pestañas del asistente IA"
        />
      </div>

      {activeTab === "triage" ? (
        <div className={s.form}>
          <h2 className={s.formTitle}>Analizador Clínico Pre-Diagnóstico</h2>
          <p className={s.formSub}>
            Te orientamos sobre qué tan urgente es atender a tu mascota según los síntomas. No es un
            diagnóstico ni sustituye a un veterinario.
          </p>

          {loadingPets ? (
            <Skeleton height={48} borderRadius={12} />
          ) : pets.length === 0 ? (
            <EmptyState
              icon={<AlertTriangle size={28} />}
              title="Registra a tu mascota"
              subtitle="Para orientar el análisis con su especie, peso y edad."
              actionLabel="Agregar mascota"
              onAction={goAddPet}
            />
          ) : (
            <FormSelect
              label="¿A qué mascota le pasa? (opcional)"
              options={petOptions}
              value={triagePetId}
              onChange={setTriagePetId}
            />
          )}

          <FormField
            label="¿Qué síntomas presenta tu mascota? *"
            value={symptoms}
            onChangeText={(t) => { setSymptoms(t); if (symptomsError) setSymptomsError(null); }}
            error={symptomsError}
            multiline
            numberOfLines={4}
            placeholder="Describe detalladamente lo que notas (ej. vómito constante, decaído, no come)…"
          />

          <FormField
            label="¿Hace cuántas horas comenzaron los síntomas? *"
            value={durationHours}
            onChangeText={(t) => { setDurationHours(t); if (durationError) setDurationError(null); }}
            error={durationError}
            keyboardType="numeric"
            placeholder="Ej. 12"
          />

          <Button
            label={triageLoading ? "Analizando síntomas…" : "Iniciar Análisis Clínico"}
            onPress={submitSymptomCheck}
            loading={triageLoading}
            icon={<Sparkles size={16} />}
          />

          {triageResult && (
            <div className={s.resultCard} style={{ borderColor: getTriageColor(triageResult.urgency) }}>
              <div className={s.resultHeader}>
                <ShieldAlert size={28} color={getTriageColor(triageResult.urgency)} />
                <h3 className={s.resultTitle} style={{ color: getTriageColor(triageResult.urgency) }}>
                  {triageResult.triage_level}
                </h3>
              </div>
              <p className={s.resultText}>{triageResult.summary}</p>

              <div className={s.recommendation}>
                <p className={s.recommendationLabel}>Plan de Acción Recomendado:</p>
                <p className={s.resultText}>{triageResult.action_plan}</p>
              </div>

              <p className={s.disclaimer}>
                <Info size={14} aria-hidden /> {triageResult.disclaimer}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className={s.form}>
          <h2 className={s.formTitle}>Planificador Nutricional Personalizado</h2>
          <p className={s.formSub}>
            Calcula las calorías diarias de tu mascota (fórmula RER/MER) y recibe una guía de
            alimentación balanceada.
          </p>

          {loadingPets ? (
            <Skeleton height={48} borderRadius={12} />
          ) : pets.length === 0 ? (
            <EmptyState
              icon={<AlertTriangle size={28} />}
              title="Necesitas registrar al menos una mascota"
              subtitle="Sin mascotas no hay plan que calcular."
              actionLabel="Agregar mascota"
              onAction={goAddPet}
            />
          ) : (
            <>
              <FormSelect
                label="Selecciona tu Mascota *"
                options={dietPetOptions}
                value={selectedPetId}
                onChange={setSelectedPetId}
              />
              <FormSelect
                label="Nivel de Actividad Física"
                options={ACTIVITY_OPTIONS}
                value={activityLevel}
                onChange={setActivityLevel}
              />
              <FormField
                label="Alergias conocidas (opcional)"
                value={allergies}
                onChangeText={setAllergies}
                placeholder="Ej. Pollo, pescado, granos…"
              />
              <FormField
                label="Peso objetivo en kg (opcional)"
                value={targetWeight}
                onChangeText={setTargetWeight}
                keyboardType="decimal-pad"
                placeholder="Ej. 8.5"
              />
              <Button
                label={dietLoading ? "Generando plan…" : "Generar Plan de Dieta"}
                onPress={handleDietPlan}
                loading={dietLoading}
                icon={<Sparkles size={16} />}
              />
            </>
          )}

          {dietResult && (
            <div className={s.resultCard}>
              <div className={s.resultHeader}>
                <Clipboard size={28} color="var(--color-primary)" />
                <h3 className={s.resultTitle}>Guía de Nutrición</h3>
              </div>

              <div className={s.metricRow}>
                <div className={s.metricBox}>
                  <p className={s.metricVal} style={{ color: "var(--color-primary)" }}>
                    {dietResult.resting_energy_requirement_kcal}
                  </p>
                  <p className={s.metricLabel}>RER (kcal/día)</p>
                </div>
                <div className={s.metricBox}>
                  <p className={s.metricVal} style={{ color: "var(--color-success)" }}>
                    {dietResult.daily_energy_needs_kcal}
                  </p>
                  <p className={s.metricLabel}>Meta Calórica</p>
                </div>
                <div className={s.metricBox}>
                  <p className={s.metricVal} style={{ color: "var(--color-info)" }}>
                    {dietResult.hydration_target_ml} ml
                  </p>
                  <p className={s.metricLabel}>Hidratación</p>
                </div>
              </div>

              <div className={s.recommendation}>
                <p className={s.recommendationLabel}>Pauta de Dieta Sugerida:</p>
                <p className={s.resultText}>{dietResult.recommended_diet}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </ScreenContainer>
  );
}

function DiagnosticoInner() {
  const params = useSearchParams();
  return <DiagnosticoContent petId={params.get("petId") || undefined} />;
}

export default function DiagnosticoIAPage() {
  return (
    <Suspense fallback={null}>
      <DiagnosticoInner />
    </Suspense>
  );
}
