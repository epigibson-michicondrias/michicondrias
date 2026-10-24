"use client";

/** Piezas de la consola de admin: tarjeta de cifra, acceso a módulo, avatar por iniciales y paginador. */
import type { ComponentType, CSSProperties } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "@/components/Button";
import s from "./admin.module.css";

type Icon = ComponentType<{ size?: number }>;

export function StatTile({ icon: IconC, value, label, color, href }: { icon: Icon; value: string | number; label: string; color: string; href?: string }) {
  const style = { "--c": color } as CSSProperties;
  const body = (
    <>
      <span className={s.tileIcon}>
        <IconC size={20} />
      </span>
      <span className={s.tileValue}>{value}</span>
      <span className={s.tileLabel}>{label}</span>
    </>
  );
  return href ? (
    <Link href={href} className={s.tile} style={style}>
      {body}
    </Link>
  ) : (
    <div className={s.tile} style={style}>
      {body}
    </div>
  );
}

export function ModuleLink({ icon: IconC, label, sub, color, href, badge }: { icon: Icon; label: string; sub: string; color: string; href: string; badge?: number }) {
  return (
    <Link href={href} className={s.menuItem} style={{ "--c": color } as CSSProperties}>
      <span className={s.iconBox}>
        <IconC size={20} />
      </span>
      <span className={s.menuText}>
        <span className={s.menuLabel}>
          {label}
          {badge ? ` · ${badge}` : ""}
        </span>
        <span className={s.menuSub}>{sub}</span>
      </span>
    </Link>
  );
}

export function Avatar({ name, color, url }: { name?: string | null; color?: string; url?: string | null }) {
  const initials = (name || "?").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
  const style = color ? ({ "--c": color } as CSSProperties) : undefined;
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element -- avatar del storage
    <img src={url} alt="" className={s.avatar} style={style} />
  ) : (
    <span className={s.avatar} style={style} aria-hidden>
      {initials || "?"}
    </span>
  );
}

export function Pager({ page, pageCount, total, pageSize, onChange }: { page: number; pageCount: number; total: number; pageSize: number; onChange: (p: number) => void }) {
  if (total <= pageSize) return null;
  const from = page * pageSize + 1;
  const to = Math.min(total, (page + 1) * pageSize);
  return (
    <div className={s.pager}>
      <span>
        {from}–{to} de {total}
      </span>
      <div className={s.pagerButtons}>
        <Button label="Anterior" icon={<ChevronLeft size={16} />} size="sm" variant="secondary" fullWidth={false} disabled={page === 0} onPress={() => onChange(page - 1)} />
        <Button label="Siguiente" iconRight={<ChevronRight size={16} />} size="sm" variant="secondary" fullWidth={false} disabled={page + 1 >= pageCount} onPress={() => onChange(page + 1)} />
      </div>
    </div>
  );
}

export const KYC_LABELS: Record<string, { label: string; color: string }> = {
  VERIFIED: { label: "Verificada", color: "var(--color-success)" },
  PENDING: { label: "Por revisar", color: "var(--color-warning)" },
  REJECTED: { label: "Rechazada", color: "var(--color-error)" },
  UNVERIFIED: { label: "Sin verificar", color: "var(--color-text-muted)" },
};
