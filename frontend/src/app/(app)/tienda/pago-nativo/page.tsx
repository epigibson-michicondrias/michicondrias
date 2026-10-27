"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { ShieldCheck, ArrowLeft, Loader2, Lock, AlertCircle } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { useThemeContext } from "@/contexts/ThemeContext";
import { createPaymentIntent, getOrder, Order } from "@/services/ecommerce";
import s from "../tienda.module.css";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    "pk_test_51UUxT5KudUw71uodwRzmXjFEIv0o2ifgY35fY3H1dP9gQBj3USkxtO7tXbZyQwIMmBLfPlolPqmVHusvAYQAfQ2b00k2w8v6eg"
);

function PaymentForm({ order }: { order: Order }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/tienda/pago-exitoso?orderId=${order.id}`,
      },
    });

    if (error) {
      setErrorMessage(error.message || "No se pudo procesar el pago. Intenta con otro método.");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />

      {errorMessage && (
        <div
          role="alert"
          style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--color-danger)", fontSize: 13, padding: "8px 12px", background: "var(--color-danger-light, rgba(240, 113, 111, 0.1))", borderRadius: 8 }}
        >
          <AlertCircle size={16} aria-hidden />
          <span>{errorMessage}</span>
        </div>
      )}

      <Button
        type="submit"
        label={isProcessing ? "Procesando pago…" : `Confirmar y pagar · $${order.total_amount.toFixed(2)}`}
        loading={isProcessing}
        disabled={!stripe || !elements}
        icon={<Lock size={18} />}
      />
    </form>
  );
}

function PagoNativoContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id") ?? searchParams.get("orderId");
  const router = useRouter();
  const { colorScheme } = useThemeContext();
  const isDark = colorScheme === "dark";

  const [order, setOrder] = useState<Order | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(orderId));
  const [errorMsg, setErrorMsg] = useState<string | null>(
    orderId ? null : "No se proporcionó un número de pedido."
  );

  useEffect(() => {
    if (!orderId) return;

    let isMounted = true;
    (async () => {
      try {
        const [ord, session] = await Promise.all([
          getOrder(orderId),
          createPaymentIntent(orderId),
        ]);
        if (!isMounted) return;
        setOrder(ord);
        setClientSecret(session.clientSecret);
      } catch (err) {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : "No se pudo preparar la pasarela de pago.";
        setErrorMsg(msg);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  // Estilo adaptado a la identidad Michicondrias (Midnight & Gold) para Stripe Elements
  const appearance = {
    theme: (isDark ? "night" : "stripe") as "night" | "stripe",
    variables: {
      colorPrimary: isDark ? "#4f8cff" : "#2f5fd0",
      colorBackground: isDark ? "#131826" : "#ffffff",
      colorText: isDark ? "#f5f1e8" : "#141824",
      colorDanger: isDark ? "#f0716f" : "#d64545",
      colorTextSecondary: isDark ? "#9aa3b5" : "#667085",
      colorTextPlaceholder: isDark ? "#9aa3b5" : "#667085",
      borderRadius: "12px",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      spacingUnit: "4px",
    },
    rules: {
      ".Tab": {
        border: isDark ? "1px solid rgba(233, 200, 131, 0.14)" : "1px solid #ebe5d8",
        backgroundColor: isDark ? "#131826" : "#ffffff",
        color: isDark ? "#f5f1e8" : "#141824",
      },
      ".Tab--selected": {
        borderColor: isDark ? "#4f8cff" : "#2f5fd0",
        backgroundColor: isDark ? "rgba(79, 140, 255, 0.12)" : "#e8eefc",
      },
      ".Input": {
        border: isDark ? "1px solid rgba(233, 200, 131, 0.2)" : "1px solid #ddd5c3",
        backgroundColor: isDark ? "rgba(255, 255, 255, 0.045)" : "#ffffff",
        color: isDark ? "#f5f1e8" : "#141824",
      },
      ".Block": {
        backgroundColor: isDark ? "#131826" : "#ffffff",
        border: isDark ? "1px solid rgba(233, 200, 131, 0.14)" : "1px solid #ebe5d8",
      },
    },
  };

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Finalizar compra"
        subtitle="Paso 2 de 2: Pago protegido in-app"
        leftElement={
          <button
            type="button"
            className={s.iconBtn}
            aria-label="Volver"
            onClick={() => router.back()}
          >
            <ArrowLeft size={20} />
          </button>
        }
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Barra de progreso */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "8px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--color-primary)", fontWeight: 700 }}>
            <span style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--color-primary)", color: "var(--color-on-primary, #fff)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>✓</span>
            <span>Envío</span>
          </div>
          <div style={{ width: 40, height: 2, background: "var(--color-primary)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--color-primary)", fontWeight: 700 }}>
            <span style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--color-primary)", color: "var(--color-on-primary, #fff)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>2</span>
            <span>Pago in-app</span>
          </div>
        </div>

        {order && (
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Pedido #{order.id.slice(0, 8)}</span>
                <p style={{ margin: "4px 0 0 0", fontSize: 14, fontWeight: 500 }}>
                  {order.shipping_address ? `Entrega en: ${order.shipping_address}` : "Envío a domicilio"}
                </p>
              </div>
              <strong style={{ fontSize: 18, color: "var(--color-primary)" }}>
                ${order.total_amount.toFixed(2)}
              </strong>
            </div>
          </Card>
        )}

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 48, gap: 12 }} aria-busy="true" aria-live="polite">
            <Loader2 size={32} className={s.spinner} aria-hidden />
            <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>
              Cargando pasarela de pago segura de Michicondrias…
            </p>
          </div>
        ) : errorMsg ? (
          <Card>
            <div style={{ textAlign: "center", padding: 24 }} role="alert">
              <p style={{ color: "var(--color-danger)", fontWeight: 600 }}>{errorMsg}</p>
              <div style={{ marginTop: 16 }}>
                <Button label="Volver al carrito" onPress={() => router.push("/tienda/carrito")} />
              </div>
            </div>
          </Card>
        ) : clientSecret && order ? (
          <Card>
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance,
              }}
            >
              <PaymentForm order={order} />
            </Elements>
          </Card>
        ) : null}

        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, background: "var(--color-surface-secondary)", borderRadius: "var(--radius-md)" }}>
          <ShieldCheck size={20} color="var(--color-success)" aria-hidden />
          <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            Pagos procesados directamente con cifrado SSL de 256 bits. Michicondrias nunca almacena los datos de tu tarjeta.
          </span>
        </div>
      </div>
    </ScreenContainer>
  );
}

export default function PagoNativoPage() {
  return (
    <Suspense fallback={null}>
      <PagoNativoContent />
    </Suspense>
  );
}
