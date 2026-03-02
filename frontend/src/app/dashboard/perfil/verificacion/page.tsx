"use client";

import { useState, useEffect } from "react";
import { getCurrentUser, uploadKYC, User } from "@/lib/auth";
import { toast } from "react-hot-toast";
import dashStyles from "../../dashboard.module.css";
import styles from "./verificacion.module.css";

export default function VerificacionPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const [files, setFiles] = useState<{
        id_front: File | null;
        id_back: File | null;
        proof: File | null;
    }>({
        id_front: null,
        id_back: null,
        proof: null,
    });

    useEffect(() => {
        loadUser();
    }, []);

    async function loadUser() {
        try {
            const u = await getCurrentUser();
            setUser(u);
        } catch (err) {
            console.error("Error loading user", err);
        } finally {
            setLoading(false);
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: keyof typeof files) => {
        if (e.target.files && e.target.files[0]) {
            setFiles((prev) => ({ ...prev, [type]: e.target.files![0] }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!files.id_front || !files.id_back || !files.proof) {
            toast.error("Por favor, sube los 3 documentos requeridos.");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append("id_front", files.id_front);
        formData.append("id_back", files.id_back);
        formData.append("proof_of_address", files.proof);

        try {
            const updatedUser = await uploadKYC(formData);
            setUser(updatedUser);
            toast.success("Documentos enviados con éxito. Un administrador los revisará pronto.", { duration: 5000 });
        } catch (err: any) {
            toast.error(err.message || "Error al subir los documentos");
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <p className={dashStyles["loading-text"]}>Cargando perfil de seguridad...</p>;
    if (!user) return <p>Error al cargar el usuario. Por favor, inicia sesión de nuevo.</p>;

    const getStatusIcon = () => {
        switch (user.verification_status) {
            case "VERIFIED": return "✅";
            case "PENDING": return "⏳";
            case "REJECTED": return "❌";
            default: return "🛡️";
        }
    };

    const getStatusTitle = () => {
        switch (user.verification_status) {
            case "VERIFIED": return "Cuenta Verificada";
            case "PENDING": return "Verificación en Proceso";
            case "REJECTED": return "Verificación Rechazada";
            default: return "Cuenta No Verificada";
        }
    };

    const getStatusDesc = () => {
        switch (user.verification_status) {
            case "VERIFIED": return "¡Felicidades! Tienes acceso total al proceso de adopción formal.";
            case "PENDING": return "Estamos revisando tus documentos. Te notificaremos pronto.";
            case "REJECTED": return "Hubo un problema con tus documentos. Por favor, intenta de nuevo.";
            default: return "Para garantizar la seguridad de nuestros animalitos, necesitamos verificar tu identidad.";
        }
    };

    return (
        <div className={styles["verification-container"]}>
            <div className={dashStyles["page-header"]}>
                <h1 className={dashStyles["page-title"]}>🛡️ Centro de Seguridad KYC</h1>
                <p className={dashStyles["page-subtitle"]}>Verifica tu identidad para iniciar un proceso de adopción seguro</p>
            </div>

            <div className={styles["status-card"]}>
                <div className={styles["status-icon"]}>{getStatusIcon()}</div>
                <div className={styles["status-info"]}>
                    <h2>{getStatusTitle()}</h2>
                    <p>{getStatusDesc()}</p>
                </div>
            </div>

            {(user.verification_status === "UNVERIFIED" || user.verification_status === "REJECTED") && (
                <form className={styles["kyc-form"]} onSubmit={handleSubmit}>
                    <div className={styles["upload-card"]}>
                        <i>🪪</i>
                        <h3>Identificación (Frente)</h3>
                        <p>Sube una foto clara de tu INE o Pasaporte (Anverso)</p>
                        <input type="file" className={styles["file-input"]} accept="image/*" onChange={(e) => handleFileChange(e, "id_front")} required />
                        {files.id_front && <span className={styles["file-preview"]}>✓ {files.id_front.name}</span>}
                    </div>

                    <div className={styles["upload-card"]}>
                        <i>🪪</i>
                        <h3>Identificación (Reverso)</h3>
                        <p>Sube una foto clara de tu INE o Pasaporte (Reverso)</p>
                        <input type="file" className={styles["file-input"]} accept="image/*" onChange={(e) => handleFileChange(e, "id_back")} required />
                        {files.id_back && <span className={styles["file-preview"]}>✓ {files.id_back.name}</span>}
                    </div>

                    <div className={`${styles["upload-card"]} ${styles["full-width"]}`}>
                        <i>🏠</i>
                        <h3>Comprobante de Domicilio</h3>
                        <p>Recibo de luz, agua o teléfono (no mayor a 3 meses)</p>
                        <input type="file" className={styles["file-input"]} accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, "proof")} required />
                        {files.proof && <span className={styles["file-preview"]}>✓ {files.proof.name}</span>}
                    </div>

                    <button type="submit" className={styles["submit-btn"]} disabled={uploading}>
                        {uploading ? "SUBIENDO DOCUMENTOS..." : "🚀 ENVIAR PARA VERIFICACIÓN"}
                    </button>
                </form>
            )}

            {user.verification_status === "PENDING" && (
                <div className={dashStyles["empty-state"]}>
                    <span style={{ fontSize: "4rem" }}>📅</span>
                    <p>Tu solicitud fue recibida el {new Date().toLocaleDateString()}. Nuestro equipo administrativo responderá en un plazo máximo de 48 horas.</p>
                </div>
            )}
        </div>
    );
}
