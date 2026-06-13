"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import dashStyles from "../../dashboard.module.css";
import modStyles from "../../modules.module.css";

export default function PagoExitosoPage() {
    const searchParams = useSearchParams();
    const sessionId = searchParams?.get("session_id");

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", textAlign: "center" }}>
            <div style={{
                background: "var(--bg-glass)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-lg)",
                padding: "3rem 2rem",
                maxWidth: "500px",
                width: "100%",
                boxShadow: "0 8px 32px rgba(139, 92, 246, 0.1)"
            }}>
                <div style={{
                    width: "80px", height: "80px", borderRadius: "50%", background: "rgba(34, 197, 94, 0.2)",
                    color: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 1.5rem", fontSize: "2.5rem"
                }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                </div>

                <h1 className={dashStyles["page-title"]} style={{ marginBottom: "0.5rem" }}>¡Pago Exitoso!</h1>
                <p className={dashStyles["page-subtitle"]} style={{ marginBottom: "2rem" }}>
                    Tu orden ha sido procesada correctamente y notificada al vendedor.
                </p>

                {sessionId && (
                    <div style={{ background: "rgba(0,0,0,0.2)", padding: "1rem", borderRadius: "var(--radius-md)", marginBottom: "2rem", fontSize: "0.85rem", color: "var(--text-secondary)", wordBreak: "break-all" }}>
                        <span style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold", color: "var(--text-muted)" }}>ID DE TRANSACCIÓN STRIPE</span>
                        {sessionId}
                    </div>
                )}

                <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                    <Link href="/dashboard/tienda" className="btn btn-outline">
                        Volver a Tienda
                    </Link>
                    <Link href="/dashboard/perfil?tab=orders" className="btn btn-primary">
                        Ver mis Órdenes
                    </Link>
                </div>
            </div>
        </div>
    );
}
