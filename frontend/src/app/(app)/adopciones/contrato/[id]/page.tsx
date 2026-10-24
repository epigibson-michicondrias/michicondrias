"use client";

/**
 * Contrato de adopción (`/adopciones/contrato/[id]`): el refugio firma o rechaza la postulación.
 * Espejo de `mobile/app/adopciones/contrato/[id].tsx`.
 */
import { FileCheck, PenTool } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Button from "@/components/Button";
import FormSwitch from "@/components/forms/FormSwitch";
import { useAdoptionContract } from "@/hooks/adopciones/useAdoptionContract";
import local from "@/features/adopciones/adopciones.module.css";

export default function AdoptionContractPage() {
  const { terms, agreed, setAgreed, handleSign, handleReject, isRejecting, isSigning } = useAdoptionContract();

  return (
    <ScreenContainer>
      <ScreenHeader title="Contrato de adopción" />

      <div className={local.contractHeader}>
        <FileCheck size={32} color="var(--color-primary)" aria-hidden />
        <p className={local.contractTitle}>Contrato de Adopción Responsable</p>
        <p className={local.contractSubtitle}>El refugio firma este contrato para cerrar la postulación</p>
      </div>

      <div className={local.contractBox}>
        <p className={local.contractText}>{terms}</p>
      </div>

      <FormSwitch
        variant="checkbox"
        label="He revisado los términos y los firmo como refugio"
        description="Al marcar esta casilla, confirmas que entiendes y aceptas todas las condiciones"
        value={agreed}
        onChange={setAgreed}
      />

      <div className={local.contractActions}>
        <Button
          label="Rechazar"
          variant="secondary"
          onPress={handleReject}
          loading={isRejecting}
          disabled={isSigning}
        />
        <Button
          label="Firmar contrato"
          icon={<PenTool size={16} />}
          onPress={handleSign}
          loading={isSigning}
          disabled={!agreed || isRejecting}
        />
      </div>
    </ScreenContainer>
  );
}
