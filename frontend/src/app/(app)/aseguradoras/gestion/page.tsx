"use client";

/**
 * Gestión de reclamos (aseguradora). Espejo de `mobile/app/aseguradoras/gestion.tsx` y `/reclamos.tsx`.
 */
import { useRouter } from "next/navigation";
import { ShieldCheck, ShieldX, FileText, ExternalLink, Inbox } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import RoleGuard from "@/components/RoleGuard";
import EmptyState from "@/components/EmptyState";
import { SkeletonList } from "@/components/Skeleton";
import { useInsuranceAdmin } from "@/hooks/insurance/useInsuranceAdmin";
import { formatCurrency, sentenceCase } from "@/utils/formatters";
import local from "../aseguradoras.module.css";

function statusBadge(status?: string | null) {
  const s = status || "pending";
  if (s === "approved") return <Badge label="Aprobado" color="var(--color-success)" />;
  if (s === "rejected") return <Badge label="Rechazado" color="var(--color-error)" />;
  return <Badge label="Pendiente" color="var(--color-warning)" />;
}

function GestionContent() {
  const router = useRouter();
  const { allClaims, isLoadingClaims, updateClaimStatus, isUpdatingClaim } = useInsuranceAdmin();

  return (
    <ScreenContainer>
      <ScreenHeader title="Reclamos" subtitle="Gestión de reclamos de seguros" />

      {isLoadingClaims ? (
        <SkeletonList count={3} />
      ) : allClaims.length === 0 ? (
        <EmptyState
          icon={<Inbox size={28} />}
          title="No hay reclamos pendientes"
          subtitle="Los reclamos de tus asegurados aparecerán aquí"
        />
      ) : (
        <div className={local.list}>
          {allClaims.map((claim) => {
            const isPending = !claim.status || claim.status === "pending";
            return (
              <Card key={claim.id}>
                <div className={local.claimCard}>
                  <div className={local.petHeader}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className={local.claimTitle}>
                        {claim.pet_name ? `Mascota: ${claim.pet_name}` : `Reclamo #${claim.id.slice(0, 8)}`}
                      </p>
                      <p className={local.claimMeta}>
                        {claim.policy_number ? `Póliza ${claim.policy_number} · ` : ""}
                        Monto: {formatCurrency(claim.amount_claimed)}
                      </p>
                    </div>
                    {statusBadge(claim.status)}
                  </div>

                  {claim.reason ? (
                    <p className={local.claimMeta}>{claim.reason}</p>
                  ) : null}

                  {claim.medical_receipt_url ? (
                    <a
                      className={local.policyLine}
                      href={claim.medical_receipt_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "var(--color-primary)" }}
                    >
                      <ExternalLink size={14} aria-hidden /> Ver comprobante
                    </a>
                  ) : null}

                  {isPending ? (
                    <div className={local.rowActions}>
                      <Button
                        label="Aprobar"
                        size="sm"
                        fullWidth={false}
                        loading={isUpdatingClaim}
                        onPress={() => updateClaimStatus(claim.id, "approved")}
                        icon={<ShieldCheck size={16} />}
                      />
                      <Button
                        label="Rechazar"
                        size="sm"
                        variant="danger"
                        fullWidth={false}
                        loading={isUpdatingClaim}
                        onPress={() => updateClaimStatus(claim.id, "rejected")}
                        icon={<ShieldX size={16} />}
                      />
                    </div>
                  ) : (
                    <p className={local.claimMeta}>Estado: {sentenceCase(claim.status)}</p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: "1.25rem" }}>
        <Button
          label="Volver"
          variant="secondary"
          onPress={() => (window.history.length > 1 ? router.back() : router.replace("/aseguradoras"))}
          icon={<FileText size={18} />}
        />
      </div>
    </ScreenContainer>
  );
}

export default function GestionAseguradorasPage() {
  return (
    <RoleGuard roles={["aseguradora"]} message="Esta sección es para cuentas de aseguradora.">
      <GestionContent />
    </RoleGuard>
  );
}
