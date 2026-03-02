"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createLostPet } from "@/lib/services/mascotas";
import dashStyles from "../../dashboard.module.css";
import styles from "../../modules.module.css";

export default function ReportarPerdidaPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");
        const form = new FormData(e.currentTarget);
        try {
            await createLostPet({
                pet_name: form.get("pet_name") as string,
                species: form.get("species") as string,
                breed: (form.get("breed") as string) || null,
                description: (form.get("description") as string) || null,
                last_seen_location: form.get("location") as string,
                date_lost: new Date().toISOString(),
                contact_phone: form.get("phone") as string,
                image_url: null,
                is_found: false,
            });
            router.push("/dashboard/perdidas");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Error al reportar");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div className={dashStyles["page-header"]}>
                <h1 className={dashStyles["page-title"]}>🔍 Reportar mascota perdida</h1>
                <p className={dashStyles["page-subtitle"]}>Ayúdanos a encontrarla</p>
            </div>
            <form onSubmit={handleSubmit} className={styles["create-form"]}>
                {error && <div style={{ color: "var(--error)", marginBottom: "1rem" }}>{error}</div>}
                <div className={styles["form-group"]}>
                    <label>Nombre de la mascota</label>
                    <input name="pet_name" placeholder="Nombre" required />
                </div>
                <div className={styles["form-group"]}>
                    <label>Especie</label>
                    <select name="species" required>
                        <option value="perro">Perro</option>
                        <option value="gato">Gato</option>
                        <option value="otro">Otro</option>
                    </select>
                </div>
                <div className={styles["form-group"]}>
                    <label>Raza (opcional)</label>
                    <input name="breed" placeholder="Raza" />
                </div>
                <div className={styles["form-group"]}>
                    <label>Descripción</label>
                    <textarea name="description" placeholder="Color, tamaño, marcas..." />
                </div>
                <div className={styles["form-group"]}>
                    <label>Última ubicación vista</label>
                    <input name="location" placeholder="Colonia, calle, referencia" required />
                </div>
                <div className={styles["form-group"]}>
                    <label>Teléfono de contacto</label>
                    <input name="phone" placeholder="55 1234 5678" required />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Reportando..." : "Publicar reporte"}
                </button>
            </form>
        </>
    );
}
