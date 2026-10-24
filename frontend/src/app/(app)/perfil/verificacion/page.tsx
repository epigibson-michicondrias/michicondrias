"use client";

/**
 * Verificación KYC — espejo de `mobile/app/perfil/verificacion.tsx`.
 */
import { AlertCircle, Camera, CheckCircle, Clock, ShieldCheck, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useKYC } from "@/hooks/perfil/useKYC";
import type { VerificationStatus } from "@/types/auth";
import s from "../perfil.module.css";

const STATE_COPY: Record<VerificationStatus, {
  icon: typeof CheckCircle;
  tone: "ok" | "warn" | "bad" | "muted";
  title: string;
  desc: string;
  action?: string;
  route?: string;
}> = {
  UNVERIFIED: {
    icon: ShieldCheck,
    tone: "muted",
    title: "Cuenta no verificada",
    desc: "Sube tus documentos para poder ofrecer servicios profesionales.",
  },
  PENDING: {
    icon: Clock,
    tone: "warn",
    title: "Verificación en curso",
    desc: "Un administrador revisa tus documentos. Suele tomar de 24 a 48 horas.",
  },
  VERIFIED: {
    icon: CheckCircle,
    tone: "ok",
    title: "Cuenta verificada",
    desc: "Tu identidad está confirmada. Ya puedes activar tu cuenta profesional.",
    action: "Activar cuenta profesional",
    route: "/perfil/partner",
  },
  REJECTED: {
    icon: AlertCircle,
    tone: "bad",
    title: "Verificación rechazada",
    desc: "Vuelve a subir tus documentos para poder continuar.",
    action: "Reintentar",
    route: "/perfil/verificacion",
  },
};

export default function VerificacionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const status = (user?.verification_status || "UNVERIFIED") as VerificationStatus;
  // Un estado inesperado del backend no debe dejar la pantalla en blanco: se cae a UNVERIFIED.
  const copy = STATE_COPY[status] ?? STATE_COPY.UNVERIFIED;
  const Icon = copy.icon;
  const { documents, setDocumentFile, allDocumentsSelected, handleSubmit, isSubmitting, uploadProgress } = useKYC();
  const showForm = status === "UNVERIFIED" || status === "REJECTED";

  return (
    <ScreenContainer>
      <ScreenHeader title="Verificación" subtitle="Confirma tu identidad" />

      <Card>
        <div className={s.account}>
          <div className={`${s.avatar} ${copy.tone === "ok" ? s.avatarOk : ""}`} aria-hidden>
            <Icon size={24} />
          </div>
          <div className={s.accountBody}>
            <p className={s.accountName}>{copy.title}</p>
            <p className={s.accountEmail}>{copy.desc}</p>
          </div>
        </div>
        {copy.action && copy.route && (
          <Button
            label={copy.action}
            variant="secondary"
            onPress={() => router.push(copy.route!)}
          />
        )}
      </Card>

      {showForm && (
        <>
          <section className={s.docSection}>
            <h2 className={s.docTitle}>Documentos requeridos</h2>
            {documents.map((doc) => (
              <div key={doc.key} className={s.docCard}>
                <div className={s.docInfo}>
                  <Camera size={20} aria-hidden />
                  <div>
                    <p className={s.docLabel}>{doc.label}</p>
                    <p className={s.accountEmail}>{doc.hint}</p>
                  </div>
                </div>
                <label className={s.docBtn}>
                  <Upload size={16} aria-hidden />
                  {doc.file ? "Cambiar" : "Subir"}
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className={s.docInput}
                    onChange={(e) => setDocumentFile(doc.key, e.target.files?.[0] ?? null)}
                  />
                </label>
                {doc.preview && (
                  // eslint-disable-next-line @next/next/no-img-element -- previsualización local
                  <img src={doc.preview} alt={doc.label} className={s.docPreview} />
                )}
              </div>
            ))}
          </section>

          <p className={s.accountEmail}>
            Tus datos están protegidos y solo se usan para verificar tu identidad.
          </p>

          <Button
            label={isSubmitting ? `Enviando… ${Math.round(uploadProgress * 100)}%` : "Enviar para revisión"}
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={!allDocumentsSelected}
          />
        </>
      )}
    </ScreenContainer>
  );
}
