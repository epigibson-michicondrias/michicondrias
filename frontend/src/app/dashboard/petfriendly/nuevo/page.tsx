"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPlace, getMascotasPresignedUrl } from "@/lib/services/mascotas";
import { toast } from "react-hot-toast";
import dashStyles from "../../dashboard.module.css";
import styles from "../../modules.module.css";

const CATEGORIES = [
    "Restaurante", "Cafetería", "Parque", "Hotel",
    "Centro Comercial", "Playa", "Veterinaria", "Tienda"
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
        state: "",
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
                image_url: photoUrl || null,
                latitude: null,
                longitude: null,
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

            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                <form onSubmit={handleSubmit} className={styles["registro-form"]}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
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

                            <div className={styles["form-group"]}>
                                <label>Ciudad</label>
                                <input
                                    required
                                    value={formData.city}
                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                    placeholder="Ej. CDMX"
                                />
                            </div>

                            <div className={styles["form-group"]}>
                                <label>Dirección Completa</label>
                                <textarea
                                    required
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Calle, número, colonia..."
                                    rows={3}
                                />
                            </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                            <div className={styles["form-group"]}>
                                <label>Foto del Lugar</label>
                                <div
                                    onClick={() => document.getElementById("photo-upload")?.click()}
                                    style={{
                                        height: "200px", background: "rgba(255,255,255,0.03)",
                                        borderRadius: "20px", border: "2px dashed rgba(255,255,255,0.1)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        overflow: "hidden", cursor: "pointer"
                                    }}
                                >
                                    {imagePreview ? (
                                        <img src={imagePreview} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    ) : (
                                        <div style={{ textAlign: "center", opacity: 0.5 }}>
                                            <p style={{ fontSize: "2rem", margin: 0 }}>📸</p>
                                            <p>Click para subir foto</p>
                                        </div>
                                    )}
                                </div>
                                <input id="photo-upload" type="file" hidden accept="image/*" onChange={handleFileChange} />
                            </div>

                            <div className={styles["form-group"]}>
                                <label>Descripción / Comentarios</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Cuéntanos por qué es un buen lugar..."
                                    rows={4}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
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
