"use client";

import { useEffect, useState } from "react";
import { getUserPets, createPet, Pet } from "@/lib/services/mascotas";
import { getCurrentUser, User } from "@/lib/auth";
import dashStyles from "../dashboard.module.css";
import modStyles from "../modules.module.css";
import styles from "./mascotas.module.css";
import { toast } from "react-hot-toast";

export default function MisMascotasPage() {
    const [pets, setPets] = useState<Pet[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        name: "", species: "perro", breed: "", age_months: "",
        size: "mediano", description: "", photo_url: "",
    });

    useEffect(() => {
        async function load() {
            try {
                const u = await getCurrentUser();
                setUser(u);
                if (u) {
                    const data = await getUserPets(u.id);
                    setPets(data);
                }
            } catch (err) {
                console.error("Error cargando mascotas", err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const created = await createPet({
                ...form,
                age_months: form.age_months ? parseInt(form.age_months) : null,
                owner_id: user!.id,
                is_active: true,
            });
            setPets([created, ...pets]);
            setShowModal(false);
            setForm({ name: "", species: "perro", breed: "", age_months: "", size: "mediano", description: "", photo_url: "" });
            toast.success("🐾 Mascota registrada con éxito");
        } catch (error: any) {
            toast.error(error.message || "Error al registrar mascota");
        } finally {
            setSubmitting(false);
        }
    };

    const getAgeLabel = (months: number | null) => {
        if (!months) return "";
        if (months < 12) return `${months} mes${months > 1 ? "es" : ""}`;
        const years = Math.floor(months / 12);
        const rem = months % 12;
        return `${years} año${years > 1 ? "s" : ""}${rem > 0 ? ` ${rem}m` : ""}`;
    };

    const speciesIcon: Record<string, string> = {
        perro: "🐕", gato: "🐈", ave: "🦜", otro: "🐾",
    };

    return (
        <div className={styles.container}>
            <div className={dashStyles["page-header"]}>
                <h1 className={dashStyles["page-title"]}>🐾 Mis Mascotas</h1>
                <p className={dashStyles["page-subtitle"]}>
                    Registra y gestiona los perfiles de tus compañeros peludos.
                </p>
            </div>

            <div className={modStyles["module-page__toolbar"]}>
                <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                    {pets.length} mascota{pets.length !== 1 ? "s" : ""} registrada{pets.length !== 1 ? "s" : ""}
                </span>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    ➕ Registrar Mascota
                </button>
            </div>

            {loading ? (
                <p className={dashStyles["loading-text"]}>Cargando tus compañeros...</p>
            ) : pets.length === 0 ? (
                <div className={modStyles["empty-state"]}>
                    <span className={modStyles["empty-state__icon"]}>🐾</span>
                    <p className={modStyles["empty-state__text"]}>Aún no has registrado ninguna mascota. ¡Añade a tu primer compañero!</p>
                </div>
            ) : (
                <div className={styles["pets-grid"]}>
                    {pets.map(pet => (
                        <div key={pet.id} className={styles["pet-card"]}>
                            <div className={styles["pet-avatar"]} style={{
                                backgroundImage: pet.photo_url ? `url(${pet.photo_url})` : "none"
                            }}>
                                {!pet.photo_url && <span className={styles["pet-emoji"]}>{speciesIcon[pet.species] || "🐾"}</span>}
                            </div>
                            <div className={styles["pet-info"]}>
                                <h3 className={styles["pet-name"]}>{pet.name}</h3>
                                <div className={styles["pet-meta"]}>
                                    <span className={styles["pet-tag"]}>{speciesIcon[pet.species]} {pet.species}</span>
                                    {pet.breed && <span className={styles["pet-tag"]}>{pet.breed}</span>}
                                    {pet.size && <span className={styles["pet-tag"]}>{pet.size}</span>}
                                    {pet.age_months && <span className={styles["pet-tag"]}>{getAgeLabel(pet.age_months)}</span>}
                                </div>
                                {pet.description && (
                                    <p className={styles["pet-desc"]}>{pet.description}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Register Modal */}
            {showModal && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "1rem" }}>
                    <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", padding: "2rem", width: "100%", maxWidth: "550px", maxHeight: "90vh", overflowY: "auto" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <h2 style={{ fontSize: "1.5rem", color: "#fff", margin: 0 }}>🐾 Registrar Mascota</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: "transparent", border: "none", color: "var(--text-secondary)", fontSize: "1.5rem", cursor: "pointer" }}>&times;</button>
                        </div>

                        <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div style={{ display: "flex", gap: "1rem" }}>
                                <div style={{ flex: 2 }}>
                                    <label>Nombre *</label>
                                    <input type="text" className="form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ej. Luna, Max..." />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label>Especie *</label>
                                    <select className="form-input" value={form.species} onChange={e => setForm({ ...form, species: e.target.value })}>
                                        <option value="perro">🐕 Perro</option>
                                        <option value="gato">🐈 Gato</option>
                                        <option value="ave">🦜 Ave</option>
                                        <option value="otro">🐾 Otro</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "1rem" }}>
                                <div style={{ flex: 1 }}>
                                    <label>Raza</label>
                                    <input type="text" className="form-input" value={form.breed} onChange={e => setForm({ ...form, breed: e.target.value })} placeholder="Labrador, Siamés..." />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label>Tamaño</label>
                                    <select className="form-input" value={form.size} onChange={e => setForm({ ...form, size: e.target.value })}>
                                        <option value="pequeño">Pequeño</option>
                                        <option value="mediano">Mediano</option>
                                        <option value="grande">Grande</option>
                                    </select>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label>Edad (meses)</label>
                                    <input type="number" className="form-input" value={form.age_months} onChange={e => setForm({ ...form, age_months: e.target.value })} placeholder="24" />
                                </div>
                            </div>
                            <div>
                                <label>Descripción</label>
                                <textarea className="form-input" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Color, personalidad, señas particulares..." />
                            </div>
                            <div>
                                <label>URL de Foto</label>
                                <input type="text" className="form-input" value={form.photo_url} onChange={e => setForm({ ...form, photo_url: e.target.value })} placeholder="https://..." />
                            </div>
                            <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={submitting}>
                                    {submitting ? "Registrando..." : "Registrar Mascota 🐾"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
