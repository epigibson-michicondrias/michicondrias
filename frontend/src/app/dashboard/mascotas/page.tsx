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

    const { data: user, isLoading: loadingUser } = useQuery({
        queryKey: ["current-user"],
        queryFn: getCurrentUser
    });

    const { data: pets = [], isPending: loadingPets } = useQuery({
        queryKey: ["user-pets", user?.id],
        queryFn: () => getUserPets(user!.id),
        enabled: !!user?.id,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const loading = loadingUser || loadingPets;

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const newPetOptimistic: Pet = {
            id: `temp-${Date.now()}`,
            ...form,
            age_months: form.age_months ? parseInt(form.age_months) : null,
            weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
            owner_id: user!.id,
            is_active: true,
            created_at: new Date().toISOString(),
        } as any as Pet;

        try {
            // Optimistic Update
            queryClient.setQueryData(["user-pets", user?.id], (old: Pet[] | undefined) => {
                return old ? [newPetOptimistic, ...old] : [newPetOptimistic];
            });

            await createPet({
                ...form,
                age_months: form.age_months ? parseInt(form.age_months) : null,
                weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
                owner_id: user!.id,
                is_active: true,
            });

            toast.success("🐾 Mascota registrada con éxito");
            setShowModal(false);
            setForm({
                name: "", species: "perro", breed: "", age_months: "", size: "mediano", description: "", photo_url: "",
                is_vaccinated: false, is_sterilized: false, is_dewormed: false,
                temperament: "", energy_level: "Medio",
                social_cats: true, social_dogs: true, social_children: true,
                weight_kg: "", microchip_number: ""
            });
        } catch (error: any) {
            // Rollback on error
            queryClient.invalidateQueries({ queryKey: ["user-pets", user?.id] });
            toast.error(error.message || "Error al registrar mascota");
        } finally {
            // Invalidate to sync with real DB ID
            queryClient.invalidateQueries({ queryKey: ["user-pets", user?.id] });
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

    const speciesIcon: Record<string, React.ReactNode> = {
        perro: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 5.172a4 4 0 0 0-5.656 5.656l1.414 1.414L12 18.414l6.242-6.172 1.414-1.414a4 4 0 0 0-5.656-5.656l-1.414 1.414L12 7.586l-1.414-1.414z" /><path d="M12 18.414 7.758 14.172a4 4 0 0 1 5.656-5.656l.586.586.586-.586a4 4 0 0 1 5.656 5.656L12 18.414z" opacity="0.3" /><circle cx="9" cy="9" r="1" /><circle cx="15" cy="9" r="1" /><path d="M10 13c.67.67 1.33.67 2 0" /></svg>,
        gato: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 2-1.99 2-1.99a8.1 8.1 0 0 1 0 4.13c1.08.77 2 2.11 2 3.6 0 3-1.61 5.5-4 6.5l-1 2-1-2c-2.39-1-4-3.5-4-6.5 0-1.49.92-2.83 2-3.6a8.1 8.1 0 0 1 0-4.13s.22-.01 2 1.99c.65-.17 1.33-.26 2-.26Z" /><circle cx="12" cy="10" r="1" /></svg>,
        ave: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 7c-1.5 0-3-1-4.5-1s-3 1-4.5 1" /><path d="M20 12c-1.5 0-3-1-4.5-1s-3 1-4.5 1" /><path d="M12 17c-1.5 0-3-1-4.5-1s-3 1-4.5 1" /><path d="M22 2v20H2V2h20z" /><path d="M12 2v20" /></svg>,
        otro: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 2-1.99 2-1.99a8.1 8.1 0 0 1 0 4.13c1.08.77 2 2.11 2 3.6 0 3-1.61 5.5-4 6.5l-1 2-1-2c-2.39-1-4-3.5-4-6.5 0-1.49.92-2.83 2-3.6a8.1 8.1 0 0 1 0-4.13s.22-.01 2 1.99c.65-.17 1.33-.26 2-.26Z" /></svg>,
    };

    const statusIcons = {
        vaccinated: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg>,
        sterilized: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 15h12" /><path d="M6 9h12" /><path d="M9 18V6" /><path d="M15 18V6" /></svg>
    };

    return (
        <div className={styles.container}>
            <div className={dashStyles["page-header"]}>
                <h1 className={dashStyles["page-title"]}>🐾 Mis Mascotas</h1>
                <p className={dashStyles["page-subtitle"]}>
                    Registra y gestiona los "Pasaportes Digitales" de tus compañeros peludos.
                </p>
            </div>

            <div className={styles["action-bar"]}>
                <span style={{ color: "var(--text-secondary)", fontSize: "0.95rem", fontWeight: 700, letterSpacing: '0.02em' }}>
                    🛰️ {pets.length} {pets.length === 1 ? 'Mascota registrada' : 'Mascotas registradas'}
                </span>
                <button className={styles["btn-premium"]} onClick={() => setShowModal(true)}>
                    ✨ Registrar Nueva Mascota
                </button>
            </div>

            {loading ? (
                <div className={dashStyles["loading-container"]}>
                    <p style={{ color: "var(--text-secondary)", padding: "2rem" }}>Sincronizando identidades digitales...</p>
                </div>
            ) : pets.length === 0 ? (
                <div className={dashStyles["empty-state"]} style={{ padding: "5rem 2rem", background: "rgba(255,255,255,0.02)", borderRadius: "40px", border: "1px dashed rgba(255,255,255,0.1)" }}>
                    <span style={{ fontSize: "5rem", display: "block", marginBottom: "1.5rem", opacity: 0.5 }}>🛰️</span>
                    <h3 style={{ color: "#fff", fontSize: "1.75rem", fontWeight: "900", letterSpacing: '-0.02em' }}>¡Aún no hay compañeros!</h3>
                    <p style={{ color: "var(--text-secondary)", fontSize: '1.1rem' }}>Registra a tu primera mascota para generar su pasaporte digital.</p>
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
                                            {speciesIcon[pet.species] || speciesIcon.otro}
                                        </div>
                                    )}
                                </div>
                                <div className={styles["pet-info"]}>
                                    <div className={styles["pet-header"]}>
                                        <h3 className={styles["pet-name"]}>{pet.name}</h3>
                                        <div style={{ display: "flex", gap: "0.5rem" }}>
                                            {pet.is_vaccinated && (
                                                <span className={`${styles["pet-status-chip"]} ${styles["status-vaccinated"]}`} title="Vacunado">
                                                    {statusIcons.vaccinated}
                                                </span>
                                            )}
                                            {pet.is_sterilized && (
                                                <span className={`${styles["pet-status-chip"]} ${styles["status-sterilized"]}`} title="Esterilizado">
                                                    {statusIcons.sterilized}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className={styles["pet-meta"]}>
                                        <span className={styles["pet-tag"]}>
                                            {speciesIcon[pet.species] || speciesIcon.otro} {pet.species}
                                        </span>
                                        {pet.breed && <span className={styles["pet-tag"]}>{pet.breed}</span>}
                                        {pet.age_months && <span className={styles["pet-tag"]}>📅 {getAgeLabel(pet.age_months)}</span>}
                                    </div>

                                    {pet.description && (
                                        <p className={styles["pet-desc"]}>{pet.description}</p>
                                    )}

                                    <div className={styles["pet-passport-footer"]}>
                                        <span>PET ID: {pet.id.split('-')[0].toUpperCase()}</span>
                                        <span>{pet.microchip_number ? `CHIP: ${pet.microchip_number}` : 'NO CHIP'}</span>
                                    </div>
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
