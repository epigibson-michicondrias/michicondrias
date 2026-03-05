"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getPetById, Pet } from "@/lib/services/mascotas";
import { getRecordsByPet, getVaccinesByPet, createRecord, createVaccine, MedicalRecord, Vaccine } from "@/lib/services/carnet";
import { getCurrentUser, User, hasRole } from "@/lib/auth";
import dashStyles from "../../dashboard.module.css";
import styles from "./expediente.module.css";
import petStyles from "../../mascotas/mascotas.module.css";
import { toast } from "react-hot-toast";

export default function PetMedicalRecordPage(props: { params: Promise<{ pet_id: string }> }) {
    const router = useRouter();
    const { pet_id } = React.use(props.params);

    const [loading, setLoading] = useState(true);
    const [pet, setPet] = useState<Pet | null>(null);
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [vaccines, setVaccines] = useState<Vaccine[]>([]);
    const [user, setUser] = useState<User | null>(null);

    const [activeTab, setActiveTab] = useState<"consultas" | "vacunas">("consultas");
    const [isVet, setIsVet] = useState(false);

    // Modals
    const [showRecordModal, setShowRecordModal] = useState(false);
    const [showVaccineModal, setShowVaccineModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [recordForm, setRecordForm] = useState({ reason_for_visit: "", diagnosis: "", treatment: "", weight_kg: "", notes: "" });
    const [vaccineForm, setVaccineForm] = useState({ name: "", next_due_date: "", batch_number: "", notes: "" });
    const [prescriptionsForm, setPrescriptionsForm] = useState<{
        medication_name: string;
        dosage: string;
        frequency_hours: number;
        duration_days: number;
        instructions: string;
    }[]>([]);

    useEffect(() => {
        async function loadData() {
            try {
                const u = await getCurrentUser();
                setUser(u);
                setIsVet(hasRole("veterinario") || hasRole("admin"));

                const petData = await getPetById(pet_id);
                setPet(petData);

                const [recs, vacs] = await Promise.all([
                    getRecordsByPet(pet_id),
                    getVaccinesByPet(pet_id)
                ]);

                // Sort by date desc
                setRecords(recs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                setVaccines(vacs.sort((a, b) => new Date(b.date_administered).getTime() - new Date(a.date_administered).getTime()));

            } catch (err) {
                console.error("Error loading medical record", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [pet_id]);

    const handleCreateRecord = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const added = await createRecord({
                pet_id,
                reason_for_visit: recordForm.reason_for_visit,
                diagnosis: recordForm.diagnosis,
                treatment: recordForm.treatment,
                notes: recordForm.notes,
                weight_kg: recordForm.weight_kg ? parseFloat(recordForm.weight_kg) : undefined,
                prescriptions: prescriptionsForm,
            });
            setRecords([added, ...records]);
            setShowRecordModal(false);
            setRecordForm({ reason_for_visit: "", diagnosis: "", treatment: "", weight_kg: "", notes: "" });
            setPrescriptionsForm([]);
            toast.success("Consulta agregada al expediente");
        } catch (error: any) {
            toast.error(error.message || "Error al añadir consulta");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreateVaccine = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const added = await createVaccine({
                pet_id,
                administered_by_vet_id: user?.id || null,
                name: vaccineForm.name,
                next_due_date: vaccineForm.next_due_date || null,
                batch_number: vaccineForm.batch_number,
                notes: vaccineForm.notes
            });
            setVaccines([added, ...vaccines]);
            setShowVaccineModal(false);
            setVaccineForm({ name: "", next_due_date: "", batch_number: "", notes: "" });
            toast.success("Vacuna registrada en el expediente");
        } catch (error: any) {
            toast.error(error.message || "Error al añadir vacuna");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className={dashStyles["loading-container"]}><p className={dashStyles["loading-text"]}>Sincronizando Expediente Clínico...</p></div>;
    }

    if (!pet) {
        return (
            <div className={dashStyles["empty-state"]}>
                <span style={{ fontSize: "5rem", display: "block", marginBottom: "1.5rem" }}>📡</span>
                <h3 style={{ color: "#fff", fontSize: "1.5rem", fontWeight: "800" }}>Error de Sincronización</h3>
                <p style={{ color: "var(--text-secondary)" }}>No se pudo recuperar el historial médico digital del paciente.</p>
                <button onClick={() => router.push("/dashboard/carnet")} className="btn btn-secondary" style={{ marginTop: "2rem", borderRadius: "16px" }}>
                    Regresar al Carnet
                </button>
            </div>
        );
    }

    const isOwner = user?.id === pet.owner_id;

    return (
        <div className={styles["record-container"]}>
            <div className={dashStyles["page-header"]}>
                <h1 className={dashStyles["page-title"]}>
                    <button
                        onClick={() => router.back()}
                        className={dashStyles["back-button-premium"]}
                        title="Volver"
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </button>
                    Expediente Clínico
                </h1>
                <p className={dashStyles["page-subtitle"]}>Historial médico integral de <strong>{pet.name}</strong></p>
            </div>

            {/* Action Bar / Patient ID */}
            <div className={styles["action-bar"]}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className={styles["medical-tag"]}>PATIENT_ID</div>
                    <code style={{ color: "var(--primary-light)", fontSize: "0.9rem", letterSpacing: "0.1em" }}>{pet.id}</code>
                </div>
                {!isOwner && isVet && (
                    <div className={styles["status-badge"]} style={{ background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                        ⚕️ MODO CLÍNICO EXTERNO
                    </div>
                )}
            </div>

            <div className={styles["layout-grid"]}>
                {/* Left pane: Clinical Sidebar */}
                <aside className={styles["left-pane"]}>
                    <div className={styles["pet-avatar-large"]}>
                        {pet.photo_url ? (
                            <Image
                                src={pet.photo_url}
                                alt={pet.name}
                                fill
                                style={{ objectFit: 'cover' }}
                            />
                        ) : (
                            pet.species === "Perro" ? "🐕" : pet.species === "Gato" ? "🐈" : "🐾"
                        )}
                    </div>
                    <h2 className={styles["pet-name"]}>{pet.name}</h2>
                    <p className={styles["pet-breed"]}>{pet.breed || pet.species}</p>

                    <div className={styles["pet-stats-grid"]}>
                        <div className={styles["pet-stat"]}>
                            <span>Especie</span>
                            <strong>{pet.species}</strong>
                        </div>
                        <div className={styles["pet-stat"]}>
                            <span>Edad</span>
                            <strong>{pet.age_months ? `${Math.floor(pet.age_months / 12)}a ${pet.age_months % 12}m` : "N/A"}</strong>
                        </div>
                        <div className={styles["pet-stat"]}>
                            <span>Peso Actual</span>
                            <strong>{pet.weight_kg ? `${pet.weight_kg} kg` : "--"}</strong>
                        </div>
                    </div>

                    <div className={styles["health-status-list"]}>
                        <div className={`${styles["health-badge"]} ${pet.is_vaccinated ? styles["badge-success"] : styles["badge-warning"]}`}>
                            <span>💉 Vacunación</span>
                            <span>{pet.is_vaccinated ? "AL DÍA" : "PENDIENTE"}</span>
                        </div>
                        <div className={`${styles["health-badge"]} ${pet.is_sterilized ? styles["badge-success"] : styles["badge-warning"]}`}>
                            <span>✂️ Esterilización</span>
                            <span>{pet.is_sterilized ? "SÍ" : "NO"}</span>
                        </div>
                    </div>

                    {pet.temperament && (
                        <div className={styles["diagnosis-box"]} style={{ textAlign: 'left', marginTop: '0' }}>
                            <strong>PERFIL DE TEMPERAMENTO</strong>
                            <p style={{ margin: 0, fontSize: "0.95rem", color: "#fff", fontStyle: "italic" }}>"{pet.temperament}"</p>
                        </div>
                    )}

                    {/* Clinical Summary */}
                    <div style={{
                        background: "rgba(124, 58, 237, 0.05)",
                        border: "1px solid rgba(124, 58, 237, 0.15)",
                        borderRadius: "16px",
                        padding: "1.25rem",
                        marginTop: "0.5rem"
                    }}>
                        <strong style={{ color: "#a78bfa", fontSize: "0.8rem", letterSpacing: "0.1em", display: "block", marginBottom: "0.75rem" }}>📊 RESUMEN CLÍNICO</strong>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                            <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: "10px", padding: "0.6rem", textAlign: "center" }}>
                                <span style={{ fontSize: "1.3rem", fontWeight: 800, color: "#fff", display: "block" }}>{records.length}</span>
                                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Consultas</span>
                            </div>
                            <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: "10px", padding: "0.6rem", textAlign: "center" }}>
                                <span style={{ fontSize: "1.3rem", fontWeight: 800, color: "#fff", display: "block" }}>{vaccines.length}</span>
                                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Vacunas</span>
                            </div>
                        </div>
                        {records.length > 0 && (
                            <p style={{ margin: "0.75rem 0 0 0", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                                Última visita: <strong style={{ color: "#fff" }}>{new Date(records[0].date).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}</strong>
                            </p>
                        )}
                        {vaccines.length > 0 && (() => {
                            const upcoming = vaccines.filter(v => v.next_due_date && new Date(v.next_due_date) > new Date()).sort((a, b) => new Date(a.next_due_date!).getTime() - new Date(b.next_due_date!).getTime());
                            if (upcoming.length > 0) {
                                return (
                                    <p style={{ margin: "0.4rem 0 0 0", fontSize: "0.8rem", color: "#fbbf24" }}>
                                        ⏰ Próxima: <strong>{upcoming[0].name}</strong> el {new Date(upcoming[0].next_due_date!).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                                    </p>
                                );
                            }
                            return null;
                        })()}
                    </div>

                    {/* Weight Sparkline */}
                    {(() => {
                        const weights = records.filter(r => r.weight_kg).map(r => ({ date: r.date, weight: r.weight_kg! })).reverse();
                        if (weights.length < 2) return null;
                        const minW = Math.min(...weights.map(w => w.weight));
                        const maxW = Math.max(...weights.map(w => w.weight));
                        const range = maxW - minW || 1;
                        const svgW = 200;
                        const svgH = 60;
                        const pad = 4;
                        const points = weights.map((w, i) => {
                            const x = pad + (i / (weights.length - 1)) * (svgW - pad * 2);
                            const y = svgH - pad - ((w.weight - minW) / range) * (svgH - pad * 2);
                            return `${x},${y}`;
                        });
                        const linePath = `M ${points.join(" L ")}`;
                        const areaPath = `${linePath} L ${pad + ((weights.length - 1) / (weights.length - 1)) * (svgW - pad * 2)},${svgH - pad} L ${pad},${svgH - pad} Z`;
                        return (
                            <div style={{ marginTop: "0.5rem", background: "rgba(0,0,0,0.15)", borderRadius: "14px", padding: "1rem" }}>
                                <strong style={{ color: "var(--text-secondary)", fontSize: "0.75rem", letterSpacing: "0.1em", display: "block", marginBottom: "0.5rem" }}>⚖️ EVOLUCIÓN DE PESO</strong>
                                <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: "100%", height: "60px" }}>
                                    <defs>
                                        <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                                            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    <path d={areaPath} fill="url(#weightGrad)" />
                                    <path d={linePath} fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    {weights.map((w, i) => {
                                        const x = pad + (i / (weights.length - 1)) * (svgW - pad * 2);
                                        const y = svgH - pad - ((w.weight - minW) / range) * (svgH - pad * 2);
                                        return <circle key={i} cx={x} cy={y} r="3" fill="#06b6d4" stroke="#0f0f1a" strokeWidth="1.5" />;
                                    })}
                                </svg>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>
                                    <span>{weights[0].weight} kg</span>
                                    <span>{weights[weights.length - 1].weight} kg</span>
                                </div>
                            </div>
                        );
                    })()}
                </aside>

                {/* Right pane: Clinical Content */}
                <main className={styles["right-pane"]}>
                    <nav className={styles["tabs-container"]}>
                        <button
                            className={`${styles.tab} ${activeTab === "consultas" ? styles["tab-active"] : ""}`}
                            onClick={() => setActiveTab("consultas")}
                        >
                            🩺 Consultas
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === "vacunas" ? styles["tab-active"] : ""}`}
                            onClick={() => setActiveTab("vacunas")}
                        >
                            💉 Vacunas
                        </button>
                    </nav>

                    <div className={styles["tab-content"]}>
                        {activeTab === "consultas" ? (
                            <div className={styles.container}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                                    <h3 style={{ color: "#fff", margin: 0, fontSize: "1.5rem", fontWeight: 800 }}>Línea de Tiempo Médica</h3>
                                    {isVet && (
                                        <button className={petStyles["btn-premium"]} onClick={() => setShowRecordModal(true)}>
                                            ✨ Nueva Consulta
                                        </button>
                                    )}
                                </div>

                                {records.length === 0 ? (
                                    <div className={styles["empty-list"]}>
                                        <span style={{ fontSize: "3rem", display: "block", marginBottom: "1rem" }}>📝</span>
                                        No hay registros de consultas médicas previos.
                                    </div>
                                ) : (
                                    <div className={styles["timeline"]}>
                                        {records.map(record => (
                                            <div key={record.id} className={styles["timeline-item"]}>
                                                <div className={styles["timeline-date"]}>
                                                    <span className={styles["date-day"]}>{new Date(record.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}</span>
                                                    <span className={styles["date-year"]}>{new Date(record.date).getFullYear()}</span>
                                                </div>
                                                <div className={styles["timeline-content"]}>
                                                    <h4>{record.reason_for_visit}</h4>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                        <span className={styles["medical-tag"]}>🩺 CONSULTA</span>
                                                        {record.weight_kg && <span className={styles["medical-tag"]} style={{ background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' }}>⚖️ {record.weight_kg} kg</span>}
                                                        {record.temperature_c && <span className={styles["medical-tag"]} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>🌡️ {record.temperature_c} °C</span>}
                                                    </div>

                                                    {record.diagnosis && (
                                                        <div className={styles["diagnosis-box"]}>
                                                            <strong>DIAGNÓSTICO CLÍNICO</strong>
                                                            <p style={{ margin: 0 }}>{record.diagnosis}</p>
                                                        </div>
                                                    )}

                                                    {record.treatment && (
                                                        <div className={styles["treatment-box"]}>
                                                            <strong>TRATAMIENTO Y RECETA</strong>
                                                            <p style={{ margin: 0 }}>{record.treatment}</p>
                                                        </div>
                                                    )}

                                                    {record.notes && (
                                                        <p style={{ marginTop: '1.25rem', fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                                            {record.notes}
                                                        </p>
                                                    )}
                                                </div>

                                                {record.prescriptions && record.prescriptions.length > 0 && (
                                                    <div style={{ marginTop: "1.5rem" }}>
                                                        <h5 style={{ margin: "0 0 0.8rem 0", color: "#10b981", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>💊 Receta Digital</h5>
                                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1rem" }}>
                                                            {record.prescriptions.map((p, pIdx) => (
                                                                <div key={pIdx} style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: "12px", padding: "1rem" }}>
                                                                    <strong style={{ display: "block", color: "#fff", marginBottom: "0.5rem" }}>{p.medication_name}</strong>
                                                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                                                                        <span><span style={{ color: "#34d399" }}>Dosis:</span> {p.dosage}</span>
                                                                        <span><span style={{ color: "#34d399" }}>Frecuencia:</span> Cada {p.frequency_hours} horas</span>
                                                                        <span><span style={{ color: "#34d399" }}>Duración:</span> {p.duration_days} días</span>
                                                                        {p.instructions && <span style={{ marginTop: "0.3rem", background: "rgba(0,0,0,0.2)", padding: "0.4rem", borderRadius: "6px" }}>📝 {p.instructions}</span>}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <p style={{ margin: "1rem 0 0 0", fontSize: "0.75rem", color: "#6b7280", textAlign: "right", fontStyle: "italic" }}>
                                                            ⏰ Las alarmas se han programado automáticamente.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className={styles.container}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                                    <h3 style={{ color: "#fff", margin: 0, fontSize: "1.5rem", fontWeight: 800 }}>Esquema de Vacunación</h3>
                                    {isVet && (
                                        <button className={petStyles["btn-premium"]} style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }} onClick={() => setShowVaccineModal(true)}>
                                            💉 Aplicar Vacuna
                                        </button>
                                    )}
                                </div>

                                {vaccines.length === 0 ? (
                                    <div className={styles["empty-list"]}>
                                        <span style={{ fontSize: "3rem", display: "block", marginBottom: "1rem" }}>💉</span>
                                        No hay registros de inmunización para este paciente.
                                    </div>
                                ) : (
                                    <div className={styles["vaccines-grid"]}>
                                        {vaccines.map(vaccine => {
                                            const isDue = vaccine.next_due_date && new Date(vaccine.next_due_date) < new Date();
                                            return (
                                                <div key={vaccine.id} className={`${styles["vaccine-card"]} ${isDue ? styles["vaccine-due"] : ""}`}>
                                                    <h4 className={styles["vaccine-name"]}>{vaccine.name}</h4>

                                                    <div className={styles["vaccine-info-row"]}>
                                                        <span>Fecha Aplicación:</span>
                                                        <strong>{new Date(vaccine.date_administered).toLocaleDateString()}</strong>
                                                    </div>

                                                    {vaccine.next_due_date && (
                                                        <div className={styles["vaccine-info-row"]}>
                                                            <span style={{ color: isDue ? '#ef4444' : 'inherit' }}>Próxima Dosis:</span>
                                                            <strong style={{ color: isDue ? '#ef4444' : '#10b981' }}>{new Date(vaccine.next_due_date).toLocaleDateString()}</strong>
                                                        </div>
                                                    )}

                                                    <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span className={`${styles["status-badge"]} ${isDue ? styles["status-expired"] : styles["status-valid"]}`}>
                                                            {isDue ? "EXPIRADA" : "ACTIVA"}
                                                        </span>
                                                        {vaccine.batch_number && <code style={{ fontSize: '0.7rem', opacity: 0.5 }}>#{vaccine.batch_number}</code>}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Modals for Vet usage */}
            {showRecordModal && (
                <div className={petStyles["modal-overlay"]}>
                    <div className={petStyles["modal-content"]} style={{ maxWidth: '650px' }}>
                        <div className={petStyles["modal-header"]}>
                            <h2 className={petStyles["modal-title"]}>👨‍⚕️ Registro de Consulta Profesional</h2>
                            <button onClick={() => setShowRecordModal(false)} style={{ background: "transparent", border: "none", color: "#fff", fontSize: "2rem", cursor: "pointer" }}>&times;</button>
                        </div>
                        <form onSubmit={handleCreateRecord} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                            <div className={petStyles["form-section"]}>
                                <div>
                                    <label>Motivo de la visita *</label>
                                    <input type="text" className="form-input" required value={recordForm.reason_for_visit} onChange={e => setRecordForm({ ...recordForm, reason_for_visit: e.target.value })} placeholder="Ej. Revisión trimestral, Alergia cutánea..." />
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
                                    <div>
                                        <label>Peso (kg)</label>
                                        <input type="number" step="0.01" className="form-input" value={recordForm.weight_kg} onChange={e => setRecordForm({ ...recordForm, weight_kg: e.target.value })} />
                                    </div>
                                    <div>
                                        <label>Notas Internas</label>
                                        <input type="text" className="form-input" value={recordForm.notes} onChange={e => setRecordForm({ ...recordForm, notes: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            <div className={petStyles["form-section"]}>
                                <div>
                                    <label>Diagnóstico</label>
                                    <textarea className="form-input" rows={3} value={recordForm.diagnosis} onChange={e => setRecordForm({ ...recordForm, diagnosis: e.target.value })} placeholder="Escribe el diagnóstico profesional..."></textarea>
                                </div>
                                <div style={{ marginTop: "1rem" }}>
                                    <label>Tratamiento General</label>
                                    <textarea className="form-input" rows={3} value={recordForm.treatment} onChange={e => setRecordForm({ ...recordForm, treatment: e.target.value })} placeholder="Pasos a seguir o recomendaciones..."></textarea>
                                </div>

                                <div style={{ marginTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1rem" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                                        <h4 style={{ margin: 0, color: "#10b981", fontSize: "1.1rem" }}>💊 Recetas Digitales</h4>
                                        <button
                                            type="button"
                                            onClick={() => setPrescriptionsForm([...prescriptionsForm, { medication_name: "", dosage: "", frequency_hours: 8, duration_days: 5, instructions: "" }])}
                                            style={{ background: "rgba(16,185,129,0.2)", color: "#34d399", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "6px", padding: "0.4rem 0.8rem", cursor: "pointer", fontSize: "0.85rem" }}
                                        >
                                            + Agregar Medicamento
                                        </button>
                                    </div>

                                    {prescriptionsForm.length === 0 ? (
                                        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", textAlign: "center", fontStyle: "italic" }}>No se han agregado medicamentos.</p>
                                    ) : (
                                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                            {prescriptionsForm.map((p, idx) => (
                                                <div key={idx} style={{ background: "rgba(0,0,0,0.2)", padding: "1rem", borderRadius: "8px", position: "relative" }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => setPrescriptionsForm(prescriptionsForm.filter((_, i) => i !== idx))}
                                                        style={{ position: "absolute", top: "10px", right: "10px", background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "1.2rem" }}
                                                    >
                                                        &times;
                                                    </button>
                                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "0.8rem" }}>
                                                        <div>
                                                            <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Medicamento *</label>
                                                            <input type="text" className="form-input" required value={p.medication_name} onChange={e => { const newP = [...prescriptionsForm]; newP[idx].medication_name = e.target.value; setPrescriptionsForm(newP); }} placeholder="Ej: Paracetamol" />
                                                        </div>
                                                        <div>
                                                            <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Dosis *</label>
                                                            <input type="text" className="form-input" required value={p.dosage} onChange={e => { const newP = [...prescriptionsForm]; newP[idx].dosage = e.target.value; setPrescriptionsForm(newP); }} placeholder="Ej: 1 tableta" />
                                                        </div>
                                                    </div>
                                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "0.8rem" }}>
                                                        <div>
                                                            <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Cada cuántas horas *</label>
                                                            <input type="number" min="1" className="form-input" required value={p.frequency_hours} onChange={e => { const newP = [...prescriptionsForm]; newP[idx].frequency_hours = parseInt(e.target.value); setPrescriptionsForm(newP); }} />
                                                        </div>
                                                        <div>
                                                            <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Por cuántos días *</label>
                                                            <input type="number" min="1" className="form-input" required value={p.duration_days} onChange={e => { const newP = [...prescriptionsForm]; newP[idx].duration_days = parseInt(e.target.value); setPrescriptionsForm(newP); }} />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Indicaciones adicionales</label>
                                                        <input type="text" className="form-input" value={p.instructions} onChange={e => { const newP = [...prescriptionsForm]; newP[idx].instructions = e.target.value; setPrescriptionsForm(newP); }} placeholder="Ej: Dar con alimento" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                                <button type="button" className="btn btn-secondary" style={{ flex: 1, borderRadius: '16px' }} onClick={() => setShowRecordModal(false)}>Cancelar</button>
                                <button type="submit" className={petStyles["btn-premium"]} style={{ flex: 1 }} disabled={submitting}>{submitting ? "Procesando..." : "Finalizar y Guardar"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showVaccineModal && (
                <div className={petStyles["modal-overlay"]}>
                    <div className={petStyles["modal-content"]} style={{ maxWidth: '550px' }}>
                        <div className={petStyles["modal-header"]}>
                            <h2 className={petStyles["modal-title"]}>💉 Inmunización del Paciente</h2>
                            <button onClick={() => setShowVaccineModal(false)} style={{ background: "transparent", border: "none", color: "#fff", fontSize: "2rem", cursor: "pointer" }}>&times;</button>
                        </div>
                        <form onSubmit={handleCreateVaccine} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                            <div className={petStyles["form-section"]}>
                                <div>
                                    <label>Nombre de la Vacuna *</label>
                                    <input type="text" className="form-input" required value={vaccineForm.name} onChange={e => setVaccineForm({ ...vaccineForm, name: e.target.value })} placeholder="Ej. Quíntuple Canina, Rabia..." />
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
                                    <div>
                                        <label>Próxima Dosis</label>
                                        <input type="date" className="form-input" value={vaccineForm.next_due_date} onChange={e => setVaccineForm({ ...vaccineForm, next_due_date: e.target.value })} />
                                    </div>
                                    <div>
                                        <label>Lote / Folio</label>
                                        <input type="text" className="form-input" value={vaccineForm.batch_number} onChange={e => setVaccineForm({ ...vaccineForm, batch_number: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label>Observaciones</label>
                                <textarea className="form-input" rows={2} value={vaccineForm.notes} onChange={e => setVaccineForm({ ...vaccineForm, notes: e.target.value })}></textarea>
                            </div>
                            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                                <button type="button" className="btn btn-secondary" style={{ flex: 1, borderRadius: '16px' }} onClick={() => setShowVaccineModal(false)}>Cancelar</button>
                                <button type="submit" className={petStyles["btn-premium"]} style={{ flex: 1, background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }} disabled={submitting}>{submitting ? "Registrando..." : "Registrar Aplicación"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
