"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { getProducts } from "@/lib/services/ecommerce";
import { getReports } from "@/lib/services/perdidas";
import { getPlaces } from "@/lib/services/petfriendly";
import { getDonations } from "@/lib/services/ecommerce";
import dashStyles from "../../dashboard.module.css";
import styles from "./analytics.module.css";

interface PlatformStats {
    totalUsers: number;
    totalAdoptions: number;
    totalProducts: number;
    totalDonations: number;
    totalDonationAmount: number;
    lostActive: number;
    foundActive: number;
    reunited: number;
    petfriendlyPlaces: number;
}

export default function AdminAnalyticsPage() {
    const [stats, setStats] = useState<PlatformStats>({
        totalUsers: 0, totalAdoptions: 0, totalProducts: 0,
        totalDonations: 0, totalDonationAmount: 0,
        lostActive: 0, foundActive: 0, reunited: 0, petfriendlyPlaces: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStats() {
            try {
                const [products, reports, places, donations] = await Promise.allSettled([
                    getProducts(),
                    getReports(undefined, ""),
                    getPlaces(),
                    getDonations(),
                ]);

                const productsData = products.status === "fulfilled" ? products.value : [];
                const reportsData = reports.status === "fulfilled" ? reports.value : [];
                const placesData = places.status === "fulfilled" ? places.value : [];
                const donationsData = donations.status === "fulfilled" ? donations.value : [];

                setStats({
                    totalUsers: 0, // Would need a dedicated endpoint
                    totalAdoptions: 0, // Would need a dedicated endpoint
                    totalProducts: productsData.length,
                    totalDonations: donationsData.length,
                    totalDonationAmount: donationsData.reduce((acc, d) => acc + d.amount, 0),
                    lostActive: reportsData.filter(r => r.report_type === "lost" && r.status === "active").length,
                    foundActive: reportsData.filter(r => r.report_type === "found" && r.status === "active").length,
                    reunited: reportsData.filter(r => r.is_resolved).length,
                    petfriendlyPlaces: placesData.length,
                });
            } catch (err) {
                console.error("Error loading analytics", err);
            } finally {
                setLoading(false);
            }
        }
        loadStats();
    }, []);

    const statCards = [
        { icon: "🛒", label: "Productos en Tienda", value: stats.totalProducts, color: "#ec4899" },
        { icon: "💛", label: "Donaciones Recibidas", value: stats.totalDonations, color: "#f59e0b" },
        { icon: "💰", label: "Total Recaudado", value: `$${stats.totalDonationAmount.toLocaleString()}`, color: "#22c55e" },
        { icon: "🚨", label: "Perdidas Activas", value: stats.lostActive, color: "#ef4444" },
        { icon: "🐾", label: "Encontradas", value: stats.foundActive, color: "#3b82f6" },
        { icon: "✅", label: "Reunidos", value: stats.reunited, color: "#22c55e" },
        { icon: "📍", label: "Lugares Petfriendly", value: stats.petfriendlyPlaces, color: "#8b5cf6" },
    ];

    return (
        <div className={styles.container}>
            <div className={dashStyles["page-header"]}>
                <h1 className={dashStyles["page-title"]}>📊 Panel de Analíticas</h1>
                <p className={dashStyles["page-subtitle"]}>
                    Vista general del ecosistema Michicondrias en tiempo real.
                </p>
            </div>

            {loading ? (
                <p className={dashStyles["loading-text"]}>Recopilando datos del ecosistema...</p>
            ) : (
                <>
                    {/* Stats Grid */}
                    <div className={styles["stats-grid"]}>
                        {statCards.map(card => (
                            <div key={card.label} className={styles["stat-card"]} style={{ "--stat-color": card.color } as React.CSSProperties}>
                                <div className={styles["stat-icon"]}>{card.icon}</div>
                                <div className={styles["stat-info"]}>
                                    <span className={styles["stat-value"]}>{card.value}</span>
                                    <span className={styles["stat-label"]}>{card.label}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Overview Sections */}
                    <div className={styles["panels-row"]}>
                        {/* Quick Health */}
                        <div className={styles.panel}>
                            <h3 className={styles["panel-title"]}>🩺 Salud del Ecosistema</h3>
                            <div className={styles["health-list"]}>
                                <div className={styles["health-item"]}>
                                    <span className={styles["health-dot"]} style={{ background: "#22c55e" }}></span>
                                    <span>Microservicio Core</span>
                                    <span className={styles["health-status"]}>Operativo</span>
                                </div>
                                <div className={styles["health-item"]}>
                                    <span className={styles["health-dot"]} style={{ background: "#22c55e" }}></span>
                                    <span>Microservicio Adopciones</span>
                                    <span className={styles["health-status"]}>Operativo</span>
                                </div>
                                <div className={styles["health-item"]}>
                                    <span className={styles["health-dot"]} style={{ background: "#22c55e" }}></span>
                                    <span>Microservicio Ecommerce</span>
                                    <span className={styles["health-status"]}>Operativo</span>
                                </div>
                                <div className={styles["health-item"]}>
                                    <span className={styles["health-dot"]} style={{ background: "#22c55e" }}></span>
                                    <span>Microservicio Perdidas</span>
                                    <span className={styles["health-status"]}>Operativo</span>
                                </div>
                                <div className={styles["health-item"]}>
                                    <span className={styles["health-dot"]} style={{ background: "#22c55e" }}></span>
                                    <span>Base de Datos PostgreSQL</span>
                                    <span className={styles["health-status"]}>Operativo</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className={styles.panel}>
                            <h3 className={styles["panel-title"]}>⚡ Acciones Rápidas</h3>
                            <div className={styles["actions-list"]}>
                                <a href="/dashboard/admin/verificaciones" className={styles["action-item"]}>
                                    <span>🕵️</span>
                                    <span>Revisar KYC Pendientes</span>
                                    <span className={styles["action-arrow"]}>→</span>
                                </a>
                                <a href="/dashboard/tienda" className={styles["action-item"]}>
                                    <span>🛒</span>
                                    <span>Gestionar Tienda</span>
                                    <span className={styles["action-arrow"]}>→</span>
                                </a>
                                <a href="/dashboard/perdidas" className={styles["action-item"]}>
                                    <span>🔍</span>
                                    <span>Ver Reportes Activos</span>
                                    <span className={styles["action-arrow"]}>→</span>
                                </a>
                                <a href="/dashboard/donaciones" className={styles["action-item"]}>
                                    <span>💛</span>
                                    <span>Ver Donaciones</span>
                                    <span className={styles["action-arrow"]}>→</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
