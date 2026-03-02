"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { getPendingAdoptions, approveAdoption, rejectAdoption, getPendingLostPets, approveLostPet, rejectLostPet, getPendingClinics, approveClinic, rejectClinic } from "@/lib/services/moderacion";
import { Listing } from "@/lib/services/adopciones";
import { LostPetReport } from "@/lib/services/perdidas";
import styles from "./moderacion.module.css";

export default function ModeracionPage() {
    const [pendingAdoptions, setPendingAdoptions] = useState<Listing[]>([]);
    const [pendingLostPets, setPendingLostPets] = useState<LostPetReport[]>([]);
    const [pendingClinics, setPendingClinics] = useState<any[]>([]);
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
            } else if (activeTab === "perdidas") {
                const data = await getPendingLostPets();
                setPendingLostPets(data);
            } else if (activeTab === "directorio") {
                const data = await getPendingClinics();
                setPendingClinics(data);
            } else {
                setPendingAdoptions([]);
                setPendingLostPets([]);
                setPendingClinics([]);
            }
        } catch (error: any) {
            toast.error(error.message || "Error al cargar contenido pendiente");
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
            } else if (activeTab === "perdidas") {
                await approveLostPet(id);
                setPendingLostPets(prev => prev.filter(p => p.id !== id));
                toast.success(`Reporte de mascota pérdida de ${name} revisado y liberado.`);
            } else if (activeTab === "directorio") {
                await approveClinic(id);
                setPendingClinics(prev => prev.filter(p => p.id !== id));
                toast.success(`Clínica / Profesional ${name} aprobado y ya es público.`);
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
            } else if (activeTab === "perdidas") {
                await rejectLostPet(id);
                setPendingLostPets(prev => prev.filter(p => p.id !== id));
                toast.success(`Reporte falso de ${name} eliminado del sistema.`);
            } else if (activeTab === "directorio") {
                await rejectClinic(id);
                setPendingClinics(prev => prev.filter(p => p.id !== id));
                toast.success(`Solicitud de ${name} rechazada y eliminada.`);
            }
        } catch (error: any) {
            toast.error(error.message || "Error al rechazar publicación");
        }
    }

    const currentData = activeTab === "adopciones" ? pendingAdoptions : (activeTab === "perdidas" ? pendingLostPets : (activeTab === "directorio" ? pendingClinics : []));

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>🛡️ Centro de Moderación</h1>
                    <p className={styles.subtitle}>Aprueba o rechaza el contenido subido por los usuarios antes de que sea público o retira spam.</p>
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
                >
                    Mascotas Perdidas Nuevas
                    {activeTab === 'perdidas' && pendingLostPets.length > 0 && (
                        <span style={{ marginLeft: "6px", background: "#ef4444", color: "white", padding: "2px 6px", borderRadius: "10px", fontSize: "0.8rem" }}>
                            {pendingLostPets.length}
                        </span>
                    )}
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'directorio' ? styles.active : ''}`}
                    onClick={() => setActiveTab('directorio')}
                >
                    Directorio Profesional
                    {activeTab === 'directorio' && pendingClinics.length > 0 && (
                        <span style={{ marginLeft: "6px", background: "var(--accent)", color: "white", padding: "2px 6px", borderRadius: "10px", fontSize: "0.8rem" }}>
                            {pendingClinics.length}
                        </span>
                    )}
                </button>
            </div>

            {isLoading ? (
                <div className={styles['loading-state']}>Cargando publicaciones pendientes...</div>
            ) : currentData.length === 0 ? (
                <div className={styles['empty-state']}>
                    <span className={styles['empty-icon']}>🎉</span>
                    <h3 className={styles['empty-title']}>¡Todo está al día!</h3>
                    <p className={styles['empty-desc']}>No hay publicaciones pendientes de revisión en esta categoría.</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {activeTab === "adopciones" && pendingAdoptions.map(pet => (
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

                    {activeTab === "perdidas" && pendingLostPets.map(report => (
                        <div key={report.id} className={styles.card} style={{ borderColor: report.report_type === 'lost' ? '#ef4444' : '#f59e0b', borderWidth: '2px', borderStyle: 'solid' }}>
                            <div className={styles['card-image-wrapper']}>
                                {report.image_url ? (
                                    <Image
                                        src={report.image_url}
                                        alt={report.pet_name}
                                        fill
                                        style={{ objectFit: "cover" }}
                                    />
                                ) : (
                                    <div className={styles['card-no-image']} style={{ fontSize: "3rem" }}>
                                        {report.species === "gato" ? "🐈" : report.species === "perro" ? "🐕" : "🐾"}
                                    </div>
                                )}
                                <div style={{ position: "absolute", top: "10px", left: "10px", background: report.report_type === 'lost' ? "#ef4444" : "#f59e0b", color: "white", padding: "4px 8px", borderRadius: "4px", fontSize: "0.8rem", fontWeight: "bold" }}>
                                    {report.report_type === 'lost' ? "PERDIDA" : "ENCONTRADA"}
                                </div>
                            </div>

                            <div className={styles['card-content']}>
                                <h3 className={styles['pet-name']}>{report.pet_name}</h3>

                                <div className={styles['pet-traits']}>
                                    <span className={styles['trait-badge']}>{report.species.toUpperCase()}</span>
                                    {report.color && <span className={styles['trait-badge']}>{report.color}</span>}
                                    {report.breed && <span className={styles['trait-badge']}>{report.breed}</span>}
                                </div>

                                <div className={styles['pet-desc']} style={{ marginBottom: "0.5rem" }}>
                                    <p style={{ margin: 0 }}><strong>📍 Vista por última vez:</strong> {report.last_seen_location}</p>
                                    <p style={{ margin: "0.25rem 0", fontStyle: "italic" }}>{report.description}</p>
                                    <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)" }}>Contacto: {report.contact_phone} | {report.contact_email}</p>
                                </div>

                                <div className={styles['card-actions']}>
                                    <button
                                        className={styles['btn-reject']}
                                        onClick={() => handleReject(report.id, report.pet_name)}
                                        title="Eliminar este reporte permanentemente."
                                    >
                                        ❌ Es Spam / Falso
                                    </button>
                                    <button
                                        className={styles['btn-approve']}
                                        onClick={() => handleApprove(report.id, report.pet_name)}
                                        title="Marcar como válido. Dejará de aparecer en esta cola."
                                    >
                                        ✅ Revisado (Ok)
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {activeTab === "directorio" && pendingClinics.map(clinic => (
                        <div key={clinic.id} className={styles.card}>
                            <div className={styles['card-image-wrapper']}>
                                <div className={styles['card-no-image']} style={{ fontSize: "4rem", background: "var(--bg-secondary)" }}>
                                    🏥
                                </div>
                            </div>

                            <div className={styles['card-content']}>
                                <h3 className={styles['pet-name']}>{clinic.name}</h3>

                                <div className={styles['pet-traits']}>
                                    <span className={styles['trait-badge']}>{clinic.city}, {clinic.state}</span>
                                    {clinic.is_24_hours && <span className={styles['trait-badge']} style={{ background: "#10b981", color: "white" }}>24 Horas</span>}
                                    {clinic.has_emergency && <span className={styles['trait-badge']} style={{ background: "#ef4444", color: "white" }}>Urgencias</span>}
                                </div>

                                <div className={styles['pet-desc']} style={{ marginBottom: "0.5rem" }}>
                                    <p style={{ margin: 0 }}><strong>📍 Dirección:</strong> {clinic.address}</p>
                                    <p style={{ margin: "0.25rem 0", fontStyle: "italic" }}>{clinic.description || "Sin descripción."}</p>
                                    <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)" }}>Contacto: {clinic.phone} | {clinic.email}</p>
                                    {clinic.website && <p style={{ margin: 0, fontSize: "0.85rem" }}>Web: <a href={clinic.website} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)" }}>{clinic.website}</a></p>}
                                </div>

                                <div className={styles['card-actions']}>
                                    <button
                                        className={styles['btn-reject']}
                                        onClick={() => handleReject(clinic.id, clinic.name)}
                                    >
                                        ❌ Rechazar Registro
                                    </button>
                                    <button
                                        className={styles['btn-approve']}
                                        onClick={() => handleApprove(clinic.id, clinic.name)}
                                    >
                                        ✅ Activar Negocio
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
