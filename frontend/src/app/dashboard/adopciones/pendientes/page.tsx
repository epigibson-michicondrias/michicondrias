"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserRole } from "@/lib/auth";
import {
    getPendingListings,
    approveListing,
    rejectListing,
    Listing,
} from "@/lib/services/adopciones";
import { toast } from "react-hot-toast";
import ConfirmModal from "@/components/ui/ConfirmModal";
import dashStyles from "../../dashboard.module.css";
import styles from "../../modules.module.css";

export default function PendientesPage() {
    const router = useRouter();
    const role = getUserRole();
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        isDanger: boolean;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: "",
        message: "",
        isDanger: false,
        onConfirm: () => { },
    });

    const closeModal = () => setModalState(prev => ({ ...prev, isOpen: false }));

    useEffect(() => {
        if (role !== "admin") {
            router.push("/dashboard/adopciones");
            return;
        }
        loadPending();
    }, [role, router]);

    async function loadPending() {
        try {
            const data = await getPendingListings();
            setListings(data);
        } catch {
            console.error("Error loading pending");
        } finally {
            setLoading(false);
        }
    }

    async function handleApprove(id: string) {
        setActionLoading(id);
        try {
            await approveListing(id);
            setListings((prev) => prev.filter((l) => l.id !== id));
            toast.success("Publicación aprobada exitosamente");
        } catch {
            toast.error("Error al aprobar publicación");
        } finally {
            setActionLoading(null);
        }
    }

    async function executeReject(id: string) {
        setActionLoading(id);
        try {
            await rejectListing(id);
            setListings((prev) => prev.filter((l) => l.id !== id));
            toast.success("Publicación rechazada y eliminada");
        } catch {
            toast.error("Error al rechazar publicación");
        } finally {
            setActionLoading(null);
            closeModal();
        }
    }

    function handleReject(id: string) {
        setModalState({
            isOpen: true,
            title: "Rechazar Publicación",
            message: "¿Estás seguro de rechazar y eliminar esta publicación permanentemente?",
            isDanger: true,
            onConfirm: () => executeReject(id)
        });
    }

    if (role !== "admin") return null;

    return (
        <>
            <ConfirmModal
                isOpen={modalState.isOpen}
                title={modalState.title}
                message={modalState.message}
                isDanger={modalState.isDanger}
                onConfirm={modalState.onConfirm}
                onCancel={closeModal}
            />
            <div className={dashStyles["page-header"]}>
                <h1 className={dashStyles["page-title"]}>📋 Pendientes de Aprobación</h1>
                <p className={dashStyles["page-subtitle"]}>
                    Publicaciones esperando tu revisión
                </p>
            </div>

            {loading ? (
                <p style={{ color: "var(--text-secondary)", padding: "2rem" }}>Cargando...</p>
            ) : listings.length === 0 ? (
                <div className={styles["empty-state"]}>
                    <span className={styles["empty-state__icon"]}>✅</span>
                    <p className={styles["empty-state__text"]}>
                        No hay publicaciones pendientes. ¡Todo al día!
                    </p>
                </div>
            ) : (
                <div className={styles["module-page__list"]}>
                    {listings.map((listing) => (
                        <div key={listing.id} className={styles["item-card"]}>
                            <div className={styles["item-card__header"]}>
                                <span className={styles["item-card__icon"]}>
                                    {listing.species === "perro" ? "🐕" : listing.species === "gato" ? "🐈" : "🐾"}
                                </span>
                                <span className={styles["item-card__title"]}>{listing.name}</span>
                            </div>
                            <div className={styles["item-card__body"]}>
                                <p><strong>Especie:</strong> {listing.species}</p>
                                {listing.breed && <p><strong>Raza:</strong> {listing.breed}</p>}
                                {listing.age_months && <p><strong>Edad:</strong> {listing.age_months} meses</p>}
                                {listing.size && <p><strong>Tamaño:</strong> {listing.size}</p>}
                                {listing.description && (
                                    <p style={{ marginTop: "0.5rem", fontStyle: "italic" }}>{listing.description}</p>
                                )}
                            </div>
                            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                                <button
                                    className="btn btn-primary"
                                    style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}
                                    onClick={() => handleApprove(listing.id)}
                                    disabled={actionLoading === listing.id}
                                >
                                    {actionLoading === listing.id ? "..." : "✅ Aprobar"}
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    style={{ fontSize: "0.85rem", padding: "0.5rem 1rem", color: "var(--error)" }}
                                    onClick={() => handleReject(listing.id)}
                                    disabled={actionLoading === listing.id}
                                >
                                    ❌ Rechazar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
