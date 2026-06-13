"use client";

import Link from "next/link";
import dashStyles from "../../dashboard.module.css";

export default function PagoCanceladoPage() {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", textAlign: "center" }}>
            <div style={{
                background: "var(--bg-glass)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-lg)",
                padding: "3rem 2rem",
                maxWidth: "500px",
                width: "100%",
                boxShadow: "0 8px 32px rgba(239, 68, 68, 0.1)"
            }}>
                <div style={{
                    width: "80px", height: "80px", borderRadius: "50%", background: "rgba(239, 68, 68, 0.2)",
                    color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 1.5rem", fontSize: "2.5rem"
                }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </div>

                <h1 className={dashStyles["page-title"]} style={{ marginBottom: "0.5rem", color: "#f87171" }}>Pago Cancelado</h1>
                <p className={dashStyles["page-subtitle"]} style={{ marginBottom: "2rem" }}>
                    El proceso de pago fue interrumpido. No se han realizado cargos a tu tarjeta.
                </p>

                <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                    <Link href="/dashboard/tienda" className="btn btn-primary">
                        Regresar a la Tienda
                    </Link>
                </div>
            </div>
        </div>
    );
}
