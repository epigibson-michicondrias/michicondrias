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
    }, []);

    async function loadMyRequests() {
        try {
            const data = await getMyRequests();
            setRequests(data);
        } catch (err) {
            console.error("Error loading my requests", err);
        } finally {
            setLoading(false);
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
                <h1 className={dashStyles["page-title"]}>📄 Mis Solicitudes</h1>
                <p className={dashStyles["page-subtitle"]}>Sigue el progreso de tus trámites de adopción en tiempo real</p>
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
                            <div className={styles["header-info"]} style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                                {req.pet_photo_url ? (
                                    <div
                                        style={{
                                            width: "65px", height: "65px", borderRadius: "50%",
                                            background: `url(${req.pet_photo_url}) center/cover no-repeat`,
                                            border: "2px solid rgba(124, 58, 237, 0.4)"
                                        }}
                                    />
                                ) : (
                                    <div
                                        style={{
                                            width: "65px", height: "65px", borderRadius: "50%",
                                            background: "linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(236, 72, 153, 0.1))",
                                            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem",
                                            border: "2px solid rgba(124, 58, 237, 0.4)"
                                        }}
                                    >🐾</div>
                                )}
                                <div>
                                    <h2 className={styles.title}>
                                        Adopción de {req.pet_name || "Mascota"}
                                    </h2>
                                    <p className={styles.subtitle}>Solicitud #{req.id.substring(0, 8)} • Enviada para evaluación administrativa</p>
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
