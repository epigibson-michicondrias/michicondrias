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
                        style={{ margin: '1.5rem' }}
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
                                📍 {clinic.address ? `${clinic.address}, ` : ""}{clinic.city || "Ciudad Desconocida"}, {clinic.state || "MX"}
                            </p>
                        </div>
                        <div className={styles["tags-box"]}>
                            {clinic.is_24_hours && <span className={`${styles.tag} ${styles["tag-blue"]}`}>🕒 Abierto 24 Horas</span>}
                            {clinic.has_emergency && <span className={`${styles.tag} ${styles["tag-red"]}`}>🚨 Urgencias Mayores</span>}
                        </div>
                    </div>

                    <div className={styles["quick-stats"]}>
                        <div className={styles["stat-card"]}>
                            <span className={styles["stat-icon"]}>📞</span>
                            <div className={styles["stat-text"]}>
                                <span className={styles["stat-label"]}>Teléfono Principal</span>
                                <span className={styles["stat-value"]}>{clinic.phone || "No listado"}</span>
                            </div>
                        </div>
                        <div className={styles["stat-card"]}>
                            <span className={styles["stat-icon"]}>✉️</span>
                            <div className={styles["stat-text"]}>
                                <span className={styles["stat-label"]}>Correo Electrónico</span>
                                <span className={styles["stat-value"]}>{clinic.email || "No listado"}</span>
                            </div>
                        </div>
                        <div className={styles["stat-card"]}>
                            <span className={styles["stat-icon"]}>🌐</span>
                            <div className={styles["stat-text"]}>
                                <span className={styles["stat-label"]}>Sitio Web / Redes</span>
                                <span className={styles["stat-value"]}>
                                    {clinic.website ? (
                                        <a href={clinic.website} target="_blank" rel="noreferrer" style={{ color: "var(--primary-light)" }}>
                                            Visitar Enlace
                                        </a>
                                    ) : "No disponible"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className={dashStyles["form-divider"]} style={{ margin: "2.5rem 0" }} />

                    <h3 className={styles["section-title"]}>Acerca de la Clínica</h3>
                    <div className={styles["description-box"]} style={{ marginBottom: "2rem" }}>
                        {clinic.description ? (
                            <p>{clinic.description}</p>
                        ) : (
                            <p style={{ fontStyle: "italic", opacity: 0.6 }}>Clínica registrada en la red de veterinarios Michicondrias sin descripción adicional.</p>
                        )}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                        <h3 className={styles["section-title"]} style={{ marginBottom: 0 }}>Nuestros Especialistas Médicos</h3>
                        {isOwnerOrAdmin && (
                            <button className="btn btn-secondary" onClick={() => setShowModal(true)}>
                                + Añadir Especialista
                            </button>
                        )}
                    </div>

                    {vets.length === 0 ? (
                        <div className={styles["description-box"]} style={{ textAlign: "center", padding: "2rem" }}>
                            <span style={{ fontSize: "2rem" }}>🧑‍⚕️</span>
                            <p style={{ marginTop: "0.5rem", opacity: 0.7 }}>Aún no hay especialistas listados públicamente en esta clínica.</p>
                        </div>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
                            {vets.map(vet => (
                                <div key={vet.id} style={{ background: "rgba(255,255,255,0.03)", padding: "1.2rem", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)", display: "flex", gap: "1rem", alignItems: "center" }}>
                                    <div style={{ width: "45px", height: "45px", borderRadius: "50%", background: "linear-gradient(135deg, var(--primary), var(--primary-light))", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.2rem" }}>
                                        {vet.first_name.charAt(0)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 700, margin: 0, fontSize: "1.05rem", color: "#fff" }}>{vet.first_name} {vet.last_name}</p>
                                        <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--primary-light)" }}>{vet.specialty || "Médico General"}</p>
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
