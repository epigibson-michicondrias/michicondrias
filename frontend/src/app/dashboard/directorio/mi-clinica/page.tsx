"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getMyClinics, updateClinic, Clinic, ClinicCreate, getVets, Vet, deleteClinic } from "@/lib/services/directorio";
import { hasRole } from "@/lib/auth";
import dashStyles from "../../dashboard.module.css";
import styles from "../directorio.module.css";
import { toast } from "react-hot-toast";

export default function MiClinicaPage() {
    const router = useRouter();
    const [clinics, setClinics] = useState<Clinic[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<Partial<ClinicCreate>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!hasRole("veterinario") && !hasRole("admin")) {
            router.push("/dashboard/directorio");
            return;
        }
        loadMyClinics();
    }, []);

    async function loadMyClinics() {
        try {
            const data = await getMyClinics();
            setClinics(data);
        } catch (err) {
            toast.error("Error cargando tus clínicas");
        } finally {
            setLoading(false);
        }
    }

    function handleEdit(clinic: Clinic) {
        setEditingId(clinic.id);
        setForm({
            name: clinic.name,
            address: clinic.address,
            city: clinic.city,
            state: clinic.state,
            phone: clinic.phone,
            email: clinic.email,
            website: clinic.website,
            description: clinic.description,
            logo_url: clinic.logo_url,
            is_24_hours: clinic.is_24_hours,
            has_emergency: clinic.has_emergency,
        });
    }

    async function handleSave(clinicId: string) {
        setSaving(true);
        try {
            const updated = await updateClinic(clinicId, form);
            setClinics(prev => prev.map(c => c.id === clinicId ? updated : c));
            setEditingId(null);
            toast.success("✨ Clínica actualizada correctamente");
        } catch (err: any) {
            toast.error(err.message || "Error al guardar cambios");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(clinicId: string) {
        if (!confirm("¿Estás seguro de eliminar esta clínica? Esta acción no se puede deshacer.")) return;
        try {
            await deleteClinic(clinicId);
            setClinics(prev => prev.filter(c => c.id !== clinicId));
            toast.success("Clínica eliminada");
        } catch (err: any) {
            toast.error(err.message || "Error al eliminar");
        }
    }

    return (
        <div style={{ animation: "slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }}>
            <div className={dashStyles["page-header"]}>
                <h1 className={dashStyles["page-title"]}>
                    <button
                        onClick={() => router.push("/dashboard/directorio")}
                        className={dashStyles["back-button-premium"]}
                        style={{ marginRight: "1rem" }}
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </button>
                    🏥 Mi Clínica
                </h1>
                <p className={dashStyles["page-subtitle"]}>
                    Administra la información de tu(s) clínica(s) registrada(s) en la red Michicondrias
                </p>
            </div>

            {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
                    <div className={dashStyles["loading-spinner-premium"]} />
                </div>
            ) : clinics.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem 2rem", background: "rgba(255,255,255,0.02)", borderRadius: "24px", border: "1px dashed rgba(255,255,255,0.1)" }}>
                    <div style={{ fontSize: "4rem", marginBottom: "1rem", opacity: 0.5 }}>🏗️</div>
                    <h3 style={{ color: "#fff", marginBottom: "0.5rem" }}>Aún no tienes clínicas registradas</h3>
                    <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>Registra tu primera clínica para aparecer en el directorio médico</p>
                    <Link href="/dashboard/directorio/nuevo" className="btn btn-primary" style={{ padding: "1rem 2.5rem", borderRadius: "16px" }}>
                        + Registrar Mi Primera Clínica
                    </Link>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                    {clinics.map(clinic => (
                        <div key={clinic.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "24px", padding: "2rem", position: "relative" }}>
                            {/* Status Badge */}
                            <div style={{ position: "absolute", top: "1.5rem", right: "1.5rem" }}>
                                <span style={{
                                    padding: "0.4rem 1rem", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 700,
                                    background: clinic.is_approved ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                                    color: clinic.is_approved ? "#10b981" : "#f59e0b",
                                    border: `1px solid ${clinic.is_approved ? "rgba(16, 185, 129, 0.3)" : "rgba(245, 158, 11, 0.3)"}`,
                                }}>
                                    {clinic.is_approved ? "✅ Aprobada" : "⏳ En Revisión"}
                                </span>
                            </div>

                            {editingId === clinic.id ? (
                                /* EDIT MODE */
                                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                                    <h3 style={{ color: "#a78bfa", margin: 0 }}>✏️ Editando: {clinic.name}</h3>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                        <div>
                                            <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Nombre</label>
                                            <input className="form-input" value={form.name || ""} onChange={e => setForm({ ...form, name: e.target.value })} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Teléfono</label>
                                            <input className="form-input" value={form.phone || ""} onChange={e => setForm({ ...form, phone: e.target.value })} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Ciudad</label>
                                            <input className="form-input" value={form.city || ""} onChange={e => setForm({ ...form, city: e.target.value })} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Email</label>
                                            <input className="form-input" value={form.email || ""} onChange={e => setForm({ ...form, email: e.target.value })} />
                                        </div>
                                        <div style={{ gridColumn: "span 2" }}>
                                            <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Dirección</label>
                                            <input className="form-input" value={form.address || ""} onChange={e => setForm({ ...form, address: e.target.value })} />
                                        </div>
                                        <div style={{ gridColumn: "span 2" }}>
                                            <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Descripción</label>
                                            <textarea className="form-input" rows={3} value={form.description || ""} onChange={e => setForm({ ...form, description: e.target.value })} />
                                        </div>
                                        <div style={{ gridColumn: "span 2" }}>
                                            <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>URL del Logo</label>
                                            <input className="form-input" value={form.logo_url || ""} onChange={e => setForm({ ...form, logo_url: e.target.value })} placeholder="https://..." />
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                                        <button className="btn btn-secondary" style={{ flex: 1, borderRadius: "16px" }} onClick={() => setEditingId(null)}>Cancelar</button>
                                        <button className="btn btn-primary" style={{ flex: 2, borderRadius: "16px" }} disabled={saving} onClick={() => handleSave(clinic.id)}>
                                            {saving ? "Guardando..." : "💾 Guardar Cambios"}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* VIEW MODE */
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "1.5rem" }}>
                                        <div style={{ width: "60px", height: "60px", borderRadius: "16px", background: "linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(124, 58, 237, 0.4))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", fontWeight: 900, color: "#a78bfa", border: "1px solid rgba(139, 92, 246, 0.3)", flexShrink: 0 }}>
                                            {clinic.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h2 style={{ margin: 0, color: "#fff", fontSize: "1.4rem" }}>{clinic.name}</h2>
                                            <p style={{ margin: "0.2rem 0 0 0", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                                                📍 {clinic.city || "Sin ciudad"}, {clinic.state || "MX"} | 📞 {clinic.phone || "Sin tel."}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                                        <button className="btn btn-primary" style={{ borderRadius: "12px", padding: "0.7rem 1.5rem" }} onClick={() => handleEdit(clinic)}>
                                            ✏️ Editar Información
                                        </button>
                                        <Link href={`/dashboard/directorio/clinica/${clinic.id}`} className="btn btn-secondary" style={{ borderRadius: "12px", padding: "0.7rem 1.5rem" }}>
                                            👁️ Ver Perfil Público
                                        </Link>
                                        <button className="btn btn-outline" style={{ borderRadius: "12px", padding: "0.7rem 1.5rem", borderColor: "rgba(239,68,68,0.3)", color: "#ef4444" }} onClick={() => handleDelete(clinic.id)}>
                                            🗑️ Eliminar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
