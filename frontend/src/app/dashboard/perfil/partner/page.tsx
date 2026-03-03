"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import ConfirmModal from "@/components/ui/ConfirmModal";
import dashStyles from "../../dashboard.module.css";
import modStyles from "../../modules.module.css";

export default function PartnerOnboardingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState<string | null>(null);

    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        confirmText?: string;
        isDanger: boolean;
    }>({
        isOpen: false,
        title: "",
        message: "",
        isDanger: false,
    });

    const closeModal = () => setModalState(prev => ({ ...prev, isOpen: false }));

    const roles = [
        { id: "veterinario", icon: "🩺", title: "Clínica o Veterinario", desc: "Ofrece atención médica, registra historiales y atiende emergencias." },
        { id: "vendedor", icon: "🛒", title: "Marca o Vendedor", desc: "Vende alimentos, accesorios o medicinas en nuestra Tienda Global." },
        { id: "paseador", icon: "🦮", title: "Paseador o Pet Sitter", desc: "Ofrece tus servicios de compañía y paseo para dueños ocupados." },
        { id: "refugio", icon: "🏠", title: "Refugio Organizacional", desc: "Administra decenas de adopciones y recibe donaciones corporativas." }
    ];

    async function handleUpgrade() {
        if (!selectedRole) return;
        setLoading(true);
        try {
            await apiFetch("core", `/users/me/upgrade-role?role_name=${selectedRole}`, {
                method: "POST"
            });
            // Force token refresh via a new login/me mechanism or simply reload for the layout role check
            // For now, refresh user state in localstorage safely:
            const user = await getCurrentUser();
            if (user) {
                localStorage.setItem("user_role", selectedRole);
            }

            // Redirect based on selected role
            if (selectedRole === "veterinario" || selectedRole === "refugio") {
                router.push("/dashboard/directorio/nuevo");
            } else if (selectedRole === "vendedor") {
                router.push("/dashboard/tienda");
            } else {
                router.push("/dashboard/perfil");
            }

            setTimeout(() => {
                window.location.reload(); // Hard reload to update Sidebar state
            }, 500);

        } catch (error) {
            console.error("Error upgrading role:", error);
            setModalState({
                isOpen: true,
                title: "Error de Solicitud",
                message: "Ocurrió un error al intentar procesar tu solicitud de Partnership. Por favor intenta de nuevo más tarde.",
                confirmText: "Entendido",
                isDanger: true
            });
            setLoading(false);
        }
    }

    return (
        <div style={{ animation: "fadeIn 0.4s ease-out", maxWidth: "900px", margin: "0 auto" }}>
            <div className={dashStyles["page-header"]} style={{ textAlign: "center", marginBottom: "3rem" }}>
                <span style={{ fontSize: "3rem", display: "inline-block", marginBottom: "1rem" }}>🚀</span>
                <h1 className={dashStyles["page-title"]} style={{ fontSize: "2.5rem" }}>
                    Únete a <span className="gradient-text">Michicondrias Partners</span>
                </h1>
                <p className={dashStyles["page-subtitle"]} style={{ fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto" }}>
                    Crece tu negocio y conecta con miles de dueños de mascotas responsables en todo México. Selecciona cómo deseas participar en el ecosistema.
                </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
                {roles.map(r => (
                    <div
                        key={r.id}
                        onClick={() => setSelectedRole(r.id)}
                        style={{
                            background: selectedRole === r.id ? "rgba(124, 58, 237, 0.15)" : "var(--bg-glass)",
                            border: `2px solid ${selectedRole === r.id ? "var(--primary)" : "var(--border-color)"}`,
                            borderRadius: "var(--radius-lg)",
                            padding: "2rem",
                            cursor: "pointer",
                            transition: "all 0.2s ease-out",
                            transform: selectedRole === r.id ? "translateY(-5px)" : "none",
                            boxShadow: selectedRole === r.id ? "0 10px 25px rgba(124, 58, 237, 0.2)" : "none"
                        }}
                    >
                        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>{r.icon}</div>
                        <h3 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "0.5rem", color: "#fff" }}>{r.title}</h3>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6 }}>{r.desc}</p>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: "3rem", textAlign: "center", padding: "2rem", background: "rgba(255,255,255,0.02)", borderRadius: "var(--radius-lg)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <h4 style={{ marginBottom: "1rem", color: "#fff" }}>Validación y Compromiso</h4>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", maxWidth: "700px", margin: "0 auto 2rem auto", lineHeight: 1.6 }}>
                    Al convertir tu cuenta en Partner se te requerirá información comercial adicional (Cédulas profesionales, actas constitutivas o RFC dependiendo del giro) para garantizar un servicio legítimo en Michicondrias.
                </p>
                <button
                    onClick={handleUpgrade}
                    className="btn btn-primary"
                    disabled={!selectedRole || loading}
                    style={{
                        padding: "1rem 3rem",
                        fontSize: "1.1rem",
                        background: selectedRole ? "var(--primary-gradient)" : "var(--bg-card)",
                        border: selectedRole ? "none" : "1px solid var(--border-color)",
                        color: selectedRole ? "#fff" : "var(--text-secondary)",
                        cursor: selectedRole ? "pointer" : "not-allowed",
                        opacity: loading ? 0.7 : 1
                    }}
                >
                    {loading ? "Configurando tu entorno..." : (selectedRole ? "Confirmar y Continuar 👉" : "Selecciona un Rol")}
                </button>
            </div>

            <ConfirmModal
                isOpen={modalState.isOpen}
                title={modalState.title}
                message={modalState.message}
                confirmText={modalState.confirmText}
                isDanger={modalState.isDanger}
                onConfirm={closeModal}
                onCancel={closeModal}
            />
        </div>
    );
}
