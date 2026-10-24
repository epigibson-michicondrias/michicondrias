"use client";

/**
 * Pestaña "Permisos" de `/admin/roles`: matriz de solo lectura rol × zona (de `ROUTE_ACCESS`) y herramientas por rol
 * (de `ROLE_TOOLS`). "Ver como rol" filtra a un solo rol: es una vista previa, no cambia la sesión.
 */
import { useState, type CSSProperties } from "react";
import { Check, Minus, Wrench } from "lucide-react";
import Badge from "@/components/Badge";
import { ALL_ROLES, getRoleColorFor, getRoleLabelFor } from "@/constants/roles";
import { ROLE_TOOLS, ROUTE_ACCESS, canAccessRoute } from "@/constants/roleTools";
import s from "@/features/admin/admin.module.css";

/** Nombre legible de una zona: la herramienta que apunta a ese prefijo, si existe. */
const ZONE_LABELS: Record<string, string> = (() => {
  const map: Record<string, string> = { "/admin": "Consola de administración" };
  Object.values(ROLE_TOOLS).flat().forEach((t) => {
    if (!map[t.route]) map[t.route] = t.label;
  });
  return map;
})();

const ZONES = ROUTE_ACCESS.map((r) => r.prefix);

export default function PermissionsTab() {
  const [previewRole, setPreviewRole] = useState<string>("all");
  const roles: readonly string[] = previewRole === "all" ? ALL_ROLES : [previewRole];
  const allowedCount = previewRole === "all" ? 0 : ZONES.filter((z) => canAccessRoute(previewRole, z)).length;

  return (
    <div className={s.content}>
      <section className={s.section}>
        <div className={s.previewBar}>
          <h2 className={s.sectionTitle}>Zonas restringidas</h2>
          <select className={s.select} value={previewRole} onChange={(e) => setPreviewRole(e.target.value)} aria-label="Ver como rol">
            <option value="all">Ver todos los roles</option>
            {ALL_ROLES.map((r) => (
              <option key={r} value={r}>
                Ver como: {getRoleLabelFor(r)}
              </option>
            ))}
          </select>
        </div>
        <p className={s.muted}>
          {previewRole === "all"
            ? "Qué rol puede abrir cada zona. Las secciones que no aparecen aquí están abiertas para cualquier cuenta. Solo lectura: los accesos se definen en el código de la app."
            : `Vista previa: con el rol ${getRoleLabelFor(previewRole)} se abren ${allowedCount} de ${ZONES.length} zonas restringidas. No cambia tu sesión.`}
        </p>
        <div className={s.tableWrap}>
          <table className={s.matrix}>
            <thead>
              <tr>
                <th scope="col">Zona</th>
                {roles.map((r) => (
                  <th key={r} scope="col" className={previewRole !== "all" ? s.colActive : undefined}>
                    {getRoleLabelFor(r)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ZONES.map((zone) => (
                <tr key={zone}>
                  <th scope="row">
                    <span className={s.zoneName}>
                      <span>{ZONE_LABELS[zone] ?? zone}</span>
                      <span className={s.zonePath}>{zone}</span>
                    </span>
                  </th>
                  {roles.map((r) => {
                    const ok = canAccessRoute(r, zone);
                    return (
                      <td key={r} className={previewRole !== "all" ? s.colActive : undefined}>
                        {ok ? (
                          <Check size={16} className={s.yes} aria-label="Con acceso" />
                        ) : (
                          <Minus size={16} className={s.no} aria-label="Sin acceso" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={s.section}>
        <h2 className={s.sectionTitle}>Herramientas por rol</h2>
        <div className={s.toolsGrid}>
          {roles.map((r) => {
            const tools = ROLE_TOOLS[r] ?? [];
            return (
              <div key={r} className={s.card}>
                <div className={s.previewBar}>
                  <Badge label={getRoleLabelFor(r)} color={getRoleColorFor(r)} size="sm" />
                  <span className={s.muted}>
                    {tools.length} {tools.length === 1 ? "herramienta" : "herramientas"}
                  </span>
                </div>
                {tools.length === 0 ? (
                  <p className={s.muted}>Sin herramientas profesionales: usa la app como dueño de mascota.</p>
                ) : (
                  <ul className={s.toolList}>
                    {tools.map((t) => {
                      const Icon = t.icon ?? Wrench;
                      return (
                        <li key={t.id} className={s.toolItem}>
                          <span className={s.iconBox} style={{ "--c": t.color } as CSSProperties}>
                            <Icon size={18} />
                          </span>
                          <span className={s.cellMain}>
                            <span className={s.cellTitle}>{t.label}</span>
                            <span className={s.cellSub}>{t.desc}</span>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
