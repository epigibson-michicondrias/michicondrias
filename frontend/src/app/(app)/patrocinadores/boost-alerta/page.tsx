"use client";

/**
 * Impulsar alerta (`/patrocinadores/boost-alerta`): amplía el alcance de un reporte de mascota perdida.
 * Espejo de `mobile/app/patrocinadores/boost-alerta.tsx`. Avisa antes de enviar que el cobro y la difusión
 * ampliada todavía no se procesan (nada simulado).
 */
import { Check, Info, MapPin, PawPrint } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import FormField from "@/components/FormField";
import FormSection from "@/components/forms/FormSection";
import RoleGuard from "@/components/RoleGuard";
import { SkeletonList } from "@/components/Skeleton";
import { useCampaignForm } from "@/hooks/sponsors/useCampaignForm";
import s from "@/features/patrocinadores/patrocinadores.module.css";

export default function BoostAlertaPage() {
  return (
    <RoleGuard roles={["patrocinador"]}>
      <BoostAlerta />
    </RoleGuard>
  );
}

function BoostAlerta() {
  const {
    boostForm, boostErrors, updateBoostField, handleSubmitBoost, isSubmittingBoost, lostPetReports, isLoadingReports,
  } = useCampaignForm("boost");
  const radius = Number(boostForm.extra_radius_meters || 0);

  return (
    <ScreenContainer>
      <ScreenHeader title="Impulsar alerta" subtitle="Amplía el alcance de una alerta de mascota perdida" />

      <div className={s.form}>
        <FormSection title="Selecciona un reporte">
          {isLoadingReports ? (
            <SkeletonList count={3} />
          ) : lostPetReports.length === 0 ? (
            <EmptyState
              icon={<PawPrint size={28} />}
              title="No hay reportes activos"
              subtitle="Cuando alguien reporte una mascota perdida podrás impulsar su alerta."
            />
          ) : (
            <div className={s.reports} role="radiogroup" aria-label="Reportes de mascotas perdidas">
              {lostPetReports.map((r) => {
                const selected = boostForm.lost_pet_report_id === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={[s.report, selected && s.reportSelected].filter(Boolean).join(" ")}
                    onClick={() => updateBoostField("lost_pet_report_id", r.id)}
                  >
                    <PawPrint size={20} aria-hidden />
                    <span>
                      <span className={s.reportName}>{r.pet_name}</span>
                      <br />
                      <span className={s.reportMeta}>
                        {r.species}
                        {r.breed ? ` · ${r.breed}` : ""}
                        {r.last_seen_location ? (
                          <>
                            {" · "}
                            <MapPin size={12} aria-hidden /> {r.last_seen_location}
                          </>
                        ) : null}
                      </span>
                    </span>
                    {selected ? (
                      <span className={s.check}>
                        <Check size={14} strokeWidth={3} />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
          {boostErrors.lost_pet_report_id ? (
            <span className={s.fieldError}>{boostErrors.lost_pet_report_id}</span>
          ) : null}
        </FormSection>

        <FormSection title="Configuración del impulso">
          <FormField
            label="Radio extra (metros)"
            value={boostForm.extra_radius_meters}
            onChangeText={(v) => updateBoostField("extra_radius_meters", v.replace(/\D/g, ""))}
            keyboardType="numeric"
            error={boostErrors.extra_radius_meters}
          />
          <span className={s.hint}>
            Radio adicional: {(radius / 1000).toLocaleString("es-MX", { maximumFractionDigits: 1 })} km
          </span>
          <FormField
            label="Monto (MXN) *"
            value={boostForm.amount_paid}
            onChangeText={(v) => updateBoostField("amount_paid", v.replace(/[^\d.]/g, ""))}
            placeholder="200"
            keyboardType="decimal-pad"
            error={boostErrors.amount_paid}
          />
        </FormSection>

        <div className={s.notice}>
          <Info size={18} className={s.noticeIcon} aria-hidden />
          <span>
            Por ahora el impulso solo se registra: el cobro no se procesa y la difusión ampliada a usuarios cercanos
            todavía no está activa.
          </span>
        </div>

        <Button
          label="Registrar impulso"
          onPress={handleSubmitBoost}
          loading={isSubmittingBoost}
          disabled={isSubmittingBoost || lostPetReports.length === 0}
        />
      </div>
    </ScreenContainer>
  );
}
