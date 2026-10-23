"use client";

/**
 * Reporte de Defunción — registra el fallecimiento de una mascota.
 * Espejo de `mobile/app/funeraria/reporte-defuncion.tsx`.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Info, AlertTriangle, PawPrint } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Button from "@/components/Button";
import FormField from "@/components/FormField";
import FormSection from "@/components/forms/FormSection";
import FormSelect from "@/components/forms/FormSelect";
import EmptyState from "@/components/EmptyState";
import { SkeletonList } from "@/components/Skeleton";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getUserPets } from "@/services/mascotas";
import { CREMATION_OPTIONS } from "@/services/funerary";
import { useDeathReport } from "@/hooks/funerary/useDeathReport";
import local from "../funeraria.module.css";

export default function ReporteDefuncionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { form, updateForm, handleSubmitReport, isSubmitting } = useDeathReport();

  const { data: pets = [], isLoading } = useQuery({
    queryKey: ["user-pets", user?.id],
    queryFn: () => (user?.id ? getUserPets(user.id) : Promise.resolve([])),
    enabled: !!user?.id,
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const today = new Date().toISOString().slice(0, 10);
  const dateError =
    touched.date_of_death && form.date_of_death > today
      ? "La fecha de defunción no puede ser futura."
      : null;

  return (
    <ScreenContainer>
      <ScreenHeader title="Reporte de Defunción" subtitle="Registra el fallecimiento de una mascota" />

      {isLoading ? (
        <SkeletonList count={2} />
      ) : pets.length === 0 ? (
        <EmptyState
          icon={<PawPrint size={28} />}
          title="No tienes mascotas registradas"
          subtitle="Registra una mascota para poder generar el reporte."
          actionLabel="Registrar mascota"
          onAction={() => router.push("/mascotas")}
        />
      ) : (
        <>
          <div className={local.noteBox}>
            <AlertTriangle size={16} aria-hidden />
            <span>
              Este reporte registra el fallecimiento de tu mascota y permite generar el certificado de
              defunción. Tómate el tiempo que necesites.
            </span>
          </div>

          <FormSection title="Datos del reporte">
            <FormSelect
              label="Mascota *"
              options={pets.map((p) => ({ label: p.name, value: p.id }))}
              value={form.pet_id}
              onChange={(v) => updateForm("pet_id", v)}
            />
            <FormField
              label="Fecha de Defunción *"
              value={form.date_of_death}
              onChangeText={(v) => updateForm("date_of_death", v)}
              placeholder="AAAA-MM-DD"
              error={dateError}
              onBlur={() => setTouched((t) => ({ ...t, date_of_death: true }))}
            />
            <FormField
              label="Causa de defunción"
              value={form.cause_of_death || ""}
              onChangeText={(v) => updateForm("cause_of_death", v)}
              placeholder="Describe la causa..."
              multiline
              numberOfLines={3}
            />
            <FormSelect
              label="Tipo de cremación"
              options={CREMATION_OPTIONS}
              value={form.cremation_type || "individual"}
              onChange={(v) => updateForm("cremation_type", v)}
              horizontal
            />
            <FormField
              label="Modelo de urna"
              value={form.urn_model || ""}
              onChangeText={(v) => updateForm("urn_model", v)}
              placeholder="Ej. Urna de madera natural"
            />
            <FormField
              label="Notas"
              value={form.notes || ""}
              onChangeText={(v) => updateForm("notes", v)}
              placeholder="Información del veterinario, observaciones..."
              multiline
              numberOfLines={3}
            />
          </FormSection>

          <div className={local.noteBox}>
            <Info size={16} aria-hidden />
            <span>
              La mascota y la fecha de defunción son obligatorias. El resto de los campos es opcional.
            </span>
          </div>

          <div style={{ marginTop: "1rem" }}>
            <Button
              label={isSubmitting ? "Registrando..." : "Registrar Reporte"}
              onPress={handleSubmitReport}
              loading={isSubmitting}
              icon={<FileText size={18} />}
            />
          </div>
        </>
      )}
    </ScreenContainer>
  );
}
