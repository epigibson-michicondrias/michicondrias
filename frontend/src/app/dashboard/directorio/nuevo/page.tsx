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
        <div style={{ animation: "fadeIn 0.4s ease-out" }}>
            <div className={dashStyles["page-header"]}>
                <h1 className={dashStyles["page-title"]}>🏥 Alta de Clínica</h1>
                <p className={dashStyles["page-subtitle"]}>
                    Registra tu consultorio o clínica en la red de Michicondrias
                </p>
            </div>

            <form onSubmit={handleSubmit} className={styles["create-form"]}>
                {error && <div className={styles["form-error"]}>⚠️ {error}</div>}

                <div className={styles["form-section-title"]}>📝 Información General</div>

                <div className={styles["form-row"]}>
                    <div className={styles["form-group"]}>
                        <label>Nombre Comercial de la Clínica <span style={{ color: "var(--error)" }}>*</span></label>
                        <input
                            name="name"
                            placeholder="Ej: Veterinaria San Pascual"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                </div>

                <div className={styles["form-group"]}>
                    <label>Ubicación Física</label>
                    <input
                        name="address"
                        placeholder="Calle, Número, Colonia..."
                        value={formData.address}
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                    />
                </div>

                <div className={styles["form-row"]}>
                    <div className={styles["form-group"]}>
                        <label>Municipio / Alcaldía</label>
                        <input
                            name="city"
                            placeholder="Ej: Coyoacán"
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

                <div className={styles["form-section-title"]}>📞 Contacto e Internet</div>

                <div className={styles["form-row"]}>
                    <div className={styles["form-group"]}>
                        <label>Teléfono de Atención</label>
                        <input
                            name="phone"
                            placeholder="Ej: 55 1234 5678"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                    <div className={styles["form-group"]}>
                        <label>Correo Electrónico</label>
                        <input
                            name="email"
                            type="email"
                            placeholder="contacto@veterinaria.com"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                </div>

                <div className={styles["form-group"]}>
                    <label>Sitio Web o Red Social</label>
                    <input
                        name="website"
                        type="url"
                        placeholder="https://facebook.com/miveterinaria"
                        value={formData.website}
                        onChange={e => setFormData({ ...formData, website: e.target.value })}
                    />
                </div>

                <div className={styles["form-section-title"]}>🩺 Servicios y Atención</div>

                <div className={styles["form-row"]}>
                    <div className={styles["form-group"]}>
                        <label>¿Servicio 24 Horas?</label>
                        <CustomSelect
                            options={[
                                { value: "false", label: "No (Horario regular)", icon: "🗓️" },
                                { value: "true", label: "Sí, Abierto 24/7", icon: "🕒" }
                            ]}
                            value={formData.is_24_hours}
                            onChange={v => setFormData({ ...formData, is_24_hours: v })}
                        />
                    </div>
                    <div className={styles["form-group"]}>
                        <label>¿Atención de Emergencias de Vida?</label>
                        <CustomSelect
                            options={[
                                { value: "false", label: "Solo consultas", icon: "🩺" },
                                { value: "true", label: "Sí, Urgencias Mayores", icon: "🚨" }
                            ]}
                            value={formData.has_emergency}
                            onChange={v => setFormData({ ...formData, has_emergency: v })}
                        />
                    </div>
                </div>

                <div className={styles["form-group"]}>
                    <label>Acerca de la clínica y servicios adicionales (Rayos X, Cirugía, Pensión...)</label>
                    <textarea
                        name="description"
                        placeholder="Brindamos atención de primer y segundo nivel. Especialistas en cirugía ortopédica y felinos..."
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div className={dashStyles["form-divider"]} style={{ margin: "2rem 0" }} />

                <div className={styles["form-actions"]}>
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 2, padding: "1rem" }}>
                        {loading ? "Validando e Insertando..." : "🏥 Inscribir Clínica Formalmente"}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => router.back()} style={{ flex: 1 }}>
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}
