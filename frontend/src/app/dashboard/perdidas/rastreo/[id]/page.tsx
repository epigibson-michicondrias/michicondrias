"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getReportById, LostPetReport, updateTrackerLocation } from "@/lib/services/perdidas";
import dashStyles from "../../../dashboard.module.css";
import styles from "./rastreo.module.css";
import { toast } from "react-hot-toast";

export default function TrackingPage() {
    const params = useParams();
    const router = useRouter();
    const [report, setReport] = useState<LostPetReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [markerPos, setMarkerPos] = useState({ x: 50, y: 50 }); // percentages
    const [distance, setDistance] = useState(0);

    useEffect(() => {
        async function load() {
            try {
                const rep = await getReportById(params.id as string);
                if (!rep) {
                    toast.error("Reporte no encontrado");
                    router.push("/dashboard/perdidas");
                    return;
                }
                if (!rep.has_tracker) {
                    toast.error("El Michi no tiene una membresía Tracker Activa");
                    router.push("/dashboard/perdidas");
                    return;
                }
                setReport(rep);

                // Initialize random position
                setMarkerPos({
                    x: 30 + Math.random() * 40,
                    y: 30 + Math.random() * 40
                });
                setDistance(Math.floor(Math.random() * 500) + 50);

            } catch (error) {
                console.error(error);
                router.push("/dashboard/perdidas");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [params.id, router]);

    // Simulate real-time tracker movements
    useEffect(() => {
        if (!report || report.is_resolved) return;

        const interval = setInterval(() => {
            setMarkerPos(prev => {
                // Random drift
                const newX = Math.max(10, Math.min(90, prev.x + (Math.random() * 4 - 2)));
                const newY = Math.max(10, Math.min(90, prev.y + (Math.random() * 4 - 2)));

                // Simulate saving to backend every couple of movements
                if (Math.random() > 0.5) {
                    updateTrackerLocation(report.id, newX, newY).catch(() => { });
                }

                return { x: newX, y: newY };
            });
            setDistance(prev => Math.max(0, prev + Math.floor(Math.random() * 20 - 10)));
        }, 3000);

        return () => clearInterval(interval);
    }, [report]);

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: 'var(--primary-light)' }}>Conectando con Satélite GPS...</div>;
    }

    if (!report) return null;

    return (
        <div>
            <div className={dashStyles["page-header"]} style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className={dashStyles["page-title"]}>
                        <button
                            onClick={() => router.back()}
                            className={dashStyles["back-button-premium"]}
                            title="Volver"
                            style={{ marginRight: '1rem' }}
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>
                        </button>
                        Rastreo Satelital: {report.pet_name}
                    </h1>
                </div>
            </div>

            <div className={styles["tracking-container"]}>
                <div className={styles["map-simulation"]}>
                    <div className={styles["radar"]}>
                        <div className={styles["radar-sweep"]}></div>

                        <div
                            className={styles["pet-marker"]}
                            style={{ left: `${markerPos.x}%`, top: `${markerPos.y}%` }}
                        ></div>
                    </div>

                    <div className={styles["overlay-ui"]}>
                        <div className={styles["info-panel"]}>
                            <div className={styles["pet-identity"]}>
                                <div className={styles["pet-avatar"]}>
                                    {!report.image_url && <span style={{ fontSize: "2rem" }}>{report.species === "gato" ? "🐈" : report.species === "perro" ? "🐕" : "🐾"}</span>}
                                    {report.image_url && <img src={report.image_url} alt={report.pet_name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }} />}
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#fff', fontWeight: 900 }}>{report.pet_name}</h3>
                                    <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Tracker: ID-{report.tracker_device_id || "7A9F-2B"}</p>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <div className={styles["status-badge"]}>
                                    <span className={styles["status-dot"]}></span>
                                    Enlace Establecido
                                </div>
                            </div>

                            <div className={styles["stats-grid"]}>
                                <div className={styles["stat-item"]}>
                                    <div className={styles["stat-label"]}>Precisión GPS</div>
                                    <div className={styles["stat-value"]} style={{ color: '#10b981' }}>2.4m</div>
                                </div>
                                <div className={styles["stat-item"]}>
                                    <div className={styles["stat-label"]}>Batería Collar</div>
                                    <div className={styles["stat-value"]}>84% 🔋</div>
                                </div>
                                <div className={styles["stat-item"]}>
                                    <div className={styles["stat-label"]}>Distancia Prox.</div>
                                    <div className={styles["stat-value"]}>{distance}m</div>
                                </div>
                                <div className={styles["stat-item"]}>
                                    <div className={styles["stat-label"]}>Último Ping</div>
                                    <div className={styles["stat-value"]}>Hace 3s</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
