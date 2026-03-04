"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClinic } from "@/lib/services/directorio";
import CustomSelect from "@/components/ui/CustomSelect";
import dashStyles from "../../dashboard.module.css";
import styles from "../../modules.module.css";

export default function NuevoDirectorioPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        address: "",
        city: "",
        state: "CMDX",
        phone: "",
        email: "",
        website: "",
        description: "",
        is_24_hours: "false",
        has_emergency: "false"
    });

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await createClinic({
                name: formData.name,
                address: formData.address || null,
                city: formData.city || null,
                state: formData.state || null,
                phone: formData.phone || null,
                email: formData.email || null,
                website: formData.website || null,
                description: formData.description || null,
                is_24_hours: formData.is_24_hours === "true",
                has_emergency: formData.has_emergency === "true"
            });
            router.push("/dashboard/directorio");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Error al registrar la clínica");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ animation: "slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }}>
            <div className={dashStyles["page-header"]}>
                <h1 className={dashStyles["page-title"]}>
                    <button
                        onClick={() => router.back()}
                        className={dashStyles["back-button-premium"]}
                        style={{ marginRight: '1rem' }}
                        title="Volver"
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </button>
                    Alta de Clínica Médica
                </h1>
                <p className={dashStyles["page-subtitle"]}>
                    Inscribe tu consultorio o unidad hospitalaria en la red de Michicondrias
                </p>
            </div>

            <form onSubmit={handleSubmit} className={styles["create-form"]} style={{ maxWidth: '800px', margin: '0 auto' }}>
                {error && (
                    <div className={styles["form-error"]} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '12px', marginBottom: '2rem' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
                            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                        {error}
                    </div>
                )}

                <div className={styles["form-section-title"]} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--primary-light)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" />
                    </svg>
                    Información General
                </div>

                <div className={styles["form-row"]}>
                    <div className={styles["form-group"]}>
                        <label>Nombre Comercial <span style={{ color: "var(--error)" }}>*</span></label>
                        <input
                            name="name"
                            placeholder="Ej: Hospital Veterinario Central"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                </div>

                <div className={styles["form-group"]}>
                    <label>Dirección Física</label>
                    <input
                        name="address"
                        placeholder="Calle, Número, Colonia, C.P..."
                        value={formData.address}
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                    />
                </div>

                <div className={styles["form-row"]}>
                    <div className={styles["form-group"]}>
                        <label>Municipio / Alcaldía</label>
                        <input
                            name="city"
                            placeholder="Ej: Miguel Hidalgo"
                            value={formData.city}
                            onChange={e => setFormData({ ...formData, city: e.target.value })}
                        />
                    </div>
                    <div className={styles["form-group"]}>
                        <label>Estado</label>
                        <CustomSelect
                            options={[
                                { value: "CDMX", label: "Ciudad de México", icon: "🏙️" },
                                { value: "EDOMEX", label: "Estado de México", icon: "🌲" },
                                { value: "JALISCO", label: "Jalisco", icon: "🐎" },
                                { value: "NL", label: "Nuevo León", icon: "⛰️" }
                            ]}
                            value={formData.state}
                            onChange={v => setFormData({ ...formData, state: v })}
                        />
                    </div>
                </div>

                <div className={styles["form-section-title"]} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '2.5rem', fontSize: '0.85rem', color: 'var(--primary-light)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    Canales de Contacto
                </div>

                <div className={styles["form-row"]}>
                    <div className={styles["form-group"]}>
                        <label>Teléfono de Urgencias/Citas</label>
                        <input
                            name="phone"
                            placeholder="Ej: 55 5678 1234"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                    <div className={styles["form-group"]}>
                        <label>Email de Contacto</label>
                        <input
                            name="email"
                            type="email"
                            placeholder="recepcion@clinica.com"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                </div>

                <div className={styles["form-group"]}>
                    <label>Link Web / Instagram / Facebook</label>
                    <input
                        name="website"
                        type="url"
                        placeholder="https://miclinica.mx"
                        value={formData.website}
                        onChange={e => setFormData({ ...formData, website: e.target.value })}
                    />
                </div>

                <div className={styles["form-section-title"]} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '2.5rem', fontSize: '0.85rem', color: 'var(--primary-light)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h1a.3.3 0 1 0 .2-.3" />
                        <path d="M16 2a2 2 0 0 1 2 2v1h1a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-1" />
                        <path d="M13 18c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6Z" /><circle cx="13" cy="12" r="3" />
                    </svg>
                    Nivel de Atención y Servicios
                </div>

                <div className={styles["form-row"]}>
                    <div className={styles["form-group"]}>
                        <label>Disponibilidad Horaria</label>
                        <CustomSelect
                            options={[
                                { value: "false", label: "Horario Comercial", icon: "🗓️" },
                                { value: "true", label: "Emergencias 24/7", icon: "🕒" }
                            ]}
                            value={formData.is_24_hours}
                            onChange={v => setFormData({ ...formData, is_24_hours: v })}
                        />
                    </div>
                    <div className={styles["form-group"]}>
                        <label>Enfoque Médico</label>
                        <CustomSelect
                            options={[
                                { value: "false", label: "Consulta General", icon: "🩺" },
                                { value: "true", label: "Alta Especialidad / Shock", icon: "🚨" }
                            ]}
                            value={formData.has_emergency}
                            onChange={v => setFormData({ ...formData, has_emergency: v })}
                        />
                    </div>
                </div>

                <div className={styles["form-group"]}>
                    <label>Especialidades y Equipo (Rayos X, Laboratorio, Guardería...)</label>
                    <textarea
                        name="description"
                        placeholder="Describe los servicios clave y equipo médico disponible..."
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        style={{ minHeight: '150px' }}
                    />
                </div>

                <div className={dashStyles["form-divider"]} style={{ margin: "3rem 0" }} />

                <div className={styles["form-actions"]}>
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1, padding: "1.25rem", borderRadius: '16px', fontSize: '1.1rem', fontWeight: 800, background: 'linear-gradient(135deg, var(--primary), var(--primary-light))', boxShadow: '0 8px 25px rgba(124, 58, 237, 0.4)' }}>
                        {loading ? (
                            <div className={dashStyles["loading-spinner-premium"]} />
                        ) : "🏥 Confirmar Registro e Inscripción"}
                    </button>
                </div>
            </form>
        </div>
    );
}
