"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    getMyClinics, updateClinic, Clinic, ClinicCreate, deleteClinic,
    getClinicServices, createClinicService, deleteClinicService, ClinicServiceItem,
    getClinicSchedule, setClinicSchedule, ClinicScheduleItem,
    getClinicAppointments, confirmAppointment, completeAppointment, AppointmentItem,
} from "@/lib/services/directorio";
import { createMedicalRecord, MedicalRecordCreate, Prescription } from "@/lib/services/medical";
import { hasRole } from "@/lib/auth";
import dashStyles from "../../dashboard.module.css";
import { toast } from "react-hot-toast";
import ConfirmModal from "@/components/ui/ConfirmModal";

const DAY_NAMES = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const STATUS_MAP: Record<string, { label: string; emoji: string; color: string; bg: string; badge?: string }> = {
    pending: { label: "Pendiente", emoji: "⏳", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
    confirmed: { label: "Confirmada", emoji: "✅", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
    completed: { label: "Completada", emoji: "🎉", color: "#3b82f6", bg: "rgba(59,130,246,0.12)", badge: dashStyles["badge-completed"] },
    cancelled: { label: "Cancelada", emoji: "❌", color: "#ef4444", bg: "rgba(239,68,68,0.12)", badge: dashStyles["badge-cancelled"] },
    no_show: { label: "No Asistió", emoji: "👻", color: "#6b7280", bg: "rgba(107,114,128,0.12)", badge: dashStyles["badge-neutral"] },
    rescheduled: { label: "Reagendada", emoji: "🔄", color: "#6b7280", bg: "rgba(107,114,128,0.12)", badge: dashStyles["badge-neutral"] },
};

type Tab = "info" | "services" | "schedule" | "agenda";

export default function MiClinicaPage() {
    const router = useRouter();
    const [clinics, setClinics] = useState<Clinic[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>("info");
    const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);

    // Edit clinic info
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<Partial<ClinicCreate>>({});
    const [saving, setSaving] = useState(false);
    const [deleteClinicModal, setDeleteClinicModal] = useState<string | null>(null);
    const [deleteServiceModal, setDeleteServiceModal] = useState<string | null>(null);

    // Services
    const [services, setServices] = useState<ClinicServiceItem[]>([]);
    const [showSvcModal, setShowSvcModal] = useState(false);
    const [svcForm, setSvcForm] = useState({ name: "", description: "", price: "", duration_minutes: "30", category: "" });

    // Schedule
    const [schedule, setSchedule] = useState<{ day: number; start: string; end: string; slot: number; active: boolean }[]>([]);
    const [savingSchedule, setSavingSchedule] = useState(false);

    // Agenda
    const [appointments, setAppointments] = useState<AppointmentItem[]>([]);

    // Medical Record
    const [recordModalOpen, setRecordModalOpen] = useState(false);
    const [selectedApptForRecord, setSelectedApptForRecord] = useState<AppointmentItem | null>(null);
    const [recordForm, setRecordForm] = useState<MedicalRecordCreate>({ pet_id: "", diagnosis: "", prescriptions: [] });
    const [savingRecord, setSavingRecord] = useState(false);

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
            if (data.length > 0) {
                setSelectedClinic(data[0]);
                loadClinicData(data[0].id);
            }
        } catch (err) { toast.error("Error cargando tus clínicas"); }
        finally { setLoading(false); }
    }

    async function loadClinicData(clinicId: string) {
        try {
            const [svcs, scheds, appts] = await Promise.all([
                getClinicServices(clinicId).catch(() => []),
                getClinicSchedule(clinicId).catch(() => []),
                getClinicAppointments(clinicId).catch(() => []),
            ]);
            setServices(svcs);
            // Initialize schedule grid
            const grid = DAY_NAMES.map((_, i) => {
                const existing = scheds.find(s => s.day_of_week === i);
                return {
                    day: i,
                    start: existing?.start_time || "09:00",
                    end: existing?.end_time || "18:00",
                    slot: existing?.slot_duration_minutes || 30,
                    active: !!existing,
                };
            });
            setSchedule(grid);
            setAppointments(appts);
        } catch { }
    }

    // --- Clinic Info ---
    function handleEdit(clinic: Clinic) {
        setEditingId(clinic.id);
        setForm({ name: clinic.name, address: clinic.address, city: clinic.city, state: clinic.state, phone: clinic.phone, email: clinic.email, website: clinic.website, description: clinic.description, logo_url: clinic.logo_url, is_24_hours: clinic.is_24_hours, has_emergency: clinic.has_emergency });
    }

    async function handleSave(clinicId: string) {
        setSaving(true);
        try {
            const updated = await updateClinic(clinicId, form);
            setClinics(prev => prev.map(c => c.id === clinicId ? updated : c));
            setSelectedClinic(updated);
            setEditingId(null);
            toast.success("✨ Clínica actualizada");
        } catch (err: any) { toast.error(err.message || "Error"); }
        finally { setSaving(false); }
    }

    async function handleDelete(clinicId: string) {
        try {
            await deleteClinic(clinicId);
            setClinics(prev => prev.filter(c => c.id !== clinicId));
            setSelectedClinic(null);
            toast.success("Clínica eliminada");
        } catch (err: any) { toast.error(err.message || "Error"); }
        finally { setDeleteClinicModal(null); }
    }

    // --- Services ---
    async function handleAddService() {
        if (!selectedClinic || !svcForm.name) return;
        try {
            const svc = await createClinicService(selectedClinic.id, {
                name: svcForm.name,
                description: svcForm.description || undefined,
                price: svcForm.price ? parseFloat(svcForm.price) : undefined,
                duration_minutes: parseInt(svcForm.duration_minutes) || 30,
                category: svcForm.category || undefined,
            });
            setServices([...services, svc]);
            setShowSvcModal(false);
            setSvcForm({ name: "", description: "", price: "", duration_minutes: "30", category: "" });
            toast.success("Servicio añadido 🏷️");
        } catch (err: any) { toast.error(err.message || "Error"); }
    }

    async function handleDeleteService(id: string) {
        try {
            await deleteClinicService(id);
            setServices(prev => prev.filter(s => s.id !== id));
            toast.success("Servicio eliminado");
        } catch (err: any) { toast.error(err.message || "Error"); }
        finally { setDeleteServiceModal(null); }
    }

    // --- Schedule ---
    async function handleSaveSchedule() {
        if (!selectedClinic) return;
        setSavingSchedule(true);
        try {
            const activeDays = schedule.filter(s => s.active).map(s => ({
                day_of_week: s.day,
                start_time: s.start,
                end_time: s.end,
                slot_duration_minutes: s.slot,
            }));
            await setClinicSchedule(selectedClinic.id, activeDays);
            toast.success("Horario guardado ✅");
        } catch (err: any) { toast.error(err.message || "Error"); }
        finally { setSavingSchedule(false); }
    }

    // --- Agenda ---
    async function handleConfirm(id: string) {
        try {
            const updated = await confirmAppointment(id);
            setAppointments(prev => prev.map(a => a.id === id ? updated : a));
            toast.success("Cita confirmada ✅");
        } catch (err: any) { toast.error(err.message || "Error"); }
    }

    async function handleComplete(id: string) {
        try {
            const updated = await completeAppointment(id);
            setAppointments(prev => prev.map(a => a.id === id ? updated : a));
            toast.success("Cita completada 🎉");
        } catch (err: any) { toast.error(err.message || "Error"); }
    }

    // --- Medical Records ---
    function openRecordModal(appt: AppointmentItem) {
        setSelectedApptForRecord(appt);
        setRecordForm({ pet_id: appt.pet_id, diagnosis: "", weight_kg: undefined, temperature_c: undefined, clinical_notes: "", prescriptions: [] });
        setRecordModalOpen(true);
    }

    function addPrescriptionRow() {
        setRecordForm(prev => ({ ...prev, prescriptions: [...prev.prescriptions, { medication_name: "", dosage: "", frequency_hours: 8, duration_days: 5, instructions: "" }] }));
    }

    function updatePrescription(index: number, field: keyof Prescription, value: any) {
        setRecordForm(prev => {
            const arr = [...prev.prescriptions];
            arr[index] = { ...arr[index], [field]: value };
            return { ...prev, prescriptions: arr };
        });
    }

    function removePrescription(index: number) {
        setRecordForm(prev => ({ ...prev, prescriptions: prev.prescriptions.filter((_, i) => i !== index) }));
    }

    async function handleSaveRecord() {
        if (!selectedApptForRecord || !recordForm.diagnosis) return toast.error("El diagnóstico es obligatorio.");

        // Basic validation for prescriptions
        for (const p of recordForm.prescriptions) {
            if (!p.medication_name || !p.dosage) return toast.error("Hay recetas incompletas (Falta nombre o dosis)");
        }

        setSavingRecord(true);
        try {
            await createMedicalRecord(selectedApptForRecord.id, recordForm);

            // Si la cita no estaba completada, en el backend se autocompleta. Actualizamos UI:
            setAppointments(prev => prev.map(a => a.id === selectedApptForRecord.id ? { ...a, status: "completed" } : a));

            toast.success("Expediente y recetas guardados correctamente 🩺");
            setRecordModalOpen(false);
        } catch (err: any) { toast.error(err.message || "Error al guardar el expediente"); }
        finally { setSavingRecord(false); }
    }

    const tabs: { key: Tab; label: string; icon: string }[] = [
        { key: "info", label: "Información", icon: "🏥" },
        { key: "services", label: "Servicios", icon: "🏷️" },
        { key: "schedule", label: "Horario", icon: "🕐" },
        { key: "agenda", label: "Agenda", icon: "📅" },
    ];

    return (
        <div style={{ animation: "slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }}>
            <div className={dashStyles["page-header"]}>
                <h1 className={dashStyles["page-title"]}>
                    <button onClick={() => router.push("/dashboard/directorio")} className={dashStyles["back-button-premium"]} style={{ marginRight: "1rem" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                    </button>
                    🏥 Mi Clínica {selectedClinic ? `— ${selectedClinic.name}` : ""}
                </h1>
                <p className={dashStyles["page-subtitle"]}>Panel completo de administración: información, servicios, horarios y agenda</p>
            </div>

            {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}><div className={dashStyles["loading-spinner-premium"]} /></div>
            ) : clinics.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem 2rem", background: "rgba(255,255,255,0.02)", borderRadius: "24px", border: "1px dashed rgba(255,255,255,0.1)" }}>
                    <div style={{ fontSize: "4rem", marginBottom: "1rem", opacity: 0.5 }}>🏗️</div>
                    <h3 style={{ color: "#fff", marginBottom: "0.5rem" }}>Aún no tienes clínicas registradas</h3>
                    <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>Registra tu clínica para aparecer en el directorio</p>
                    <Link href="/dashboard/directorio/nuevo" className="btn btn-primary" style={{ padding: "1rem 2.5rem", borderRadius: "16px" }}>+ Registrar Mi Primera Clínica</Link>
                </div>
            ) : (
                <>
                    {/* Tab Navigation */}
                    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", flexWrap: "wrap" }}>
                        {tabs.map(tab => (
                            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                                padding: "0.75rem 1.5rem", borderRadius: "14px", cursor: "pointer", fontSize: "0.9rem", fontWeight: 700, transition: "all 0.3s",
                                background: activeTab === tab.key ? "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(124,58,237,0.3))" : "rgba(255,255,255,0.02)",
                                border: `1px solid ${activeTab === tab.key ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.06)"}`,
                                color: activeTab === tab.key ? "#a78bfa" : "var(--text-secondary)",
                            }}>{tab.icon} {tab.label}</button>
                        ))}
                    </div>

                    {/* TAB: Información */}
                    {activeTab === "info" && selectedClinic && (
                        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "24px", padding: "2rem", position: "relative" }}>
                            <div style={{ position: "absolute", top: "1.5rem", right: "1.5rem" }}>
                                <span style={{ padding: "0.4rem 1rem", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 700, background: selectedClinic.is_approved ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)", color: selectedClinic.is_approved ? "#10b981" : "#f59e0b", border: `1px solid ${selectedClinic.is_approved ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)"}` }}>
                                    {selectedClinic.is_approved ? "✅ Aprobada" : "⏳ En Revisión"}
                                </span>
                            </div>
                            {editingId === selectedClinic.id ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                                    <h3 style={{ color: "#a78bfa", margin: 0 }}>✏️ Editando: {selectedClinic.name}</h3>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                        <div><label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Nombre</label><input className="form-input" value={form.name || ""} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                                        <div><label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Teléfono</label><input className="form-input" value={form.phone || ""} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                                        <div><label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Ciudad</label><input className="form-input" value={form.city || ""} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
                                        <div><label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Email</label><input className="form-input" value={form.email || ""} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                                        <div style={{ gridColumn: "span 2" }}><label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Dirección</label><input className="form-input" value={form.address || ""} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
                                        <div style={{ gridColumn: "span 2" }}><label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Descripción</label><textarea className="form-input" rows={3} value={form.description || ""} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
                                    </div>
                                    <div style={{ display: "flex", gap: "1rem" }}>
                                        <button className="btn btn-secondary" style={{ flex: 1, borderRadius: "16px" }} onClick={() => setEditingId(null)}>Cancelar</button>
                                        <button className="btn btn-primary" style={{ flex: 2, borderRadius: "16px" }} disabled={saving} onClick={() => handleSave(selectedClinic.id)}>{saving ? "Guardando..." : "💾 Guardar"}</button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "1.5rem" }}>
                                        <div style={{ width: "60px", height: "60px", borderRadius: "16px", background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(124,58,237,0.4))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", fontWeight: 900, color: "#a78bfa", border: "1px solid rgba(139,92,246,0.3)" }}>{selectedClinic.name.charAt(0).toUpperCase()}</div>
                                        <div>
                                            <h2 style={{ margin: 0, color: "#fff", fontSize: "1.4rem" }}>{selectedClinic.name}</h2>
                                            <p style={{ margin: "0.2rem 0 0 0", color: "var(--text-secondary)", fontSize: "0.9rem" }}>📍 {selectedClinic.city || "Sin ciudad"}, {selectedClinic.state || "MX"} | 📞 {selectedClinic.phone || "Sin tel."}</p>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                                        <button className="btn btn-primary" style={{ borderRadius: "12px", padding: "0.7rem 1.5rem" }} onClick={() => handleEdit(selectedClinic)}>✏️ Editar</button>
                                        <Link href={`/dashboard/directorio/clinica/${selectedClinic.id}`} className="btn btn-secondary" style={{ borderRadius: "12px", padding: "0.7rem 1.5rem" }}>👁️ Ver Perfil</Link>
                                        <button className="btn btn-outline" style={{ borderRadius: "12px", padding: "0.7rem 1.5rem", borderColor: "rgba(239,68,68,0.3)", color: "#ef4444" }} onClick={() => setDeleteClinicModal(selectedClinic.id)}>🗑️ Eliminar</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: Servicios */}
                    {activeTab === "services" && selectedClinic && (
                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                                <h3 style={{ color: "#fff", margin: 0 }}>🏷️ Catálogo de Servicios ({services.length})</h3>
                                <button className="btn btn-primary" style={{ borderRadius: "12px" }} onClick={() => setShowSvcModal(true)}>+ Nuevo Servicio</button>
                            </div>
                            {services.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "3rem", background: "rgba(255,255,255,0.02)", borderRadius: "20px", border: "1px dashed rgba(255,255,255,0.08)" }}>
                                    <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🏷️</p>
                                    <p style={{ color: "var(--text-secondary)" }}>Agrega tus servicios para que los usuarios puedan verlos y agendar citas</p>
                                </div>
                            ) : (
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
                                    {services.map(svc => (
                                        <div key={svc.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "18px", padding: "1.5rem" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                                                <div>
                                                    <p style={{ margin: 0, color: "#fff", fontWeight: 700, fontSize: "1.05rem" }}>{svc.name}</p>
                                                    {svc.category && <span style={{ fontSize: "0.7rem", color: "#a78bfa", background: "rgba(139,92,246,0.1)", padding: "0.15rem 0.5rem", borderRadius: "6px" }}>{svc.category}</span>}
                                                </div>
                                                <span style={{ color: "#10b981", fontWeight: 800, fontSize: "1.2rem" }}>{svc.price ? `$${svc.price}` : "Consultar"}</span>
                                            </div>
                                            {svc.description && <p style={{ margin: "0.5rem 0 0 0", color: "var(--text-secondary)", fontSize: "0.85rem" }}>{svc.description}</p>}
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.75rem" }}>
                                                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>⏱️ {svc.duration_minutes} min</span>
                                                <button onClick={() => setDeleteServiceModal(svc.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: "0.8rem" }}>🗑️ Eliminar</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {/* Add Service Modal */}
                            {showSvcModal && (
                                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
                                    <div style={{ background: "var(--bg-glass)", border: "1px solid var(--border-color)", borderRadius: "24px", padding: "2rem", width: "100%", maxWidth: "500px" }}>
                                        <h2 style={{ fontSize: "1.3rem", marginBottom: "1.5rem", color: "#fff" }}>🏷️ Nuevo Servicio</h2>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                            <div><label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Nombre del Servicio *</label><input className="form-input" value={svcForm.name} onChange={e => setSvcForm({ ...svcForm, name: e.target.value })} placeholder="Ej. Consulta General" /></div>
                                            <div style={{ display: "flex", gap: "1rem" }}>
                                                <div style={{ flex: 1 }}><label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Precio (MXN)</label><input className="form-input" type="number" value={svcForm.price} onChange={e => setSvcForm({ ...svcForm, price: e.target.value })} placeholder="500" /></div>
                                                <div style={{ flex: 1 }}><label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Duración (min)</label><input className="form-input" type="number" value={svcForm.duration_minutes} onChange={e => setSvcForm({ ...svcForm, duration_minutes: e.target.value })} /></div>
                                            </div>
                                            <div><label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Categoría</label><input className="form-input" value={svcForm.category} onChange={e => setSvcForm({ ...svcForm, category: e.target.value })} placeholder="Ej. Consulta, Vacunación, Cirugía..." /></div>
                                            <div><label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Descripción</label><textarea className="form-input" rows={2} value={svcForm.description} onChange={e => setSvcForm({ ...svcForm, description: e.target.value })} placeholder="Descripción breve del servicio..." /></div>
                                            <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                                                <button className="btn btn-secondary" style={{ flex: 1, borderRadius: "14px" }} onClick={() => setShowSvcModal(false)}>Cancelar</button>
                                                <button className="btn btn-primary" style={{ flex: 2, borderRadius: "14px" }} onClick={handleAddService}>💾 Guardar Servicio</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: Horario */}
                    {activeTab === "schedule" && selectedClinic && (
                        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "24px", padding: "2rem" }}>
                            <h3 style={{ color: "#fff", margin: "0 0 1.5rem 0" }}>🕐 Horario Semanal</h3>
                            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", fontSize: "0.85rem" }}>Configura los días y horarios que tu clínica atiende. Los consumidores verán estos horarios al agendar.</p>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                {schedule.map((day, i) => (
                                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.75rem 1rem", borderRadius: "14px", background: day.active ? "rgba(16,185,129,0.05)" : "rgba(255,255,255,0.01)", border: `1px solid ${day.active ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.04)"}`, transition: "all 0.2s" }}>
                                        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", minWidth: "130px" }}>
                                            <input type="checkbox" checked={day.active} onChange={e => { const u = [...schedule]; u[i].active = e.target.checked; setSchedule(u); }} style={{ width: "18px", height: "18px", accentColor: "#10b981" }} />
                                            <span style={{ color: day.active ? "#fff" : "var(--text-secondary)", fontWeight: day.active ? 700 : 400 }}>{DAY_NAMES[i]}</span>
                                        </label>
                                        {day.active && (
                                            <>
                                                <input type="time" className="form-input" value={day.start} onChange={e => { const u = [...schedule]; u[i].start = e.target.value; setSchedule(u); }} style={{ maxWidth: "130px", padding: "0.4rem 0.6rem" }} />
                                                <span style={{ color: "var(--text-secondary)" }}>a</span>
                                                <input type="time" className="form-input" value={day.end} onChange={e => { const u = [...schedule]; u[i].end = e.target.value; setSchedule(u); }} style={{ maxWidth: "130px", padding: "0.4rem 0.6rem" }} />
                                                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Slot:</span>
                                                <select className="form-input" value={day.slot} onChange={e => { const u = [...schedule]; u[i].slot = parseInt(e.target.value); setSchedule(u); }} style={{ maxWidth: "80px", padding: "0.4rem" }}>
                                                    <option value={15}>15m</option>
                                                    <option value={30}>30m</option>
                                                    <option value={45}>45m</option>
                                                    <option value={60}>60m</option>
                                                </select>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <button className="btn btn-primary" style={{ marginTop: "1.5rem", borderRadius: "14px", width: "100%", padding: "1rem" }} disabled={savingSchedule} onClick={handleSaveSchedule}>
                                {savingSchedule ? "Guardando..." : "💾 Guardar Horario"}
                            </button>
                        </div>
                    )}

                    {/* TAB: Agenda */}
                    {activeTab === "agenda" && selectedClinic && (
                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                                <h3 style={{ color: "#fff", margin: 0 }}>📅 Agenda de Citas ({appointments.filter(a => ["pending", "confirmed"].includes(a.status)).length} activas)</h3>
                            </div>
                            {appointments.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "3rem", background: "rgba(255,255,255,0.02)", borderRadius: "20px", border: "1px dashed rgba(255,255,255,0.08)" }}>
                                    <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📅</p>
                                    <p style={{ color: "var(--text-secondary)" }}>No hay citas programadas aún</p>
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                    {appointments.filter(a => a.status !== "rescheduled").map(appt => {
                                        const s = STATUS_MAP[appt.status] || STATUS_MAP.pending;
                                        return (
                                            <div key={appt.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "18px", padding: "1.25rem", display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
                                                <div style={{ width: "60px", textAlign: "center", flexShrink: 0 }}>
                                                    <div style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(124,58,237,0.3))", borderRadius: "12px", padding: "0.6rem 0.4rem" }}>
                                                        <p style={{ margin: 0, fontSize: "1.3rem", fontWeight: 900, color: "#a78bfa" }}>{appt.date ? new Date(appt.date + "T12:00").getDate() : "?"}</p>
                                                        <p style={{ margin: 0, fontSize: "0.65rem", color: "var(--text-secondary)", textTransform: "uppercase" }}>{appt.date ? new Date(appt.date + "T12:00").toLocaleDateString("es-MX", { month: "short" }) : ""}</p>
                                                    </div>
                                                </div>
                                                <div style={{ flex: 1, minWidth: "180px" }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.2rem" }}>
                                                        <p style={{ margin: 0, color: "#fff", fontWeight: 700 }}>{appt.service_name || "Servicio"}</p>
                                                        <span style={{ padding: "0.15rem 0.5rem", borderRadius: "20px", fontSize: "0.65rem", fontWeight: 700, color: s.color, background: s.bg }}>{s.emoji} {s.label}</span>
                                                    </div>
                                                    <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.8rem" }}>🕐 {appt.start_time} - {appt.end_time} {appt.notes ? ` · 📝 ${appt.notes}` : ""}</p>
                                                </div>
                                                <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
                                                    {appt.status === "pending" && <button onClick={() => handleConfirm(appt.id)} className="btn btn-primary" style={{ borderRadius: "10px", padding: "0.4rem 1rem", fontSize: "0.8rem", background: "linear-gradient(135deg, #10b981, #059669)" }}>✅ Confirmar</button>}
                                                    {appt.status === "confirmed" && <button onClick={() => handleComplete(appt.id)} className="btn btn-primary" style={{ borderRadius: "10px", padding: "0.4rem 1rem", fontSize: "0.8rem" }}>🎉 Completar</button>}
                                                    {["confirmed", "completed"].includes(appt.status) && (
                                                        <button onClick={() => openRecordModal(appt)} className="btn btn-secondary" style={{ borderRadius: "10px", padding: "0.4rem 1rem", fontSize: "0.8rem", background: "rgba(139,92,246,0.15)", color: "#a78bfa", borderColor: "rgba(139,92,246,0.3)" }}>🩺 Expediente</button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Expediente Modal */}
            {recordModalOpen && selectedApptForRecord && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "1rem" }}>
                    <div style={{ background: "var(--bg-glass)", border: "1px solid var(--border-color)", borderRadius: "24px", padding: "2rem", width: "100%", maxWidth: "800px", maxHeight: "90vh", overflowY: "auto", position: "relative", animation: "slideUp 0.3s ease-out" }}>
                        <button onClick={() => setRecordModalOpen(false)} style={{ position: "absolute", top: "1.5rem", right: "1.5rem", background: "none", border: "none", color: "var(--text-secondary)", fontSize: "1.5rem", cursor: "pointer" }}>×</button>

                        <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem", color: "#fff", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            🩺 Expediente Médico
                        </h2>
                        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "0.9rem" }}>
                            Cita del {selectedApptForRecord.date} · {selectedApptForRecord.service_name}
                        </p>

                        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                            {/* Constantes Fisiológicas */}
                            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "1.5rem" }}>
                                <h3 style={{ fontSize: "1.1rem", color: "#a78bfa", marginTop: 0, marginBottom: "1rem" }}>Vitales (Opcional)</h3>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                    <div>
                                        <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>Peso (kg)</label>
                                        <input type="number" step="0.1" className="form-input" value={recordForm.weight_kg || ""} onChange={e => setRecordForm({ ...recordForm, weight_kg: parseFloat(e.target.value) || undefined })} placeholder="Ej. 4.5" />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>Temperatura (°C)</label>
                                        <input type="number" step="0.1" className="form-input" value={recordForm.temperature_c || ""} onChange={e => setRecordForm({ ...recordForm, temperature_c: parseFloat(e.target.value) || undefined })} placeholder="Ej. 38.5" />
                                    </div>
                                </div>
                            </div>

                            {/* Diagnóstico */}
                            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "1.5rem" }}>
                                <h3 style={{ fontSize: "1.1rem", color: "#a78bfa", marginTop: 0, marginBottom: "1rem" }}>Diagnóstico y Notas</h3>
                                <div style={{ marginBottom: "1rem" }}>
                                    <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>Diagnóstico Principal *</label>
                                    <input className="form-input" value={recordForm.diagnosis} onChange={e => setRecordForm({ ...recordForm, diagnosis: e.target.value })} placeholder="Ej. Gastroenteritis aguda" />
                                </div>
                                <div>
                                    <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>Notas Clínicas (Opcional)</label>
                                    <textarea className="form-input" rows={3} value={recordForm.clinical_notes || ""} onChange={e => setRecordForm({ ...recordForm, clinical_notes: e.target.value })} placeholder="Hallazgos en la exploración, recomendaciones generales..." />
                                </div>
                            </div>

                            {/* Recetas */}
                            <div style={{ background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.1)", borderRadius: "16px", padding: "1.5rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                                    <h3 style={{ fontSize: "1.1rem", color: "#10b981", margin: 0 }}>💊 Receta Digital</h3>
                                    <button onClick={addPrescriptionRow} style={{ background: "rgba(16,185,129,0.2)", border: "none", color: "#10b981", padding: "0.4rem 0.8rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.8rem", fontWeight: "bold" }}>+ Agregar Medicamento</button>
                                </div>

                                {recordForm.prescriptions.length === 0 ? (
                                    <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", textAlign: "center", margin: "1rem 0" }}>No hay medicamentos recetados. Presiona + para añadir uno.</p>
                                ) : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                        {recordForm.prescriptions.map((p, idx) => (
                                            <div key={idx} style={{ background: "rgba(0,0,0,0.2)", padding: "1rem", borderRadius: "12px", position: "relative" }}>
                                                <button onClick={() => removePrescription(idx)} style={{ position: "absolute", top: "0.5rem", right: "0.5rem", background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "1rem" }}>✖</button>

                                                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.8rem", marginBottom: "0.8rem" }}>
                                                    <div>
                                                        <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Nombre del Medicamento *</label>
                                                        <input className="form-input" style={{ padding: "0.5rem" }} value={p.medication_name} onChange={e => updatePrescription(idx, "medication_name", e.target.value)} placeholder="Ej. Doxiciclina 100mg" />
                                                    </div>
                                                </div>

                                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.8rem" }}>
                                                    <div>
                                                        <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Dosis *</label>
                                                        <input className="form-input" style={{ padding: "0.5rem" }} value={p.dosage} onChange={e => updatePrescription(idx, "dosage", e.target.value)} placeholder="Ej. 1/2 tableta" />
                                                    </div>
                                                    <div>
                                                        <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Frecuencia *</label>
                                                        <select className="form-input" style={{ padding: "0.5rem" }} value={p.frequency_hours} onChange={e => updatePrescription(idx, "frequency_hours", parseInt(e.target.value))}>
                                                            <option value={4}>Cada 4 hrs</option>
                                                            <option value={6}>Cada 6 hrs</option>
                                                            <option value={8}>Cada 8 hrs</option>
                                                            <option value={12}>Cada 12 hrs</option>
                                                            <option value={24}>Cada 24 hrs</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Duración *</label>
                                                        <select className="form-input" style={{ padding: "0.5rem" }} value={p.duration_days} onChange={e => updatePrescription(idx, "duration_days", parseInt(e.target.value))}>
                                                            {[1, 2, 3, 4, 5, 7, 10, 14, 21, 30].map(d => <option key={d} value={d}>Por {d} días</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div style={{ marginTop: "0.8rem" }}>
                                                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Instrucciones adicionales</label>
                                                    <input className="form-input" style={{ padding: "0.5rem" }} value={p.instructions || ""} onChange={e => updatePrescription(idx, "instructions", e.target.value)} placeholder="Ej. Dar junto con comida humeda..." />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {recordForm.prescriptions.length > 0 && (
                                    <div style={{ marginTop: "1rem", fontSize: "0.8rem", color: "#10b981", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                        El sistema enviará recordatorios automáticos al dueño por SMS/Push basados en esta receta.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
                            <button className="btn btn-secondary" style={{ flex: 1, borderRadius: "14px", padding: "1rem" }} onClick={() => setRecordModalOpen(false)}>Cancelar</button>
                            <button className="btn btn-primary" style={{ flex: 2, borderRadius: "14px", padding: "1rem", background: "linear-gradient(135deg, #8b5cf6, #7c3aed)" }} onClick={handleSaveRecord} disabled={savingRecord || !recordForm.diagnosis}>
                                {savingRecord ? "Guardando..." : "💾 Guardar Expediente"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={!!deleteClinicModal}
                title="Eliminar Clínica"
                message="¿Estás seguro que deseas eliminar esta clínica permanentemente del directorio? Esta acción no se puede deshacer."
                confirmText="Sí, Eliminar"
                cancelText="Cancelar"
                isDanger={true}
                onConfirm={() => deleteClinicModal && handleDelete(deleteClinicModal)}
                onCancel={() => setDeleteClinicModal(null)}
            />

            <ConfirmModal
                isOpen={!!deleteServiceModal}
                title="Eliminar Servicio"
                message="¿Estás seguro que deseas eliminar este servicio de tu catálogo? Ya no estará disponible para nuevas citas."
                confirmText="Sí, Eliminar"
                cancelText="Cancelar"
                isDanger={true}
                onConfirm={() => deleteServiceModal && handleDeleteService(deleteServiceModal)}
                onCancel={() => setDeleteServiceModal(null)}
            />
        </div>
    );
}
