"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPlace } from "@/lib/services/perdidas";
import { getMascotasPresignedUrl } from "@/lib/services/mascotas";
import { toast } from "react-hot-toast";
import dashStyles from "../../dashboard.module.css";
import styles from "../../modules.module.css";

const CATEGORIES = [
    "Restaurante", "Cafetería", "Parque", "Hotel",
    "Centro Comercial", "Playa", "Veterinaria", "Tienda"
];

const PET_SIZES = [
    { id: "pequeños", label: "Pequeños" },
    { id: "medianos", label: "Medianos" },
    { id: "grandes", label: "Grandes" },
    { id: "todos", label: "Todos" }
];

export default function NuevoLugarPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        category: "Restaurante",
        description: "",
        address: "",
        city: "",
        phone: "",
        website: "",
        pet_sizes_allowed: "todos",
        has_water_bowls: "no",
        has_pet_menu: "no",
        rating: 5,
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let photoUrl = "";

            if (imageFile) {
                const ext = imageFile.name.split(".").pop() || "jpg";
                const { url, object_key } = await getMascotasPresignedUrl(ext);

                await fetch(url, {
                    method: "PUT",
                    body: imageFile,
                    headers: { "Content-Type": imageFile.type }
                });

                photoUrl = object_key;
            }

            await createPlace({
                ...formData,
                image_url: photoUrl || undefined,
            });

            toast.success("¡Lugar registrado exitosamente!");
            router.push("/dashboard/petfriendly");
        } catch (error: any) {
            toast.error(error.message || "Error al registrar el lugar");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={dashStyles.container}>
            <div className={dashStyles["page-header"]}>
                <div>
                    <h1 className={dashStyles["page-title"]}>🆕 Agregar Nuevo Lugar</h1>
                    <p className={dashStyles["page-subtitle"]}>Ayuda a la comunidad a descubrir espacios aptos para mascotas</p>
                </div>
            </div>

            <div style={{ maxWidth: "900px", margin: "0 auto" }}>
                <form onSubmit={handleSubmit} className={styles["registro-form"]}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.5rem" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                            <h3 style={{ borderLeft: "4px solid var(--secondary)", paddingLeft: "1rem", marginBottom: "0.5rem" }}>Datos Generales</h3>

                            <div className={styles["form-group"]}>
                                <label>Nombre del Lugar</label>
                                <input
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ej. El Michi Café"
                                />
                            </div>

                            <div className={styles["form-group"]}>
                                <label>Categoría</label>
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                <div className={styles["form-group"]}>
                                    <label>Teléfono (Opcional)</label>
                                    <input
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="55 1234 5678"
                                    />
                                </div>
                                <div className={styles["form-group"]}>
                                    <label>Website (Opcional)</label>
                                    <input
                                        value={formData.website}
                                        onChange={e => setFormData({ ...formData, website: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            <div className={styles["form-group"]}>
                                <label>Ciudad</label>
                                <input
                                    required
                                    value={formData.city}
                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                    placeholder="Ej. Querétaro"
                                />
                            </div>

                            <div className={styles["form-group"]}>
                                <label>Dirección Completa</label>
                                <textarea
                                    required
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Calle, número, colonia..."
                                    rows={2}
                                />
                            </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                            <h3 style={{ borderLeft: "4px solid var(--secondary)", paddingLeft: "1rem", marginBottom: "0.5rem" }}>Detalles Petfriendly</h3>

                            <div className={styles["form-group"]}>
                                <label>Tamaños Permitidos</label>
                                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                                    {PET_SIZES.map(size => (
                                        <button
                                            key={size.id}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, pet_sizes_allowed: size.id })}
                                            style={{
                                                padding: "0.5rem 1rem", borderRadius: "10px", border: "none",
                                                background: formData.pet_sizes_allowed === size.id ? "var(--secondary)" : "rgba(255,255,255,0.05)",
                                                color: "#fff", cursor: "pointer", transition: "all 0.2s"
                                            }}
                                        >
                                            {size.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                <div className={styles["form-group"]}>
                                    <label>¿Tienen bebederos?</label>
                                    <select
                                        value={formData.has_water_bowls}
                                        onChange={e => setFormData({ ...formData, has_water_bowls: e.target.value })}
                                    >
                                        <option value="no">No</option>
                                        <option value="si">Sí</option>
                                        <option value="bajo pedido">Bajo pedido</option>
                                    </select>
                                </div>
                                <div className={styles["form-group"]}>
                                    <label>¿Tienen menú pet?</label>
                                    <select
                                        value={formData.has_pet_menu}
                                        onChange={e => setFormData({ ...formData, has_pet_menu: e.target.value })}
                                    >
                                        <option value="no">No</option>
                                        <option value="si">Sí</option>
                                        <option value="premios">Solo premios</option>
                                    </select>
                                </div>
                            </div>

                            <div className={styles["form-group"]}>
                                <label>Foto del Lugar</label>
                                <div
                                    onClick={() => document.getElementById("photo-upload")?.click()}
                                    style={{
                                        height: "140px", background: "rgba(255,255,255,0.03)",
                                        borderRadius: "20px", border: "2px dashed rgba(255,255,255,0.1)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        overflow: "hidden", cursor: "pointer"
                                    }}
                                >
                                    {imagePreview ? (
                                        <img src={imagePreview} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    ) : (
                                        <div style={{ textAlign: "center", opacity: 0.5 }}>
                                            <p style={{ fontSize: "1.5rem", margin: 0 }}>📸</p>
                                            <p style={{ fontSize: "0.8rem" }}>Click para subir foto</p>
                                        </div>
                                    )}
                                </div>
                                <input id="photo-upload" type="file" hidden accept="image/*" onChange={handleFileChange} />
                            </div>

                            <div className={styles["form-group"]}>
                                <label>Descripción / Tips de la comunidad</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Cuéntanos por qué es un buen lugar (ej. tienen terraza techada, son muy amables...)"
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: "2.5rem", display: "flex", gap: "1rem" }}>
                        <button type="button" onClick={() => router.back()} className="btn btn-secondary" style={{ flex: 1 }}>
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 2 }}>
                            {loading ? "Registrando..." : "Publicar Lugar 🚀"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
