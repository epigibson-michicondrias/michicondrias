"use client";

/**
 * Mi bolsa — espejo de `mobile/app/tienda/carrito.tsx`.
 */
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, MapPin, Minus, Package, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Button from "@/components/Button";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import { showAlert } from "@/components/AppAlert";
import { useCart } from "@/contexts/CartContext";
import { useCartProducts } from "@/hooks/ecommerce/useCartProducts";
import { getMyOrders } from "@/services/ecommerce";
import s from "../tienda.module.css";

export default function CarritoPage() {
  const { items, cartTotal, cartCount, updateQuantity, clearCart, savedAddress } = useCart();
  useCartProducts();
  const router = useRouter();

  const { data: myOrders } = useQuery({
    queryKey: ["my-orders-pending-cart"],
    queryFn: () => getMyOrders(0, 5),
    staleTime: 15_000,
  });
  const pendingOrder = (myOrders ?? []).find((o) => o.status === "pending");

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

      {pendingOrder && (
        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div>
              <strong style={{ fontSize: 14, color: "var(--color-primary)" }}>Tienes un pedido pendiente</strong>
              <p style={{ fontSize: 13, color: "var(--color-text-muted)", margin: "4px 0 0" }}>
                Pedido #{pendingOrder.id.slice(0, 8)} · ${pendingOrder.total_amount.toFixed(2)}
              </p>
            </div>
            <Button
              label="Completar pago"
              size="sm"
              onPress={() => router.push(`/tienda/pago-nativo?order_id=${pendingOrder.id}`)}
            />
          </div>
        </Card>
      )}

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

          {/* Selección rápida de dirección estilo ML */}
          <Link href="/tienda/checkout-direccion" style={{ textDecoration: "none", color: "inherit" }}>
            <Card>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <MapPin size={20} color="var(--color-primary)" />
                  <div>
                    <span style={{ fontSize: 12, color: "var(--color-text-muted)", display: "block" }}>Enviar a</span>
                    <strong style={{ fontSize: 14 }}>{savedAddress || "Ingresar código postal y dirección"}</strong>
                  </div>
                </div>
                <span style={{ color: "var(--color-primary)", fontSize: 13, fontWeight: 600 }}>Cambiar &gt;</span>
              </div>
            </Card>
          </Link>

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
            label={`Continuar compra · $${cartTotal.toFixed(2)}`}
            onPress={() => router.push("/tienda/checkout-direccion")}
            icon={<Lock size={18} />}
          />
        </>
      )}
    </ScreenContainer>
  );
}
