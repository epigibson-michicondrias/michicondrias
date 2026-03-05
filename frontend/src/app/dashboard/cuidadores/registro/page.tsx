"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { registerAsSitter } from "@/lib/services/cuidadores";
import dashStyles from "../../dashboard.module.css";
import styles from "../../modules.module.css";
import { toast } from "react-hot-toast";

export default function RegistroCuidadorPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        display_name: "",
        bio: "",
        location: "",
        price_per_day: "",
        price_per_visit: "",
        service_type: "both",
        max_pets: 2,
        has_yard: false,
        home_type: "",
        accepts_dogs: true,
        accepts_cats: true,
        experience_years: "",
    });

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            await registerAsSitter({
                display_name: form.display_name,
                bio: form.bio || undefined,
                location: form.location || undefined,
                price_per_day: form.price_per_day ? Number(form.price_per_day) : undefined,
                price_per_visit: form.price_per_visit ? Number(form.price_per_visit) : undefined,
                service_type: form.service_type,
                max_pets: form.max_pets,
                has_yard: form.has_yard,
                home_type: form.home_type || undefined,
                accepts_dogs: form.accepts_dogs,
                accepts_cats: form.accepts_cats,
                experience_years: form.experience_years ? Number(form.experience_years) : 0,
            });
            toast.success("🎉 ¡Te registraste como cuidador!");
            router.push("/dashboard/cuidadores");
        } catch (err: any) {
            toast.error(err.message || "Error al registrar");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div className={dashStyles["page-header"]}>
                <h1 className={dashStyles["page-title"]}>🏠 Registrarme como Cuidador</h1>
                <p className={dashStyles["page-subtitle"]}>
                    Crea tu perfil y ofrece cuidado temporal a mascotas
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
                        <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="CDMX, Roma Norte" />
                    </div>
                </div>

                <div className={styles["form-group"]}>
                    <label>Biografía / Presentación</label>
                    <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Cuéntanos sobre ti, tu hogar y tu experiencia cuidando mascotas..." style={{ minHeight: "100px" }} />
                </div>

                <div className={styles["form-divider"]} />
                <p className={styles["form-section-title"]}>🏠 Mi Espacio</p>
                <div className={styles["form-row"]}>
                    <div className={styles["form-group"]}>
                        <label>Tipo de servicio</label>
                        <select value={form.service_type} onChange={e => setForm({ ...form, service_type: e.target.value })} style={{ padding: "0.75rem", borderRadius: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}>
                            <option value="hosting">🏠 Hospedaje (en mi casa)</option>
                            <option value="visiting">🏃 Visitas (voy a tu casa)</option>
                            <option value="both">🏠+🏃 Ambos</option>
                        </select>
                    </div>
                    <div className={styles["form-group"]}>
                        <label>Tipo de hogar</label>
                        <select value={form.home_type} onChange={e => setForm({ ...form, home_type: e.target.value })} style={{ padding: "0.75rem", borderRadius: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}>
                            <option value="">Seleccionar...</option>
                            <option value="Casa">🏠 Casa</option>
                            <option value="Departamento">🏢 Departamento</option>
                            <option value="Casa con jardín">🌿 Casa con jardín</option>
                        </select>
                    </div>
                </div>
                <div className={styles["form-row"]}>
                    <div className={styles["form-group"]}>
                        <label>Max mascotas simultáneas</label>
                        <input type="number" value={form.max_pets} onChange={e => setForm({ ...form, max_pets: Number(e.target.value) })} />
                    </div>
                    <div className={styles["form-group"]}>
                        <label>Años de experiencia</label>
                        <input type="number" value={form.experience_years} onChange={e => setForm({ ...form, experience_years: e.target.value })} placeholder="2" />
                    </div>
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", color: "#fff", marginTop: "0.5rem" }}>
                    <input type="checkbox" checked={form.has_yard} onChange={e => setForm({ ...form, has_yard: e.target.checked })} /> 🌿 Cuento con jardín/patio
                </label>

                <div className={styles["form-divider"]} />
                <p className={styles["form-section-title"]}>💰 Precios</p>
                <div className={styles["form-row"]}>
                    <div className={styles["form-group"]}>
                        <label>Precio por día de hospedaje (MXN)</label>
                        <input type="number" value={form.price_per_day} onChange={e => setForm({ ...form, price_per_day: e.target.value })} placeholder="250" />
                    </div>
                    <div className={styles["form-group"]}>
                        <label>Precio por visita (MXN)</label>
                        <input type="number" value={form.price_per_visit} onChange={e => setForm({ ...form, price_per_visit: e.target.value })} placeholder="150" />
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
                        {loading ? "Registrando..." : "✨ Publicar mi Perfil de Cuidador"}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => router.push("/dashboard/cuidadores")}>
                        Cancelar
                    </button>
                </div>
            </form>
        </>
    );
}
