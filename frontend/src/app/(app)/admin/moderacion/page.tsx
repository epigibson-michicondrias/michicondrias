"use client";

/**
 * Moderación (`/admin/moderacion`): contenido pendiente de aprobar en 6 colas (adopciones, solicitudes, perdidas,
 * clínicas, veterinarios y productos). Aprobar va directo; rechazar pide confirmación (lo hace el hook).
 * Espejo de `mobile/app/admin/moderacion/index.tsx`.
 */
import type { ComponentType } from "react";
import { useRouter } from "next/navigation";
import { Building2, CheckCircle2, ClipboardList, Heart, ImageOff, MapPin, Package, RefreshCw, Stethoscope, XCircle } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import FilterChip from "@/components/FilterChip";
import { SkeletonList } from "@/components/Skeleton";
import { TAB_ORDER, useAdminModeration, type ModerationItem, type TabType } from "@/hooks/admin/useAdminModeration";
import s from "@/features/admin/admin.module.css";

const TAB_META: Record<TabType, { label: string; icon: ComponentType<{ size?: number }>; empty: string }> = {
  adopciones: { label: "Adopciones", icon: Heart, empty: "No hay mascotas en adopción esperando revisión." },
  solicitudes: { label: "Solicitudes de adopción", icon: ClipboardList, empty: "No hay solicitudes de adopción por revisar." },
  perdidas: { label: "Mascotas perdidas", icon: MapPin, empty: "No hay reportes de mascotas perdidas por revisar." },
  directorio: { label: "Clínicas", icon: Building2, empty: "No hay clínicas esperando aprobación." },
  veterinarios: { label: "Veterinarios", icon: Stethoscope, empty: "No hay veterinarios esperando aprobación." },
  ecommerce: { label: "Productos", icon: Package, empty: "No hay productos esperando aprobación." },
};

const fmt = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" }) : null;

function ModerationCard({ item, busy, disabled, onAction }: { item: ModerationItem; busy: boolean; disabled: boolean; onAction: (a: "approve" | "reject") => void }) {
  const date = fmt(item.createdAt);
  return (
    <article className={s.modCard}>
      {item.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- imagen del storage
        <img src={item.imageUrl} alt={item.title} className={s.modImg} loading="lazy" />
      ) : (
        <span className={s.modImg} aria-hidden>
          <ImageOff size={28} />
        </span>
      )}
      <div className={s.modBody}>
        <span className={s.cellTitle}>{item.title}</span>
        <span className={s.cellSub}>{item.subtitle}</span>
        <p className={s.modDetail}>{item.detail}</p>
        {date ? <span className={s.muted}>Enviado el {date}</span> : null}
      </div>
      <div className={s.modActions}>
        <Button label="Rechazar" icon={<XCircle size={16} />} variant="ghost" onPress={() => onAction("reject")} disabled={busy || disabled} />
        <Button label="Aprobar" icon={<CheckCircle2 size={16} />} onPress={() => onAction("approve")} loading={busy} disabled={disabled} />
      </div>
    </article>
  );
}

export default function AdminModeracionPage() {
  const router = useRouter();
  const m = useAdminModeration();
  const total = TAB_ORDER.reduce((acc, t) => acc + m.counts[t], 0);
  const meta = TAB_META[m.activeTab];
  const MetaIcon = meta.icon;
  const nextWithItems = TAB_ORDER.find((t) => t !== m.activeTab && m.counts[t] > 0);

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Moderación"
        subtitle={m.isLoading ? "Cargando pendientes…" : total ? `${total} ${total === 1 ? "elemento" : "elementos"} por revisar` : "Nada pendiente"}
        actions={[{ icon: RefreshCw, label: "Actualizar", onPress: m.refetch, loading: m.isFetching && !m.isLoading }]}
      />

      <div className={s.toolbar}>
        <div className={s.chips} role="group" aria-label="Tipo de contenido">
          {TAB_ORDER.map((t) => (
            <FilterChip key={t} label={TAB_META[t].label} count={m.counts[t]} active={m.activeTab === t} onPress={() => m.setActiveTab(t)} />
          ))}
        </div>
      </div>

      {m.isLoading ? (
        <SkeletonList count={4} />
      ) : m.isError ? (
        <EmptyState
          icon={<XCircle size={28} />}
          title="No pudimos cargar la cola"
          subtitle="Ocurrió un error al pedir el contenido pendiente. El detalle aparece arriba; vuelve a intentarlo."
          actionLabel="Reintentar"
          onAction={m.refetch}
        />
      ) : m.items.length === 0 ? (
        <EmptyState
          icon={<MetaIcon size={28} />}
          title={`${meta.label}: todo al día`}
          subtitle={meta.empty}
          actionLabel={nextWithItems ? `Revisar ${TAB_META[nextWithItems].label.toLowerCase()}` : "Volver al panel"}
          onAction={nextWithItems ? () => m.setActiveTab(nextWithItems) : () => router.push("/admin")}
        />
      ) : (
        <div className={s.modGrid}>
          {m.items.map((item) => (
            <ModerationCard
              key={item.id}
              item={item}
              busy={m.busyId === item.id}
              disabled={!!m.busyId && m.busyId !== item.id}
              onAction={(a) => m.handleAction(a, item)}
            />
          ))}
        </div>
      )}
    </ScreenContainer>
  );
}
