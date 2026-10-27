"use client";

/**
 * PagoResultado — pantalla de vuelta desde Stripe (`pago-exitoso` / `pago-cancelado`).
 * No inventa datos del pedido: lleva al detalle real. Espejo de
 * `mobile/src/features/tienda/PagoResultado.tsx`.
 */
import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, ShoppingBag, XCircle } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Button from "@/components/Button";
import { useCart } from "@/contexts/CartContext";
import { confirmPaymentIntent } from "@/services/ecommerce";
import { SUPPORT_EMAIL } from "@/constants/support";
import s from "./pago.module.css";

const COPY = {
  success: {
    header: "Pago recibido",
    title: "¡Gracias por tu compra!",
    message: "Estamos confirmando tu pago con Stripe. En unos segundos verás tu pedido como «Pagado».",
    cta: "Ver mi pedido",
  },
  cancelled: {
    header: "Pago no completado",
    title: "No se completó el pago",
    message: "No se hizo ningún cargo a tu tarjeta. Tu pedido sigue pendiente por un tiempo: puedes pagarlo o cancelarlo desde su detalle.",
    cta: "Ir a mi pedido",
  },
} as const;

export default function PagoResultado({ variant }: { variant: keyof typeof COPY }) {
  const router = useRouter();
  const params = useSearchParams();
  // Deep link del backend usa `orderId`; return_url de Stripe en web puede mandar `order_id`.
  const orderId = params.get("orderId") ?? params.get("order_id");
  const { clearCart } = useCart();
  const copy = COPY[variant];
  const ok = variant === "success";
  const Icon = ok ? CheckCircle : XCircle;

  // Confirma el cobro en el servidor (respaldo del webhook) y vacía la bolsa solo si el pago fue ok.
  const confirmedRef = useRef(false);
  useEffect(() => {
    if (!ok) return;
    clearCart();
    if (!orderId || confirmedRef.current) return;
    confirmedRef.current = true;
    confirmPaymentIntent(orderId, "").catch(() => {
      // El webhook o el detalle del pedido cierran el caso si esto falla
    });
  }, [ok, orderId, clearCart]);

  const leaveCheckout = () => {
    // Evita que “atrás” desde el pedido regrese al checkout (historial del navegador).
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.replaceState(null, "", window.location.href);
    }
  };

  const goToShop = () => {
    leaveCheckout();
    router.replace("/tienda");
  };

  const goToOrder = () => {
    leaveCheckout();
    router.replace(orderId ? `/tienda/pedido/${orderId}` : "/tienda/compras");
  };

  return (
    <ScreenContainer>
      <ScreenHeader title={copy.header} onBack={goToShop} />
      <div className={s.wrap}>
        <div className={`${s.icon} ${ok ? s.iconOk : s.iconBad}`}>
          <Icon size={40} />
        </div>
        <h1 className={s.title}>{copy.title}</h1>
        <p className={s.message}>{copy.message}</p>

        <div className={s.actions}>
          <Button
            label={copy.cta}
            icon={<ShoppingBag size={18} />}
            onPress={goToOrder}
          />
          <Button label="Volver a la tienda" variant="secondary" onPress={goToShop} />
        </div>

        <p className={s.help}>¿Dudas? Escríbenos a {SUPPORT_EMAIL}</p>
      </div>
    </ScreenContainer>
  );
}
