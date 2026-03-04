"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import dashStyles from "../../dashboard.module.css";
import { useSearchParams } from "next/navigation";

export default function PagoExitosoPage() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("session_id");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div style={{ maxWidth: "600px", margin: "4rem auto", textAlign: "center", animation: "fadeIn 0.5s ease-out" }}>
            <div style={{ fontSize: "6rem", marginBottom: "1rem" }}>🎉🐾</div>
            <h1 className={dashStyles["page-title"]}>¡Michi-Pago Exitoso!</h1>
            <p className={dashStyles["page-subtitle"]} style={{ marginBottom: "2rem" }}>
                Tu transacción se ha procesado con máxima seguridad a través de Stripe.
                El vendedor ya fue notificado y está preparando tu pedido.
            </p>

            <div style={{ background: "var(--bg-glass)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "var(--radius-lg)", padding: "2rem", boxShadow: "0 10px 30px rgba(16, 185, 129, 0.1)", backdropFilter: "blur(20px)" }}>
                <h3 style={{ color: "#10b981", margin: "0 0 1rem 0" }}>Detalles del Recibo</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                    ID de Transacción:<br />
                    <span style={{ fontFamily: "monospace", color: "#fff", display: "inline-block", marginTop: "0.5rem" }}>
                        {sessionId || "Generando..."}
                    </span>
                </p>
            </div>

            <div style={{ marginTop: "3rem", display: "flex", gap: "1rem", justifyContent: "center" }}>
                <Link href="/dashboard/tienda" className="btn btn-outline" style={{ display: "inline-block" }}>
                    Seguir Comprando
                </Link>
                <Link href="/dashboard/tienda/compras" className="btn btn-primary" style={{ display: "inline-block" }}>
                    Ver mis pedidos 📦
                </Link>
            </div>
        </div>
    );
}
