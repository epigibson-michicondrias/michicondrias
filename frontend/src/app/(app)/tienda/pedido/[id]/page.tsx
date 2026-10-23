"use client";

/**
 * Detalle de pedido — espejo de `mobile/app/tienda/pedido/[id].tsx`.
 */
import { use, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HelpCircle, Package, RotateCcw, XCircle } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import ListRow from "@/components/ListRow";
import { Skeleton } from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";
import { useOrderDetail } from "@/hooks/ecommerce/useOrderDetail";
import { getOrderStatus, TRACKING_STEPS, trackingIndex } from "@/features/tienda/orderStatus";
import { SUPPORT_EMAIL } from "@/constants/support";
import s from "../../tienda.module.css";

function PedidoContent({ orderId }: { orderId: string }) {
  const { order, isLoading, error, payNow, isPaying, cancelOrder, isCancelling, buyAgain } = useOrderDetail(orderId);
  const router = useRouter();

  if (isLoading) {
    return (
      <ScreenContainer>
        <Skeleton height={72} borderRadius={12} />
        <Skeleton height={100} borderRadius={12} />
        <Skeleton height={140} borderRadius={12} />
      </ScreenContainer>
    );
  }

  if (error || !order) {
    return (
      <ScreenContainer>
        <EmptyState
          icon={<Package size={28} />}
          title="No pudimos cargar este pedido"
          actionLabel="Ir a Mis compras"
          onAction={() => router.push("/tienda/compras")}
        />
      </ScreenContainer>
    );
  }

  const st = getOrderStatus(order.status);
  const stepIdx = trackingIndex(order.status);
  const totalLabel =
    order.status === "pending" ? "Total a pagar"
      : order.status === "cancelled" ? "Total (sin cargo)"
        : "Total pagado";

  return (
    <ScreenContainer>
      <ScreenHeader title="Pedido" subtitle={`#${String(order.id).slice(0, 8)}`} />

      <Card>
        <div className={s.priceRow}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <st.icon size={22} />
            <div>
              <p className={s.cardName}>{st.label}</p>
              <p className={s.cardMeta}>Pedido el {order.created_at?.slice(0, 10)}</p>
            </div>
          </div>
          <Badge label={st.label} color={`var(--color-${st.tone})`} size="sm" />
        </div>

        {stepIdx >= 0 && (
          <ol className={s.tracking}>
            {TRACKING_STEPS.map((step, i) => (
              <li key={step.status} className={`${s.trackStep} ${i <= stepIdx ? s.trackDone : ""}`}>
                <span className={s.trackDot} aria-hidden />
                <p className={s.trackLabel}>{step.label}</p>
                <p className={s.cardMeta}>{step.hint}</p>
              </li>
            ))}
          </ol>
        )}
      </Card>

      {order.status === "pending" && (
        <Card>
          <p className={s.cardName}>Tu pedido espera el pago</p>
          <p className={s.cardMeta}>Las piezas están apartadas por tiempo limitado.</p>
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <Button
              label={`Pagar ahora · $${order.total_amount.toFixed(2)}`}
              onPress={payNow}
              loading={isPaying}
            />
            <Button
              label="Cancelar pedido"
              variant="danger"
              icon={<XCircle size={18} />}
              onPress={cancelOrder}
              loading={isCancelling}
            />
          </div>
        </Card>
      )}

      <section>
        <h2 className={s.sectionTitle}>Productos</h2>
        <div className={s.orderList}>
          {(order.items ?? []).map((item) => (
            <div key={item.id} className={s.orderRow}>
              <div className={s.orderMedia}>
                {item.product?.image_url ? (
                  <Image src={item.product.image_url} alt="" width={48} height={48} className={s.cartImg} />
                ) : (
                  <div className={s.cartImgFallback}><Package size={18} /></div>
                )}
              </div>
              <div className={s.orderBody}>
                <p className={s.cardName}>{item.product?.name || "Producto"}</p>
                <p className={s.cardMeta}>{item.quantity} × ${item.price_at_purchase.toFixed(2)}</p>
              </div>
              <p className={s.cartLineTotal}>${(item.price_at_purchase * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </section>

      <Card>
        <div className={s.summaryRow}><span>Dirección de envío</span><span>{order.shipping_address || "—"}</span></div>
        <div className={s.summaryRow}><span>Subtotal</span><strong>${order.total_amount.toFixed(2)}</strong></div>
        <div className={s.summaryRow}><span>Envío</span><strong>Gratis</strong></div>
        <div className={`${s.summaryRow} ${s.summaryTotal}`}><span>{totalLabel}</span><strong>${order.total_amount.toFixed(2)}</strong></div>
      </Card>

      {order.status !== "pending" && (
        <Button label="Volver a comprar" variant="secondary" icon={<RotateCcw size={18} />} onPress={buyAgain} />
      )}

      <ListRow
        icon={HelpCircle}
        label="¿Necesitas ayuda con este pedido?"
        desc={SUPPORT_EMAIL}
        onPress={() => window.open(`mailto:${SUPPORT_EMAIL}`, "_self")}
      />
    </ScreenContainer>
  );
}

export default function PedidoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={null}>
      <PedidoContent orderId={id} />
    </Suspense>
  );
}
