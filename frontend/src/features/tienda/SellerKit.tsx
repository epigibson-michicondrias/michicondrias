"use client";

/**
 * Piezas del panel de vendedor (espejo de `SummaryCard`, `StatTile`, `MediaRow`, `MiniBarChart` y `SellerOrderCard`
 * de la app). Solo las usa `/tienda/vendedor/*`; si otro módulo las necesita, se suben a `components/`.
 */
import type { ComponentType, CSSProperties, ReactNode } from "react";
import { CalendarDays, CheckCircle2, MapPin, Truck, UserRound } from "lucide-react";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import { getOrderStatus } from "@/features/tienda/orderStatus";
import { SELLER_NEXT_STATUS, isSellerItem, sellerSubtotal } from "@/hooks/ecommerce/useSellerOrders";
import { formatCurrency } from "@/utils/formatters";
import type { Order } from "@/services/ecommerce";
import s from "./vendedor.module.css";

type Icon = ComponentType<{ size?: number }>;

/** Color de cada tono de estado de pedido. */
export const TONE_COLORS: Record<string, string> = {
  warning: "var(--color-warning)",
  info: "var(--color-info)",
  primary: "var(--color-primary)",
  success: "var(--color-success)",
  error: "var(--color-error)",
};

export function SummaryCard({
  label, value, icon: IconC, caption, stats,
}: { label: string; value: string; icon: Icon; caption?: string; stats: { label: string; value: string | number }[] }) {
  return (
    <section className={s.summary} aria-label={label}>
      <span className={s.summaryLabel}>
        <IconC size={16} /> {label}
      </span>
      <span className={s.summaryValue}>{value}</span>
      {caption ? <span className={s.summaryCaption}>{caption}</span> : null}
      <div className={s.summaryStats}>
        {stats.map((st) => (
          <div key={st.label} className={s.summaryStat}>
            <span className={s.summaryStatValue}>{st.value}</span>
            <span className={s.summaryStatLabel}>{st.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function StatTile({
  icon: IconC, value, label, color, onPress,
}: { icon: Icon; value: string | number; label: string; color: string; onPress?: () => void }) {
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
  return onPress ? (
    <button type="button" className={s.tile} style={style} onClick={onPress} aria-label={`${label}: ${value}`}>
      {body}
    </button>
  ) : (
    <div className={s.tile} style={style}>
      {body}
    </div>
  );
}

export function MediaRow({
  imageUrl, fallbackIcon: Fallback, title, lines, trailing, actions, onPress, accessibilityLabel,
}: {
  imageUrl?: string | null;
  fallbackIcon: Icon;
  title: string;
  lines: { text: string; icon?: Icon }[];
  trailing?: ReactNode;
  actions?: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
}) {
  return (
    <div className={s.mediaRow}>
      <button type="button" className={s.mediaMain} onClick={onPress} aria-label={accessibilityLabel}>
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- la foto del producto viene del storage
          <img src={imageUrl} alt="" className={s.thumb} />
        ) : (
          <span className={s.thumb}>
            <Fallback size={22} />
          </span>
        )}
        <span className={s.mediaText}>
          <span className={s.mediaTitle}>{title}</span>
          {lines.map(({ text, icon: LineIcon }) => (
            <span key={text} className={s.mediaLine}>
              {LineIcon ? <LineIcon size={12} /> : null}
              {text}
            </span>
          ))}
        </span>
      </button>
      {trailing}
      {actions ? <div className={s.mediaActions}>{actions}</div> : null}
    </div>
  );
}

export function MiniBarChart({ data, formatValue }: { data: { label: string; value: number }[]; formatValue: (v: number) => string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className={s.chart} role="img" aria-label={data.map((d) => `${d.label}: ${formatValue(d.value)}`).join(", ")}>
      {data.map((d) => (
        <div key={d.label} className={s.chartCol} title={`${d.label}: ${formatValue(d.value)}`}>
          <div className={s.chartBarWrap}>
            <div className={s.chartBar} style={{ height: `${(d.value / max) * 100}%` }} />
          </div>
          <span className={s.chartLabel}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function SellerOrderCard({
  order, sellerId, onAdvance, updating, disabled,
}: { order: Order; sellerId?: string; onAdvance: (status: string) => void; updating?: boolean; disabled?: boolean }) {
  const status = getOrderStatus(order.status);
  const next = SELLER_NEXT_STATUS[order.status];
  // Un pedido puede incluir productos de varios vendedores: aquí solo cuenta lo de este vendedor
  const myItems = (order.items || []).filter((i) => isSellerItem(i, sellerId));
  const date = new Date(order.created_at).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
  const info = [
    { icon: UserRound, text: order.buyer_name || "Comprador de Michi-Shop" },
    { icon: MapPin, text: order.shipping_address || "Sin dirección de envío" },
    { icon: CalendarDays, text: `${date} · #${order.id.slice(0, 8).toUpperCase()}` },
  ];

  return (
    <article className={s.order}>
      <div className={s.orderHead}>
        <span className={s.orderTotal}>{formatCurrency(sellerSubtotal(order, sellerId))}</span>
        <Badge label={status.sellerLabel} color={TONE_COLORS[status.tone]} size="sm" />
      </div>
      <div className={s.orderItems}>
        {myItems.map((i) => (
          <span key={i.id}>
            {i.quantity} × {i.product?.name || "Producto"}
          </span>
        ))}
      </div>
      <div className={s.orderInfo}>
        {info.map(({ icon: InfoIcon, text }) => (
          <div key={text} className={s.orderInfoRow}>
            <InfoIcon size={16} />
            <span>{text}</span>
          </div>
        ))}
      </div>
      {next ? (
        <Button
          label={next.label}
          icon={next.status === "delivered" ? <CheckCircle2 size={18} /> : <Truck size={18} />}
          onPress={() => onAdvance(next.status)}
          loading={updating}
          disabled={disabled}
        />
      ) : order.status === "pending" ? (
        <span className={s.orderNote}>El comprador aún no paga: no lo envíes todavía.</span>
      ) : null}
    </article>
  );
}
