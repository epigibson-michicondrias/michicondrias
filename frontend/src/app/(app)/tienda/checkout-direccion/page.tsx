"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Building2,
  ShieldCheck,
  Lock,
  ArrowRight,
  Home,
  CheckCircle2,
} from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import FormField from "@/components/FormField";
import Button from "@/components/Button";
import Card from "@/components/Card";
import { showAlert } from "@/components/AppAlert";
import { useCart } from "@/contexts/CartContext";
import s from "../tienda.module.css";

interface AddressForm {
  street: string;
  extNumber: string;
  intNumber: string;
  colonia: string;
  city: string;
  state: string;
  postalCode: string;
  references: string;
  receiverName: string;
  receiverPhone: string;
}

export default function CheckoutDireccionPage() {
  const { items, cartTotal, cartCount, savedAddress, rememberAddress } = useCart();
  const router = useRouter();

  const [useNewAddress, setUseNewAddress] = useState(!savedAddress);
  const [form, setForm] = useState<AddressForm>({
    street: "",
    extNumber: "",
    intNumber: "",
    colonia: "",
    city: "",
    state: "",
    postalCode: "",
    references: "",
    receiverName: "",
    receiverPhone: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof AddressForm, string>>>({});

  const updateField = (field: keyof AddressForm, val: string) => {
    setForm((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const nextErrors: Partial<Record<keyof AddressForm, string>> = {};
    if (!form.receiverName.trim()) nextErrors.receiverName = "Indica quién recibe el paquete";
    if (!form.receiverPhone.trim() || form.receiverPhone.trim().length < 10) {
      nextErrors.receiverPhone = "Teléfono a 10 dígitos obligatorio";
    }
    if (!form.street.trim()) nextErrors.street = "Escribe calle o avenida";
    if (!form.extNumber.trim()) nextErrors.extNumber = "Número exterior obligatorio";
    if (!form.colonia.trim()) nextErrors.colonia = "Colonia obligatoria";
    if (!form.postalCode.trim() || form.postalCode.trim().length < 5) {
      nextErrors.postalCode = "C.P. válido (5 dígitos)";
    }
    if (!form.city.trim()) nextErrors.city = "Ciudad o Municipio";
    if (!form.state.trim()) nextErrors.state = "Estado obligatorio";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const buildFullAddress = (): string => {
    if (!useNewAddress && savedAddress) {
      return savedAddress;
    }
    const parts = [
      `${form.street} #${form.extNumber}${form.intNumber ? ` Int. ${form.intNumber}` : ""}`,
      `Col. ${form.colonia}`,
      `C.P. ${form.postalCode}, ${form.city}, ${form.state}`,
      form.references ? `Ref: ${form.references}` : "",
      `Recibe: ${form.receiverName} (Tel: ${form.receiverPhone})`,
    ].filter(Boolean);
    return parts.join(" · ");
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePay = async () => {
    if (items.length === 0) {
      showAlert({
        type: "warning",
        title: "Bolsa vacía",
        message: "No tienes productos en tu bolsa.",
        onButtonPress: () => router.push("/tienda"),
      });
      return;
    }

    let finalAddress = savedAddress;
    if (useNewAddress) {
      if (!validateForm()) {
        showAlert({
          type: "warning",
          title: "Faltan datos de envío",
          message: "Revisa los campos obligatorios para asegurar la entrega de tu pedido.",
        });
        return;
      }
      finalAddress = buildFullAddress();
      rememberAddress(finalAddress);
    } else if (!savedAddress) {
      setUseNewAddress(true);
      return;
    }

    try {
      setIsSubmitting(true);
      const { createOrder } = await import("@/services/ecommerce");
      const order = await createOrder({
        items: items.map((it) => ({ product_id: it.product.id, quantity: it.quantity })),
        shipping_address: finalAddress,
      });
      router.push(`/tienda/pago-nativo?order_id=${order.id}`);
    } catch (err) {
      showAlert({
        type: "error",
        title: "No se pudo crear el pedido",
        message: err instanceof Error ? err.message : "Inténtalo de nuevo.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Elegir forma de entrega"
        subtitle="Paso 1 de 2: Dirección y detalles de entrega"
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Indicador de pasos estilo ML */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "8px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--color-primary)", fontWeight: 700 }}>
            <span style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--color-primary)", color: "var(--color-on-primary, #fff)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>1</span>
            <span>Envío</span>
          </div>
          <div style={{ width: 40, height: 2, background: "var(--color-border)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--color-text-muted)" }}>
            <span style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--color-surface-secondary)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>2</span>
            <span>Pago</span>
          </div>
        </div>

        {/* Dirección habitual guardada */}
        {Boolean(savedAddress) && (
          <Card>
            <label style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer" }}>
              <input
                type="radio"
                name="deliveryAddress"
                checked={!useNewAddress}
                onChange={() => setUseNewAddress(false)}
                style={{ marginTop: 4 }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--color-primary)", fontWeight: 600, fontSize: 13 }}>
                  <Home size={16} aria-hidden />
                  <span>Dirección guardada habitual</span>
                </div>
                <p style={{ margin: "6px 0 2px 0", fontSize: 15, fontWeight: 500 }}>{savedAddress}</p>
                <span style={{ color: "var(--color-success)", fontSize: 12, fontWeight: 600 }}>Envío FULL directo a este domicilio</span>
              </div>
            </label>
          </Card>
        )}

        {/* Opción para escribir otra dirección */}
        {Boolean(savedAddress) && (
          <Card>
            <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
              <input
                type="radio"
                name="deliveryAddress"
                checked={useNewAddress}
                onChange={() => setUseNewAddress(true)}
              />
              <div>
                <strong style={{ fontSize: 14 }}>Entregar en otra dirección</strong>
                <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-muted)" }}>Ingresa un nuevo domicilio para este pedido</p>
              </div>
            </label>
          </Card>
        )}

        {/* Formulario desglosado si es nueva dirección */}
        {useNewAddress && (
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Building2 size={18} color="var(--color-primary)" aria-hidden />
              <h3 style={{ margin: 0, fontSize: 16 }}>Datos del domicilio</h3>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <FormField
                label="Nombre de quien recibe"
                value={form.receiverName}
                onChangeText={(v) => updateField("receiverName", v)}
                placeholder="Ej. Juan Pérez"
                error={errors.receiverName}
              />
              <FormField
                label="Teléfono de contacto"
                value={form.receiverPhone}
                onChangeText={(v) => updateField("receiverPhone", v)}
                placeholder="10 dígitos"
                error={errors.receiverPhone}
              />
            </div>

            <FormField
              label="Calle o Avenida"
              value={form.street}
              onChangeText={(v) => updateField("street", v)}
              placeholder="Ej. Av. Insurgentes Sur"
              error={errors.street}
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <FormField
                label="Núm. Exterior"
                value={form.extNumber}
                onChangeText={(v) => updateField("extNumber", v)}
                placeholder="123"
                error={errors.extNumber}
              />
              <FormField
                label="Núm. Interior (opc)"
                value={form.intNumber}
                onChangeText={(v) => updateField("intNumber", v)}
                placeholder="Depto 4B"
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 12 }}>
              <FormField
                label="Colonia"
                value={form.colonia}
                onChangeText={(v) => updateField("colonia", v)}
                placeholder="Colonia o Barrio"
                error={errors.colonia}
              />
              <FormField
                label="Código Postal"
                value={form.postalCode}
                onChangeText={(v) => updateField("postalCode", v)}
                placeholder="06600"
                error={errors.postalCode}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <FormField
                label="Ciudad / Alcaldía"
                value={form.city}
                onChangeText={(v) => updateField("city", v)}
                placeholder="Ej. Cuauhtémoc"
                error={errors.city}
              />
              <FormField
                label="Estado"
                value={form.state}
                onChangeText={(v) => updateField("state", v)}
                placeholder="Ej. CDMX"
                error={errors.state}
              />
            </div>

            <FormField
              label="Indicaciones de entrega (opcional)"
              value={form.references}
              onChangeText={(v) => updateField("references", v)}
              placeholder="Ej. Fachada azul, portón negro, timbre 2"
              multiline
              numberOfLines={2}
            />
          </Card>
        )}

        {/* Resumen y botón de pago */}
        <Card>
          <div className={s.summaryRow}><span>Subtotal ({cartCount} prod.)</span><strong>${cartTotal.toFixed(2)}</strong></div>
          <div className={s.summaryRow}><span>Envío</span><strong>Gratis</strong></div>
          <div className={`${s.summaryRow} ${s.summaryTotal}`}><span>Total a pagar</span><strong>${cartTotal.toFixed(2)}</strong></div>
          <p className={s.secureNote}>
            <ShieldCheck size={16} aria-hidden />
            Compra Protegida por Michicondrias · Pagas de forma 100% segura mediante Stripe.
          </p>
        </Card>

        <Button
          label={isSubmitting ? "Preparando pago…" : `Continuar a pago in-app · $${cartTotal.toFixed(2)}`}
          onPress={handlePay}
          loading={isSubmitting}
          icon={<Lock size={18} />}
        />
      </div>
    </ScreenContainer>
  );
}
