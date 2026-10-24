"use client";

/**
 * Verificaciones de identidad (`/admin/verificaciones`): cuentas con documentos por revisar. Muestra INE (frente y
 * reverso) y comprobante de domicilio con URL firmada; aprobar va directo y rechazar pide confirmación.
 * Espejo de `mobile/app/admin/verificaciones/index.tsx`.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileText, ImageOff, RefreshCw, ShieldCheck, XCircle } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import { SkeletonList } from "@/components/Skeleton";
import { getRoleColorFor, getRoleLabelFor } from "@/constants/roles";
import { Avatar, KYC_LABELS } from "@/features/admin/AdminKit";
import { useAdminVerifications, type PendingVerification } from "@/hooks/admin/useAdminVerifications";
import s from "@/features/admin/admin.module.css";

const isPdf = (url: string) => /\.pdf(\?|$)/i.test(url);

const fmt = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" }) : null;

function DocPreview({ label, url }: { label: string; url?: string | null }) {
  if (!url) {
    return (
      <div className={s.doc}>
        <span className={`${s.docImg} ${s.docPlaceholder}`}>
          <ImageOff size={24} aria-hidden />
          No lo subió
        </span>
        {label}
      </div>
    );
  }
  const pdf = isPdf(url);
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={s.doc} aria-label={`Abrir ${label} en otra pestaña`}>
      {pdf ? (
        <span className={`${s.docImg} ${s.docPlaceholder}`}>
          <FileText size={28} aria-hidden />
          Documento PDF
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- URL firmada temporal del bucket privado
        <img src={url} alt={label} className={s.docImg} />
      )}
      {label}
    </a>
  );
}

function VerificationCard({ user, busy, onAction }: { user: PendingVerification; busy: boolean; onAction: (status: "VERIFIED" | "REJECTED") => void }) {
  const name = user.full_name || user.email;
  const since = fmt(user.created_at);
  return (
    <section className={s.card}>
      <div className={s.kycHead}>
        <Link href={`/admin/usuarios/${user.id}`} className={`${s.who} ${s.cellLink}`}>
          <Avatar name={name} color={getRoleColorFor(user.role_name)} />
          <span className={s.cellMain}>
            <span className={s.cellTitle}>{user.full_name || "Sin nombre"}</span>
            <span className={s.cellSub}>
              {user.email}
              {since ? ` · desde ${since}` : ""}
            </span>
          </span>
        </Link>
        <span className={s.toolbarRow}>
          {user.role_name ? <Badge label={getRoleLabelFor(user.role_name)} color={getRoleColorFor(user.role_name)} size="sm" /> : null}
          <Badge label={KYC_LABELS.PENDING.label} color={KYC_LABELS.PENDING.color} size="sm" variant="outlined" />
        </span>
      </div>

      <div className={s.docs}>
        <DocPreview label="Identificación (frente)" url={user.id_front_url} />
        <DocPreview label="Identificación (reverso)" url={user.id_back_url} />
        <DocPreview label="Comprobante de domicilio" url={user.proof_of_address_url} />
      </div>

      <div className={s.toolbarRow}>
        <Button label="Aprobar identidad" icon={<CheckCircle2 size={16} />} fullWidth={false} onPress={() => onAction("VERIFIED")} loading={busy} />
        <Button label="Rechazar" icon={<XCircle size={16} />} variant="ghost" fullWidth={false} onPress={() => onAction("REJECTED")} disabled={busy} />
      </div>
    </section>
  );
}

export default function AdminVerificacionesPage() {
  const router = useRouter();
  const v = useAdminVerifications();
  const n = v.pendingUsers.length;

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Verificaciones"
        subtitle={v.isLoading ? "Identidades por revisar" : n ? `${n} ${n === 1 ? "identidad" : "identidades"} por revisar` : "Nada pendiente"}
        actions={[{ icon: RefreshCw, label: "Actualizar", onPress: () => v.refetch(), loading: v.isFetching && !v.isLoading }]}
      />

      {v.isLoading ? (
        <SkeletonList count={3} />
      ) : v.isError ? (
        <EmptyState
          icon={<XCircle size={28} />}
          title="No pudimos cargar las identidades"
          subtitle="Ocurrió un error al pedir las identidades pendientes. El detalle aparece arriba; vuelve a intentarlo."
          actionLabel="Reintentar"
          onAction={() => v.refetch()}
        />
      ) : n === 0 ? (
        <EmptyState
          icon={<ShieldCheck size={28} />}
          title="Todo al día"
          subtitle="No hay identidades por revisar. Cuando alguien suba sus documentos para ser profesional aparecerá aquí."
          actionLabel="Ver usuarios"
          onAction={() => router.push("/admin/usuarios")}
        />
      ) : (
        <div className={s.kycList}>
          {v.pendingUsers.map((user) => (
            <VerificationCard
              key={user.id}
              user={user}
              busy={v.busyId === user.id}
              onAction={(status) => v.handleAction(user.id, user.full_name || user.email, status)}
            />
          ))}
        </div>
      )}
    </ScreenContainer>
  );
}
