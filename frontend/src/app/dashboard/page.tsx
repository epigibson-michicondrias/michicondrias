"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCurrentUser, User, getUserRole } from "@/lib/auth";
import dashStyles from "./dashboard.module.css";
import styles from "./home.module.css";

interface QuickStat {
    icon: string;
    label: string;
    value: string | number;
    href: string;
    color: string;
}

export default function DashboardHomePage() {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState("consumidor");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const u = await getCurrentUser();
                setUser(u);
                setRole(getUserRole());
            } catch { }
            finally {
                setMounted(true);
            }
        }
        load();
    }, []);

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Buenos días";
        if (hour < 19) return "Buenas tardes";
        return "Buenas noches";
    };

    const quickActions = [
        { icon: "🐾", label: "Adoptar una mascota", desc: "Encuentra a tu compañero ideal", href: "/dashboard/adopciones", color: "#7c3aed" },
        { icon: "🛒", label: "Tienda y Marketplace", desc: "Productos para tu mascota", href: "/dashboard/tienda", color: "#ec4899" },
        { icon: "🔍", label: "Mascotas Perdidas", desc: "Red de apoyo comunitario", href: "/dashboard/perdidas", color: "#ef4444" },
        { icon: "📋", label: "Carnet Clínico", desc: "Historial médico digital", href: "/dashboard/carnet", color: "#3b82f6" },
        { icon: "💛", label: "Donar", desc: "Apoya refugios y causas", href: "/dashboard/donaciones", color: "#f59e0b" },
        { icon: "📍", label: "Petfriendly", desc: "Lugares que aceptan mascotas", href: "/dashboard/petfriendly", color: "#22c55e" },
    ];

    const roleModules = role === "admin" ? [
        { icon: "🛡️", label: "Roles y Permisos", desc: "Gestión de accesos", href: "/dashboard/admin/roles", color: "#6366f1" },
        { icon: "⚙️", label: "Configuración Global", desc: "Variables y mantenimiento", href: "/dashboard/admin/configuraciones", color: "#f59e0b" },
        { icon: "🏷️", label: "Categorías de Tienda", desc: "Catálogo Ecommerce", href: "/dashboard/admin/categorias", color: "#ec4899" },
        { icon: "🕵️", label: "Revisión KYC", desc: "Verificar identidades pendientes", href: "/dashboard/admin/verificaciones", color: "#10b981" },
    ] : [];

    return (
        <div className={styles.container}>
            {/* Welcome Section */}
            <div className={styles["welcome-section"]}>
                <div>
                    <h1 className={styles["welcome-title"]}>
                        {mounted ? greeting() : "Hola"}, <span className="gradient-text">{user?.full_name?.split(" ")[0] || "Michilover"}</span> 👋
                    </h1>
                    <p className={styles["welcome-subtitle"]}>
                        ¿Qué quieres hacer hoy por tus michis y peludos?
                    </p>
                </div>
                <div className={styles["role-pill"]}>
                    {role === "admin" ? "🛡️" : role === "veterinario" ? "🩺" : role === "vendedor" ? "🏪" : "👤"}{" "}
                    {mounted ? role.charAt(0).toUpperCase() + role.slice(1) : "..."}
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className={styles["actions-grid"]}>
                {quickActions.map(action => (
                    <Link key={action.href} href={action.href} className={styles["action-card"]} style={{ "--accent-color": action.color } as React.CSSProperties}>
                        <span className={styles["action-icon"]}>{action.icon}</span>
                        <div>
                            <h3 className={styles["action-title"]}>{action.label}</h3>
                            <p className={styles["action-desc"]}>{action.desc}</p>
                        </div>
                        <span className={styles["action-arrow"]}>→</span>
                    </Link>
                ))}
            </div>

            {/* Admin Modules */}
            {roleModules.length > 0 && (
                <>
                    <h2 className={styles["section-heading"]}>🛡️ Herramientas de Administración</h2>
                    <div className={styles["actions-grid"]}>
                        {roleModules.map(mod => (
                            <Link key={mod.href} href={mod.href} className={styles["action-card"]} style={{ "--accent-color": "#7c3aed" } as React.CSSProperties}>
                                <span className={styles["action-icon"]}>{mod.icon}</span>
                                <div>
                                    <h3 className={styles["action-title"]}>{mod.label}</h3>
                                    <p className={styles["action-desc"]}>{mod.desc}</p>
                                </div>
                                <span className={styles["action-arrow"]}>→</span>
                            </Link>
                        ))}
                    </div>
                </>
            )}

            {/* Tip Card */}
            <div className={styles["tip-card"]}>
                <span style={{ fontSize: "1.5rem" }}>💡</span>
                <div>
                    <strong>Tip Michicondrias:</strong> Si tu mascota se pierde, crea un reporte en la{" "}
                    <Link href="/dashboard/perdidas" style={{ color: "var(--primary-light)", fontWeight: 600 }}>Red de Mascotas Perdidas</Link>{" "}
                    para que la comunidad te ayude a encontrarla.
                </div>
            </div>
        </div>
    );
}
