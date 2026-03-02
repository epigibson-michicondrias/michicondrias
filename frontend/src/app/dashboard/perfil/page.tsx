"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCurrentUser, User, getUserRole } from "@/lib/auth";
import dashStyles from "../dashboard.module.css";
import styles from "./perfil.module.css";

export default function MiPerfilPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState("consumidor");

    useEffect(() => {
        async function load() {
            try {
                const u = await getCurrentUser();
                setUser(u);
                setRole(getUserRole());
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) return <p className={dashStyles["loading-text"]}>Cargando tu información...</p>;
    if (!user) return <p style={{ color: "var(--text-secondary)", padding: "2rem" }}>Inicia sesión nuevamente.</p>;

    const verificationColor = user.verification_status === "VERIFIED" ? "var(--success)" : user.verification_status === "PENDING" ? "var(--warning)" : "var(--text-secondary)";
    const verificationLabel: Record<string, string> = {
        "VERIFIED": "✅ Verificado",
        "PENDING": "⏳ En Revisión",
        "UNVERIFIED": "🔓 Sin verificar",
    };

    return (
        <div className={styles.container}>
            <div className={dashStyles["page-header"]}>
                <h1 className={dashStyles["page-title"]}>⚙️ Mi Cuenta</h1>
                <p className={dashStyles["page-subtitle"]}>
                    Gestiona tu perfil, seguridad y ecosistema profesional.
                </p>
            </div>

            {/* User Info Card */}
            <div className={styles["user-card"]}>
                <div className={styles["user-avatar"]}>
                    {user.full_name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div className={styles["user-info"]}>
                    <h2 className={styles["user-name"]}>{user.full_name || "Usuario"}</h2>
                    <p className={styles["user-email"]}>{user.email}</p>
                    <div className={styles["user-badges"]}>
                        <span className={styles["badge-role"]}>
                            {role === "admin" ? "🛡️" : role === "veterinario" ? "🩺" : role === "vendedor" ? "🏪" : "👤"}
                            {" "}{role.charAt(0).toUpperCase() + role.slice(1)}
                        </span>
                        <span className={styles["badge-verification"]} style={{ color: verificationColor }}>
                            {verificationLabel[user.verification_status] || user.verification_status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Action Cards Grid */}
            <div className={styles["cards-grid"]}>
                {/* KYC Card */}
                <div className={styles["action-card"]}>
                    <span className={styles["card-icon"]}>🛡️</span>
                    <h3 className={styles["card-title"]}>Centro de Seguridad KYC</h3>
                    <p className={styles["card-desc"]}>
                        Sube tus identificaciones oficiales para adoptar mascotas y publicar servicios de forma legítima.
                    </p>
                    <Link href="/dashboard/perfil/verificacion" className="btn btn-secondary" style={{ width: "100%" }}>
                        Gestionar Verificación
                    </Link>
                </div>

                {/* Partner / Professional Card */}
                {role === "consumidor" ? (
                    <div className={`${styles["action-card"]} ${styles["card-gradient"]}`}>
                        <span className={styles["card-icon"]}>🚀</span>
                        <h3 className={styles["card-title"]}>Michicondrias Partners</h3>
                        <p className={styles["card-desc"]}>
                            ¿Eres Veterinario o vendes productos para mascotas? Desbloquea herramientas profesionales.
                        </p>
                        <Link href="/dashboard/perfil/partner" className="btn btn-primary" style={{ width: "100%" }}>
                            ⚕️ Desbloquear Panel Médico
                        </Link>
                    </div>
                ) : (
                    <div className={`${styles["action-card"]} ${styles["card-success"]}`}>
                        <span className={styles["card-icon"]}>💼</span>
                        <h3 className={styles["card-title"]}>Mi Panel Profesional</h3>
                        <p className={styles["card-desc"]}>
                            Rol activo: <strong>{role.toUpperCase()}</strong>. Administra tu clínica o perfil de médico independiente.
                        </p>
                        <Link href="/dashboard/directorio/nuevo" className="btn btn-primary" style={{ width: "100%" }}>
                            🏥 Modificar mi Negocio
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
