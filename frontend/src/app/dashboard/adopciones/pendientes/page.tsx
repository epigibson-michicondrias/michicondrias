"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserRole } from "@/lib/auth";
import Image from "next/image";
import {
    getPendingListings,
    approveListing,
    rejectListing,
    Listing,
} from "@/lib/services/adopciones";
import { toast } from "react-hot-toast";
import ConfirmModal from "@/components/ui/ConfirmModal";
import dashStyles from "../../dashboard.module.css";
import styles from "./pendientes.module.css";

export default function PendientesPage() {
    const router = useRouter();
    const role = getUserRole();
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

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
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && role !== "admin") {
            router.push("/dashboard/adopciones");
        }
    }, [role, router, mounted]);

    useEffect(() => {
        if (mounted && role === "admin") {
            loadPending();
        }
    }, [mounted, role]);

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
            toast.success("Publicación aprobada exitosamente. ¡Michi liberado! 🐾");
        } catch {
            toast.error("Error al aprobar publicación. Intenta de nuevo.");
        } finally {
            setActionLoading(null);
        }
    }

    async function executeReject(id: string) {
        setActionLoading(id);
        try {
            await rejectListing(id);
            setListings((prev) => prev.filter((l) => l.id !== id));
            toast.success("Publicación rechazada y eliminada correctamente.");
        } catch {
            toast.error("Error al rechazar publicación.");
        } finally {
            setActionLoading(null);
            closeModal();
        }
    }

    function handleReject(id: string, name: string) {
        setModalState({
            isOpen: true,
            title: "Rechazar Publicación",
            message: `¿Estás seguro de rechazar y eliminar permanentemente la publicación de ${name}?`,
            isDanger: true,
            onConfirm: () => executeReject(id)
        });
    }

    if (!mounted) return null;
    if (role !== "admin") return null;

    return (
        <div className={styles.container}>
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
                    Verifica que las publicaciones cumplan con los estándares de Michicondrias
                </p>
            </div>

            {loading ? (
                <div className={dashStyles["loading-container"]}>
                    <p style={{ color: "var(--text-secondary)", padding: "2rem" }}>Cargando michis pendientes...</p>
                </div>
            ) : listings.length === 0 ? (
                <div className={styles.emptyState}>
                    <span className={styles.emptyIcon}>🎉</span>
                    <h3 className={styles.emptyTitle}>¡Todo está al día!</h3>
                    <p className={styles.emptyText}>
                        No hay publicaciones pendientes de revisión. ¡Buen trabajo, Admin!
                    </p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {listings.map((listing) => (
                        <div key={listing.id} className={styles.card}>
                            <div className={styles.cardImageWrapper}>
                                {listing.photo_url ? (
                                    <Image
                                        src={listing.photo_url}
                                        alt={listing.name}
                                        fill
                                        style={{ objectFit: "cover" }}
                                    />
                                ) : (
                                    <div className={styles.noImage}>📷</div>
                                )}
                            </div>

                            <div className={styles.cardContent}>
                                <div className={styles.header}>
                                    <div className={styles.petIcon}>
                                        {listing.species === "perro" ? "🐕" : listing.species === "gato" ? "🐈" : "🐾"}
                                    </div>
                                    <h3 className={styles.petName}>{listing.name}</h3>
                                </div>

                                <div className={styles.traits}>
                                    <span className={styles.traitBadge}>{listing.species}</span>
                                    {listing.breed && <span className={styles.traitBadge}>{listing.breed}</span>}
                                    {listing.age_months && <span className={styles.traitBadge}>{listing.age_months} meses</span>}
                                    {listing.size && <span className={styles.traitBadge}>{listing.size}</span>}
                                </div>

                                <div className={styles.petDesc}>
                                    {listing.description || "Sin descripción proporcionada por el usuario."}
                                </div>

                                <div className={styles.actions}>
                                    <button
                                        className={`${styles.btnReject} ${actionLoading === listing.id ? styles.btnLoading : ""}`}
                                        onClick={() => handleReject(listing.id, listing.name)}
                                        disabled={actionLoading === listing.id}
                                    >
                                        ❌ Rechazar
                                    </button>
                                    <button
                                        className={`${styles.btnApprove} ${actionLoading === listing.id ? styles.btnLoading : ""}`}
                                        onClick={() => handleApprove(listing.id)}
                                        disabled={actionLoading === listing.id}
                                    >
                                        {actionLoading === listing.id ? "..." : "✅ Aprobar"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
