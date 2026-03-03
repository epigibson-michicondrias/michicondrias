"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getPetById, updatePet, Pet } from "@/lib/services/mascotas";
import dashStyles from "../../dashboard.module.css";
import styles from "../mascotas.module.css";
import { toast } from "react-hot-toast";

export default function GestionMascotaPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const petId = params.id as string;

    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState<Partial<Pet>>({});

    const { data: pet, isLoading, error } = useQuery({
        queryKey: ["pet", petId],
        queryFn: () => getPetById(petId),
        enabled: !!petId,
    });

    useEffect(() => {
        if (pet) {
            setForm(pet);
        }
    }, [pet]);

    const mutation = useMutation({
        mutationFn: (data: Partial<Pet>) => updatePet(petId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pet", petId] });
            queryClient.invalidateQueries({ queryKey: ["user-pets"] });
            toast.success("✨ ¡Mascota actualizada con éxito!");
            setIsEditing(false);
        },
        onError: (err: any) => {
            toast.error(err.message || "Error al actualizar");
        }
    });

    if (isLoading) return (
        <div className={dashStyles["loading-container"]}>
            <p style={{ color: "var(--text-secondary)", padding: "2rem" }}>Conectando con el michi...</p>
        </div>
    );

    if (error || !pet) return (
        <div className={dashStyles["empty-state"]}>
            <span style={{ fontSize: "5rem" }}>😿</span>
            <h3>No encontramos a este michi</h3>
            <Link href="/dashboard/mascotas" className="btn btn-secondary">Volver a mis mascotas</Link>
        </div>
    );

    const speciesIcon: Record<string, string> = {
        perro: "🐕", gato: "🐈", ave: "🦜", otro: "🐾",
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(form);
    };

    return (
        <div className={styles.container}>
            {/* Action Bar */}
            <div className={styles["action-bar"]}>
                <Link href="/dashboard/mascotas" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    ← Volver a Mis Mascotas
                </Link>
                <button
                    className={isEditing ? "btn btn-outline" : styles["btn-premium"]}
                    onClick={() => setIsEditing(!isEditing)}
                >
                    {isEditing ? "👁️ Ver Perfil Cinemático" : "✏️ Editar Información"}
                </button>
            </div>

            {!isEditing ? (
                /* CINEMATIC PROFILE VIEW */
                <div className={styles["cinematic-container"]}>
                    <div className={styles["profile-hero"]}>
                        {pet.photo_url ? (
                            <Image
                                src={pet.photo_url}
                                alt={pet.name}
                                fill
                                style={{ objectFit: "cover" }}
                                priority
                            />
                        ) : (
                            <div className={styles["pet-emoji-placeholder"]} style={{ fontSize: "10rem" }}>
                                {speciesIcon[pet.species] || "🐾"}
                            </div>
                        )}
                    </div>

                    <div className={styles["profile-content"]}>
                        {/* Digital Identity Card (Sticky Column) */}
                        <div className={styles["pet-digital-card"]}>
                            <h1 className={styles["profile-pet-name"]}>{pet.name}</h1>
                            <div className={styles["profile-meta-row"]}>
                                <span className={styles["pet-tag"]} style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa' }}>
                                    {speciesIcon[pet.species]} {pet.species}
                                </span>
                                {pet.breed && <span className={styles["pet-tag"]}>{pet.breed}</span>}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
                                <div className={`${styles["social-badge"]} ${pet.is_vaccinated ? styles["badge-active"] : styles["badge-inactive"]}`}>
                                    <span>💉</span> Vacunas: {pet.is_vaccinated ? "Al día" : "Pendientes"}
                                </div>
                                <div className={`${styles["social-badge"]} ${pet.is_sterilized ? styles["badge-active"] : styles["badge-inactive"]}`}>
                                    <span>✂️</span> {pet.is_sterilized ? "Esterilizado" : "No esterilizado"}
                                </div>
                                <div className={`${styles["social-badge"]} ${pet.is_dewormed ? styles["badge-active"] : styles["badge-inactive"]}`}>
                                    <span>🦠</span> {pet.is_dewormed ? "Desparasitado" : "Protección necesaria"}
                                </div>
                            </div>

                            {pet.microchip_number && (
                                <div style={{ marginTop: '2.5rem', opacity: 0.5, fontSize: '0.8rem', fontFamily: 'monospace' }}>
                                    📡 MICROCHIP: {pet.microchip_number}
                                </div>
                            )}
                        </div>

                        {/* Interactive Info Section */}
                        <div className={styles["main-profile-info"]}>
                            {/* Stats Bar */}
                            <div className={styles["cinematic-stats-bar"]}>
                                <div className={styles["stat-item"]}>
                                    <span className={styles["stat-icon"]}>📏</span>
                                    <span className={styles["stat-label"]}>Tamaño</span>
                                    <span className={styles["stat-value"]}>{pet.size || "Mediano"}</span>
                                </div>
                                <div className={styles["stat-item"]}>
                                    <span className={styles["stat-icon"]}>📅</span>
                                    <span className={styles["stat-label"]}>Edad</span>
                                    <span className={styles["stat-value"]}>{pet.age_months ? `${pet.age_months}m` : "--"}</span>
                                </div>
                                <div className={styles["stat-item"]}>
                                    <span className={styles["stat-icon"]}>⚖️</span>
                                    <span className={styles["stat-label"]}>Peso</span>
                                    <span className={styles["stat-value"]}>{pet.weight_kg ? `${pet.weight_kg}kg` : "--"}</span>
                                </div>
                                <div className={styles["stat-item"]}>
                                    <span className={styles["stat-icon"]}>⚡</span>
                                    <span className={styles["stat-label"]}>Energía</span>
                                    <span className={styles["stat-value"]}>{pet.energy_level || "Medio"}</span>
                                </div>
                            </div>

                            {/* Biography / Story */}
                            <div className={styles["info-block"]}>
                                <h3>📖 La Historia de {pet.name}</h3>
                                <p className={styles["info-text"]}>
                                    {pet.description || "Este pequeño compañero aún no tiene una historia escrita, pero cada día a tu lado es un capítulo nuevo."}
                                </p>
                            </div>

                            {/* Behavior & Social */}
                            <div className={styles["info-block"]}>
                                <h3>👨‍👩‍👧‍👦 Personalidad y Socialización</h3>
                                <div className={styles["social-grid"]}>
                                    <div className={`${styles["social-badge"]} ${pet.social_dogs ? styles["badge-active"] : ""}`}>
                                        <span>🐕</span> {pet.social_dogs ? "Amigo de otros perros" : "Independiente con perros"}
                                    </div>
                                    <div className={`${styles["social-badge"]} ${pet.social_cats ? styles["badge-active"] : ""}`}>
                                        <span>🐈</span> {pet.social_cats ? "Apto con gatitos" : "Prefiere ser el único felino"}
                                    </div>
                                    <div className={`${styles["social-badge"]} ${pet.social_children ? styles["badge-active"] : ""}`}>
                                        <span>👶</span> {pet.social_children ? "Excelente con niños" : "Hogar tranquilo sin niños"}
                                    </div>
                                </div>
                                {pet.temperament && (
                                    <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', fontStyle: 'italic', color: '#a78bfa' }}>
                                        "{pet.temperament}"
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* EDIT MODE VIEW */
                <div className={styles["modal-content"]} style={{ margin: "2rem auto", maxWidth: "900px", boxShadow: 'none', background: 'rgba(255,255,255,0.02)' }}>
                    <h2 className={styles["modal-title"]} style={{ marginBottom: '2rem' }}>✏️ Editar Perfil de {pet.name}</h2>
                    <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        <div className={styles["form-section"]}>
                            <h4 className={styles["section-title"]}>Información Básica</h4>
                            <div className={styles["form-grid"]}>
                                <div style={{ gridColumn: "span 2" }}>
                                    <label>Nombre de la Mascota</label>
                                    <input
                                        type="text" className="form-input" required
                                        value={form.name || ""} onChange={e => setForm({ ...form, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label>Especie</label>
                                    <select className="form-input" value={form.species || ""} onChange={e => setForm({ ...form, species: e.target.value })}>
                                        <option value="perro">🐕 Perro</option>
                                        <option value="gato">🐈 Gato</option>
                                        <option value="ave">🦜 Ave</option>
                                        <option value="otro">🐾 Otro</option>
                                    </select>
                                </div>
                                <div>
                                    <label>Raza</label>
                                    <input type="text" className="form-input" value={form.breed || ""} onChange={e => setForm({ ...form, breed: e.target.value })} />
                                </div>
                                <div>
                                    <label>Tamaño</label>
                                    <select className="form-input" value={form.size || ""} onChange={e => setForm({ ...form, size: e.target.value })}>
                                        <option value="pequeño">Pequeño</option>
                                        <option value="mediano">Mediano</option>
                                        <option value="grande">Grande</option>
                                    </select>
                                </div>
                                <div>
                                    <label>Edad (meses)</label>
                                    <input type="number" className="form-input" value={form.age_months || ""} onChange={e => setForm({ ...form, age_months: parseInt(e.target.value) })} />
                                </div>
                            </div>
                            <div style={{ marginTop: "1rem" }}>
                                <label>Descripción Personal / Historia</label>
                                <textarea className="form-input" rows={4} value={form.description || ""} onChange={e => setForm({ ...form, description: e.target.value })} />
                            </div>
                            <div style={{ marginTop: "1rem" }}>
                                <label>URL de la Foto</label>
                                <input type="text" className="form-input" value={form.photo_url || ""} onChange={e => setForm({ ...form, photo_url: e.target.value })} />
                            </div>
                        </div>

                        <div className={styles["form-section"]}>
                            <h4 className={styles["section-title"]}>🩺 Perfil Clínico</h4>
                            <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
                                <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer" }}>
                                    <input type="checkbox" checked={form.is_vaccinated || false} onChange={e => setForm({ ...form, is_vaccinated: e.target.checked })} /> Vacunado
                                </label>
                                <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer" }}>
                                    <input type="checkbox" checked={form.is_sterilized || false} onChange={e => setForm({ ...form, is_sterilized: e.target.checked })} /> Esterilizado
                                </label>
                                <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer" }}>
                                    <input type="checkbox" checked={form.is_dewormed || false} onChange={e => setForm({ ...form, is_dewormed: e.target.checked })} /> Desparasitado
                                </label>
                            </div>
                            <div className={styles["form-grid"]}>
                                <div>
                                    <label>Peso (kg)</label>
                                    <input type="number" step="0.1" className="form-input" value={form.weight_kg || ""} onChange={e => setForm({ ...form, weight_kg: parseFloat(e.target.value) })} />
                                </div>
                                <div>
                                    <label>Microchip / ID</label>
                                    <input type="text" className="form-input" value={form.microchip_number || ""} onChange={e => setForm({ ...form, microchip_number: e.target.value })} />
                                </div>
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                            <button type="button" className="btn btn-secondary" style={{ flex: 1, borderRadius: "16px" }} onClick={() => setIsEditing(false)}>Descartar Cambios</button>
                            <button type="submit" className={styles["btn-premium"]} style={{ flex: 2 }} disabled={mutation.isPending}>
                                {mutation.isPending ? "Guardando..." : "Guardar Cambios ✨"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
