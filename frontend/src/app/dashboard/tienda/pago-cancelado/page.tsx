"use client";

import Link from "next/link";
import dashStyles from "../../dashboard.module.css";

export default function PagoCanceladoPage() {
    return (
        <div style={{ maxWidth: "600px", margin: "4rem auto", textAlign: "center", animation: "fadeIn 0.5s ease-out" }}>
            <div style={{ fontSize: "6rem", marginBottom: "1rem" }}>😿</div>
            <h1 className={dashStyles["page-title"]}>Pago Interrumpido</h1>
            <p className={dashStyles["page-subtitle"]} style={{ marginBottom: "2rem" }}>
                Parece que decidiste no completar la transacción o hubo un problema con la plataforma de pagos.
            </p>

            <div style={{ background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "var(--radius-lg)", padding: "2rem", backdropFilter: "blur(20px)" }}>
                <p style={{ color: "#ef4444", margin: "0", fontWeight: "600" }}>
                    No te preocupes, no se ha realizado ningún cargo a tu tarjeta.
                </p>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.5rem" }}>
                    Tus artículos seguirán guardados en tu carrito para cuando decidas volver.
                </p>
            </div>

            <div style={{ marginTop: "3rem" }}>
                <Link href="/dashboard/tienda" className="btn btn-primary" style={{ display: "inline-block", padding: "1rem 2rem", fontSize: "1.1rem" }}>
                    Regresar a la Tienda 🛒
                </Link>
            </div>
        </div>
    );
}
