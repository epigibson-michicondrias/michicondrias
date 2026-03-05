"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getPetById, updatePet, Pet, getMascotasPresignedUrl } from "@/lib/services/mascotas";
import { createSubscriptionSession } from "@/lib/services/ecommerce";
import dashStyles from "../../dashboard.module.css";
import styles from "../mascotas.module.css";
import { toast } from "react-hot-toast";

export default function GestionMascotaPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const petId = params.id as string;

    const [isEditing, setIsEditing] = useState(false);
    const [isUpgrading, setIsUpgrading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
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

    const handleUpgradePro = async () => {
        setIsUpgrading(true);
        try {
            const result = await createSubscriptionSession(petId);
            if (result.url) {
                window.location.href = result.url;
            } else {
                toast.error("Error al iniciar checkout");
                setIsUpgrading(false);
            }
        } catch (error: any) {
            toast.error(error.message || "Error de conexión con Stripe");
            setIsUpgrading(false);
        }
    };

    const handleUploadGalleryImage = async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = true;
        input.onchange = async (e) => {
            const files = (e.target as HTMLInputElement).files;
            if (!files || files.length === 0) return;
            setIsUploading(true);
            try {
                const currentGallery = pet?.gallery ? [...pet.gallery] : [];
                for (const file of Array.from(files)) {
                    const ext = file.name.split('.').pop() || 'jpg';
                    const { url, object_key } = await getMascotasPresignedUrl(ext);
                    await fetch(url, {
                        method: 'PUT',
                        body: file,
                        headers: { 'Content-Type': file.type },
                    });
                    currentGallery.push(object_key);
                }
                await updatePet(petId, { gallery: currentGallery });
                queryClient.invalidateQueries({ queryKey: ['pet', petId] });
                queryClient.invalidateQueries({ queryKey: ['user-pets'] });
                toast.success(`📸 ${files.length} foto(s) subidas con éxito`);
            } catch (err: any) {
                toast.error(err.message || 'Error al subir imagen');
            } finally {
                setIsUploading(false);
            }
        };
        input.click();
    };

    const handleSetAsProfile = async (url: string) => {
        try {
            await updatePet(petId, { photo_url: url });
            queryClient.invalidateQueries({ queryKey: ['pet', petId] });
            queryClient.invalidateQueries({ queryKey: ['user-pets'] });
            toast.success('⭐ Foto de perfil actualizada');
        } catch {
            toast.error('Error al cambiar foto de perfil');
        }
    };

    const handleDeleteGalleryImage = async (urlToDelete: string) => {
        const updated = (pet?.gallery || []).filter(u => u !== urlToDelete);
        const updates: Partial<Pet> = { gallery: updated };
        if (pet?.photo_url === urlToDelete) {
            updates.photo_url = updated[0] || null;
        }
        try {
            await updatePet(petId, updates);
            queryClient.invalidateQueries({ queryKey: ['pet', petId] });
            queryClient.invalidateQueries({ queryKey: ['user-pets'] });
            toast.success('🗑️ Foto eliminada');
        } catch {
            toast.error('Error al eliminar foto');
        }
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

                            {/* Photo Gallery */}
                            <div className={styles["info-block"]}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3>📸 Galería de Fotos</h3>
                                    <button
                                        onClick={handleUploadGalleryImage}
                                        disabled={isUploading}
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(6, 182, 212, 0.15))',
                                            border: '1px solid rgba(124, 58, 237, 0.3)',
                                            color: '#fff',
                                            padding: '0.6rem 1.2rem',
                                            borderRadius: '12px',
                                            fontWeight: 600,
                                            fontSize: '0.85rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                        }}
                                    >
                                        {isUploading ? '⏳ Subiendo...' : '📤 Subir Fotos'}
                                    </button>
                                </div>
                                {pet.gallery && pet.gallery.length > 0 ? (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
                                        {pet.gallery.map((url, i) => (
                                            <div key={i} style={{
                                                position: 'relative',
                                                borderRadius: '16px',
                                                overflow: 'hidden',
                                                aspectRatio: '1',
                                                border: pet.photo_url === url ? '2px solid #a78bfa' : '1px solid rgba(255,255,255,0.06)',
                                                transition: 'all 0.3s ease',
                                            }}>
                                                <img src={url} alt={`${pet.name} ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                {pet.photo_url === url && (
                                                    <div style={{ position: 'absolute', top: '6px', left: '6px', background: 'rgba(139, 92, 246, 0.85)', borderRadius: '8px', padding: '2px 8px', fontSize: '0.65rem', fontWeight: 700, color: '#fff' }}>⭐ Perfil</div>
                                                )}
                                                <div style={{
                                                    position: 'absolute', bottom: 0, left: 0, right: 0,
                                                    background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
                                                    padding: '0.5rem', display: 'flex', justifyContent: 'center', gap: '0.4rem',
                                                    opacity: 0, transition: 'opacity 0.3s',
                                                }}
                                                    onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                                                    onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
                                                >
                                                    {pet.photo_url !== url && (
                                                        <button onClick={() => handleSetAsProfile(url)} style={{ background: 'rgba(139,92,246,0.3)', border: '1px solid rgba(139,92,246,0.5)', color: '#fff', borderRadius: '8px', padding: '4px 10px', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 600 }}>⭐ Perfil</button>
                                                    )}
                                                    <button onClick={() => handleDeleteGalleryImage(url)} style={{ background: 'rgba(239,68,68,0.3)', border: '1px solid rgba(239,68,68,0.5)', color: '#fff', borderRadius: '8px', padding: '4px 10px', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 600 }}>🗑️</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>📷</span>
                                        Aún no hay fotos. ¡Sube las mejores de {pet.name}!
                                    </div>
                                )}
                            </div>

                            {/* Michi-Tracker Pro Banner */}
                            {!pet.has_active_subscription ? (
                                <div style={{ background: 'linear-gradient(135deg, rgba(30,30,40,0.8), rgba(20,20,30,0.95))', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '24px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem', boxShadow: '0 8px 32px rgba(139, 92, 246, 0.15)', position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'radial-gradient(circle at center, rgba(139,92,246,0.1) 0%, transparent 50%)', animation: 'spin 15s linear infinite', zIndex: 0, pointerEvents: 'none' }} />
                                    <div style={{ zIndex: 1, position: 'relative' }}>
                                        <h3 style={{ margin: 0, color: '#a78bfa', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.4rem' }}>
                                            🛸 Michi-Tracker Pro
                                        </h3>
                                        <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 1.5rem 0', lineHeight: 1.6 }}>
                                            Activa la suscripción mensual para desbloquear el collar GPS, monitoreo en tiempo real, alertas de escape y más.
                                        </p>
                                        <button
                                            className={styles["btn-premium"]}
                                            style={{ width: '100%' }}
                                            onClick={handleUpgradePro}
                                            disabled={isUpgrading}
                                        >
                                            {isUpgrading ? "Conectando con Stripe..." : "🌟 Adquirir Suscripción por $199 MXN/mes"}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '24px', padding: '2rem', marginTop: '1.5rem', boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)' }}>
                                    <h3 style={{ margin: 0, color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.4rem' }}>
                                        📡 Michi-Tracker Pro Activo
                                    </h3>
                                    <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 1.5rem 0' }}>
                                        Conexión satelital establecida con el Michi-Collar GPS.
                                    </p>
                                    <button
                                        className="btn btn-outline"
                                        style={{ width: '100%', borderColor: '#10b981', color: '#10b981' }}
                                        onClick={() => toast.success("Abriendo radar...")}
                                    >
                                        📍 Abrir Radar en Tiempo Real
                                    </button>
                                </div>
                            )}

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

                            {/* Medical History */}
                            {/* Medical History Shortcut */}
                            <div className={styles["info-block"]} style={{ marginTop: '2rem' }}>
                                <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>🩺 Expediente Clínico de {pet.name}</h3>
                                <div style={{ background: "rgba(139, 92, 246, 0.05)", border: "1px solid rgba(139, 92, 246, 0.2)", borderRadius: "16px", padding: "1.5rem" }}>
                                    <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
                                        Consulta el historial médico oficial, recetas digitales, recordatorios de medicación y vacunas de tu compañero en su Carnet Digital interactivo.
                                    </p>
                                    <Link href={`/dashboard/carnet/${pet.id}`} className={styles["btn-premium"]} style={{ width: "100%", justifyContent: "center" }}>
                                        Ir al Carnet Clínico de {pet.name} ➡️
                                    </Link>
                                </div>
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
                                <label>Galería de Fotos</label>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.25rem 0 0.75rem 0' }}>Las fotos se gestionan desde la vista de perfil. Cambia a "Ver Perfil Cinemático" para subir, eliminar o cambiar la foto de perfil.</p>
                                {form.photo_url && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'rgba(139,92,246,0.05)', borderRadius: '12px', border: '1px solid rgba(139,92,246,0.15)' }}>
                                        <img src={form.photo_url} alt="Perfil" style={{ width: '50px', height: '50px', borderRadius: '12px', objectFit: 'cover' }} />
                                        <div>
                                            <span style={{ fontSize: '0.8rem', color: '#a78bfa', fontWeight: 600 }}>⭐ Foto de perfil actual</span>
                                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0', wordBreak: 'break-all' }}>{form.photo_url.split('/').pop()}</p>
                                        </div>
                                    </div>
                                )}
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
