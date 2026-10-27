"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  ShieldCheck,
  Lock,
  Home,
} from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import FormField from "@/components/FormField";
import Button from "@/components/Button";
import Card from "@/components/Card";
import { showAlert } from "@/components/AppAlert";
import { useCart } from "@/contexts/CartContext";
import CheckoutSteps from "@/features/tienda/CheckoutSteps";
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
        <CheckoutSteps current={1} />

        {/* Dirección habitual guardada */}
        {Boolean(savedAddress) && (
          <button
            type="button"
            className={`${s.optionCard} ${!useNewAddress ? s.optionCardSelected : ""}`}
            onClick={() => setUseNewAddress(false)}
            aria-pressed={!useNewAddress}
          >
            <span className={s.optionRow}>
              <span className={s.optionRadio} aria-hidden>
                {!useNewAddress && <span className={s.optionRadioDot} />}
              </span>
              <span style={{ flex: 1 }}>
                <span className={`${s.optionTag} ${s.optionTagPrimary}`}>
                  <Home size={16} aria-hidden />
                  Dirección guardada habitual
                </span>
                <span className={s.optionTitle} style={{ display: "block", marginTop: 6 }}>{savedAddress}</span>
                <span className={s.optionTag}>Envío FULL directo a este domicilio</span>
              </span>
            </span>
          </button>
        )}

        {/* Opción para escribir otra dirección */}
        {Boolean(savedAddress) && (
          <button
            type="button"
            className={`${s.optionCard} ${useNewAddress ? s.optionCardSelected : ""}`}
            onClick={() => setUseNewAddress(true)}
            aria-pressed={useNewAddress}
            style={{ marginTop: 8 }}
          >
            <span className={s.optionRow}>
              <span className={s.optionRadio} aria-hidden>
                {useNewAddress && <span className={s.optionRadioDot} />}
              </span>
              <span>
                <span className={s.optionTitle}>Entregar en otra dirección</span>
                <span className={s.optionDesc} style={{ display: "block" }}>Ingresa un nuevo domicilio para este pedido</span>
              </span>
            </span>
          </button>
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
