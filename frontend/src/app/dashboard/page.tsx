"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCurrentUser, User, getUserRole } from "@/lib/auth";
import { getAdminAnalytics, AnalyticsMetrics } from "@/lib/services/analytics";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";
import dashStyles from "./dashboard.module.css";
import styles from "./home.module.css";

interface QuickStat {
    icon: string;
    label: string;
    value: string | number;
    href: string;
    color: string;
}

const COLORS = ['#7c3aed', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];

export default function DashboardHomePage() {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState("consumidor");
    const [mounted, setMounted] = useState(false);
    const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);

    useEffect(() => {
        setMounted(true);
        const currentRole = getUserRole();
        setRole(currentRole);

        async function load() {
            try {
                const u = await getCurrentUser();
                setUser(u);

                if (currentRole === "admin") {
                    const data = await getAdminAnalytics();
                    setMetrics(data);
                }
            } catch { }
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
        {
            icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 2-1.99 2-1.99a8.1 8.1 0 0 1 0 4.13c1.08.77 2 2.11 2 3.6 0 3-1.61 5.5-4 6.5l-1 2-1-2c-2.39-1-4-3.5-4-6.5 0-1.49.92-2.83 2-3.6a8.1 8.1 0 0 1 0-4.13s.22-.01 2 1.99c.65-.17 1.33-.26 2-.26Z" /><circle cx="12" cy="10" r="1" /></svg>,
            label: "Adoptar una mascota",
            desc: "Encuentra a tu compañero ideal",
            href: "/dashboard/adopciones",
            color: "#7c3aed"
        },
        {
            icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>,
            label: "Tienda y Marketplace",
            desc: "Productos para tu mascota",
            href: "/dashboard/tienda",
            color: "#ec4899"
        },
        {
            icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>,
            label: "Mascotas Perdidas",
            desc: "Red de apoyo comunitario",
            href: "/dashboard/perdidas",
            color: "#ef4444"
        },
        {
            icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
            label: "Carnet Clínico",
            desc: "Historial médico digital",
            href: "/dashboard/carnet",
            color: "#3b82f6"
        },
        {
            icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>,
            label: "Donar",
            desc: "Apoya refugios y causas",
            href: "/dashboard/donaciones",
            color: "#f59e0b"
        },
        {
            icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>,
            label: "Petfriendly",
            desc: "Lugares que aceptan mascotas",
            href: "/dashboard/petfriendly",
            color: "#22c55e"
        },
    ];

    const roleModules = role === "admin" ? [
        {
            icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /></svg>,
            label: "Roles y Permisos",
            desc: "Gestión de accesos",
            href: "/dashboard/admin/roles",
            color: "#6366f1"
        },
        {
            icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>,
            label: "Configuración Global",
            desc: "Variables y mantenimiento",
            href: "/dashboard/admin/configuraciones",
            color: "#f59e0b"
        },
        {
            icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>,
            label: "Categorías de Tienda",
            desc: "Catálogo Ecommerce",
            href: "/dashboard/admin/categorias",
            color: "#ec4899"
        },
        {
            icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg>,
            label: "Revisión KYC",
            desc: "Verificar identidades pendientes",
            href: "/dashboard/admin/verificaciones",
            color: "#10b981"
        },
    ] : [];

    const pieData = metrics ? Object.entries(metrics.role_distribution).map(([name, value]) => ({ name, value })) : [];

    return (
        <div className={styles.container}>
            {/* Welcome Section */}
            <div className={styles["welcome-section"]}>
                <div>
                    <h1 className={styles["welcome-title"]}>
                        {mounted ? greeting() : "Hola"}, <span className="gradient-text">{user?.full_name?.split(" ")[0] || "Michilover"}</span> 👋
                    </h1>
                    <p className={styles["welcome-subtitle"]}>
                        {role === "admin" ? "Panel de control general de Michicondrias" : "¿Qué quieres hacer hoy por tus michis y peludos?"}
                    </p>
                </div>
                <div className={styles["role-pill"]}>
                    <span>{role === "admin" ? "🛡️" : role === "veterinario" ? "🩺" : role === "vendedor" ? "🏪" : "👤"}</span>
                    {mounted ? role.charAt(0).toUpperCase() + role.slice(1) : "..."}
                </div>
            </div>

            {/* ---> ADMIN DASHBOARD SECTION <--- */}
            {role === "admin" && mounted && metrics && (
                <div style={{ marginBottom: "3rem" }}>
                    <h2 className={styles["section-heading"]}>📊 Resumen de Plataforma</h2>

                    {/* KPIs */}
                    <div className={styles["kpi-grid"]}>
                        <div className={styles["kpi-card"]} style={{ "--accent-color": "var(--primary)" } as React.CSSProperties}>
                            <div className={styles["kpi-value"]}>{metrics.kpis.total_users}</div>
                            <div className={styles["kpi-label"]}>Usuarios Registrados</div>
                        </div>
                        <div className={styles["kpi-card"]} style={{ "--accent-color": "#f59e0b" } as React.CSSProperties}>
                            <div className={styles["kpi-value"]} style={{ color: "#f59e0b" }}>{metrics.kpis.pending_verifications}</div>
                            <div className={styles["kpi-label"]}>Pendientes KYC</div>
                        </div>
                        <div className={styles["kpi-card"]} style={{ "--accent-color": "#10b981" } as React.CSSProperties}>
                            <div className={styles["kpi-value"]} style={{ color: "#10b981" }}>{metrics.kpis.approved_verifications}</div>
                            <div className={styles["kpi-label"]}>Identidades Aprobadas</div>
                        </div>
                        <div className={styles["kpi-card"]} style={{ "--accent-color": "#6366f1" } as React.CSSProperties}>
                            <div className={styles["kpi-value"]} style={{ color: "#6366f1" }}>{metrics.kpis.system_admins}</div>
                            <div className={styles["kpi-label"]}>Administradores Activos</div>
                        </div>
                    </div>

                    {/* CHARTS */}
                    <div className={styles["chart-container"]}>
                        <h3 style={{ margin: "0 0 1.5rem 0", fontSize: "1.2rem", fontWeight: 800 }}>Distribución de Roles de Usuario</h3>
                        <div style={{ height: "300px", minHeight: 0 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={100}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        contentStyle={{ background: "rgba(15,15,26,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", backdropFilter: "blur(10px)" }}
                                        itemStyle={{ color: "#fff", fontWeight: 600 }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* Admin Modules */}
            {roleModules.length > 0 && (
                <>
                    <h2 className={styles["section-heading"]}>🛡️ Herramientas de Administración</h2>
                    <div className={styles["actions-grid"]} style={{ marginBottom: "3.5rem" }}>
                        {roleModules.map(mod => (
                            <Link key={mod.href} href={mod.href} className={styles["action-card"]} style={{ "--accent-color": mod.color } as React.CSSProperties}>
                                <div className={styles["action-icon-box"]}>{mod.icon}</div>
                                <div className={styles["action-content"]}>
                                    <h3 className={styles["action-title"]}>{mod.label}</h3>
                                    <p className={styles["action-desc"]}>{mod.desc}</p>
                                </div>
                                <span className={styles["action-arrow"]}>→</span>
                            </Link>
                        ))}
                    </div>
                </>
            )}

            {/* Quick Actions Grid (For everyone, but lower for admin) */}
            <h2 className={styles["section-heading"]}>{role === "admin" ? "🐾 Accesos Rápidos" : ""}</h2>
            <div className={styles["actions-grid"]}>
                {quickActions.map(action => (
                    <Link key={action.href} href={action.href} className={styles["action-card"]} style={{ "--accent-color": action.color } as React.CSSProperties}>
                        <div className={styles["action-icon-box"]}>{action.icon}</div>
                        <div className={styles["action-content"]}>
                            <h3 className={styles["action-title"]}>{action.label}</h3>
                            <p className={styles["action-desc"]}>{action.desc}</p>
                        </div>
                        <span className={styles["action-arrow"]}>→</span>
                    </Link>
                ))}
            </div>

            {/* Tip Card */}
            <div className={styles["tip-card"]}>
                <span style={{ fontSize: "2rem" }}>💡</span>
                <div>
                    <strong>Tip Michicondrias:</strong> Si tu mascota se pierde, crea un reporte en la{" "}
                    <Link href="/dashboard/perdidas" style={{ color: "var(--primary-light)", fontWeight: 700, textDecoration: "none" }}>Red de Mascotas Perdidas</Link>{" "}
                    para que la comunidad te ayude a encontrarla al instante.
                </div>
            </div>
        </div>
    );
}
