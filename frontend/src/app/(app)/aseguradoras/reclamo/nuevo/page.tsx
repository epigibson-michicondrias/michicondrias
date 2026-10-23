"use client";

/**
 * Nuevo reclamo de seguro. Espejo de `mobile/app/aseguradoras/reclamo/nuevo.tsx`.
 * Acepta `?pet_id=`.
 */
import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Shield } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Button from "@/components/Button";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import FormField from "@/components/FormField";
import FormSection from "@/components/forms/FormSection";
import FormSelect from "@/components/forms/FormSelect";
import FormImagePicker from "@/components/forms/FormImagePicker";
import EmptyState from "@/components/EmptyState";
import { SkeletonList } from "@/components/Skeleton";
import { useInsuranceClaim } from "@/hooks/insurance/useInsuranceClaim";
import { formatDate, formatCurrency } from "@/utils/formatters";
import local from "../../aseguradoras.module.css";

function ReclamoContent() {
  const router = useRouter();
  const {
    form,
    updateField,
    pets,
    selectedPetId,
    activePolicy,
    isLoading,
    isLoadingPolicy,
    isSubmitting,
    receiptFile,
    setReceiptFile,
    setSelectedPetId,
    handleSubmit,
  } = useInsuranceClaim();
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const amountError =
    touched.amount_claimed && (!form.amount_claimed || Number.isNaN(parseFloat(form.amount_claimed)))
      ? "Ingresa un monto mayor a cero."
      : null;
  const reasonError = touched.reason && !form.reason.trim() ? "Describe el motivo del reclamo." : null;

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Presentar reclamo"
        subtitle="La aseguradora revisará tu caso"
      />

      {isLoading ? (
        <SkeletonList count={2} />
      ) : pets.length === 0 ? (
        <EmptyState
          icon={<Shield size={28} />}
          title="No tienes mascotas registradas"
          subtitle="Registra una mascota con póliza activa para presentar un reclamo."
          actionLabel="Registrar mascota"
          onAction={() => router.push("/mascotas")}
        />
      ) : (
        <>
          <FormSection title="Mascota y póliza">
            <FormSelect
              label="Mascota *"
              options={pets.map((p) => ({ label: p.name, value: p.id }))}
              value={selectedPetId || ""}
              onChange={setSelectedPetId}
            />
            {isLoadingPolicy ? (
              <SkeletonList count={1} />
            ) : activePolicy ? (
              <Card>
                <div className={local.petRow}>
                  <div className={local.petHeader}>
                    <span className={local.petIcon} aria-hidden>
                      <Shield size={20} />
                    </span>
                    <div style={{ flex: 1 }}>
                      <p className={local.petName}>Póliza {activePolicy.policy_number}</p>
                      <p className={local.petMeta}>
                        Prima {formatCurrency(activePolicy.monthly_premium)}/mes · Vigente hasta{" "}
                        {formatDate(activePolicy.end_date)}
                      </p>
                    </div>
                    <Badge label="Activa" color="var(--color-success)" />
                  </div>
                </div>
              </Card>
            ) : selectedPetId ? (
              <EmptyState
                icon={<Shield size={28} />}
                title="Sin póliza activa"
                subtitle="La mascota seleccionada no tiene una póliza activa."
                actionLabel="Ver planes"
                onAction={() => router.push("/aseguradoras")}
              />
            ) : null}
          </FormSection>

          <FormSection title="Detalle del reclamo">
            <FormField
              label="Motivo *"
              value={form.reason}
              onChangeText={(v) => updateField("reason", v)}
              placeholder="Describe qué ocurrió con tu mascota"
              multiline
              numberOfLines={3}
              error={reasonError}
              onBlur={() => setTouched((t) => ({ ...t, reason: true }))}
            />
            <FormField
              label="Monto reclamado (MXN) *"
              value={form.amount_claimed}
              onChangeText={(v) => updateField("amount_claimed", v)}
              placeholder="Ej. 1500"
              keyboardType="decimal-pad"
              error={amountError}
              onBlur={() => setTouched((t) => ({ ...t, amount_claimed: true }))}
            />
            <FormImagePicker
              label="Comprobante médico (opcional)"
              preview={receiptFile ? URL.createObjectURL(receiptFile) : null}
              onChange={setReceiptFile}
            />
          </FormSection>

          <Button
            label={isSubmitting ? "Enviando…" : "Enviar reclamo"}
            onPress={handleSubmit}
            loading={isSubmitting}
            icon={<FileText size={18} />}
          />
        </>
      )}
    </ScreenContainer>
  );
}

export default function NuevoReclamoPage() {
  return (
    <Suspense
      fallback={
        <ScreenContainer>
          <ScreenHeader title="Presentar reclamo" />
        </ScreenContainer>
      }
    >
      <ReclamoContent />
    </Suspense>
  );
}
