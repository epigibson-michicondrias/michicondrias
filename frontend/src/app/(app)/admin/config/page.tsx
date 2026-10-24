"use client";

/**
 * Configuración del sistema (`/admin/config`): interruptores globales, estado de la última sincronización y acciones
 * de mantenimiento con confirmación. Espejo de `mobile/app/admin/config.tsx`.
 */
import { Database, Trash2 } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Button from "@/components/Button";
import FormSection from "@/components/forms/FormSection";
import FormSwitch from "@/components/forms/FormSwitch";
import { Skeleton } from "@/components/Skeleton";
import { useAdminConfig, type ToggleKey } from "@/hooks/admin/useAdminConfig";
import s from "@/features/admin/admin.module.css";

const SWITCHES: { section: string; items: { key: ToggleKey; label: string; description: string }[] }[] = [
  {
    section: "Estado de la plataforma",
    items: [
      {
        key: "maintenance_mode",
        label: "Modo mantenimiento",
        description: "Marca la plataforma como en mantenimiento, para pausar el uso mientras se hacen cambios.",
      },
      {
        key: "debug_mode",
        label: "Modo depuración",
        description: "Pide registros más detallados para investigar errores. Déjalo apagado en uso normal.",
      },
    ],
  },
  {
    section: "Servicios",
    items: [
      {
        key: "ota_updates_enabled",
        label: "Actualizaciones automáticas",
        description: "Permite que la app móvil reciba mejoras sin pasar por la tienda de aplicaciones.",
      },
      {
        key: "push_notifications_enabled",
        label: "Notificaciones push",
        description: "Permite enviar avisos al teléfono de los usuarios (citas, mensajes, adopciones).",
      },
    ],
  },
];

const DATE_FMT = new Intl.DateTimeFormat("es-MX", { dateStyle: "long", timeStyle: "short" });

/** El backend guarda la fecha en UTC sin zona ("2026-10-23T18:04:11"). */
function formatSync(iso: string): string {
  const d = new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(iso) ? iso : `${iso}Z`);
  return Number.isNaN(d.getTime()) ? iso : DATE_FMT.format(d);
}

function ConfigSkeleton() {
  return (
    <div className={s.content} role="status" aria-label="Cargando">
      {Array.from({ length: 2 }, (_, i) => (
        <div key={i} className={s.card}>
          <Skeleton width="35%" height={12} />
          <Skeleton height={44} borderRadius={12} />
          <Skeleton height={44} borderRadius={12} />
        </div>
      ))}
    </div>
  );
}

export default function AdminConfigPage() {
  const { currentSettings, isLoading, toggleSetting, updatingKey, syncDatabase, clearCache, isSyncing, isClearing, lastSyncResult, tableLabel } =
    useAdminConfig();

  return (
    <ScreenContainer>
      <ScreenHeader title="Configuración" subtitle="Ajustes globales de la plataforma" />

      {isLoading ? (
        <ConfigSkeleton />
      ) : (
        <div className={s.content}>
          {SWITCHES.map((group) => (
            <FormSection key={group.section} title={group.section}>
              {group.items.map((item) => (
                <FormSwitch
                  key={item.key}
                  label={item.label}
                  description={item.description}
                  value={!!currentSettings[item.key]}
                  onChange={() => {
                    if (updatingKey !== item.key) toggleSetting(item.key);
                  }}
                />
              ))}
            </FormSection>
          ))}

          <section className={s.card} aria-labelledby="maint-title">
            <h2 id="maint-title" className={s.cardTitle}>Datos y caché</h2>
            <dl className={s.kv}>
              <dt>Última sincronización</dt>
              <dd>{currentSettings.last_sync ? formatSync(currentSettings.last_sync) : "Nunca"}</dd>
              <dt>Versión de caché</dt>
              <dd>{currentSettings.cache_version || "Sin dato"}</dd>
            </dl>
            {lastSyncResult ? (
              <dl className={s.kv} role="status" aria-label="Resultado de la sincronización">
                <dt>Registros contados</dt>
                <dd>
                  {Object.entries(lastSyncResult.counts)
                    .map(([table, n]) => `${tableLabel(table)}: ${n == null ? "—" : n}`)
                    .join(" · ")}
                </dd>
              </dl>
            ) : null}
            <div className={s.configActions}>
              <Button
                label="Sincronizar base de datos"
                icon={<Database size={18} />}
                variant="secondary"
                fullWidth={false}
                loading={isSyncing}
                disabled={isSyncing}
                onPress={syncDatabase}
              />
              <Button
                label="Limpiar caché"
                icon={<Trash2 size={18} />}
                variant="danger"
                fullWidth={false}
                loading={isClearing}
                disabled={isClearing}
                onPress={clearCache}
              />
            </div>
          </section>
        </div>
      )}
    </ScreenContainer>
  );
}
