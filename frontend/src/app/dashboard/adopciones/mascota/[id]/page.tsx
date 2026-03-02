"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getListing, Listing } from "@/lib/services/adopciones";
import { getUserRole } from "@/lib/auth";
import dashStyles from "../../../dashboard.module.css";
import styles from "./mascota.module.css";

const SPECIES_EMOJI: Record<string, string> = {
    perro: "🐕",
    gato: "🐈",
    ave: "🐦",
    otro: "🐾",
};

export default function MascotaDetailPage(props: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    // Unwrap params in Next.js 15
    const { id } = React.use(props.params);

    useEffect(() => {
        const role = localStorage.getItem("user_role");
        setIsAdmin(role === "admin" || role === "veterinario");

        async function load() {
            try {
                const data = await getListing(id);
                setListing(data);
            } catch (err) {
                console.error("Error cargando perfil de la mascota", err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id]);

    if (loading) {
        return (
            <div className={dashStyles["page-header"]}>
                <h1 className={dashStyles["page-title"]}>Cargando Perfil...</h1>
            </div>
        );
    }

    if (!listing) {
        return (
            <div className={dashStyles["empty-state"]}>
                <span style={{ fontSize: "4rem" }}>😢</span>
                <p>No logramos encontrar a esta mascota.</p>
                <button onClick={() => router.push("/dashboard/adopciones")} className="btn btn-secondary" style={{ marginTop: "1rem" }}>
                    Volver a la galería
                </button>
            </div>
        );
    }

    const emoji = SPECIES_EMOJI[listing.species] || "🐾";

    return (
        <div className={styles["profile-container"]}>
            {/* Header Visual */}
            <div className={`${styles["visual-header"]} ${styles[`visual-header--${listing.species}`]}`}>
                {listing.photo_url ? (
                    <img src={listing.photo_url} alt={listing.name} className={styles["hero-image"]} />
                ) : (
                    <div className={styles["emoji-placeholder"]}>{emoji}</div>
                )}

                <div className={styles["hero-overlay"]}>
                    <button className={styles["back-btn"]} onClick={() => router.back()}>
                        ← Volver a la Galería
                    </button>
                    <div className={styles["hero-tags"]}>
                        <span className={styles["status-badge"]}>
                            {listing.status === "abierto" ? "☀️ Disponible para Adopción" : "En proceso..."}
                        </span>
                    </div>
                </div>
            </div>

            {/* Información Principal */}
            <div className={styles["profile-body"]}>
                <div className={styles["main-info"]}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                        <div>
                            <h1 className={styles["pet-name"]}>{listing.name}</h1>
                            <p className={styles["pet-metadata"]}>
                                {listing.breed || "Mestizo"} • {listing.species.charAt(0).toUpperCase() + listing.species.slice(1)}
                            </p>
                        </div>
                        {/* Call to action principal */}
                        <div className={styles["action-box"]}>
                            {!isAdmin ? (
                                <Link href={`/dashboard/adopciones/solicitud?id=${listing.id}`} className={styles["adopt-btn-large"]}>
                                    💛 Enviar Solicitud de Adopción
                                </Link>
                            ) : (
                                <Link href={`/dashboard/adopciones/solicitudes?id=${listing.id}`} className={styles["adopt-btn-large"]} style={{ background: "rgba(124, 58, 237, 0.2)", border: "1px solid rgba(124, 58, 237, 0.4)", color: "#fff" }}>
                                    🕵️ Ver Solicitudes Recibidas
                                </Link>
                            )}
                            <p className={styles["action-disclaimer"]}>El proceso requiere validación de identidad (KYC)</p>
                        </div>
                    </div>

                    {/* Fila de Datos Rápidos */}
                    <div className={styles["quick-stats"]}>
                        <div className={styles["stat-card"]}>
                            <span className={styles["stat-icon"]}>📅</span>
                            <div className={styles["stat-text"]}>
                                <span className={styles["stat-label"]}>Edad aproximada</span>
                                <span className={styles["stat-value"]}>{listing.age_months != null ? `${listing.age_months} meses` : "Desconocida"}</span>
                            </div>
                        </div>
                        <div className={styles["stat-card"]}>
                            <span className={styles["stat-icon"]}>📏</span>
                            <div className={styles["stat-text"]}>
                                <span className={styles["stat-label"]}>Tamaño proyectado</span>
                                <span className={styles["stat-value"]}>{listing.size ? listing.size.charAt(0).toUpperCase() + listing.size.slice(1) : "No especificado"}</span>
                            </div>
                        </div>
                        <div className={styles["stat-card"]}>
                            <span className={styles["stat-icon"]}>📋</span>
                            <div className={styles["stat-text"]}>
                                <span className={styles["stat-label"]}>Expediente Médico</span>
                                <span className={styles["stat-value"]} style={{ color: "var(--primary-light)" }}>Verificado por Michicondrias</span>
                            </div>
                        </div>
                    </div>

                    <div className={dashStyles["form-divider"]} style={{ margin: "2.5rem 0" }} />

                    {/* Historia */}
                    <h3 className={styles["section-title"]}>📖 Su Historia</h3>
                    <div className={styles["description-box"]}>
                        {listing.description ? (
                            <p>{listing.description}</p>
                        ) : (
                            <p style={{ fontStyle: "italic", opacity: 0.6 }}>No hay una descripción detallada disponible para esta mascota.</p>
                        )}
                    </div>

                    {/* Compromisos */}
                    <h3 className={styles["section-title"]} style={{ marginTop: "2rem" }}>🤝 Compromisos Requeridos</h3>
                    <ul className={styles["commitment-list"]}>
                        <li>Espacio seguro y protegido para sus necesidades de vida.</li>
                        <li>Entrevista y revisión de tu historial preventivo con mascotas.</li>
                        <li>Aceptación de gastos veterinarios y de buena alimentación por el resto de su vida.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
