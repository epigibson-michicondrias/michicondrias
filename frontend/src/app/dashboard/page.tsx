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
        async function load() {
            try {
                const u = await getCurrentUser();
                setUser(u);
                const currentRole = getUserRole();
                setRole(currentRole);

                if (currentRole === "admin") {
                    const data = await getAdminAnalytics();
                    setMetrics(data);
                }
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
                    {role === "admin" ? "🛡️" : role === "veterinario" ? "🩺" : role === "vendedor" ? "🏪" : "👤"}{" "}
                    {mounted ? role.charAt(0).toUpperCase() + role.slice(1) : "..."}
                </div>
            </div>

            {/* ---> ADMIN DASHBOARD SECTION <--- */}
            {role === "admin" && mounted && metrics && (
                <div style={{ marginBottom: "3rem" }}>
                    <h2 className={styles["section-heading"]}>📊 Resumen de Plataforma</h2>

                    {/* KPIs */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
                        <div style={{ background: "var(--surface)", padding: "1.5rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)" }}>
                            <div style={{ fontSize: "2.5rem", fontWeight: "800", color: "var(--primary)" }}>{metrics.kpis.total_users}</div>
                            <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Usuarios Registrados</div>
                        </div>
                        <div style={{ background: "var(--surface)", padding: "1.5rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)" }}>
                            <div style={{ fontSize: "2.5rem", fontWeight: "800", color: "#f59e0b" }}>{metrics.kpis.pending_verifications}</div>
                            <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Pendientes KYC</div>
                        </div>
                        <div style={{ background: "var(--surface)", padding: "1.5rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)" }}>
                            <div style={{ fontSize: "2.5rem", fontWeight: "800", color: "#10b981" }}>{metrics.kpis.approved_verifications}</div>
                            <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Identidades Aprobadas</div>
                        </div>
                        <div style={{ background: "var(--surface)", padding: "1.5rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)" }}>
                            <div style={{ fontSize: "2.5rem", fontWeight: "800", color: "#6366f1" }}>{metrics.kpis.system_admins}</div>
                            <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Administradores Activos</div>
                        </div>
                    </div>

                    {/* CHARTS */}
                    <div style={{ background: "var(--surface)", padding: "1.5rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", height: "350px", display: "flex", flexDirection: "column" }}>
                        <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem" }}>Distribución de Roles de Usuario</h3>
                        <div style={{ flex: 1, minHeight: 0 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        contentStyle={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}
                                        itemStyle={{ color: "var(--text-primary)" }}
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
                    <div className={styles["actions-grid"]} style={{ marginBottom: "3rem" }}>
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

            {/* Quick Actions Grid (For everyone, but lower for admin) */}
            <h2 className={styles["section-heading"]}>{role === "admin" ? "🐾 Accesos Rápidos" : ""}</h2>
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

            {/* Tip Card */}
            <div className={styles["tip-card"]} style={{ marginTop: "2rem" }}>
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
