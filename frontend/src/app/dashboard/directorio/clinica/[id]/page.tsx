"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getClinic, Clinic, getVets, Vet, createVet } from "@/lib/services/directorio";
import { getCurrentUser, User } from "@/lib/auth";
import dashStyles from "../../../dashboard.module.css";
import styles from "./clinica.module.css";
import { toast } from "react-hot-toast";

export default function ClinicaDetailPage(props: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [clinic, setClinic] = useState<Clinic | null>(null);
    const [vets, setVets] = useState<Vet[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        first_name: "", last_name: "", specialty: "",
        license_number: "", phone: "", email: "", bio: ""
    });

    const { id } = React.use(props.params);

    useEffect(() => {
        async function load() {
            try {
                const [data, vetsData, user] = await Promise.all([
                    getClinic(id),
                    getVets(id),
                    getCurrentUser()
                ]);
                setClinic(data);
                setVets(vetsData);
                setCurrentUser(user);
            } catch (err) {
                console.error("Error cargando perfil de clínica", err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id]);

    const isOwnerOrAdmin = currentUser?.role_name === "admin" || (clinic && currentUser && clinic.owner_user_id === currentUser.id);

    const handleAddVet = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const added = await createVet({ ...formData, clinic_id: id });
            setVets([...vets, added]);
            setShowModal(false);
            setFormData({ first_name: "", last_name: "", specialty: "", license_number: "", phone: "", email: "", bio: "" });
            toast.success("Especialista añadido correctamente a la clínica");
        } catch (err: any) {
            toast.error(err.message || "Error al añadir especialista");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className={dashStyles["page-header"]}>
                <h1 className={dashStyles["page-title"]}>Cargando Clínica...</h1>
            </div>
        );
    }

    if (!clinic) {
        return (
            <div className={dashStyles["empty-state"]}>
                <span style={{ fontSize: "4rem" }}>😢</span>
                <p>No logramos encontrar esta clínica.</p>
                <button onClick={() => router.push("/dashboard/directorio")} className="btn btn-secondary" style={{ marginTop: "1rem" }}>
                    Volver al Directorio
                </button>
            </div>
        );
    }

    return (
        <div className={styles["profile-container"]}>
            <div className={styles["visual-header"]}>
                <div className={styles["hero-overlay"]}>
                    <button
                        onClick={() => router.back()}
                        className={dashStyles["back-button-premium"]}
                        style={{ margin: '1.5rem', zIndex: 100, position: 'relative' }}
                        title="Volver al Directorio"
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </button>
                </div>
                <div className={styles["avatar-large"]}>
                    {clinic.name.charAt(0).toUpperCase()}
                </div>
            </div>

            <div className={styles["profile-body"]}>
                <div className={styles["main-info"]}>
                    <div className={styles["header-row"]}>
                        <div>
                            <h1 className={styles["clinic-name"]}>{clinic.name}</h1>
                            <p className={styles["clinic-metadata"]}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary-light)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
                                </svg>
                                {clinic.address ? `${clinic.address}, ` : ""}{clinic.city || "Ciudad Desconocida"}, {clinic.state || "MX"}
                            </p>
                        </div>
                        <div className={styles["tags-box"]}>
                            {clinic.is_24_hours && (
                                <span className={`${styles.tag} ${styles["tag-blue"]}`}>
                                    🕒 Abierto 24 Horas
                                </span>
                            )}
                            {clinic.has_emergency && (
                                <span className={`${styles.tag} ${styles["tag-red"]}`}>
                                    🚨 Urgencias Mayores
                                </span>
                            )}
                        </div>
                    </div>

                    <div className={styles["quick-stats"]}>
                        <div className={styles["stat-card"]}>
                            <div className={styles["stat-icon"]} style={{ color: '#3b82f6' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                </svg>
                            </div>
                            <div className={styles["stat-text"]}>
                                <span className={styles["stat-label"]}>Teléfono Principal</span>
                                <span className={styles["stat-value"]}>{clinic.phone || "No listado"}</span>
                            </div>
                        </div>
                        <div className={styles["stat-card"]}>
                            <div className={styles["stat-icon"]} style={{ color: '#8b5cf6' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                </svg>
                            </div>
                            <div className={styles["stat-text"]}>
                                <span className={styles["stat-label"]}>Correo Electrónico</span>
                                <span className={styles["stat-value"]}>{clinic.email || "No listado"}</span>
                            </div>
                        </div>
                        <div className={styles["stat-card"]}>
                            <div className={styles["stat-icon"]} style={{ color: '#06b6d4' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                </svg>
                            </div>
                            <div className={styles["stat-text"]}>
                                <span className={styles["stat-label"]}>Sitio Web / Redes</span>
                                <span className={styles["stat-value"]}>
                                    {clinic.website ? (
                                        <a href={clinic.website} target="_blank" rel="noreferrer" style={{ color: "var(--primary-light)", textDecoration: 'none' }}>
                                            Visitar Enlace oficial
                                        </a>
                                    ) : "No disponible"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className={dashStyles["form-divider"]} style={{ margin: "4rem 0" }} />

                    <h3 className={styles["section-title"]}>Acerca de la Clínica</h3>
                    <div className={styles["description-box"]} style={{ marginBottom: "3rem" }}>
                        {clinic.description ? (
                            <p>{clinic.description}</p>
                        ) : (
                            <p style={{ fontStyle: "italic", opacity: 0.6 }}>Clínica registrada en la red de veterinarios Michicondrias sin descripción adicional.</p>
                        )}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                        <h3 className={styles["section-title"]} style={{ marginBottom: 0 }}>Nuestros Especialistas Médicos</h3>
                        {isOwnerOrAdmin && (
                            <button className="btn btn-secondary" onClick={() => setShowModal(true)} style={{ padding: '0.6rem 1.25rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14M12 5v14" />
                                </svg>
                                Añadir Especialista
                            </button>
                        )}
                    </div>

                    {vets.length === 0 ? (
                        <div className={styles["description-box"]} style={{ textAlign: "center", padding: "3rem", background: 'rgba(255,255,255,0.01)', borderStyle: 'dashed' }}>
                            <div style={{ fontSize: "2.5rem", marginBottom: '1rem', opacity: 0.4 }}>🧑‍⚕️</div>
                            <p style={{ margin: 0, opacity: 0.7 }}>Aún no hay especialistas listados públicamente en esta clínica.</p>
                        </div>
                    ) : (
                        <div className={styles["specialists-grid"]}>
                            {vets.map(vet => (
                                <div key={vet.id} className={styles["vet-card"]}>
                                    <div className={styles["vet-avatar"]}>
                                        {vet.first_name.charAt(0)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 800, margin: 0, fontSize: "1.1rem", color: "#fff", letterSpacing: '-0.01em' }}>{vet.first_name} {vet.last_name}</p>
                                        <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.9rem", color: "var(--primary-light)", fontWeight: 600 }}>{vet.specialty || "Médico General"}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL para añadir Veterinario */}
            {showModal && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
                    <div style={{ background: "var(--bg-glass)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", padding: "2rem", width: "100%", maxWidth: "550px", maxHeight: "90vh", overflowY: "auto" }}>
                        <h2 style={{ fontSize: "1.5rem", marginBottom: "1.5rem", color: "#fff" }}>Nuevo Especialista</h2>

                        <form onSubmit={handleAddVet} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div style={{ display: "flex", gap: "1rem" }}>
                                <div style={{ flex: 1 }}>
                                    <label>Nombre(s) *</label>
                                    <input type="text" className="form-input" required value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label>Apellidos *</label>
                                    <input type="text" className="form-input" required value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} />
                                </div>
                            </div>

                            <div>
                                <label>Especialidad</label>
                                <input type="text" className="form-input" placeholder="Ej. Cardiólogo, Cirujano, Médico General..." value={formData.specialty} onChange={e => setFormData({ ...formData, specialty: e.target.value })} />
                            </div>

                            <div style={{ display: "flex", gap: "1rem" }}>
                                <div style={{ flex: 1 }}>
                                    <label>Cédula Profesional</label>
                                    <input type="text" className="form-input" value={formData.license_number} onChange={e => setFormData({ ...formData, license_number: e.target.value })} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label>Tel. de Contacto</label>
                                    <input type="text" className="form-input" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                            </div>

                            <div>
                                <label>Biografía breve</label>
                                <textarea className="form-input" rows={3} value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })}></textarea>
                            </div>

                            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                                    {submitting ? "Guardando..." : "Guardar Profesional"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
