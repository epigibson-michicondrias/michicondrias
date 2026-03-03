"use client";

import { useEffect, useState } from "react";
import { getMyRequests, AdoptionRequest } from "@/lib/services/adopciones";
import dashStyles from "../../dashboard.module.css";
import styles from "./mis-solicitudes.module.css";

const STEPS = [
    { key: "PENDING", label: "Enviada", icon: "📨" },
    { key: "REVIEWING", label: "Revisión", icon: "🔍" },
    { key: "INTERVIEW_SCHEDULED", label: "Entrevista", icon: "💬" },
    { key: "APPROVED", label: "Aprobada", icon: "✅" },
    { key: "ADOPTED", label: "Finalizada", icon: "🎉" },
];

export default function MisSolicitudesPage() {
    const [requests, setRequests] = useState<AdoptionRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMyRequests();

        // Smart Polling: Refresh every 30 seconds
        const interval = setInterval(() => {
            loadMyRequests(true); // silent refresh
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    async function loadMyRequests(silent = false) {
        if (!silent) setLoading(true);
        try {
            const data = await getMyRequests();
            setRequests(data);
        } catch (err) {
            console.error("Error loading my requests", err);
        } finally {
            if (!silent) setLoading(false);
        }
    }

    const getProgressIndex = (status: string) => {
        if (status === "REJECTED") return -1;
        const index = STEPS.findIndex(s => s.key === status);
        return index !== -1 ? index : 0;
    };

    return (
        <div className={styles.container}>
            <div className={dashStyles["page-header"]}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                        <h1 className={dashStyles["page-title"]}>📄 Mis Solicitudes</h1>
                        <p className={dashStyles["page-subtitle"]}>Sigue el progreso de tus trámites de adopción en tiempo real</p>
                    </div>
                    <div className={dashStyles["live-indicator"]}>
                        <div className={dashStyles["live-dot"]} />
                        Live
                    </div>
                </div>
            </div>

            {loading ? (
                <p className={dashStyles["loading-text"]}>Cargando tus solicitudes...</p>
            ) : requests.length === 0 ? (
                <div className={dashStyles["empty-state"]}>
                    <span style={{ fontSize: "4rem" }}>🐾</span>
                    <p>Aún no has solicitado adoptar a ningún michicondria.</p>
                </div>
            ) : (
                requests.map(req => {
                    const currentIdx = getProgressIndex(req.status);
                    const isRejected = req.status === "REJECTED";
                    // Calculate progress bar width based on steps (4 intervals for 5 steps)
                    const progressWidth = isRejected ? 0 : (currentIdx / (STEPS.length - 1)) * 100;

                    return (
                        <div key={req.id} className={styles["request-card"]}>
                            <div className={styles.pawDecoration} style={{ position: "absolute", top: "-15px", right: "-15px", fontSize: "2.5rem", opacity: 0.1, pointerEvents: "none" }}>🐾</div>
                            <div className={styles["header-info"]} style={{ display: "flex", alignItems: "center", gap: "1.5rem", position: "relative", zIndex: 2 }}>
                                {req.pet_photo_url ? (
                                    <div
                                        style={{
                                            width: "70px", height: "70px", borderRadius: "50%",
                                            background: `url(${req.pet_photo_url}) center/cover no-repeat`,
                                            border: "3px solid #7c3aed",
                                            boxShadow: "0 0 15px rgba(124, 58, 237, 0.4)"
                                        }}
                                    />
                                ) : (
                                    <div
                                        style={{
                                            width: "70px", height: "70px", borderRadius: "50%",
                                            background: "linear-gradient(135deg, #1e1b4b, #0f172a)",
                                            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem",
                                            border: "3px solid #7c3aed",
                                            boxShadow: "0 0 15px rgba(124, 58, 237, 0.4)"
                                        }}
                                    >🐾</div>
                                )}
                                <div>
                                    <h2 className={styles.title}>
                                        Adopción de {req.pet_name || "Mascota"}
                                    </h2>
                                    <p className={styles.subtitle}>
                                        <span className={styles["request-id-badge"]}>#{req.id.substring(0, 8).toUpperCase()}</span> • Enviada para evaluación administrativa
                                    </p>
                                </div>
                            </div>

                            {isRejected ? (
                                <div className={styles["rejected-banner"]}>
                                    <span>❌</span>
                                    <span>Esta solicitud fue rechazada. No cumplió con todos los criterios de seguridad o la mascota fue asignada a otra familia.</span>
                                </div>
                            ) : (
                                <>
                                    {req.status === "ADOPTED" && (
                                        <div className={styles["adopted-banner"]}>
                                            <span>🎉</span>
                                            <div>
                                                <strong>¡Felicidades! La adopción ha sido finalizada.</strong>
                                                <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", opacity: 0.9 }}>
                                                    {req.pet_name || "Tu nueva mascota"} ya está registrada en tu perfil. Ve a{" "}
                                                    <a href="/dashboard/mascotas" style={{ color: "#fff", textDecoration: "underline" }}>Mis Mascotas</a>{" "}
                                                    para verla.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    <div className={styles.stepper}>
                                        {/* Desktop Progress Bar */}
                                        <div
                                            className={styles["stepper-progress"]}
                                            style={{ width: `${progressWidth}%` }}
                                            suppressHydrationWarning
                                        />

                                        {STEPS.map((step, idx) => {
                                            const isCompleted = idx < currentIdx;
                                            const isActive = idx === currentIdx;

                                            return (
                                                <div
                                                    key={step.key}
                                                    className={`${styles.step} ${isActive ? styles.active : ""} ${isCompleted ? styles.completed : ""}`}
                                                >
                                                    <div className={styles["step-icon"]}>
                                                        {isCompleted ? "✓" : step.icon}
                                                    </div>
                                                    <span className={styles["step-label"]}>{step.label}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
}
