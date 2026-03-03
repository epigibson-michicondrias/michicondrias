"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserPets, createPet, Pet } from "@/lib/services/mascotas";
import { getCurrentUser } from "@/lib/auth";
import dashStyles from "../dashboard.module.css";
import modStyles from "../modules.module.css";
import styles from "./mascotas.module.css";
import { toast } from "react-hot-toast";

export default function MisMascotasPage() {
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        name: "", species: "perro", breed: "", age_months: "",
        size: "mediano", description: "", photo_url: "",
        is_vaccinated: false, is_sterilized: false, is_dewormed: false,
        temperament: "", energy_level: "Medio",
        social_cats: true, social_dogs: true, social_children: true,
        weight_kg: "", microchip_number: ""
    });

    const { data: user } = useQuery({
        queryKey: ["current-user"],
        queryFn: getCurrentUser
    });

    const { data: pets = [], isLoading: loading } = useQuery({
        queryKey: ["user-pets", user?.id],
        queryFn: () => getUserPets(user!.id),
        enabled: !!user?.id,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await createPet({
                ...form,
                age_months: form.age_months ? parseInt(form.age_months) : null,
                weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
                owner_id: user!.id,
                is_active: true,
            });
            // Finalize by invalidating cache
            queryClient.invalidateQueries({ queryKey: ["user-pets", user?.id] });
            setShowModal(false);
            setForm({
                name: "", species: "perro", breed: "", age_months: "", size: "mediano", description: "", photo_url: "",
                is_vaccinated: false, is_sterilized: false, is_dewormed: false,
                temperament: "", energy_level: "Medio",
                social_cats: true, social_dogs: true, social_children: true,
                weight_kg: "", microchip_number: ""
            });
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

            <div className={styles["action-bar"]}>
                <span style={{ color: "var(--text-secondary)", fontSize: "0.95rem", fontWeight: 600 }}>
                    🐾 {pets.length} {pets.length === 1 ? 'Mascota registrada' : 'Mascotas registradas'}
                </span>
                <button className={styles["btn-premium"]} onClick={() => setShowModal(true)}>
                    ✨ Registrar Nueva Mascota
                </button>
            </div>

            {loading ? (
                <div className={dashStyles["loading-container"]}>
                    <p style={{ color: "var(--text-secondary)", padding: "2rem" }}>Conectando con el refugio...</p>
                </div>
            ) : pets.length === 0 ? (
                <div className={dashStyles["empty-state"]} style={{ padding: "5rem 2rem", background: "rgba(15,15,26,0.4)", borderRadius: "32px", border: "1px dashed rgba(255,255,255,0.1)" }}>
                    <span style={{ fontSize: "5rem", display: "block", marginBottom: "1rem" }}>🐾</span>
                    <h3 style={{ color: "#fff", fontSize: "1.5rem", fontWeight: "800" }}>¡Aún no hay compañeros!</h3>
                    <p style={{ color: "var(--text-secondary)" }}>Registra a tu primera mascota para empezar a gestionarla.</p>
                </div>
            ) : (
                <div className={styles["pets-grid"]}>
                    {pets.map(pet => (
                        <Link key={pet.id} href={`/dashboard/mascotas/${pet.id}`} style={{ textDecoration: "none" }}>
                            <div className={styles["pet-card"]}>
                                <div className={styles["pet-visual"]}>
                                    {pet.photo_url ? (
                                        <Image
                                            src={pet.photo_url}
                                            alt={pet.name}
                                            fill
                                            style={{ objectFit: "cover" }}
                                        />
                                    ) : (
                                        <div className={styles["pet-emoji-placeholder"]}>
                                            {speciesIcon[pet.species] || "🐾"}
                                        </div>
                                    )}
                                </div>
                                <div className={styles["pet-info"]}>
                                    <div className={styles["pet-header"]}>
                                        <h3 className={styles["pet-name"]}>{pet.name}</h3>
                                        <div style={{ display: "flex", gap: "0.5rem" }}>
                                            {pet.is_vaccinated && <span className={`${styles["pet-status-chip"]} ${styles["status-vaccinated"]}`} title="Vacunado">💉</span>}
                                            {pet.is_sterilized && <span className={`${styles["pet-status-chip"]} ${styles["status-sterilized"]}`} title="Esterilizado">✂️</span>}
                                        </div>
                                    </div>

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
                        </Link>
                    ))}
                </div>
            )}

            {/* Register Modal */}
            {showModal && (
                <div className={styles["modal-overlay"]}>
                    <div className={styles["modal-content"]}>
                        <div className={styles["modal-header"]}>
                            <h2 className={styles["modal-title"]}>🐾 Registrar Mascota</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: "transparent", border: "none", color: "var(--text-secondary)", fontSize: "2rem", cursor: "pointer", lineHeight: 1 }}>&times;</button>
                        </div>

                        <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                            {/* Basic Info */}
                            <div className={styles["form-section"]}>
                                <h4 className={styles["section-title"]}>Información Básica</h4>
                                <div className={styles["form-grid"]}>
                                    <div style={{ gridColumn: "span 2" }}>
                                        <label>Nombre *</label>
                                        <input type="text" className="form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ej. Luna, Max..." />
                                    </div>
                                    <div>
                                        <label>Especie *</label>
                                        <select className="form-input" value={form.species} onChange={e => setForm({ ...form, species: e.target.value })}>
                                            <option value="perro">🐕 Perro</option>
                                            <option value="gato">🐈 Gato</option>
                                            <option value="ave">🦜 Ave</option>
                                            <option value="otro">🐾 Otro</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label>Raza</label>
                                        <input type="text" className="form-input" value={form.breed} onChange={e => setForm({ ...form, breed: e.target.value })} placeholder="Labrador, Siamés..." />
                                    </div>
                                    <div>
                                        <label>Tamaño</label>
                                        <select className="form-input" value={form.size} onChange={e => setForm({ ...form, size: e.target.value })}>
                                            <option value="pequeño">Pequeño</option>
                                            <option value="mediano">Mediano</option>
                                            <option value="grande">Grande</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label>Edad (meses)</label>
                                        <input type="number" className="form-input" value={form.age_months} onChange={e => setForm({ ...form, age_months: e.target.value })} placeholder="24" />
                                    </div>
                                </div>
                                <div style={{ marginTop: "1rem" }}>
                                    <label>Descripción</label>
                                    <textarea className="form-input" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Personalidad, señas particulares..." />
                                </div>
                                <div style={{ marginTop: "1rem" }}>
                                    <label>URL de Foto</label>
                                    <input type="text" className="form-input" value={form.photo_url} onChange={e => setForm({ ...form, photo_url: e.target.value })} placeholder="https://..." />
                                </div>
                            </div>

                            {/* Clinical Info */}
                            <div className={styles["form-section"]}>
                                <h4 className={styles["section-title"]}>🩺 Salud y Registro</h4>
                                <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
                                    <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", fontSize: "0.95rem" }}>
                                        <input type="checkbox" checked={form.is_vaccinated} onChange={e => setForm({ ...form, is_vaccinated: e.target.checked })} /> Vacunado
                                    </label>
                                    <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", fontSize: "0.95rem" }}>
                                        <input type="checkbox" checked={form.is_sterilized} onChange={e => setForm({ ...form, is_sterilized: e.target.checked })} /> Esterilizado
                                    </label>
                                    <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", fontSize: "0.95rem" }}>
                                        <input type="checkbox" checked={form.is_dewormed} onChange={e => setForm({ ...form, is_dewormed: e.target.checked })} /> Desparasitado
                                    </label>
                                </div>
                                <div className={styles["form-grid"]}>
                                    <div>
                                        <label>Peso (kg)</label>
                                        <input type="number" step="0.1" className="form-input" value={form.weight_kg} onChange={e => setForm({ ...form, weight_kg: e.target.value })} placeholder="12.5" />
                                    </div>
                                    <div>
                                        <label>Microchip / ID</label>
                                        <input type="text" className="form-input" value={form.microchip_number} onChange={e => setForm({ ...form, microchip_number: e.target.value })} placeholder="9000..." />
                                    </div>
                                </div>
                            </div>

                            {/* Behavior Info */}
                            <div className={styles["form-section"]}>
                                <h4 className={styles["section-title"]}>🧠 Comportamiento</h4>
                                <div className={styles["form-grid"]}>
                                    <div>
                                        <label>Nivel de Energía</label>
                                        <select className="form-input" value={form.energy_level} onChange={e => setForm({ ...form, energy_level: e.target.value })}>
                                            <option value="Bajo">Bajo</option>
                                            <option value="Medio">Medio</option>
                                            <option value="Alto">Alto</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label>Apto con Niños</label>
                                        <select className="form-input" value={form.social_children ? "true" : "false"} onChange={e => setForm({ ...form, social_children: e.target.value === "true" })}>
                                            <option value="true">Sí</option>
                                            <option value="false">No</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                                <button type="button" className="btn btn-secondary" style={{ flex: 1, borderRadius: "16px" }} onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className={styles["btn-premium"]} style={{ flex: 2 }} disabled={submitting}>
                                    {submitting ? "Registrando..." : "Confirmar Registro ✨"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
