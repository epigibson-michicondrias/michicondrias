"use client";

import { useState, useEffect } from "react";
import { apiFetch, API_URLS } from "@/lib/api";
import { User } from "@/lib/auth";
import { toast } from "react-hot-toast";
import ConfirmModal from "@/components/ui/ConfirmModal";
import dashStyles from "../../dashboard.module.css";
import styles from "./verificaciones.module.css";

export default function AdminVerificacionesPage() {
    const [pendingUsers, setPendingUsers] = useState<User[]>([]);
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

    const CORE_BASE_URL = API_URLS.core.replace("/api/v1", "");

    useEffect(() => {
        loadPending();
    }, []);

    const loadPending = async () => {
        try {
            const users = await apiFetch<User[]>("core", "/users/pending-verifications");
            setPendingUsers(users);
        } catch (err) {
            console.error("Error loading pending verifications", err);
        } finally {
            setLoading(false);
        }
    };

    const executeVerify = async (userId: string, status: "VERIFIED" | "REJECTED") => {
        setActionLoading(userId);
        try {
            await apiFetch("core", `/users/${userId}/verify?status=${status}`, {
                method: "POST",
            });
            setPendingUsers(prev => prev.filter(u => u.id !== userId));
            if (status === "VERIFIED") {
                toast.success("Identidad del usuario aprobada con éxito", { icon: "✅" });
            } else {
                toast.success("Verificación de usuario rechazada", { icon: "⚠️" });
            }
        } catch (err: any) {
            toast.error(err.message || "Error al procesar la verificación");
        } finally {
            setActionLoading(null);
            closeModal();
        }
    };

    const handleVerify = (userId: string, status: "VERIFIED" | "REJECTED") => {
        setModalState({
            isOpen: true,
            title: status === "VERIFIED" ? "Aprobar Identidad" : "Rechazar Identidad",
            message: status === "VERIFIED"
                ? "¿Estás seguro de APROBAR esta identidad? El usuario obtendrá acceso completo."
                : "¿Estás seguro de RECHAZAR los documentos de este usuario?",
            isDanger: status === "REJECTED",
            onConfirm: () => executeVerify(userId, status)
        });
    };

    const getImageUrl = (url?: string) => {
        if (!url) return "/placeholder-image.png";
        if (url.startsWith("http")) return url;
        return `${CORE_BASE_URL}${url}`;
    };

    const isPdf = (url?: string) => {
        if (!url) return false;
        // Check path before query params
        const path = url.split("?")[0].toLowerCase();
        return path.endsWith(".pdf");
    };

    const DocPreview = ({ url, label }: { url?: string; label: string }) => {
        const fullUrl = getImageUrl(url);
        const pdf = isPdf(fullUrl);

        return (
            <div className={styles["doc-item"]}>
                <span className={styles["doc-label"]}>{label}</span>
                <div className={styles["doc-preview"]}>
                    {pdf ? (
                        <div className={styles["pdf-preview"]}>
                            <span className={styles["pdf-icon"]}>📄</span>
                            <span className={styles["pdf-text"]}>Documento PDF</span>
                        </div>
                    ) : (
                        <img src={fullUrl} alt={label} onError={(e) => (e.currentTarget.src = "/placeholder-image.png")} />
                    )}
                </div>
                <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ fontSize: "0.8rem", padding: "0.5rem" }}>
                    Ver tamaño completo {pdf ? "(PDF)" : ""}
                </a>
            </div>
        );
    };

    if (loading) return <p className={dashStyles["loading-text"]}>Cargando solicitudes de identidad...</p>;

    return (
        <div className={styles["admin-container"]}>
            <ConfirmModal
                isOpen={modalState.isOpen}
                title={modalState.title}
                message={modalState.message}
                isDanger={modalState.isDanger}
                onConfirm={modalState.onConfirm}
                onCancel={closeModal}
            />
            <div className={dashStyles["page-header"]}>
                <h1 className={dashStyles["page-title"]}>🕵️ Panel de Revisión KYC</h1>
                <p className={dashStyles["page-subtitle"]}>Valida la identidad de los adoptantes para garantizar la seguridad de Michicondrias</p>
            </div>

            {pendingUsers.length === 0 ? (
                <div className={dashStyles["empty-state"]}>
                    <span style={{ fontSize: "4rem" }}>☕</span>
                    <p>No hay verificaciones pendientes por ahora. ¡Buen trabajo!</p>
                </div>
            ) : (
                <div className={styles["verification-list"]}>
                    {pendingUsers.map(user => (
                        <div key={user.id} className={styles["verification-card"]}>
                            <div className={styles["card-header"]}>
                                <div className={styles["user-info"]}>
                                    <h3>{user.full_name}</h3>
                                    <p>{user.email} • ID: {user.id.substring(0, 8)}</p>
                                </div>
                                <div className={dashStyles["status-badge"]} style={{ background: "rgba(255, 193, 7, 0.1)", color: "#ffc107" }}>
                                    PENDIENTE
                                </div>
                            </div>

                            <div className={styles["docs-grid"]}>
                                <DocPreview url={user.id_front_url} label="Identificación Anverso" />
                                <DocPreview url={user.id_back_url} label="Identificación Reverso" />
                                <DocPreview url={user.proof_of_address_url} label="Comprobante de Domicilio" />
                            </div>

                            <div className={styles["actions"]}>
                                <button
                                    className={styles["reject-btn"]}
                                    onClick={() => handleVerify(user.id, "REJECTED")}
                                    disabled={actionLoading === user.id}
                                >
                                    {actionLoading === user.id ? "PROCESANDO..." : "⚠️ RECHAZAR"}
                                </button>
                                <button
                                    className={styles["approve-btn"]}
                                    onClick={() => handleVerify(user.id, "VERIFIED")}
                                    disabled={actionLoading === user.id}
                                >
                                    {actionLoading === user.id ? "PROCESANDO..." : "✅ APROBAR IDENTIDAD"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
