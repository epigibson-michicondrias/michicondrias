"use client";

import { useCart } from "@/lib/contexts/CartContext";
import styles from "./CartDrawer.module.css";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function CartDrawer() {
    const { isCartOpen, setIsCartOpen, cartItems, cartCount, cartTotal, removeFromCart, updateQuantity, clearCart } = useCart();
    const [isSimulatingCheckout, setIsSimulatingCheckout] = useState(false);
    const [checkoutSuccess, setCheckoutSuccess] = useState(false);

    if (!isCartOpen) return null;

    const handleCheckout = () => {
        setIsSimulatingCheckout(true);
        // Simulate a checkout delay (e.g. connecting to Stripe/MercadoPago)
        setTimeout(() => {
            setIsSimulatingCheckout(false);
            setCheckoutSuccess(true);
            toast.success("¡Pago exitoso! Gracias por tu compra 🐾");
            clearCart();

            // Auto close after success
            setTimeout(() => {
                setCheckoutSuccess(false);
                setIsCartOpen(false);
            }, 3000);
        }, 2500);
    };

    return (
        <div className={styles["drawer-overlay"]}>
            <div className={styles["drawer-pane"]} style={{ animation: "slideIn 0.3s ease-out" }}>

                <div className={styles["drawer-header"]}>
                    <h2>🛒 Tu Carrito ({cartCount})</h2>
                    <button className={styles["close-btn"]} onClick={() => setIsCartOpen(false)}>✕</button>
                </div>

                <div className={styles["drawer-content"]}>
                    {checkoutSuccess ? (
                        <div className={styles["success-state"]}>
                            <span style={{ fontSize: "4rem" }}>🎉</span>
                            <h3>¡Compra Realizada!</h3>
                            <p>Tu orden electrónica ha sido generada y el vendedor ha sido notificado.</p>
                        </div>
                    ) : isSimulatingCheckout ? (
                        <div className={styles["loading-state"]}>
                            <div className={styles.spinner}></div>
                            <p>Procesando pago seguro...</p>
                        </div>
                    ) : cartItems.length === 0 ? (
                        <div className={styles["empty-state"]}>
                            <span style={{ fontSize: "3rem", opacity: 0.5 }}>🛍️</span>
                            <p>Oh no, el carrito está vacío.</p>
                            <button className="btn btn-outline" onClick={() => setIsCartOpen(false)} style={{ marginTop: "1rem" }}>
                                Explorar la Tienda
                            </button>
                        </div>
                    ) : (
                        <div className={styles["items-list"]}>
                            {cartItems.map((item) => (
                                <div key={item.product.id} className={styles["cart-item"]}>
                                    <div className={styles["item-image"]} style={{ backgroundImage: item.product.image_url ? `url(${item.product.image_url})` : "none" }}>
                                        {!item.product.image_url && "📦"}
                                    </div>
                                    <div className={styles["item-details"]}>
                                        <h4>{item.product.name}</h4>
                                        <p className={styles["item-price"]}>${(item.product.price * item.quantity).toFixed(2)}</p>

                                        <div className={styles["item-actions"]}>
                                            <div className={styles["qty-control"]}>
                                                <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} disabled={item.quantity <= 1}>-</button>
                                                <span>{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} disabled={item.quantity >= item.product.stock}>+</button>
                                            </div>
                                            <button className={styles["remove-btn"]} onClick={() => removeFromCart(item.product.id)}>Eliminar</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {!isSimulatingCheckout && !checkoutSuccess && cartItems.length > 0 && (
                    <div className={styles["drawer-footer"]}>
                        <div className={styles["summary-row"]}>
                            <span>Subtotal</span>
                            <span>${cartTotal.toFixed(2)} MXN</span>
                        </div>
                        <div className={styles["summary-row"]}>
                            <span>Envío</span>
                            <span style={{ color: "#10b981", fontWeight: "bold" }}>GRATIS 🚀</span>
                        </div>
                        <div className={`${styles["summary-row"]} ${styles["total-row"]}`}>
                            <span>Total a pagar</span>
                            <span>${cartTotal.toFixed(2)} MXN</span>
                        </div>
                        <button className="btn btn-primary" style={{ width: "100%", padding: "1rem", fontSize: "1.1rem" }} onClick={handleCheckout}>
                            Ir al Pago Seguro 💳
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
