"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
    getListing, Listing,
    getListingRequests, AdoptionRequest,
    updateRequestStatus, approveAdoption,
} from "@/lib/services/adopciones";
import { toast } from "react-hot-toast";
import ConfirmModal from "@/components/ui/ConfirmModal";
import dashStyles from "../../dashboard.module.css";
import styles from "./solicitudes.module.css";

const STATUS_LABELS: Record<string, { label: string; color: string; icon: string }> = {
    PENDING: { label: "Pendiente", color: "#f59e0b", icon: "⏳" },
    REVIEWING: { label: "En Revisión", color: "#3b82f6", icon: "🔍" },
    INTERVIEW_SCHEDULED: { label: "Entrevista Programada", color: "#8b5cf6", icon: "📅" },
    APPROVED: { label: "Pre-Aprobada", color: "#22c55e", icon: "✅" },
    ADOPTED: { label: "¡Adoptado!", color: "#ec4899", icon: "🎉" },
    REJECTED: { label: "Rechazada", color: "#ef4444", icon: "❌" },
};

function SolicitudesContent() {
    const searchParams = useSearchParams();
    const listingId = searchParams.get("id");

    const [listing, setListing] = useState<Listing | null>(null);
    const [requests, setRequests] = useState<AdoptionRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const [modalState, setModalState] = useState<{
        isOpen: boolean; title: string; message: string;
        isDanger: boolean; onConfirm: () => void;
    }>({ isOpen: false, title: "", message: "", isDanger: false, onConfirm: () => { } });

    const closeModal = () => setModalState(prev => ({ ...prev, isOpen: false }));

    useEffect(() => {
        if (!listingId) return;
        async function load() {
            try {
                const [l, r] = await Promise.all([
                    getListing(listingId!),
                    getListingRequests(listingId!),
                ]);
                setListing(l);
                setRequests(r);
            } catch (err) {
                console.error(err);
                toast.error("Error cargando solicitudes");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [listingId]);

    const handleStatusChange = async (requestId: string, status: string) => {
        setActionLoading(requestId);
        try {
            const updated = await updateRequestStatus(requestId, status);
            setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: updated.status } : r));
            toast.success(`Estado actualizado a: ${STATUS_LABELS[status]?.label || status}`);
        } catch (err: any) {
            toast.error(err.message || "Error actualizando estado");
        } finally {
            setActionLoading(null);
        }
    };

    const handleFinalApproval = (requestId: string, applicantName: string) => {
        setModalState({
            isOpen: true,
            title: "🎉 Finalizar Adopción",
            message: `¿Estás seguro de aprobar la adopción de "${listing?.name}" para ${applicantName}? Esto:\n\n• Marcará la mascota como ADOPTADA\n• Creará el registro permanente de mascota\n• Rechazará las demás solicitudes`,
            isDanger: false,
            onConfirm: async () => {
                setActionLoading(requestId);
                closeModal();
                try {
                    await approveAdoption(requestId);
                    // Refresh all requests
                    const updated = await getListingRequests(listingId!);
                    setRequests(updated);
                    // Refresh listing
                    const updatedListing = await getListing(listingId!);
                    setListing(updatedListing);
                    toast.success("🎉 ¡Adopción finalizada! La mascota ha sido vinculada al nuevo dueño.", { duration: 5000 });
                } catch (err: any) {
                    toast.error(err.message || "Error al finalizar adopción");
                } finally {
                    setActionLoading(null);
                }
            },
        });
    };

    if (!listingId) {
        return <p style={{ color: "var(--text-secondary)", padding: "2rem" }}>No se especificó un listing. <a href="/dashboard/adopciones">Volver a adopciones</a></p>;
    }

    return (
        <div className={styles.container}>
            <ConfirmModal isOpen={modalState.isOpen} title={modalState.title} message={modalState.message}
                isDanger={modalState.isDanger} onConfirm={modalState.onConfirm} onCancel={closeModal} />

            <div className={dashStyles["page-header"]}>
                <h1 className={dashStyles["page-title"]}>📋 Solicitudes de Adopción</h1>
                <p className={dashStyles["page-subtitle"]}>
                    Gestiona las solicitudes para este listing
                </p>
            </div>

            {loading ? (
                <p className={dashStyles["loading-text"]}>Cargando solicitudes...</p>
            ) : (
                <>
                    {/* Listing Info Card */}
                    {listing && (
                        <div className={styles["listing-info"]}>
                            <div className={styles["listing-avatar"]}>
                                {listing.species === "perro" ? "🐕" : listing.species === "gato" ? "🐈" : "🐾"}
                            </div>
                            <div>
                                <h2 className={styles["listing-name"]}>{listing.name}</h2>
                                <div className={styles["listing-meta"]}>
                                    <span>{listing.species} {listing.breed && `• ${listing.breed}`} {listing.size && `• ${listing.size}`}</span>
                                    <span className={styles["listing-status"]} style={{
                                        color: listing.status === "ADOPTED" ? "#ec4899" : listing.status === "abierto" ? "#22c55e" : "#f59e0b"
                                    }}>
                                        {listing.status === "ADOPTED" ? "🎉 Adoptada" : listing.status === "abierto" ? "🟢 Abierta" : listing.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Requests */}
                    {requests.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
                            <span style={{ fontSize: "3rem", display: "block", marginBottom: "1rem" }}>📭</span>
                            <p>No hay solicitudes para esta mascota aún.</p>
                        </div>
                    ) : (
                        <div className={styles["requests-list"]}>
                            {requests.map(req => {
                                const statusInfo = STATUS_LABELS[req.status] || { label: req.status, color: "#94a3b8", icon: "❓" };
                                const isAdopted = listing?.status === "ADOPTED";
                                return (
                                    <div key={req.id} className={`${styles["request-card"]} ${req.status === "ADOPTED" ? styles["request-card--adopted"] : ""}`}>
                                        <div className={styles["request-header"]}>
                                            <div>
                                                <h3 className={styles["request-applicant"]}>{req.applicant_name || "Solicitante Anónimo"}</h3>
                                                <span className={styles["request-id"]}>ID: {req.user_id.substring(0, 8)}</span>
                                            </div>
                                            <span className={styles["status-badge"]} style={{ color: statusInfo.color, borderColor: statusInfo.color }}>
                                                {statusInfo.icon} {statusInfo.label}
                                            </span>
                                        </div>

                                        {/* Questionnaire Summary */}
                                        <div className={styles["questionnaire"]}>
                                            <div className={styles["q-grid"]}>
                                                <div className={styles["q-item"]}>
                                                    <span className={styles["q-label"]}>🏠 Vivienda</span>
                                                    <span>{req.house_type} • {req.own_or_rent}</span>
                                                </div>
                                                <div className={styles["q-item"]}>
                                                    <span className={styles["q-label"]}>🌳 Patio</span>
                                                    <span>{req.has_yard ? "Sí" : "No"}</span>
                                                </div>
                                                <div className={styles["q-item"]}>
                                                    <span className={styles["q-label"]}>👶 Niños</span>
                                                    <span>{req.has_children ? `Sí (${req.children_ages || "sin edades"})` : "No"}</span>
                                                </div>
                                                <div className={styles["q-item"]}>
                                                    <span className={styles["q-label"]}>⏰ Horas sola</span>
                                                    <span>{req.hours_alone}h/día</span>
                                                </div>
                                                <div className={styles["q-item"]}>
                                                    <span className={styles["q-label"]}>💰 Compromiso financiero</span>
                                                    <span style={{ color: req.financial_commitment ? "#22c55e" : "#ef4444" }}>
                                                        {req.financial_commitment ? "✅ Sí" : "❌ No"}
                                                    </span>
                                                </div>
                                                {req.other_pets && (
                                                    <div className={styles["q-item"]}>
                                                        <span className={styles["q-label"]}>🐾 Otras mascotas</span>
                                                        <span>{req.other_pets}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className={styles["q-reason"]}>
                                                <span className={styles["q-label"]}>💬 Motivo</span>
                                                <p>{req.reason}</p>
                                            </div>
                                            {req.previous_experience && (
                                                <div className={styles["q-reason"]}>
                                                    <span className={styles["q-label"]}>📋 Experiencia previa</span>
                                                    <p>{req.previous_experience}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        {!isAdopted && req.status !== "REJECTED" && req.status !== "ADOPTED" && (
                                            <div className={styles["request-actions"]}>
                                                {req.status === "PENDING" && (
                                                    <button className={styles["action-btn-review"]}
                                                        disabled={actionLoading === req.id}
                                                        onClick={() => handleStatusChange(req.id, "REVIEWING")}>
                                                        🔍 Revisar
                                                    </button>
                                                )}
                                                {(req.status === "REVIEWING" || req.status === "PENDING") && (
                                                    <button className={styles["action-btn-interview"]}
                                                        disabled={actionLoading === req.id}
                                                        onClick={() => handleStatusChange(req.id, "INTERVIEW_SCHEDULED")}>
                                                        📅 Programar Entrevista
                                                    </button>
                                                )}
                                                {(req.status === "INTERVIEW_SCHEDULED" || req.status === "APPROVED") && (
                                                    <button className={styles["action-btn-adopt"]}
                                                        disabled={actionLoading === req.id}
                                                        onClick={() => handleFinalApproval(req.id, req.applicant_name || "este solicitante")}>
                                                        🎉 Finalizar Adopción
                                                    </button>
                                                )}
                                                <button className={styles["action-btn-reject"]}
                                                    disabled={actionLoading === req.id}
                                                    onClick={() => handleStatusChange(req.id, "REJECTED")}>
                                                    ❌ Rechazar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default function SolicitudesAdminPage() {
    return (
        <Suspense fallback={<p style={{ padding: "2rem" }}>Cargando...</p>}>
            <SolicitudesContent />
        </Suspense>
    );
}
