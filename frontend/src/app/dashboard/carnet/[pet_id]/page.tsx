"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPetById, Pet } from "@/lib/services/mascotas";
import { getRecordsByPet, getVaccinesByPet, createRecord, createVaccine, MedicalRecord, Vaccine } from "@/lib/services/carnet";
import { getCurrentUser, User, hasRole } from "@/lib/auth";
import dashStyles from "../../dashboard.module.css";
import styles from "./expediente.module.css";
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
                veterinarian_id: user?.id || null,
                clinic_id: null, // Depending on future scope we can attach clinic_id
                reason_for_visit: recordForm.reason_for_visit,
                diagnosis: recordForm.diagnosis,
                treatment: recordForm.treatment,
                notes: recordForm.notes,
                weight_kg: recordForm.weight_kg ? parseFloat(recordForm.weight_kg) : null,
            });
            setRecords([added, ...records]);
            setShowRecordModal(false);
            setRecordForm({ reason_for_visit: "", diagnosis: "", treatment: "", weight_kg: "", notes: "" });
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
        return <div className={dashStyles["page-header"]}><h1 className={dashStyles["page-title"]}>Cargando Expediente...</h1></div>;
    }

    if (!pet) {
        return (
            <div className={dashStyles["empty-state"]}>
                <span style={{ fontSize: "4rem" }}>😢</span>
                <p>No pudimos encontrar el expediente de esta mascota.</p>
                <button onClick={() => router.push("/dashboard/carnet")} className="btn btn-secondary" style={{ marginTop: "1rem" }}>
                    Volver
                </button>
            </div>
        );
    }

    // Checking if user is Owner
    const isOwner = user?.id === pet.owner_id;

    return (
        <div className={styles["record-container"]}>
            <div className={dashStyles["page-header"]} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                    <h1 className={dashStyles["page-title"]}>
                        <button onClick={() => router.back()} style={{ background: "transparent", border: "none", color: "var(--primary-light)", cursor: "pointer", fontSize: "1.2rem", marginRight: "10px" }}>←</button>
                        Expediente de {pet.name}
                    </h1>
                    <p className={dashStyles["page-subtitle"]}>ID del Paciente: <span style={{ fontFamily: "monospace", opacity: 0.8 }}>{pet.id}</span></p>
                </div>
            </div>

            <div className={styles["layout-grid"]}>
                {/* Left pane: Pet Details */}
                <div className={styles["left-pane"]}>
                    <div className={styles["pet-avatar-large"]}>
                        {pet.species === "Perro" ? "🐶" : pet.species === "Gato" ? "🐱" : "🐾"}
                    </div>
                    <h2 className={styles["pet-name"]}>{pet.name}</h2>
                    <p className={styles["pet-breed"]}>{pet.breed || pet.species}</p>

                    <div className={styles["pet-stats-grid"]}>
                        <div className={styles["pet-stat"]}>
                            <span>Especie</span>
                            <strong>{pet.species}</strong>
                        </div>
                        <div className={styles["pet-stat"]}>
                            <span>Edad Estimada</span>
                            <strong>{pet.age_months ? `${Math.floor(pet.age_months / 12)}a ${pet.age_months % 12}m` : "No registrada"}</strong>
                        </div>
                        <div className={styles["pet-stat"]}>
                            <span>Tamaño</span>
                            <strong>{pet.size || "Mediano"}</strong>
                        </div>
                    </div>

                    {!isOwner && isVet && (
                        <div style={{ marginTop: "1.5rem", padding: "1rem", background: "rgba(124, 58, 237, 0.1)", borderRadius: "var(--radius-sm)", border: "1px solid rgba(124, 58, 237, 0.2)", fontSize: "0.85rem", color: "var(--primary-light)" }}>
                            <strong>Atención Médica Externa</strong><br />
                            Estás visualizando el carnet de un paciente que no es tuyo bajo el rol de veterinario.
                            Puedes registrar nuevas interacciones médicas debajo.
                        </div>
                    )}
                </div>

                {/* Right pane: Medical History */}
                <div className={styles["right-pane"]}>
                    <div className={styles["tabs-container"]}>
                        <button
                            className={`${styles.tab} ${activeTab === "consultas" ? styles["tab-active"] : ""}`}
                            onClick={() => setActiveTab("consultas")}
                        >
                            🩺 Consultas y Tratamientos
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === "vacunas" ? styles["tab-active"] : ""}`}
                            onClick={() => setActiveTab("vacunas")}
                        >
                            💉 Historial de Vacunación
                        </button>
                    </div>

                    <div className={styles["tab-content"]}>
                        {activeTab === "consultas" ? (
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                                    <h3 style={{ color: "#fff", margin: 0 }}>Historial Médico</h3>
                                    {isVet && (
                                        <button className="btn btn-primary" onClick={() => setShowRecordModal(true)} style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
                                            + Registrar Consulta
                                        </button>
                                    )}
                                </div>

                                {records.length === 0 ? (
                                    <div className={styles["empty-list"]}>Sin consultas registradas.</div>
                                ) : (
                                    <div className={styles["timeline"]}>
                                        {records.map(record => (
                                            <div key={record.id} className={styles["timeline-item"]}>
                                                <div className={styles["timeline-date"]}>
                                                    {new Date(record.date).toLocaleDateString()}
                                                </div>
                                                <div className={styles["timeline-content"]}>
                                                    <h4 style={{ margin: "0 0 0.5rem 0", color: "#fff" }}>{record.reason_for_visit}</h4>
                                                    {record.weight_kg && <span style={{ fontSize: "0.8rem", background: "rgba(255,255,255,0.1)", padding: "0.2rem 0.5rem", borderRadius: "4px", marginRight: "0.5rem" }}>⚖️ {record.weight_kg} kg</span>}
                                                    {record.diagnosis && <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}><strong>Diagnóstico:</strong> {record.diagnosis}</p>}
                                                    {record.treatment && <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}><strong>Tratamiento:</strong> {record.treatment}</p>}
                                                    {record.notes && <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontStyle: "italic", marginTop: "0.5rem" }}>{record.notes}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                                    <h3 style={{ color: "#fff", margin: 0 }}>Esquema de Vacunación</h3>
                                    {isVet && (
                                        <button className="btn btn-secondary" onClick={() => setShowVaccineModal(true)} style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
                                            + Registrar Vacuna
                                        </button>
                                    )}
                                </div>

                                {vaccines.length === 0 ? (
                                    <div className={styles["empty-list"]}>Sin historial de vacunación.</div>
                                ) : (
                                    <div className={styles["vaccines-grid"]}>
                                        {vaccines.map(vaccine => {
                                            const isDue = vaccine.next_due_date && new Date(vaccine.next_due_date) < new Date();
                                            return (
                                                <div key={vaccine.id} className={`${styles["vaccine-card"]} ${isDue ? styles["vaccine-due"] : ""}`}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                                        <h4 style={{ margin: "0 0 0.5rem 0", color: "#fff" }}>🧬 {vaccine.name}</h4>
                                                        {isDue && <span className={styles["badge-danger"]}>Expirada</span>}
                                                    </div>
                                                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: "0 0 0.25rem 0" }}>
                                                        <strong>Aplicada:</strong> {new Date(vaccine.date_administered).toLocaleDateString()}
                                                    </p>
                                                    {vaccine.next_due_date && (
                                                        <p style={{ fontSize: "0.85rem", color: isDue ? "#ef4444" : "var(--primary-light)", margin: 0 }}>
                                                            <strong>Próxima Dosis:</strong> {new Date(vaccine.next_due_date).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                    {vaccine.batch_number && (
                                                        <div style={{ marginTop: "0.75rem", fontSize: "0.75rem", fontFamily: "monospace", color: "var(--text-secondary)" }}>
                                                            Lote: {vaccine.batch_number}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals for Vet usage */}
            {showRecordModal && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
                    <div style={{ background: "var(--bg-glass)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", padding: "2rem", width: "100%", maxWidth: "550px", maxHeight: "90vh", overflowY: "auto" }}>
                        <h2 style={{ fontSize: "1.5rem", marginBottom: "1.5rem", color: "#fff" }}>Registrar Consulta Médica</h2>
                        <form onSubmit={handleCreateRecord} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div>
                                <label>Motivo de la visita *</label>
                                <input type="text" className="form-input" required value={recordForm.reason_for_visit} onChange={e => setRecordForm({ ...recordForm, reason_for_visit: e.target.value })} placeholder="Ej. Revisión general, Cojera, Dolor..." />
                            </div>
                            <div>
                                <label>Diagnóstico</label>
                                <textarea className="form-input" rows={2} value={recordForm.diagnosis} onChange={e => setRecordForm({ ...recordForm, diagnosis: e.target.value })}></textarea>
                            </div>
                            <div>
                                <label>Tratamiento / Receta</label>
                                <textarea className="form-input" rows={2} value={recordForm.treatment} onChange={e => setRecordForm({ ...recordForm, treatment: e.target.value })}></textarea>
                            </div>
                            <div style={{ display: "flex", gap: "1rem" }}>
                                <div style={{ flex: 1 }}>
                                    <label>Peso (kg)</label>
                                    <input type="number" step="0.01" className="form-input" value={recordForm.weight_kg} onChange={e => setRecordForm({ ...recordForm, weight_kg: e.target.value })} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label>Notas Privadas / Internas</label>
                                    <input type="text" className="form-input" value={recordForm.notes} onChange={e => setRecordForm({ ...recordForm, notes: e.target.value })} />
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowRecordModal(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>{submitting ? "Guardando..." : "Guardar Historial"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showVaccineModal && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
                    <div style={{ background: "var(--bg-glass)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", padding: "2rem", width: "100%", maxWidth: "550px" }}>
                        <h2 style={{ fontSize: "1.5rem", marginBottom: "1.5rem", color: "#fff" }}>Aplicar Vacuna</h2>
                        <form onSubmit={handleCreateVaccine} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div>
                                <label>Nombre Comercial / Tipo de Vacuna *</label>
                                <input type="text" className="form-input" required value={vaccineForm.name} onChange={e => setVaccineForm({ ...vaccineForm, name: e.target.value })} placeholder="Ej. Rabia, Múltiple Canina..." />
                            </div>
                            <div style={{ display: "flex", gap: "1rem" }}>
                                <div style={{ flex: 1 }}>
                                    <label>Fecha de Próxima Dosis</label>
                                    <input type="date" className="form-input" value={vaccineForm.next_due_date} onChange={e => setVaccineForm({ ...vaccineForm, next_due_date: e.target.value })} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label>Número de Lote / Sticker</label>
                                    <input type="text" className="form-input" value={vaccineForm.batch_number} onChange={e => setVaccineForm({ ...vaccineForm, batch_number: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label>Notas Adicionales</label>
                                <textarea className="form-input" rows={2} value={vaccineForm.notes} onChange={e => setVaccineForm({ ...vaccineForm, notes: e.target.value })}></textarea>
                            </div>
                            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowVaccineModal(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-secondary" style={{ flex: 1 }} disabled={submitting}>{submitting ? "Guardando..." : "Registrar Vacuna"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
