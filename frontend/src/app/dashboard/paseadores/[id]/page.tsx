"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getWalker, getWalkerReviews, requestWalk, Walker } from "@/lib/services/paseadores";
import { getUserPets, Pet } from "@/lib/services/mascotas";
import { getCurrentUser } from "@/lib/auth";
import dashStyles from "../../dashboard.module.css";
import styles from "../../modules.module.css";
import { toast } from "react-hot-toast";

export default function WalkerDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [showBooking, setShowBooking] = useState(false);

    const { data: walker, isLoading } = useQuery({
        queryKey: ["walker", id],
        queryFn: () => getWalker(id as string),
    });

    const { data: reviews = [] } = useQuery({
        queryKey: ["walker-reviews", id],
        queryFn: () => getWalkerReviews(id as string),
    });

    if (isLoading) return <div className={dashStyles["loading-container"]}><p>Cargando perfil...</p></div>;
    if (!walker) return <div className={dashStyles["empty-state"]}><h3>Perfil no encontrado</h3></div>;

    return (
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <div className={dashStyles["page-header"]}>
                <button onClick={() => router.back()} className="btn btn-secondary">← Volver</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "2rem", alignItems: "start" }}>
                {/* Main Content */}
                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                    {/* Header Card */}
                    <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "24px", padding: "2rem", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
                            <div style={{ width: "120px", height: "120px", borderRadius: "24px", overflow: "hidden", background: "rgba(255,255,255,0.05)" }}>
                                {walker.photo_url ? (
                                    <img src={walker.photo_url} alt={walker.display_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : (
                                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem" }}>🚶</div>
                                )}
                            </div>
                            <div>
                                <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 800 }}>{walker.display_name} {walker.is_verified && "✅"}</h1>
                                <p style={{ color: "var(--text-muted)", fontSize: "1.1rem", margin: "0.5rem 0" }}>📍 {walker.location}</p>
                                <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                                    <span style={{ padding: "0.5rem 1rem", background: "rgba(250,204,21,0.1)", color: "#fbbf24", borderRadius: "12px", fontWeight: 700 }}>⭐ {walker.rating?.toFixed(1) || "5.0"}</span>
                                    <span style={{ padding: "0.5rem 1rem", background: "rgba(124,58,237,0.1)", color: "#a78bfa", borderRadius: "12px", fontWeight: 700 }}>🐾 {walker.total_walks} paseos</span>
                                </div>
                            </div>
                        </div>
                        <div style={{ marginTop: "2rem", padding: "1.5rem", background: "rgba(255,255,255,0.02)", borderRadius: "16px", lineHeight: "1.6" }}>
                            <p style={{ margin: 0 }}>{walker.bio || "Este paseador aún no ha redactado su biografía."}</p>
                        </div>
                    </div>

                    {/* Details */}
                    <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "24px", padding: "2rem", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <h3 style={{ marginTop: 0 }}>Preferencias de Paseo</h3>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                            <div>
                                <p style={{ color: "var(--text-muted)", marginBottom: "0.5rem" }}>Experiencia:</p>
                                <p style={{ fontWeight: 600 }}>{walker.experience_years || 0} años paseando mascotas</p>
                            </div>
                            <div>
                                <p style={{ color: "var(--text-muted)", marginBottom: "0.5rem" }}>Mascotas por paseo:</p>
                                <p style={{ fontWeight: 600 }}>Hasta {walker.max_pets_per_walk} mascotas</p>
                            </div>
                            <div>
                                <p style={{ color: "var(--text-muted)", marginBottom: "0.5rem" }}>Radio de acción:</p>
                                <p style={{ fontWeight: 600 }}>{walker.service_radius_km} km a la redonda</p>
                            </div>
                            <div>
                                <p style={{ color: "var(--text-muted)", marginBottom: "0.5rem" }}>Acepta:</p>
                                <p style={{ fontWeight: 600 }}>{walker.accepts_dogs && "🐕 Perros "} {walker.accepts_cats && "🐈 Gatos"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Reviews */}
                    <div>
                        <h3 style={{ marginBottom: "1.5rem" }}>Reseñas ({reviews.length})</h3>
                        {reviews.length === 0 ? (
                            <p style={{ opacity: 0.5 }}>Aún no hay reseñas para este paseador.</p>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                {reviews.map(review => (
                                    <div key={review.id} style={{ background: "rgba(255,255,255,0.03)", borderRadius: "16px", padding: "1.5rem", border: "1px solid rgba(255,255,255,0.05)" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                            <span style={{ fontWeight: 700, color: "#fbbf24" }}>{"⭐".repeat(review.rating)}</span>
                                        </div>
                                        <p style={{ margin: 0, opacity: 0.8 }}>{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Booking Card */}
                <div style={{ position: "sticky", top: "2rem", background: "linear-gradient(145deg, rgba(124,58,237,0.1), rgba(6,182,212,0.1))", borderRadius: "24px", padding: "2rem", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" }}>
                    <h3 style={{ marginTop: 0 }}>Reservar Paseo</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {walker.price_per_hour && (
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                <span style={{ opacity: 0.7 }}>Por hora</span>
                                <span style={{ fontSize: "1.4rem", fontWeight: 800 }}>${walker.price_per_hour} <small style={{ fontSize: "0.8rem", fontWeight: 400 }}>/h</small></span>
                            </div>
                        )}
                        {walker.price_per_walk && (
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                <span style={{ opacity: 0.7 }}>Por paseo</span>
                                <span style={{ fontSize: "1.4rem", fontWeight: 800 }}>${walker.price_per_walk} <small style={{ fontSize: "0.8rem", fontWeight: 400 }}>/total</small></span>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setShowBooking(true)}
                        className="btn btn-primary"
                        style={{ width: "100%", marginTop: "2rem", padding: "1.2rem", fontSize: "1.1rem", borderRadius: "16px", background: "var(--secondary)" }}
                    >
                        Solicitar Paseo 🦮
                    </button>

                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center", marginTop: "1rem" }}>
                        Horario: <span style={{ color: "#a78bfa" }}>{walker.schedule_preference || "Flexible"}</span>
                    </p>
                </div>
            </div>

            {showBooking && <WalkBookingModal walker={walker} onClose={() => setShowBooking(false)} />}
        </div>
    );
}

function WalkBookingModal({ walker, onClose }: { walker: Walker, onClose: () => void }) {
    const [petId, setPetId] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [duration, setDuration] = useState(60);
    const [address, setAddress] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);

    const { data: pets = [] } = useQuery<Pet[]>({
        queryKey: ["my-pets"],
        queryFn: async () => {
            const user = await getCurrentUser();
            if (!user) return [];
            return getUserPets(user.id);
        }
    });

    async function handleRequest(e: React.FormEvent) {
        e.preventDefault();
        if (!petId) return toast.error("Elige una mascota");

        setLoading(true);
        try {
            await requestWalk(walker.id, {
                pet_id: petId,
                requested_date: date,
                requested_time: time,
                duration_minutes: duration,
                pickup_address: address,
                notes
            });
            toast.success("¡Solicitud de paseo enviada!");
            onClose();
        } catch (err: any) {
            toast.error(err.message || "Error al enviar solicitud");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
            <div style={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "24px", width: "100%", maxWidth: "500px", padding: "2rem" }}>
                <h2 style={{ marginTop: 0 }}>🦮 Solicitar Paseo</h2>
                <form onSubmit={handleRequest} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                    <div className={styles["form-group"]}>
                        <label>Mascota</label>
                        <select required value={petId} onChange={e => setPetId(e.target.value)} style={{ padding: "0.8rem", borderRadius: "12px", background: "rgba(255,255,255,0.05)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" }}>
                            <option value="">Selecciona una...</option>
                            {pets.map((pet: Pet) => (
                                <option key={pet.id} value={pet.id}>{pet.name} ({pet.species})</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div className={styles["form-group"]}>
                            <label>Fecha</label>
                            <input type="date" required value={date} onChange={e => setDate(e.target.value)} />
                        </div>
                        <div className={styles["form-group"]}>
                            <label>Hora</label>
                            <input type="time" required value={time} onChange={e => setTime(e.target.value)} />
                        </div>
                    </div>

                    <div className={styles["form-group"]}>
                        <label>Duración (minutos)</label>
                        <select value={duration} onChange={e => setDuration(Number(e.target.value))} style={{ padding: "0.8rem", borderRadius: "12px", background: "rgba(255,255,255,0.05)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" }}>
                            <option value={30}>30 min</option>
                            <option value={60}>1 hora</option>
                            <option value={90}>1.5 horas</option>
                            <option value={120}>2 horas</option>
                        </select>
                    </div>

                    <div className={styles["form-group"]}>
                        <label>Dirección de recolección</label>
                        <input required value={address} onChange={e => setAddress(e.target.value)} placeholder="¿Dónde recogemos al michi?" />
                    </div>

                    <div className={styles["form-group"]}>
                        <label>Notas</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Instrucciones del paseo" />
                    </div>

                    <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                        <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>Cancelar</button>
                        <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 2, background: "var(--secondary)" }}>{loading ? "Enviando..." : "Confirmar Paseo"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
