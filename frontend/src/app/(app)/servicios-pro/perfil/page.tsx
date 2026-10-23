"use client";

/**
 * Mi perfil de servicio (`/servicios-pro/perfil`): lo que ven los dueños al buscar paseador o cuidador.
 * Espejo de `mobile/app/servicios-pro/perfil.tsx`.
 */
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import FormField from "@/components/FormField";
import FormSection from "@/components/forms/FormSection";
import FormSwitch from "@/components/forms/FormSwitch";
import RoleGuard from "@/components/RoleGuard";
import { SkeletonList } from "@/components/Skeleton";
import { useServiceProfile } from "@/hooks/servicios-pro/useServiceProfile";

const money = (v: string) => v.replace(/[^\d.]/g, "");

export default function ServiceProfilePage() {
  return (
    <RoleGuard roles={["paseador", "cuidador"]}>
      <ServiceProfile />
    </RoleGuard>
  );
}

function ServiceProfile() {
  const router = useRouter();
  const { isWalker, hasProfile, form, updateField, saving, isLoading, handleSave } = useServiceProfile();
  const title = "Mi perfil de servicio";

  if (isLoading) {
    return (
      <ScreenContainer>
        <ScreenHeader title={title} />
        <SkeletonList count={4} />
      </ScreenContainer>
    );
  }

  if (!hasProfile) {
    const base = isWalker ? "/paseadores" : "/cuidadores";
    return (
      <ScreenContainer>
        <ScreenHeader title={title} />
        <EmptyState
          icon={<UserPlus size={28} />}
          title="Aún no tienes perfil publicado"
          subtitle="Crea tu perfil para que los dueños te encuentren."
          actionLabel="Crear mi perfil"
          onAction={() => router.push(`${base}/registro`)}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScreenHeader
        title={title}
        subtitle={isWalker ? "Lo que ven los dueños al buscar paseador" : "Lo que ven los dueños al buscar cuidador"}
        module={isWalker ? "paseadores" : "cuidadores"}
      />

      <div style={{ display: "grid", gap: "var(--space-xxl)", paddingBottom: "var(--space-xxl)" }}>
        <FormSection title="Visibilidad">
          <FormSwitch
            label={form.is_active ? "Visible para nuevos clientes" : "Perfil oculto"}
            description="Ocúltalo cuando no puedas recibir solicitudes (vacaciones, agenda llena)."
            value={form.is_active}
            onChange={(v) => updateField("is_active", v)}
          />
        </FormSection>

        <FormSection title="Sobre ti">
          <FormField
            label="Nombre que verán los clientes"
            value={form.display_name}
            onChangeText={(v) => updateField("display_name", v)}
            placeholder={isWalker ? "Ej. Juan, paseador en Coyoacán" : "Ej. Ana, cuidadora en Coyoacán"}
          />
          <FormField
            label="Ubicación"
            value={form.location}
            onChangeText={(v) => updateField("location", v)}
            placeholder="CDMX, Coyoacán"
          />
          <FormField
            label="Experiencia"
            value={form.bio}
            onChangeText={(v) => updateField("bio", v)}
            placeholder="Años de experiencia, razas que conoces, certificaciones…"
            multiline
          />
        </FormSection>

        <FormSection title="Tarifas (MXN)">
          <FormField
            label={isWalker ? "Por paseo" : "Por día (hospedaje)"}
            value={form.price_a}
            onChangeText={(v) => updateField("price_a", money(v))}
            keyboardType="decimal-pad"
            placeholder="0"
          />
          <FormField
            label={isWalker ? "Por hora" : "Por visita"}
            value={form.price_b}
            onChangeText={(v) => updateField("price_b", money(v))}
            keyboardType="decimal-pad"
            placeholder="0"
          />
        </FormSection>

        <FormSection title="Mascotas que aceptas">
          <FormSwitch label="Gatos" value={form.accepts_cats} onChange={(v) => updateField("accepts_cats", v)} variant="checkbox" />
          <FormSwitch label="Perros" value={form.accepts_dogs} onChange={(v) => updateField("accepts_dogs", v)} variant="checkbox" />
        </FormSection>

        <Button label="Guardar perfil" onPress={handleSave} loading={saving} disabled={saving} />
      </div>
    </ScreenContainer>
  );
}
