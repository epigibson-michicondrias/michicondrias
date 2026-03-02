"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { getPendingAdoptions, approveAdoption, rejectAdoption } from "@/lib/services/moderacion";
import { Listing } from "@/lib/services/adopciones";
import styles from "./moderacion.module.css";

export default function ModeracionPage() {
    const [pendingAdoptions, setPendingAdoptions] = useState<Listing[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"adopciones" | "perdidas" | "directorio">("adopciones");

    useEffect(() => {
        loadPending();
    }, [activeTab]);

    async function loadPending() {
        setIsLoading(true);
        try {
            if (activeTab === "adopciones") {
                const data = await getPendingAdoptions();
                setPendingAdoptions(data);
            } else {
                // Future implementation
                setPendingAdoptions([]);
            }
        } catch (error: any) {
            toast.error(error.message || "Error al cargar contenido pendiente");
            setPendingAdoptions([]);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleApprove(id: string, name: string) {
        if (!confirm(`¿Estás seguro de aprobar la publicación de: ${name}?`)) return;

        try {
            if (activeTab === "adopciones") {
                await approveAdoption(id);
                setPendingAdoptions(prev => prev.filter(p => p.id !== id));
                toast.success(`Publicación de ${name} aprobada. ¡Ahora es visible!`);
            }
        } catch (error: any) {
            toast.error(error.message || "Error al aprobar publicación");
        }
    }

    async function handleReject(id: string, name: string) {
        if (!confirm(`¿Estás seguro de RECHAZAR y eliminar permanentemente a: ${name}?`)) return;

        try {
            if (activeTab === "adopciones") {
                await rejectAdoption(id);
                setPendingAdoptions(prev => prev.filter(p => p.id !== id));
                toast.success(`Publicación rechazada y eliminada.`);
            }
        } catch (error: any) {
            toast.error(error.message || "Error al rechazar publicación");
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>🛡️ Centro de Moderación</h1>
                    <p className={styles.subtitle}>Aprueba o rechaza el contenido subido por los usuarios antes de que sea público.</p>
                </div>
            </div>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'adopciones' ? styles.active : ''}`}
                    onClick={() => setActiveTab('adopciones')}
                >
                    Adopciones Pendientes
                    {activeTab === 'adopciones' && pendingAdoptions.length > 0 && (
                        <span style={{ marginLeft: "6px", background: "var(--primary)", color: "white", padding: "2px 6px", borderRadius: "10px", fontSize: "0.8rem" }}>
                            {pendingAdoptions.length}
                        </span>
                    )}
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'perdidas' ? styles.active : ''}`}
                    onClick={() => setActiveTab('perdidas')}
                    disabled
                    style={{ opacity: 0.5, cursor: "not-allowed" }}
                >
                    Mascotas Perdidas (Próximamente)
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'directorio' ? styles.active : ''}`}
                    onClick={() => setActiveTab('directorio')}
                    disabled
                    style={{ opacity: 0.5, cursor: "not-allowed" }}
                >
                    Directorio (Próximamente)
                </button>
            </div>

            {isLoading ? (
                <div className={styles['loading-state']}>Cargando publicaciones pendientes...</div>
            ) : pendingAdoptions.length === 0 ? (
                <div className={styles['empty-state']}>
                    <span className={styles['empty-icon']}>🎉</span>
                    <h3 className={styles['empty-title']}>¡Todo está al día!</h3>
                    <p className={styles['empty-desc']}>No hay publicaciones pendientes de revisión en esta categoría.</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {pendingAdoptions.map(pet => (
                        <div key={pet.id} className={styles.card}>
                            <div className={styles['card-image-wrapper']}>
                                {pet.photo_url ? (
                                    <Image
                                        src={pet.photo_url}
                                        alt={pet.name}
                                        fill
                                        style={{ objectFit: "cover" }}
                                    />
                                ) : (
                                    <div className={styles['card-no-image']}>📷</div>
                                )}
                            </div>

                            <div className={styles['card-content']}>
                                <h3 className={styles['pet-name']}>{pet.name}</h3>

                                <div className={styles['pet-traits']}>
                                    <span className={styles['trait-badge']}>{pet.species.toUpperCase()}</span>
                                    {pet.breed && <span className={styles['trait-badge']}>{pet.breed}</span>}
                                    <span className={styles['trait-badge']}>{pet.age_months} meses</span>
                                    <span className={styles['trait-badge']}>Tamaño: {pet.size || 'N/A'}</span>
                                </div>

                                <p className={styles['pet-desc']}>{pet.description || "Sin descripción proporcionada."}</p>

                                <div className={styles['card-actions']}>
                                    <button
                                        className={styles['btn-reject']}
                                        onClick={() => handleReject(pet.id, pet.name)}
                                    >
                                        ❌ Rechazar
                                    </button>
                                    <button
                                        className={styles['btn-approve']}
                                        onClick={() => handleApprove(pet.id, pet.name)}
                                    >
                                        ✅ Aprobar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
