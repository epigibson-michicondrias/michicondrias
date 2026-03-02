"use client";

import { useEffect, useState } from "react";
import { getMyOrders, Order } from "@/lib/services/ecommerce";
import { toast } from "react-hot-toast";
import styles from "./Compras.module.css";
import dashStyles from "../../../dashboard.module.css";
import Link from "next/link";

export default function MisComprasPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const data = await getMyOrders();
                setOrders(data);
            } catch (err) {
                console.error("Error loading orders", err);
                toast.error("No pudimos cargar tus pedidos");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) return <div className={dashStyles["loading-text"]}>Buscando tus michi-pedidos...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>🛍️ Mis Compras</h1>
                <p>Aquí puedes rastrear tus pedidos y ver tu historial de felicidad michi.</p>
            </div>

            {orders.length === 0 ? (
                <div className={styles["empty-state"]}>
                    <span style={{ fontSize: "4rem" }}>📦</span>
                    <h3>Aún no has realizado ninguna compra</h3>
                    <p>¡Explora nuestra tienda y encuentra algo especial para tu mascota!</p>
                    <Link href="/dashboard/tienda" className="btn btn-primary" style={{ marginTop: "1rem" }}>
                        Ir a la Tienda
                    </Link>
                </div>
            ) : (
                <div className={styles["orders-list"]}>
                    {orders.map((order) => (
                        <div key={order.id} className={styles["order-card"]}>
                            <div className={styles["order-header"]}>
                                <div>
                                    <span className={styles["order-date"]}>
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </span>
                                    <h4 className={styles["order-id"]}>ID: {order.id.slice(0, 8).toUpperCase()}</h4>
                                </div>
                                <div className={styles["order-status-badge"]} data-status={order.status}>
                                    {order.status === "paid" ? "Pagado ✅" : order.status}
                                </div>
                            </div>

                            <div className={styles["order-items"]}>
                                {order.items.map((item, idx) => (
                                    <div key={idx} className={styles["item-row"]}>
                                        <span>Cantidad: {item.quantity}</span>
                                        <span className={styles["item-price"]}>${item.price_at_purchase.toFixed(2)} c/u</span>
                                    </div>
                                ))}
                            </div>

                            <div className={styles["order-footer"]}>
                                <div className={styles["total-label"]}>Total Pagado</div>
                                <div className={styles["total-value"]}>${order.total_amount.toFixed(2)} MXN</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
