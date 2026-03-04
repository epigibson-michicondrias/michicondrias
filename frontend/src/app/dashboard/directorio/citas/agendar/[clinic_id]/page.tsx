"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { getClinic, Clinic, getClinicServices, ClinicServiceItem, getAvailableSlots, AvailableSlot, createAppointment } from "@/lib/services/directorio";
import dashStyles from "../../../../dashboard.module.css";
import { toast } from "react-hot-toast";

interface Pet { id: string; name: string; species: string; }

export default function AgendarPage() {
    const router = useRouter();
    const { clinic_id } = useParams<{ clinic_id: string }>();
    const searchParams = useSearchParams();
    const preselectedServiceId = searchParams.get("service_id");

    const [clinic, setClinic] = useState<Clinic | null>(null);
    const [services, setServices] = useState<ClinicServiceItem[]>([]);
    const [pets, setPets] = useState<Pet[]>([]);
    const [selectedService, setSelectedService] = useState<string>("");
    const [selectedPet, setSelectedPet] = useState<string>("");
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [slots, setSlots] = useState<AvailableSlot[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<string>("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(true);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [booking, setBooking] = useState(false);
    const [step, setStep] = useState(1); // 1: Service, 2: Date/Slot, 3: Confirm

    // Calendar
    const [currentMonth, setCurrentMonth] = useState(new Date());

    useEffect(() => {
        async function load() {
            try {
                const [clinicData, servicesData] = await Promise.all([
                    getClinic(clinic_id),
                    getClinicServices(clinic_id),
                ]);
                setClinic(clinicData);
                setServices(servicesData);
                if (preselectedServiceId) setSelectedService(preselectedServiceId);

                // Load pets from mascotas service
                const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
                if (token) {
                    try {
                        const apiBase = process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost:8000";
                        const res = await fetch(`${apiBase}/mascotas/api/v1/mascotas/pets/me`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        if (res.ok) setPets(await res.json());
                    } catch { }
                }
            } catch (err) { console.error(err); } finally { setLoading(false); }
        }
        load();
    }, [clinic_id]);

    // Load available slots when date + service change
    useEffect(() => {
        if (!selectedDate || !selectedService) return;
        setLoadingSlots(true);
        setSelectedSlot("");
        getAvailableSlots(clinic_id, selectedDate, selectedService)
            .then(setSlots)
            .catch(() => setSlots([]))
            .finally(() => setLoadingSlots(false));
    }, [selectedDate, selectedService]);

    async function handleBook() {
        if (!selectedService || !selectedPet || !selectedDate || !selectedSlot) return;
        setBooking(true);
        try {
            await createAppointment({
                clinic_id,
                service_id: selectedService,
                pet_id: selectedPet,
                date: selectedDate,
                start_time: selectedSlot,
                notes: notes || undefined,
            });
            toast.success("🎉 ¡Cita agendada con éxito!");
            router.push("/dashboard/directorio/citas");
        } catch (err: any) {
            toast.error(err.message || "Error al agendar la cita");
        } finally { setBooking(false); }
    }

    // Calendar helpers
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    const today = new Date().toISOString().split("T")[0];
    const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    function formatDate(day: number): string {
        const m = String(currentMonth.getMonth() + 1).padStart(2, "0");
        const d = String(day).padStart(2, "0");
        return `${currentMonth.getFullYear()}-${m}-${d}`;
    }

    function isPast(day: number): boolean {
        return formatDate(day) < today;
    }

    const selectedServiceObj = services.find(s => s.id === selectedService);

    if (loading) {
        return <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}><div className={dashStyles["loading-spinner-premium"]} /></div>;
    }

    return (
        <div style={{ animation: "slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }}>
            {/* Header */}
            <div className={dashStyles["page-header"]}>
                <h1 className={dashStyles["page-title"]}>
                    <button onClick={() => router.back()} className={dashStyles["back-button-premium"]} style={{ marginRight: "1rem" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                    </button>
                    📅 Agendar Cita — {clinic?.name}
                </h1>
                <p className={dashStyles["page-subtitle"]}>Selecciona un servicio, fecha y horario disponible</p>
            </div>

            {/* Progress Steps */}
            <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
                {[
                    { n: 1, label: "Servicio y Mascota" },
                    { n: 2, label: "Fecha y Horario" },
                    { n: 3, label: "Confirmar" },
                ].map(s => (
                    <div key={s.n} style={{ flex: 1, textAlign: "center", padding: "1rem", borderRadius: "16px", background: step >= s.n ? "rgba(139, 92, 246, 0.15)" : "rgba(255,255,255,0.02)", border: `1px solid ${step >= s.n ? "rgba(139, 92, 246, 0.3)" : "rgba(255,255,255,0.06)"}`, transition: "all 0.3s" }}>
                        <div style={{ fontSize: "1.5rem", marginBottom: "0.3rem" }}>{step > s.n ? "✅" : `${s.n}`}</div>
                        <div style={{ fontSize: "0.8rem", color: step >= s.n ? "#a78bfa" : "var(--text-secondary)", fontWeight: step === s.n ? 700 : 400 }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* STEP 1: Service + Pet */}
            {step === 1 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "24px", padding: "2rem" }}>
                        <h3 style={{ color: "#fff", margin: "0 0 1.5rem 0" }}>🏷️ Selecciona el Servicio</h3>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
                            {services.map(svc => (
                                <button key={svc.id} onClick={() => setSelectedService(svc.id)} style={{
                                    padding: "1.25rem", borderRadius: "16px", textAlign: "left", cursor: "pointer", transition: "all 0.3s",
                                    background: selectedService === svc.id ? "rgba(139, 92, 246, 0.15)" : "rgba(255,255,255,0.02)",
                                    border: `2px solid ${selectedService === svc.id ? "#a78bfa" : "rgba(255,255,255,0.06)"}`,
                                }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                                        <div>
                                            <p style={{ margin: 0, color: "#fff", fontWeight: 700 }}>{svc.name}</p>
                                            {svc.category && <span style={{ fontSize: "0.75rem", color: "#a78bfa", background: "rgba(139,92,246,0.1)", padding: "0.2rem 0.5rem", borderRadius: "6px" }}>{svc.category}</span>}
                                        </div>
                                        <span style={{ color: "#10b981", fontWeight: 800, fontSize: "1.1rem" }}>
                                            {svc.price ? `$${svc.price}` : "Consultar"}
                                        </span>
                                    </div>
                                    {svc.description && <p style={{ margin: "0.5rem 0 0 0", color: "var(--text-secondary)", fontSize: "0.85rem" }}>{svc.description}</p>}
                                    <p style={{ margin: "0.3rem 0 0 0", fontSize: "0.75rem", color: "var(--text-secondary)" }}>⏱️ {svc.duration_minutes} min</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "24px", padding: "2rem" }}>
                        <h3 style={{ color: "#fff", margin: "0 0 1.5rem 0" }}>🐾 ¿Para cuál mascota?</h3>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
                            {pets.map(pet => (
                                <button key={pet.id} onClick={() => setSelectedPet(pet.id)} style={{
                                    padding: "1rem", borderRadius: "16px", textAlign: "center", cursor: "pointer", transition: "all 0.3s",
                                    background: selectedPet === pet.id ? "rgba(16, 185, 129, 0.15)" : "rgba(255,255,255,0.02)",
                                    border: `2px solid ${selectedPet === pet.id ? "#10b981" : "rgba(255,255,255,0.06)"}`,
                                }}>
                                    <span style={{ fontSize: "2rem" }}>{pet.species === "gato" ? "🐱" : "🐶"}</span>
                                    <p style={{ margin: "0.3rem 0 0 0", color: "#fff", fontWeight: 600 }}>{pet.name}</p>
                                </button>
                            ))}
                            {pets.length === 0 && <p style={{ color: "var(--text-secondary)" }}>No tienes mascotas registradas</p>}
                        </div>
                    </div>

                    <button className="btn btn-primary" disabled={!selectedService || !selectedPet} onClick={() => setStep(2)} style={{ borderRadius: "16px", padding: "1rem 2rem", fontSize: "1.05rem", width: "100%" }}>
                        Siguiente → Elegir Fecha y Hora
                    </button>
                </div>
            )}

            {/* STEP 2: Calendar + Time Slots */}
            {step === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "24px", padding: "2rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "0.5rem 1rem", cursor: "pointer", color: "#fff" }}>◀</button>
                            <h3 style={{ color: "#fff", margin: 0 }}>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h3>
                            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "0.5rem 1rem", cursor: "pointer", color: "#fff" }}>▶</button>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.5rem", textAlign: "center" }}>
                            {dayNames.map(d => <div key={d} style={{ color: "var(--text-secondary)", fontSize: "0.8rem", fontWeight: 700, padding: "0.5rem" }}>{d}</div>)}
                            {Array.from({ length: firstDay }, (_, i) => <div key={`empty-${i}`} />)}
                            {Array.from({ length: daysInMonth }, (_, i) => {
                                const day = i + 1;
                                const dateStr = formatDate(day);
                                const past = isPast(day);
                                const isSelected = dateStr === selectedDate;
                                return (
                                    <button
                                        key={day}
                                        disabled={past}
                                        onClick={() => setSelectedDate(dateStr)}
                                        style={{
                                            padding: "0.7rem", borderRadius: "12px", cursor: past ? "not-allowed" : "pointer",
                                            background: isSelected ? "linear-gradient(135deg, #8b5cf6, #7c3aed)" : "rgba(255,255,255,0.02)",
                                            border: `1px solid ${isSelected ? "#a78bfa" : "rgba(255,255,255,0.06)"}`,
                                            color: past ? "rgba(255,255,255,0.2)" : isSelected ? "#fff" : "#fff",
                                            fontWeight: isSelected ? 800 : 400, fontSize: "0.9rem", transition: "all 0.2s",
                                        }}
                                    >{day}</button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Time Slots Grid */}
                    {selectedDate && (
                        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "24px", padding: "2rem" }}>
                            <h3 style={{ color: "#fff", margin: "0 0 1rem 0" }}>🕐 Horarios Disponibles — {selectedDate}</h3>
                            {loadingSlots ? (
                                <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}><div className={dashStyles["loading-spinner-premium"]} /></div>
                            ) : slots.length === 0 ? (
                                <p style={{ color: "#f59e0b", textAlign: "center", padding: "2rem" }}>😕 No hay horarios disponibles para esta fecha</p>
                            ) : (
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "0.75rem" }}>
                                    {slots.map(slot => (
                                        <button key={slot.start_time} onClick={() => setSelectedSlot(slot.start_time)} style={{
                                            padding: "0.8rem", borderRadius: "12px", cursor: "pointer", transition: "all 0.2s", textAlign: "center",
                                            background: selectedSlot === slot.start_time ? "linear-gradient(135deg, #10b981, #059669)" : "rgba(255,255,255,0.03)",
                                            border: `1px solid ${selectedSlot === slot.start_time ? "#10b981" : "rgba(255,255,255,0.08)"}`,
                                            color: "#fff", fontWeight: selectedSlot === slot.start_time ? 800 : 500,
                                        }}>
                                            {slot.start_time}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div style={{ display: "flex", gap: "1rem" }}>
                        <button className="btn btn-secondary" onClick={() => setStep(1)} style={{ flex: 1, borderRadius: "16px" }}>← Atrás</button>
                        <button className="btn btn-primary" disabled={!selectedDate || !selectedSlot} onClick={() => setStep(3)} style={{ flex: 2, borderRadius: "16px" }}>Siguiente → Confirmar</button>
                    </div>
                </div>
            )}

            {/* STEP 3: Confirmation */}
            {step === 3 && (
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "24px", padding: "2.5rem" }}>
                    <h3 style={{ color: "#fff", margin: "0 0 2rem 0", textAlign: "center", fontSize: "1.5rem" }}>✅ Confirma tu Cita</h3>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", maxWidth: "600px", margin: "0 auto" }}>
                        <div style={{ background: "rgba(139,92,246,0.08)", borderRadius: "16px", padding: "1.25rem" }}>
                            <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)" }}>🏥 Clínica</p>
                            <p style={{ margin: "0.3rem 0 0 0", color: "#fff", fontWeight: 700 }}>{clinic?.name}</p>
                        </div>
                        <div style={{ background: "rgba(16,185,129,0.08)", borderRadius: "16px", padding: "1.25rem" }}>
                            <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)" }}>🏷️ Servicio</p>
                            <p style={{ margin: "0.3rem 0 0 0", color: "#fff", fontWeight: 700 }}>{selectedServiceObj?.name}</p>
                            {selectedServiceObj?.price && <p style={{ margin: "0.2rem 0 0 0", color: "#10b981", fontWeight: 700 }}>${selectedServiceObj.price} MXN</p>}
                        </div>
                        <div style={{ background: "rgba(245,158,11,0.08)", borderRadius: "16px", padding: "1.25rem" }}>
                            <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)" }}>📅 Fecha</p>
                            <p style={{ margin: "0.3rem 0 0 0", color: "#fff", fontWeight: 700 }}>{new Date(selectedDate + "T12:00").toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}</p>
                        </div>
                        <div style={{ background: "rgba(59,130,246,0.08)", borderRadius: "16px", padding: "1.25rem" }}>
                            <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)" }}>🕐 Horario</p>
                            <p style={{ margin: "0.3rem 0 0 0", color: "#fff", fontWeight: 700 }}>{selectedSlot} hrs</p>
                        </div>
                        <div style={{ background: "rgba(236,72,153,0.08)", borderRadius: "16px", padding: "1.25rem" }}>
                            <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)" }}>🐾 Mascota</p>
                            <p style={{ margin: "0.3rem 0 0 0", color: "#fff", fontWeight: 700 }}>{pets.find(p => p.id === selectedPet)?.name || "—"}</p>
                        </div>
                        <div style={{ background: "rgba(139,92,246,0.08)", borderRadius: "16px", padding: "1.25rem" }}>
                            <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)" }}>⏱️ Duración</p>
                            <p style={{ margin: "0.3rem 0 0 0", color: "#fff", fontWeight: 700 }}>{selectedServiceObj?.duration_minutes || 30} min</p>
                        </div>
                    </div>

                    <div style={{ maxWidth: "600px", margin: "1.5rem auto 0 auto" }}>
                        <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>📝 Notas adicionales (opcional)</label>
                        <textarea className="form-input" rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ej: Mi gato es nervioso, prefiere consultas tranquilas..." style={{ marginTop: "0.5rem" }} />
                    </div>

                    <div style={{ display: "flex", gap: "1rem", maxWidth: "600px", margin: "2rem auto 0 auto" }}>
                        <button className="btn btn-secondary" onClick={() => setStep(2)} style={{ flex: 1, borderRadius: "16px" }}>← Atrás</button>
                        <button className="btn btn-primary" onClick={handleBook} disabled={booking} style={{ flex: 2, borderRadius: "16px", padding: "1rem", fontSize: "1.05rem", background: "linear-gradient(135deg, #10b981, #059669)" }}>
                            {booking ? "Agendando..." : "🎉 Confirmar y Agendar Cita"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
