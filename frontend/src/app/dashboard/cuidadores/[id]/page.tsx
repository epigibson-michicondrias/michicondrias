"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSitter, getSitterReviews, requestSit, Sitter } from "@/lib/services/cuidadores";
import { getUserPets, Pet } from "@/lib/services/mascotas";
import { getCurrentUser } from "@/lib/auth";
import dashStyles from "../../dashboard.module.css";
import styles from "../../modules.module.css";
import { toast } from "react-hot-toast";

export default function SitterDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [showBooking, setShowBooking] = useState(false);

    const { data: sitter, isLoading } = useQuery({
        queryKey: ["sitter", id],
        queryFn: () => getSitter(id as string),
    });

    const { data: reviews = [] } = useQuery({
        queryKey: ["sitter-reviews", id],
        queryFn: () => getSitterReviews(id as string),
    });

    if (isLoading) return <div className={dashStyles["loading-container"]}><p>Cargando perfil...</p></div>;
    if (!sitter) return <div className={dashStyles["empty-state"]}><h3>Perfil no encontrado</h3></div>;

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
                                {sitter.photo_url ? (
                                    <img src={sitter.photo_url} alt={sitter.display_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : (
                                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem" }}>🏠</div>
                                )}
                            </div>
                            <div>
                                <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 800 }}>{sitter.display_name} {sitter.is_verified && "✅"}</h1>
                                <p style={{ color: "var(--text-muted)", fontSize: "1.1rem", margin: "0.5rem 0" }}>📍 {sitter.location}</p>
                                <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                                    <span style={{ padding: "0.5rem 1rem", background: "rgba(250,204,21,0.1)", color: "#fbbf24", borderRadius: "12px", fontWeight: 700 }}>⭐ {sitter.rating?.toFixed(1) || "5.0"}</span>
                                    <span style={{ padding: "0.5rem 1rem", background: "rgba(16,185,129,0.1)", color: "#34d399", borderRadius: "12px", fontWeight: 700 }}>🏠 {sitter.total_sits} servicios</span>
                                </div>
                            </div>
                        </div>
                        <div style={{ marginTop: "2rem", padding: "1.5rem", background: "rgba(255,255,255,0.02)", borderRadius: "16px", lineHeight: "1.6" }}>
                            <p style={{ margin: 0 }}>{sitter.bio || "Este cuidador aún no ha redactado su biografía."}</p>
                        </div>
                    </div>

                    {/* Gallery or Extra Info */}
                    <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "24px", padding: "2rem", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <h3 style={{ marginTop: 0 }}>Detalles del Servicio</h3>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                            <div>
                                <p style={{ color: "var(--text-muted)", marginBottom: "0.5rem" }}>Servicios ofrecidos:</p>
                                <p style={{ fontWeight: 600 }}>{sitter.service_type === "both" ? "🏠 Hospedaje y 🏃 Visitas" : sitter.service_type === "hosting" ? "🏠 Hospedaje" : "🏃 Visitas"}</p>
                            </div>
                            <div>
                                <p style={{ color: "var(--text-muted)", marginBottom: "0.5rem" }}>Tipo de hogar:</p>
                                <p style={{ fontWeight: 600 }}>{sitter.home_type || "No especificado"} {sitter.has_yard && "(Con jardín)"}</p>
                            </div>
                            <div>
                                <p style={{ color: "var(--text-muted)", marginBottom: "0.5rem" }}>Experiencia:</p>
                                <p style={{ fontWeight: 600 }}>{sitter.experience_years || 0} años cuidando mascotas</p>
                            </div>
                            <div>
                                <p style={{ color: "var(--text-muted)", marginBottom: "0.5rem" }}>Acepta:</p>
                                <p style={{ fontWeight: 600 }}>{sitter.accepts_dogs && "🐕 Perros "} {sitter.accepts_cats && "🐈 Gatos"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Reviews */}
                    <div>
                        <h3 style={{ marginBottom: "1.5rem" }}>Reseñas ({reviews.length})</h3>
                        {reviews.length === 0 ? (
                            <p style={{ opacity: 0.5 }}>Aún no hay reseñas para este cuidador.</p>
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
                <div style={{ position: "sticky", top: "2rem", background: "linear-gradient(145deg, rgba(6,182,212,0.1), rgba(124,58,237,0.1))", borderRadius: "24px", padding: "2rem", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" }}>
                    <h3 style={{ marginTop: 0 }}>Reservar</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {sitter.price_per_day && (
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                <span style={{ opacity: 0.7 }}>Hospedaje</span>
                                <span style={{ fontSize: "1.4rem", fontWeight: 800 }}>${sitter.price_per_day} <small style={{ fontSize: "0.8rem", fontWeight: 400 }}>/día</small></span>
                            </div>
                        )}
                        {sitter.price_per_visit && (
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                <span style={{ opacity: 0.7 }}>Visita</span>
                                <span style={{ fontSize: "1.4rem", fontWeight: 800 }}>${sitter.price_per_visit} <small style={{ fontSize: "0.8rem", fontWeight: 400 }}>/sesión</small></span>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setShowBooking(true)}
                        className="btn btn-primary"
                        style={{ width: "100%", marginTop: "2rem", padding: "1.2rem", fontSize: "1.1rem", borderRadius: "16px" }}
                    >
                        Solicitar Cuidado ✨
                    </button>

                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center", marginTop: "1rem" }}>
                        Respuesta aprox: <span style={{ color: "#34d399" }}>Menos de 24h</span>
                    </p>
                </div>
            </div>

            {showBooking && <BookingModal sitter={sitter} onClose={() => setShowBooking(false)} />}
        </div>
    );
}

function BookingModal({ sitter, onClose }: { sitter: Sitter, onClose: () => void }) {
    const [petId, setPetId] = useState("");
    const [serviceType, setServiceType] = useState(sitter.service_type === "visiting" ? "visiting" : "hosting");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
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
            await requestSit(sitter.id, {
                pet_id: petId,
                service_type: serviceType,
                start_date: startDate,
                end_date: endDate,
                notes
            });
            toast.success("¡Solicitud enviada correctamente!");
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
                <h2 style={{ marginTop: 0 }}>🐾 Solicitar Cuidado</h2>
                <form onSubmit={handleRequest} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                    <div className={styles["form-group"]}>
                        <label>Mascota a cuidar</label>
                        <select required value={petId} onChange={e => setPetId(e.target.value)} style={{ padding: "0.8rem", borderRadius: "12px", background: "rgba(255,255,255,0.05)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" }}>
                            <option value="">Selecciona una...</option>
                            {pets.map((pet: Pet) => (
                                <option key={pet.id} value={pet.id}>{pet.name} ({pet.species})</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles["form-group"]}>
                        <label>Tipo de servicio</label>
                        <select required value={serviceType} onChange={e => setServiceType(e.target.value)} style={{ padding: "0.8rem", borderRadius: "12px", background: "rgba(255,255,255,0.05)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" }}>
                            {(sitter.service_type === "hosting" || sitter.service_type === "both") && <option value="hosting">Hospedaje (en casa del cuidador)</option>}
                            {(sitter.service_type === "visiting" || sitter.service_type === "both") && <option value="visiting">Visita (en mi domicilio)</option>}
                        </select>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div className={styles["form-group"]}>
                            <label>Fecha Inicio</label>
                            <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} />
                        </div>
                        <div className={styles["form-group"]}>
                            <label>Fecha Fin</label>
                            <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} />
                        </div>
                    </div>

                    <div className={styles["form-group"]}>
                        <label>Notas adicionales</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Instrucciones especiales, dieta, etc." />
                    </div>

                    <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                        <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>Cancelar</button>
                        <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 2 }}>{loading ? "Enviando..." : "Confirmar Solicitud"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
