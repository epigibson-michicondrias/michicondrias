"use client";

/**
 * Mi bolsa — espejo de `mobile/app/tienda/carrito.tsx`.
 */
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Minus, Package, Plus, ShieldCheck, Trash2 } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import FormField from "@/components/FormField";
import Button from "@/components/Button";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import { showAlert } from "@/components/AppAlert";
import { useCart } from "@/contexts/CartContext";
import { useCartProducts } from "@/hooks/ecommerce/useCartProducts";
import { useCheckout } from "@/hooks/ecommerce/useCheckout";
import s from "../tienda.module.css";

export default function CarritoPage() {
  const { items, cartTotal, cartCount, updateQuantity, clearCart, savedAddress, rememberAddress } = useCart();
  const { isRefreshing } = useCartProducts();
  const { checkout, isCheckingOut } = useCheckout();
  const [address, setAddress] = useState(savedAddress);
  const router = useRouter();

  const handlePay = () => {
    if (address.trim().length > 0 && address.trim().length < 10) {
      showAlert({ type: "warning", title: "Dirección incompleta", message: "Escribe una dirección más completa o déjala vacía." });
      return;
    }
    checkout(address);
  };

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Mi bolsa"
        subtitle={cartCount > 0 ? `${cartCount} ${cartCount === 1 ? "artículo" : "artículos"}` : undefined}
        rightElement={
          cartCount > 0 ? (
            <button
              type="button"
              className={s.iconBtn}
              aria-label="Vaciar bolsa"
              onClick={() =>
                showAlert({
                  type: "warning",
                  title: "¿Vaciar la bolsa?",
                  message: "Se quitarán todos los productos.",
                  showCancel: true,
                  onButtonPress: clearCart,
                })
              }
            >
              <Trash2 size={20} />
            </button>
          ) : undefined
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon={<Package size={28} />}
          title="Tu bolsa está vacía"
          subtitle="Explora la tienda y agrega lo que le guste a tu michi."
          actionLabel="Ir a la tienda"
          onAction={() => router.push("/tienda")}
        />
      ) : (
        <>
          <div className={s.cartList}>
            {items.map(({ product, quantity }) => (
              <div key={product.id} className={s.cartRow}>
                <Link href={`/tienda/producto/${product.id}`} className={s.cartMedia}>
                  {product.image_url ? (
                    <Image src={product.image_url} alt={product.name} width={72} height={72} className={s.cartImg} />
                  ) : (
                    <div className={s.cartImgFallback}><Package size={22} /></div>
                  )}
                </Link>
                <div className={s.cartBody}>
                  <Link href={`/tienda/producto/${product.id}`} className={s.cardName}>{product.name}</Link>
                  <p className={s.cardPrice}>${product.price.toFixed(2)}</p>
                  <div className={s.stepper}>
                    <button
                      type="button"
                      className={s.stepBtn}
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      aria-label="Quitar una pieza"
                    >
                      <Minus size={16} />
                    </button>
                    <span className={s.stepQty}>{quantity}</span>
                    <button
                      type="button"
                      className={s.stepBtn}
                      onClick={() => {
                        const stock = product.stock ?? 0;
                        if (stock > 0 && quantity >= stock) {
                          showAlert({ type: "info", title: "No hay más piezas", message: `Solo hay ${stock} disponibles.` });
                          return;
                        }
                        updateQuantity(product.id, quantity + 1);
                      }}
                      aria-label="Agregar una pieza"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                <p className={s.cartLineTotal}>${(product.price * quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <FormField
            label="Dirección de envío"
            value={address}
            onChangeText={(v) => { setAddress(v); rememberAddress(v); }}
            placeholder="Calle, número, colonia y ciudad"
            multiline
            numberOfLines={2}
            hint="La misma de tu última compra."
          />

          <Card>
            <div className={s.summaryRow}><span>Subtotal</span><strong>${cartTotal.toFixed(2)}</strong></div>
            <div className={s.summaryRow}><span>Envío</span><strong>Gratis</strong></div>
            <div className={`${s.summaryRow} ${s.summaryTotal}`}><span>Total</span><strong>${cartTotal.toFixed(2)}</strong></div>
            <p className={s.secureNote}>
              <ShieldCheck size={16} aria-hidden />
              Pagas con tarjeta en la página segura de Stripe. No guardamos tus datos de tarjeta.
            </p>
          </Card>

          <Button
            label={isCheckingOut ? "Abriendo pago…" : `Pagar · $${cartTotal.toFixed(2)}`}
            onPress={handlePay}
            loading={isCheckingOut || isRefreshing}
            icon={<Lock size={18} />}
          />
        </>
      )}
    </ScreenContainer>
  );
}
