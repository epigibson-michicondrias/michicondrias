"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMyAppointments, cancelAppointment, AppointmentItem } from "@/lib/services/directorio";
import dashStyles from "../../dashboard.module.css";
import { toast } from "react-hot-toast";

const STATUS_MAP: Record<string, { label: string; emoji: string; color: string; bg: string }> = {
    pending: { label: "Pendiente", emoji: "⏳", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
    confirmed: { label: "Confirmada", emoji: "✅", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
    completed: { label: "Completada", emoji: "🎉", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
    cancelled: { label: "Cancelada", emoji: "❌", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
    no_show: { label: "No Asistió", emoji: "👻", color: "#6b7280", bg: "rgba(107,114,128,0.12)" },
};

export default function MisCitasPage() {
    const router = useRouter();
    const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>("all");

    useEffect(() => {
        loadAppointments();
    }, []);

    async function loadAppointments() {
        try {
            const data = await getMyAppointments();
            setAppointments(data);
        } catch (err) {
            toast.error("Error cargando tus citas");
        } finally { setLoading(false); }
    }

    async function handleCancel(id: string) {
        const reason = prompt("¿Motivo de la cancelación? (opcional)");
        if (reason === null) return; // user clicked cancel on prompt
        try {
            const updated = await cancelAppointment(id, reason || undefined);
            setAppointments(prev => prev.map(a => a.id === id ? updated : a));
            toast.success("Cita cancelada correctamente");
        } catch (err: any) {
            toast.error(err.message || "Error al cancelar");
        }
    }

    const filtered = filter === "all" ? appointments : appointments.filter(a => a.status === filter);
    const upcoming = appointments.filter(a => ["pending", "confirmed"].includes(a.status));
    const past = appointments.filter(a => ["completed", "cancelled", "no_show"].includes(a.status));

    return (
        <div style={{ animation: "slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }}>
            <div className={dashStyles["page-header"]}>
                <h1 className={dashStyles["page-title"]}>📅 Mis Citas Veterinarias</h1>
                <p className={dashStyles["page-subtitle"]}>Gestiona tus citas médicas, reagenda o cancela según necesites</p>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
                {[
                    { label: "Próximas", count: upcoming.length, emoji: "📋", color: "#a78bfa" },
                    { label: "Completadas", count: past.filter(a => a.status === "completed").length, emoji: "✅", color: "#10b981" },
                    { label: "Canceladas", count: past.filter(a => a.status === "cancelled").length, emoji: "❌", color: "#ef4444" },
                    { label: "Total", count: appointments.length, emoji: "📊", color: "#3b82f6" },
                ].map(stat => (
                    <div key={stat.label} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "18px", padding: "1.25rem", textAlign: "center" }}>
                        <div style={{ fontSize: "1.5rem" }}>{stat.emoji}</div>
                        <p style={{ margin: "0.3rem 0 0 0", color: stat.color, fontSize: "1.8rem", fontWeight: 900 }}>{stat.count}</p>
                        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.8rem" }}>{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Filter Tabs */}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
                {[
                    { key: "all", label: "Todas" },
                    { key: "pending", label: "⏳ Pendientes" },
                    { key: "confirmed", label: "✅ Confirmadas" },
                    { key: "completed", label: "🎉 Completadas" },
                    { key: "cancelled", label: "❌ Canceladas" },
                ].map(tab => (
                    <button key={tab.key} onClick={() => setFilter(tab.key)} style={{
                        padding: "0.5rem 1.25rem", borderRadius: "12px", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, transition: "all 0.2s",
                        background: filter === tab.key ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${filter === tab.key ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.06)"}`,
                        color: filter === tab.key ? "#a78bfa" : "var(--text-secondary)",
                    }}>{tab.label}</button>
                ))}
            </div>

            {/* Appointments List */}
            {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}><div className={dashStyles["loading-spinner-premium"]} /></div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem 2rem", background: "rgba(255,255,255,0.02)", borderRadius: "24px", border: "1px dashed rgba(255,255,255,0.1)" }}>
                    <div style={{ fontSize: "4rem", marginBottom: "1rem", opacity: 0.5 }}>📅</div>
                    <h3 style={{ color: "#fff", marginBottom: "0.5rem" }}>No tienes citas {filter !== "all" ? `con este filtro` : ``}</h3>
                    <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>Busca una clínica en el directorio para agendar tu primera cita</p>
                    <button className="btn btn-primary" onClick={() => router.push("/dashboard/directorio")} style={{ borderRadius: "16px", padding: "1rem 2.5rem" }}>Buscar Clínicas →</button>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {filtered.map(appt => {
                        const s = STATUS_MAP[appt.status] || STATUS_MAP.pending;
                        return (
                            <div key={appt.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "20px", padding: "1.5rem", display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
                                {/* Date Badge */}
                                <div style={{ width: "70px", textAlign: "center", flexShrink: 0 }}>
                                    <div style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(124,58,237,0.3))", borderRadius: "14px", padding: "0.75rem 0.5rem" }}>
                                        <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: 900, color: "#a78bfa" }}>{appt.date ? new Date(appt.date + "T12:00").getDate() : "?"}</p>
                                        <p style={{ margin: 0, fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase" }}>{appt.date ? new Date(appt.date + "T12:00").toLocaleDateString("es-MX", { month: "short" }) : ""}</p>
                                    </div>
                                </div>

                                {/* Details */}
                                <div style={{ flex: 1, minWidth: "200px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.3rem" }}>
                                        <p style={{ margin: 0, color: "#fff", fontWeight: 700, fontSize: "1.05rem" }}>{appt.service_name || "Servicio"}</p>
                                        <span style={{ padding: "0.2rem 0.7rem", borderRadius: "20px", fontSize: "0.7rem", fontWeight: 700, color: s.color, background: s.bg }}>{s.emoji} {s.label}</span>
                                    </div>
                                    <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                                        🏥 {appt.clinic_name || "Clínica"} · 🕐 {appt.start_time} - {appt.end_time}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                                    {["pending", "confirmed"].includes(appt.status) && (
                                        <>
                                            <button onClick={() => router.push(`/dashboard/directorio/citas/agendar/${appt.clinic_id}?service_id=${appt.service_id}`)} className="btn btn-secondary" style={{ borderRadius: "10px", padding: "0.5rem 1rem", fontSize: "0.8rem" }}>🔄 Reagendar</button>
                                            <button onClick={() => handleCancel(appt.id)} className="btn btn-outline" style={{ borderRadius: "10px", padding: "0.5rem 1rem", fontSize: "0.8rem", borderColor: "rgba(239,68,68,0.3)", color: "#ef4444" }}>❌ Cancelar</button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
