"use client";

/**
 * Solicitud de adopción — formulario multi-paso (`/adopciones/solicitar/[id]`).
 * Espejo de `mobile/app/adopciones/solicitar/[id].tsx`.
 */
import { useRouter } from "next/navigation";
import { Home, Users, Heart, ShieldAlert, Lock, PartyPopper, Send } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import FormField from "@/components/FormField";
import FormSection from "@/components/forms/FormSection";
import FormSwitch from "@/components/forms/FormSwitch";
import FilterChip from "@/components/FilterChip";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import { useApplyForm } from "@/hooks/adopciones/useApplyForm";
import local from "@/features/adopciones/adopciones.module.css";

const STEPS = [
  { title: "Hogar", icon: Home },
  { title: "Familia y rutina", icon: Users },
  { title: "Compromiso", icon: Heart },
];
const HOUSE_TYPES = ["Casa", "Departamento", "Rancho", "Otro"];

export default function SolicitarAdopcionPage() {
  const router = useRouter();
  const {
    listing, loadingListing, form, step, errors, loading, success,
    isAdmin, isVerified, isPending,
    updateField, handleNext, handleBack, handleSubmit,
  } = useApplyForm();
  const petName = listing?.name ?? "esta mascota";

  if (loadingListing) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Solicitud de adopción" />
        <div style={{ display: "grid", gap: "var(--space-md)" }}>
          <Skeleton height={20} width="40%" />
          <Skeleton height={56} borderRadius={12} />
          <Skeleton height={56} borderRadius={12} />
          <Skeleton height={56} borderRadius={12} />
        </div>
      </ScreenContainer>
    );
  }

  if (isAdmin) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Solicitud de adopción" />
        <EmptyState
          icon={<ShieldAlert size={28} />}
          title="Acción no disponible para administradores"
          subtitle="Las solicitudes se revisan desde el panel de moderación."
          actionLabel="Volver"
          onAction={handleBack}
        />
      </ScreenContainer>
    );
  }

  if (!isVerified) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Solicitud de adopción" subtitle={listing?.name} />
        <EmptyState
          icon={<Lock size={28} />}
          title={isPending ? "Estamos verificando tu identidad" : "Verifica tu identidad para adoptar"}
          subtitle={
            isPending
              ? "Podrás enviar tu solicitud en cuanto el equipo valide tus documentos."
              : "Por el bienestar de las mascotas, quien adopta debe tener su identidad verificada. Toma unos minutos."
          }
          actionLabel={isPending ? "Ver el estado" : "Verificar mi identidad"}
          onAction={() => router.push("/perfil/verificacion")}
        />
      </ScreenContainer>
    );
  }

  if (success) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Solicitud enviada" showBack={false} />
        <EmptyState
          icon={<PartyPopper size={28} />}
          title={`¡Listo! Ya postulaste para adoptar a ${petName}`}
          subtitle="Quien lo publicó revisará tu solicitud. Te avisaremos en cada cambio de estado."
          actionLabel="Ver mis solicitudes"
          onAction={() => router.push("/adopciones/mis-solicitudes")}
        />
      </ScreenContainer>
    );
  }

  const StepIcon = STEPS[step - 1].icon;

  return (
    <ScreenContainer>
      <ScreenHeader title="Solicitud de adopción" subtitle={`Para ${petName}`} onBack={handleBack} />

      {/* Progreso */}
      <div style={{ marginBottom: "var(--space-lg)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", marginBottom: "var(--space-sm)" }}>
          <StepIcon size={18} style={{ color: "var(--color-primary)" }} aria-hidden />
          <span style={{ flex: 1, fontWeight: 600, color: "var(--color-text)" }}>{STEPS[step - 1].title}</span>
          <span style={{ fontSize: "var(--font-sm)", color: "var(--color-text-muted)" }}>
            Paso {step} de {STEPS.length}
          </span>
        </div>
        <div style={{ height: 4, borderRadius: "var(--radius-pill)", background: "var(--color-border)", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              borderRadius: "var(--radius-pill)",
              background: "var(--color-primary)",
              width: `${(step / STEPS.length) * 100}%`,
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>

      {step === 1 ? (
        <>
          <FormSection title="Sobre ti">
            <FormField
              label="Nombre completo *"
              value={form.applicant_name || ""}
              onChangeText={(t) => updateField("applicant_name", t)}
              placeholder="Como aparece en tu identificación"
              error={errors.applicant_name}
            />
          </FormSection>
          <FormSection title="Vivienda">
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-sm)", marginBottom: "var(--space-md)" }}>
              {HOUSE_TYPES.map((t) => (
                <FilterChip key={t} label={t} active={form.house_type === t} onPress={() => updateField("house_type", t)} />
              ))}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-sm)", marginBottom: "var(--space-md)" }}>
              {["Propia", "Renta"].map((t) => (
                <FilterChip
                  key={t}
                  label={t === "Propia" ? "Es propia" : "Rento"}
                  active={form.own_or_rent === t}
                  onPress={() => updateField("own_or_rent", t)}
                />
              ))}
            </div>
            <FormSwitch label="Tiene patio o jardín" value={form.has_yard} onChange={(v) => updateField("has_yard", v)} />
            {form.own_or_rent === "Renta" ? (
              <>
                <FormSwitch
                  label="Mi arrendador permite mascotas"
                  value={form.landlord_permission}
                  onChange={(v) => updateField("landlord_permission", v)}
                />
                {errors.landlord_permission ? (
                  <p style={{ fontSize: "var(--font-sm)", color: "var(--color-error)", margin: 0 }}>
                    {errors.landlord_permission}
                  </p>
                ) : null}
              </>
            ) : null}
          </FormSection>
        </>
      ) : null}

      {step === 2 ? (
        <>
          <FormSection title="Familia">
            <FormSwitch label="Hay niños en casa" value={form.has_children} onChange={(v) => updateField("has_children", v)} />
            {form.has_children ? (
              <FormField
                label="Edades de los niños"
                value={form.children_ages || ""}
                onChangeText={(t) => updateField("children_ages", t)}
                placeholder="Ej: 3 y 7 años"
              />
            ) : null}
            <FormField
              label="Otras mascotas"
              value={form.other_pets || ""}
              onChangeText={(t) => updateField("other_pets", t)}
              placeholder="Especie, raza y edad (déjalo vacío si no tienes)"
              multiline
            />
          </FormSection>
          <FormSection title="Rutina">
            <FormField
              label="Horas al día que pasaría sola"
              value={String(form.hours_alone ?? "")}
              onChangeText={(t) => {
                const digits = t.replace(/\D/g, "");
                updateField("hours_alone", digits === "" ? (undefined as unknown as number) : parseInt(digits, 10));
              }}
              keyboardType="number-pad"
              maxLength={2}
              placeholder="0 a 24"
              error={errors.hours_alone}
            />
          </FormSection>
        </>
      ) : null}

      {step === 3 ? (
        <FormSection title={`¿Por qué ${petName}?`}>
          <FormField
            label="¿Por qué quieres adoptar? *"
            value={form.reason}
            onChangeText={(t) => updateField("reason", t)}
            placeholder="Cuéntale a quien lo cuida cómo sería su vida contigo"
            multiline
            error={errors.reason}
          />
          <FormField
            label="Experiencia con mascotas"
            value={form.previous_experience || ""}
            onChangeText={(t) => updateField("previous_experience", t)}
            placeholder="Ej: He tenido perros toda mi vida"
            multiline
          />
          <FormSwitch
            label="Me comprometo con sus gastos"
            description="Comida, veterinario, vacunas y esterilización."
            value={form.financial_commitment}
            onChange={(v) => updateField("financial_commitment", v)}
          />
          {errors.financial_commitment ? (
            <p style={{ fontSize: "var(--font-sm)", color: "var(--color-error)", margin: 0 }}>
              {errors.financial_commitment}
            </p>
          ) : null}
        </FormSection>
      ) : null}

      <div className={local.footerActions}>
        {step > 1 ? (
          <Button label="Atrás" variant="secondary" onPress={handleBack} />
        ) : null}
        {step < 3 ? (
          <Button label="Continuar" onPress={handleNext} style={{ flex: 1.6 }} />
        ) : (
          <Button
            label="Enviar solicitud"
            icon={<Send size={18} />}
            onPress={handleSubmit}
            loading={loading}
            style={{ flex: 1.6 }}
          />
        )}
      </div>
    </ScreenContainer>
  );
}
