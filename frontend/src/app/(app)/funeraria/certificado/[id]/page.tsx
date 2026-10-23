"use client";

/**
 * Certificado de defunción. Espejo de `mobile/app/funeraria/certificado/[id].tsx`.
 */
import { useParams, useRouter } from "next/navigation";
import { FileText, Download, Calendar, Heart, Shield } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Card from "@/components/Card";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import { useDeathReport } from "@/hooks/funerary/useDeathReport";
import { cremationLabel } from "@/services/funerary";
import { formatDate } from "@/utils/formatters";
import local from "../../funeraria.module.css";

export default function CertificadoPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const deathId = params.id;
  const { certificate, isLoadingCertificate } = useDeathReport(deathId);

  const c = (certificate || {}) as Record<string, unknown>;

  return (
    <ScreenContainer>
      <ScreenHeader title="Certificado" subtitle="Certificado de defunción" />

      {isLoadingCertificate ? (
        <Skeleton height={320} borderRadius={16} />
      ) : !certificate ? (
        <EmptyState
          icon={<FileText size={28} />}
          title="No encontramos el certificado"
          subtitle="Puede que aún no esté disponible. Inténtalo más tarde."
          actionLabel="Volver"
          onAction={() => (window.history.length > 1 ? router.back() : router.replace("/funeraria"))}
        />
      ) : (
        <Card>
          <div className={local.certificate}>
            <span className={local.certificateIcon} aria-hidden>
              <Shield size={30} />
            </span>
            <p className={local.certificateTitle}>Certificado de defunción</p>
            <p className={local.certificateSubtitle}>
              Documento generado para el registro de la mascota
            </p>

            <div className={local.certificateMeta}>
              {c.date_of_death ? (
                <p className={local.certificateLine}>
                  <Calendar size={14} aria-hidden /> Fecha de defunción: {formatDate(String(c.date_of_death))}
                </p>
              ) : null}
              {c.cause_of_death ? (
                <p className={local.certificateLine}>
                  <Heart size={14} aria-hidden /> Causa: {String(c.cause_of_death)}
                </p>
              ) : null}
              {c.cremation_type ? (
                <p className={local.certificateLine}>
                  <FileText size={14} aria-hidden /> Cremación: {cremationLabel(String(c.cremation_type))}
                </p>
              ) : null}
              {c.urn_model ? (
                <p className={local.certificateLine}>
                  <FileText size={14} aria-hidden /> Urna: {String(c.urn_model)}
                </p>
              ) : null}
            </div>

            {typeof c.certificate_url === "string" && c.certificate_url ? (
              <a href={c.certificate_url} target="_blank" rel="noreferrer" style={{ width: "100%" }}>
                <Button label="Descargar certificado" icon={<Download size={18} />} />
              </a>
            ) : null}
          </div>
        </Card>
      )}

      <div style={{ marginTop: "1.25rem" }}>
        <Button
          label="Volver"
          variant="secondary"
          onPress={() => (window.history.length > 1 ? router.back() : router.replace("/funeraria"))}
        />
      </div>
    </ScreenContainer>
  );
}
