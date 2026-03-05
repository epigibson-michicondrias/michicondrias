"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { registerAsWalker } from "@/lib/services/paseadores";
import dashStyles from "../../dashboard.module.css";
import styles from "../../modules.module.css";
import { toast } from "react-hot-toast";

export default function RegistroPaseadorPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        display_name: "",
        bio: "",
        location: "",
        price_per_walk: "",
        price_per_hour: "",
        experience_years: "",
        accepts_dogs: true,
        accepts_cats: false,
        max_pets_per_walk: 3,
        service_radius_km: 5,
        schedule_preference: "Flexible",
    });

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            await registerAsWalker({
                display_name: form.display_name,
                bio: form.bio || undefined,
                location: form.location || undefined,
                price_per_walk: form.price_per_walk ? Number(form.price_per_walk) : undefined,
                price_per_hour: form.price_per_hour ? Number(form.price_per_hour) : undefined,
                experience_years: form.experience_years ? Number(form.experience_years) : 0,
                accepts_dogs: form.accepts_dogs,
                accepts_cats: form.accepts_cats,
                max_pets_per_walk: form.max_pets_per_walk,
                service_radius_km: form.service_radius_km,
                schedule_preference: form.schedule_preference || undefined,
            });
            toast.success("🎉 ¡Te registraste como paseador!");
            router.push("/dashboard/paseadores");
        } catch (err: any) {
            toast.error(err.message || "Error al registrar");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div className={dashStyles["page-header"]}>
                <h1 className={dashStyles["page-title"]}>🚶 Registrarme como Paseador</h1>
                <p className={dashStyles["page-subtitle"]}>
                    Crea tu perfil y empieza a ofrecer paseos
                </p>
            </div>

            <form onSubmit={handleSubmit} className={styles["create-form"]}>
                <p className={styles["form-section-title"]}>Información Personal</p>
                <div className={styles["form-row"]}>
                    <div className={styles["form-group"]}>
                        <label>Nombre para mostrar</label>
                        <input required value={form.display_name} onChange={e => setForm({ ...form, display_name: e.target.value })} placeholder="Tu nombre público" />
                    </div>
                    <div className={styles["form-group"]}>
                        <label>Ubicación</label>
                        <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="CDMX, Polanco" />
                    </div>
                </div>

                <div className={styles["form-group"]}>
                    <label>Biografía / Presentación</label>
                    <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Cuéntanos sobre ti y tu experiencia con mascotas..." style={{ minHeight: "100px" }} />
                </div>

                <div className={styles["form-divider"]} />
                <p className={styles["form-section-title"]}>💰 Precios y Servicio</p>
                <div className={styles["form-row"]}>
                    <div className={styles["form-group"]}>
                        <label>Precio por paseo (MXN)</label>
                        <input type="number" value={form.price_per_walk} onChange={e => setForm({ ...form, price_per_walk: e.target.value })} placeholder="150" />
                    </div>
                    <div className={styles["form-group"]}>
                        <label>Precio por hora (MXN)</label>
                        <input type="number" value={form.price_per_hour} onChange={e => setForm({ ...form, price_per_hour: e.target.value })} placeholder="100" />
                    </div>
                </div>

                <div className={styles["form-row"]}>
                    <div className={styles["form-group"]}>
                        <label>Años de experiencia</label>
                        <input type="number" value={form.experience_years} onChange={e => setForm({ ...form, experience_years: e.target.value })} placeholder="2" />
                    </div>
                    <div className={styles["form-group"]}>
                        <label>Max mascotas por paseo</label>
                        <input type="number" value={form.max_pets_per_walk} onChange={e => setForm({ ...form, max_pets_per_walk: Number(e.target.value) })} />
                    </div>
                </div>

                <div className={styles["form-row"]}>
                    <div className={styles["form-group"]}>
                        <label>Radio de servicio (km)</label>
                        <input type="number" step="0.5" value={form.service_radius_km} onChange={e => setForm({ ...form, service_radius_km: Number(e.target.value) })} />
                    </div>
                    <div className={styles["form-group"]}>
                        <label>Horario preferido</label>
                        <select value={form.schedule_preference} onChange={e => setForm({ ...form, schedule_preference: e.target.value })} style={{ padding: "0.75rem", borderRadius: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}>
                            <option value="Mañanas">🌅 Mañanas</option>
                            <option value="Tardes">🌇 Tardes</option>
                            <option value="Flexible">🕐 Flexible</option>
                        </select>
                    </div>
                </div>

                <div className={styles["form-divider"]} />
                <p className={styles["form-section-title"]}>🐾 Acepta</p>
                <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", color: "#fff" }}>
                        <input type="checkbox" checked={form.accepts_dogs} onChange={e => setForm({ ...form, accepts_dogs: e.target.checked })} /> 🐕 Perros
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", color: "#fff" }}>
                        <input type="checkbox" checked={form.accepts_cats} onChange={e => setForm({ ...form, accepts_cats: e.target.checked })} /> 🐈 Gatos
                    </label>
                </div>

                <div className={styles["form-actions"]}>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? "Registrando..." : "✨ Publicar mi Perfil de Paseador"}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => router.push("/dashboard/paseadores")}>
                        Cancelar
                    </button>
                </div>
            </form>
        </>
    );
}
