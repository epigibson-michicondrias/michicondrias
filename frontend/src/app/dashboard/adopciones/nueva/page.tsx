"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createListing } from "@/lib/services/adopciones";
import CustomSelect from "@/components/ui/CustomSelect";
import dashStyles from "../../dashboard.module.css";
import styles from "../../modules.module.css";

export default function NuevaAdopcionPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // Controlled Form State
    const [formData, setFormData] = useState({
        name: "",
        species: "perro",
        breed: "",
        age: "",
        size: "mediano",
        description: "",
        is_vaccinated: false,
        is_sterilized: false,
        is_dewormed: false,
        temperament: "",
        energy_level: "Medio",
        social_cats: true,
        social_dogs: true,
        social_children: true,
        weight_kg: "",
        microchip_number: "",
    });

    // Photo Mock State
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const speciesOptions = [
        { value: "perro", label: "Perro", icon: "🐕" },
        { value: "gato", label: "Gato", icon: "🐈" },
        { value: "ave", label: "Ave", icon: "🐦" },
        { value: "otro", label: "Otro", icon: "🐾" },
    ];

    const sizeOptions = [
        { value: "pequeño", label: "Pequeño (0-10 kg)", icon: "📏" },
        { value: "mediano", label: "Mediano (10-25 kg)", icon: "📏" },
        { value: "grande", label: "Grande (25+ kg)", icon: "📏" },
    ];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const form = e.currentTarget;
        try {
            // Simulated upload: pass photo_url if exists, backend supports it optionally
            await createListing({
                name: formData.name,
                species: formData.species,
                breed: formData.breed || null,
                age_months: formData.age ? Number(formData.age) : null,
                size: formData.size || null,
                description: formData.description || null,
                photo_url: photoPreview,
                // Enrichment Fields
                is_vaccinated: formData.is_vaccinated,
                is_sterilized: formData.is_sterilized,
                is_dewormed: formData.is_dewormed,
                temperament: formData.temperament || null,
                energy_level: formData.energy_level || null,
                social_cats: formData.social_cats,
                social_dogs: formData.social_dogs,
                social_children: formData.social_children,
                weight_kg: formData.weight_kg ? Number(formData.weight_kg) : null,
                microchip_number: formData.microchip_number || null,
            });
            setSuccess(true);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Error al crear");
        } finally {
            setLoading(false);
        }
    }

    if (success) {
        return (
            <>
                <div className={dashStyles["page-header"]}>
                    <h1 className={dashStyles["page-title"]}>🐾 ¡Publicación enviada!</h1>
                </div>
                <div className={styles["create-form"]} style={{ textAlign: "center" }}>
                    <span style={{ fontSize: "4rem", display: "block", marginBottom: "1rem" }}>⏳</span>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                        Esperando aprobación
                    </h2>
                    <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", lineHeight: 1.6 }}>
                        Tu publicación fue enviada correctamente. Un administrador la revisará
                        y aprobará pronto. Una vez aprobada será visible para todos.
                    </p>
                    <button
                        onClick={() => router.push("/dashboard/adopciones")}
                        className="btn btn-primary"
                    >
                        Volver a Adopciones
                    </button>
                </div>
            </>
        );
    }

    return (
        <>
            <div className={dashStyles["page-header"]}>
                <h1 className={dashStyles["page-title"]}>🐾 Publicar en adopción</h1>
                <p className={dashStyles["page-subtitle"]}>
                    Tu publicación será revisada por un administrador antes de aparecer
                </p>
            </div>

            <form onSubmit={handleSubmit} className={styles["create-form"]}>
                {error && <div className={styles["form-error"]}>⚠️ {error}</div>}

                {/* Zona de Fotografía Premium (Glassmorphism + Dropzone) */}
                <p className={styles["form-section-title"]}>📸 Fotografía de la Mascota</p>
                <div style={{
                    border: "2px dashed rgba(124, 58, 237, 0.4)",
                    borderRadius: "var(--radius-lg)",
                    padding: "3rem 2rem",
                    textAlign: "center",
                    cursor: "pointer",
                    background: photoPreview ? `url(${photoPreview}) center/cover no-repeat` : "rgba(255, 255, 255, 0.02)",
                    position: "relative",
                    marginBottom: "2rem",
                    transition: "all 0.3s ease",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "inset 0 4px 20px rgba(0,0,0,0.2)"
                }}>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }}
                    />
                    {!photoPreview && (
                        <>
                            <span style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.8 }}>📥</span>
                            <h3 style={{ color: "#fff", fontWeight: 600, fontSize: "1.1rem" }}>Haz clic o arrastra la foto aquí</h3>
                            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.5rem" }}>JPG, PNG (Max 5MB)</p>
                        </>
                    )}
                    {photoPreview && (
                        <div style={{
                            position: "absolute", bottom: "1rem", backgroundColor: "rgba(0,0,0,0.7)",
                            padding: "0.5rem 1rem", borderRadius: "100px", color: "#fff", fontSize: "0.8rem", backdropFilter: "blur(5px)"
                        }}>
                            📸 Cambiar Fotografía
                        </div>
                    )}
                </div>

                <p className={styles["form-section-title"]}>Información Básica</p>

                <div className={styles["form-row"]}>
                    <div className={styles["form-group"]}>
                        <label>Nombre</label>
                        <input
                            name="name"
                            placeholder="Ej: Luna"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className={styles["form-group"]}>
                        <label>Especie</label>
                        <CustomSelect
                            options={speciesOptions}
                            value={formData.species}
                            onChange={(v) => setFormData({ ...formData, species: v })}
                        />
                    </div>
                </div>

                <div className={styles["form-row"]}>
                    <div className={styles["form-group"]}>
                        <label>Raza (opcional)</label>
                        <input
                            name="breed"
                            placeholder="Ej: Labrador, Siamés"
                            value={formData.breed}
                            onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                        />
                    </div>
                    <div className={styles["form-group"]}>
                        <label>Edad (meses)</label>
                        <input
                            name="age"
                            type="number"
                            min="0"
                            placeholder="Ej: 12"
                            value={formData.age}
                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        />
                    </div>
                </div>

                <div className={styles["form-group"]}>
                    <label>Tamaño</label>
                    <CustomSelect
                        options={sizeOptions}
                        value={formData.size}
                        onChange={(v) => setFormData({ ...formData, size: v })}
                    />
                </div>

                <div className={styles["form-divider"]} />
                <p className={styles["form-section-title"]}>🩺 Información Clínica</p>
                <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", color: "#fff" }}>
                        <input type="checkbox" checked={formData.is_vaccinated} onChange={e => setFormData({ ...formData, is_vaccinated: e.target.checked })} /> Vacunado
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", color: "#fff" }}>
                        <input type="checkbox" checked={formData.is_sterilized} onChange={e => setFormData({ ...formData, is_sterilized: e.target.checked })} /> Esterilizado
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", color: "#fff" }}>
                        <input type="checkbox" checked={formData.is_dewormed} onChange={e => setFormData({ ...formData, is_dewormed: e.target.checked })} /> Desparasitado
                    </label>
                </div>
                <div className={styles["form-row"]}>
                    <div className={styles["form-group"]}>
                        <label>Peso (kg)</label>
                        <input type="number" step="0.1" value={formData.weight_kg} onChange={e => setFormData({ ...formData, weight_kg: e.target.value })} placeholder="Ej: 5.5" />
                    </div>
                    <div className={styles["form-group"]}>
                        <label>Microchip (opcional)</label>
                        <input type="text" value={formData.microchip_number} onChange={e => setFormData({ ...formData, microchip_number: e.target.value })} placeholder="ID del chip" />
                    </div>
                </div>

                <div className={styles["form-divider"]} />
                <p className={styles["form-section-title"]}>🧠 Comportamiento y Socialización</p>
                <div className={styles["form-row"]}>
                    <div className={styles["form-group"]}>
                        <label>Nivel de Energía</label>
                        <CustomSelect
                            options={[
                                { value: "Bajo", label: "Bajo", icon: "💤" },
                                { value: "Medio", label: "Medio", icon: "🐕" },
                                { value: "Alto", label: "Alto", icon: "⚡" },
                            ]}
                            value={formData.energy_level}
                            onChange={(v) => setFormData({ ...formData, energy_level: v })}
                        />
                    </div>
                    <div className={styles["form-group"]}>
                        <label>Personalidad / Temperamento</label>
                        <input type="text" value={formData.temperament} onChange={e => setFormData({ ...formData, temperament: e.target.value })} placeholder="Ej: Cariñoso, protector..." />
                    </div>
                </div>
                <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.9rem", color: "#fff" }}>
                        <input type="checkbox" checked={formData.social_cats} onChange={e => setFormData({ ...formData, social_cats: e.target.checked })} /> ¿Apto con Gatos?
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.9rem", color: "#fff" }}>
                        <input type="checkbox" checked={formData.social_dogs} onChange={e => setFormData({ ...formData, social_dogs: e.target.checked })} /> ¿Apto con Otros Perros?
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.9rem", color: "#fff" }}>
                        <input type="checkbox" checked={formData.social_children} onChange={e => setFormData({ ...formData, social_children: e.target.checked })} /> ¿Apto con Niños?
                    </label>
                </div>

                <div className={styles["form-divider"]} />
                <p className={styles["form-section-title"]}>Descripción</p>

                <div className={styles["form-group"]}>
                    <label>Cuéntanos la historia de este animalito</label>
                    <textarea
                        name="description"
                        placeholder="Personalidad, necesidades especiales, historia de rescate..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        style={{ minHeight: "120px" }}
                    />
                </div>

                <div className={styles["form-actions"]}>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? "Procesando anuncio..." : "✨ Enviar para aprobación"}
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => router.push("/dashboard/adopciones")}
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </>
    );
}
