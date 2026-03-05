"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getIncomingSitRequests, getMySitRequests, updateSitRequestStatus, createSitReview } from "@/lib/services/cuidadores";
import { useState } from "react";
import dashStyles from "../../dashboard.module.css";
import styles from "../../modules.module.css";
import { toast } from "react-hot-toast";

export default function SitRequestsPage() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<"incoming" | "outgoing">("incoming");

    const { data: incoming = [], isLoading: loadingIncoming } = useQuery({
        queryKey: ["sit-requests-incoming"],
        queryFn: getIncomingSitRequests,
    });

    const { data: outgoing = [], isLoading: loadingOutgoing } = useQuery({
        queryKey: ["sit-requests-outgoing"],
        queryFn: getMySitRequests,
    });

    const isLoading = loadingIncoming || loadingOutgoing;

    return (
        <div className={dashStyles.container}>
            <div className={dashStyles["page-header"]}>
                <h1 className={dashStyles["page-title"]}>📋 Gestión de Cuidados</h1>
                <p className={dashStyles["page-subtitle"]}>Administra tus servicios prestados y solicitados</p>
            </div>

            <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
                <button
                    onClick={() => setActiveTab("incoming")}
                    style={{
                        padding: "1rem 2rem", borderRadius: "16px", border: "none",
                        background: activeTab === "incoming" ? "rgba(6,182,212,0.2)" : "rgba(255,255,255,0.03)",
                        color: activeTab === "incoming" ? "#06b6d4" : "var(--text-muted)",
                        fontWeight: 700, cursor: "pointer", flex: 1
                    }}
                >
                    📥 Solicitudes Recibidas ({incoming.length})
                </button>
                <button
                    onClick={() => setActiveTab("outgoing")}
                    style={{
                        padding: "1rem 2rem", borderRadius: "16px", border: "none",
                        background: activeTab === "outgoing" ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.03)",
                        color: activeTab === "outgoing" ? "#a78bfa" : "var(--text-muted)",
                        fontWeight: 700, cursor: "pointer", flex: 1
                    }}
                >
                    📤 Mis Solicitudes ({outgoing.length})
                </button>
            </div>

            {isLoading ? (
                <div className={dashStyles["loading-container"]}><p>Cargando solicitudes...</p></div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    {(activeTab === "incoming" ? incoming : outgoing).length === 0 ? (
                        <div className={dashStyles["empty-state"]} style={{ padding: "4rem" }}>
                            <h3>No hay solicitudes aún</h3>
                            <p style={{ opacity: 0.5 }}>Las nuevas solicitudes aparecerán aquí.</p>
                        </div>
                    ) : (
                        (activeTab === "incoming" ? incoming : outgoing).map(req => (
                            <RequestCard
                                key={req.id}
                                request={req}
                                isIncoming={activeTab === "incoming"}
                                refresh={() => {
                                    queryClient.invalidateQueries({ queryKey: ["sit-requests-incoming"] });
                                    queryClient.invalidateQueries({ queryKey: ["sit-requests-outgoing"] });
                                }}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

function RequestCard({ request, isIncoming, refresh }: { request: any, isIncoming: boolean, refresh: () => void }) {
    const [loading, setLoading] = useState(false);
    const [showReview, setShowReview] = useState(false);

    async function handleStatus(newStatus: string) {
        setLoading(true);
        try {
            await updateSitRequestStatus(request.id, newStatus);
            toast.success(`Solicitud ${newStatus}`);
            refresh();
        } catch (err: any) {
            toast.error(err.message || "Error al actualizar");
        } finally {
            setLoading(false);
        }
    }

    const statusColors: Record<string, string> = {
        pending: "#fbbf24",
        accepted: "#06b6d4",
        in_progress: "#8b5cf6",
        completed: "#10b981",
        cancelled: "#ef4444"
    };

    return (
        <div style={{
            background: "rgba(255,255,255,0.03)", borderRadius: "20px",
            padding: "1.5rem", border: "1px solid rgba(255,255,255,0.06)",
            display: "grid", gridTemplateColumns: "1fr auto", gap: "1rem", alignItems: "center"
        }}>
            <div>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "0.5rem" }}>
                    <span style={{
                        padding: "4px 12px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 800,
                        background: `${statusColors[request.status]}20`, color: statusColors[request.status],
                        textTransform: "uppercase"
                    }}>
                        {request.status === "pending" ? "Pendiente" : request.status}
                    </span>
                    <span style={{ fontSize: "0.85rem", opacity: 0.5 }}>ID: {request.id.slice(0, 8)}</span>
                </div>
                <h3 style={{ margin: "0.25rem 0", fontSize: "1.2rem" }}>
                    {request.service_type === "hosting" ? "🏠 Hospedaje" : "🏃 Visita"}
                </h3>
                <p style={{ margin: "0.25rem 0", fontSize: "0.95rem" }}>
                    📅 {request.start_date} al {request.end_date}
                </p>
                {request.notes && (
                    <p style={{ fontSize: "0.85rem", opacity: 0.6, fontStyle: "italic", marginTop: "0.5rem" }}>
                        " {request.notes} "
                    </p>
                )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", minWidth: "150px" }}>
                {isIncoming && request.status === "pending" && (
                    <>
                        <button disabled={loading} onClick={() => handleStatus("accepted")} className="btn btn-primary" style={{ padding: "0.6rem" }}>Aceptar ✅</button>
                        <button disabled={loading} onClick={() => handleStatus("cancelled")} className="btn btn-secondary" style={{ padding: "0.6rem" }}>Rechazar ❌</button>
                    </>
                )}
                {isIncoming && request.status === "accepted" && (
                    <button disabled={loading} onClick={() => handleStatus("in_progress")} className="btn btn-primary" style={{ padding: "0.6rem" }}>Iniciar Servicio ▶️</button>
                )}
                {isIncoming && request.status === "in_progress" && (
                    <button disabled={loading} onClick={() => handleStatus("completed")} className="btn btn-primary" style={{ padding: "0.6rem", background: "#10b981" }}>Completar 🏁</button>
                )}
                {!isIncoming && request.status === "completed" && !request.reviewed && (
                    <button onClick={() => setShowReview(true)} className="btn btn-primary" style={{ padding: "0.6rem", background: "#fbbf24", color: "#000" }}>⭐ Calificar</button>
                )}
                {request.status === "pending" && (
                    <button disabled={loading} onClick={() => handleStatus("cancelled")} className="btn btn-secondary" style={{ padding: "0.6rem", opacity: 0.5 }}>Cancelar</button>
                )}
            </div>

            {showReview && <ReviewModal request={request} onClose={() => { setShowReview(false); refresh(); }} />}
        </div>
    );
}

function ReviewModal({ request, onClose }: { request: any, onClose: () => void }) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            await createSitReview(request.id, { rating, comment });
            toast.success("¡Gracias por tu reseña!");
            onClose();
        } catch (err: any) {
            toast.error(err.message || "Error al enviar reseña");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: "1rem" }}>
            <div style={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "24px", width: "100%", maxWidth: "400px", padding: "2rem" }}>
                <h2 style={{ marginTop: 0 }}>⭐ Calificar Servicio</h2>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                    <div className={styles["form-group"]}>
                        <label>Rating (1-5)</label>
                        <div style={{ display: "flex", gap: "0.5rem", fontSize: "1.5rem" }}>
                            {[1, 2, 3, 4, 5].map(num => (
                                <span
                                    key={num}
                                    onClick={() => setRating(num)}
                                    style={{ cursor: "pointer", filter: num <= rating ? "none" : "grayscale(1) opacity(0.3)" }}
                                >⭐</span>
                            ))}
                        </div>
                    </div>
                    <div className={styles["form-group"]}>
                        <label>Comentario</label>
                        <textarea required value={comment} onChange={e => setComment(e.target.value)} placeholder="¿Qué tal estuvo el cuidado?" />
                    </div>
                    <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                        <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>Cancelar</button>
                        <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 2 }}>{loading ? "Enviando..." : "Publicar"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
