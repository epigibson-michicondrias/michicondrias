"use client";

import { useEffect, useState } from "react";
import { getReports, createReport, resolveReport, LostPetReport, LostPetReportCreate } from "@/lib/services/perdidas";
import { getCurrentUser, User } from "@/lib/auth";
import dashStyles from "../dashboard.module.css";
import modStyles from "../modules.module.css";
import styles from "./perdidas.module.css";
import { toast } from "react-hot-toast";

export default function PerdidasPage() {
    const [reports, setReports] = useState<LostPetReport[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const [filterType, setFilterType] = useState<"all" | "lost" | "found">("all");
    const [filterSpecies, setFilterSpecies] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState<LostPetReportCreate>({
        pet_name: "",
        species: "perro",
        breed: "",
        color: "",
        size: "mediano",
        age_approx: "",
        description: "",
        image_url: "",
        report_type: "lost",
        last_seen_location: "",
        contact_phone: "",
        contact_email: "",
    });

    useEffect(() => {
        async function load() {
            try {
                const u = await getCurrentUser();
                setCurrentUser(u);
                const data = await getReports();
                setReports(data);
            } catch (err) {
                console.error("Error al cargar reportes", err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const filtered = reports.filter(r => {
        const matchesType = filterType === "all" || r.report_type === filterType;
        const matchesSpecies = filterSpecies === "all" || r.species === filterSpecies;
        const matchesSearch = r.pet_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (r.last_seen_location?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
            (r.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
        return matchesType && matchesSpecies && matchesSearch;
    });

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const created = await createReport(formData);
            setReports([created, ...reports]);
            setShowModal(false);
            setFormData({
                pet_name: "", species: "perro", breed: "", color: "", size: "mediano",
                age_approx: "", description: "", image_url: "", report_type: "lost",
                last_seen_location: "", contact_phone: "", contact_email: "",
            });
            toast.success(formData.report_type === "lost"
                ? "🚨 Reporte de mascota perdida publicado"
                : "🎉 Reporte de mascota encontrada publicado"
            );
        } catch (error: any) {
            toast.error(error.message || "Error al crear reporte");
        } finally {
            setSubmitting(false);
        }
    };

    const handleResolve = async (reportId: string) => {
        try {
            const updated = await resolveReport(reportId);
            setReports(reports.map(r => r.id === reportId ? updated : r));
            toast.success("¡Reporte marcado como resuelto! 🎉");
        } catch (err: any) {
            toast.error(err.message || "Error al resolver reporte");
        }
    };

    const getTimeSince = (dateStr: string | null) => {
        if (!dateStr) return "Hace poco";
        const diff = Date.now() - new Date(dateStr).getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours < 1) return "Hace menos de 1 hora";
        if (hours < 24) return `Hace ${hours}h`;
        const days = Math.floor(hours / 24);
        return `Hace ${days} día${days > 1 ? 's' : ''}`;
    };

    return (
        <div className={styles.container}>
            <div className={dashStyles["page-header"]}>
                <h1 className={dashStyles["page-title"]}>🔍 Red de Mascotas Perdidas</h1>
                <p className={dashStyles["page-subtitle"]}>
                    Reporta una mascota perdida o encontrada. La comunidad Michicondrias te ayuda.
                </p>
            </div>

            {/* Stats Strip */}
            <div className={styles["stats-strip"]}>
                <div className={styles["stat-card"]}>
                    <span className={styles["stat-icon"]}>🚨</span>
                    <div>
                        <span className={styles["stat-value"]}>{reports.filter(r => r.report_type === "lost" && r.status === "active").length}</span>
                        <span className={styles["stat-label"]}>Perdidas Activas</span>
                    </div>
                </div>
                <div className={styles["stat-card"]}>
                    <span className={styles["stat-icon"]}>🐾</span>
                    <div>
                        <span className={styles["stat-value"]}>{reports.filter(r => r.report_type === "found" && r.status === "active").length}</span>
                        <span className={styles["stat-label"]}>Encontradas</span>
                    </div>
                </div>
                <div className={styles["stat-card"]}>
                    <span className={styles["stat-icon"]}>✅</span>
                    <div>
                        <span className={styles["stat-value"]}>{reports.filter(r => r.is_resolved).length}</span>
                        <span className={styles["stat-label"]}>Reunidos</span>
                    </div>
                </div>
            </div>

            {/* Michi-Tracker Premium Offer */}
            <div className={dashStyles["premium-banner"]} style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.15))', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '24px', padding: '2rem', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }}>
                <div style={{ flex: 1, minWidth: '300px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                        <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 10px #10b981', animation: 'pulse 2s infinite' }}></span>
                        Membresía Activa
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', marginBottom: '0.5rem', lineHeight: 1.1 }}>Michi-Tracker Pro</h2>
                    <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.05rem', lineHeight: 1.6, margin: 0 }}>No dependas solo de la suerte. Con nuestra membresía premium adquieres un collar GPS Inteligente para localizar a tu michi en tiempo real con precisión milimétrica.</p>
                </div>
                <div>
                    <button className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)', fontWeight: 800, border: 'none' }}>
                        Adquirir Collar GPS 📍
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className={modStyles["module-page__toolbar"]}>
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", flex: 1 }}>
                    <input
                        type="text"
                        placeholder="🔍 Buscar por nombre, ubicación..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="form-input"
                        style={{ flex: 2, minWidth: "200px" }}
                    />
                    <select
                        value={filterType}
                        onChange={e => setFilterType(e.target.value as "all" | "lost" | "found")}
                        className="form-input"
                        style={{ flex: 1, minWidth: "130px" }}
                    >
                        <option value="all">Todos los Reportes</option>
                        <option value="lost">🚨 Perdidas</option>
                        <option value="found">🐾 Encontradas</option>
                    </select>
                    <select
                        value={filterSpecies}
                        onChange={e => setFilterSpecies(e.target.value)}
                        className="form-input"
                        style={{ flex: 1, minWidth: "130px" }}
                    >
                        <option value="all">Todas las Especies</option>
                        <option value="perro">🐕 Perros</option>
                        <option value="gato">🐈 Gatos</option>
                        <option value="ave">🦜 Aves</option>
                        <option value="otro">🐾 Otro</option>
                    </select>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    📢 Crear Reporte
                </button>
            </div>

            {/* Report Feed */}
            {loading ? (
                <p style={{ color: "var(--text-secondary)", marginTop: "2rem" }}>Cargando reportes de la red...</p>
            ) : filtered.length === 0 ? (
                <div className={modStyles["empty-state"]}>
                    <span className={modStyles["empty-state__icon"]}>🐾</span>
                    <p className={modStyles["empty-state__text"]}>No hay reportes activos que coincidan con tu búsqueda.</p>
                </div>
            ) : (
                <div className={styles["reports-grid"]}>
                    {filtered.map(report => (
                        <div key={report.id} className={`${styles["report-card"]} ${styles[report.report_type]}`}>
                            <div className={styles["report-badge"]}>
                                {report.report_type === "lost" ? "🚨 PERDIDA" : "🐾 ENCONTRADA"}
                            </div>

                            <div className={styles["report-image"]} style={{
                                backgroundImage: report.image_url ? `url(${report.image_url})` : "none"
                            }}>
                                {!report.image_url && (
                                    <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '50%', boxShadow: 'inset 0 0 20px rgba(255,255,255,0.02)' }}>
                                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: report.report_type === 'lost' ? '#fca5a5' : '#86efac', filter: `drop-shadow(0 0 15px ${report.report_type === 'lost' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(34, 197, 94, 0.4)'})` }}>
                                            {report.species === 'gato' ? (
                                                <path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7 .58 8 .5 1.4 0 2.88 0 2.88-3.2 6.08-9.08 8.56-10.12 8.56-1.02 0-6.57-2.48-9.76-8.56 0 0-.5-1.48 0-2.88 1-1-1.2-7.55.22-8.08C2.73 2.5 5.86 3.4 7.55 5.3A9.8 9.8 0 0 1 12 5Z" />
                                            ) : report.species === 'perro' ? (
                                                <path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.476-2.771 4.305-1.209 5.866 2 2 6 7 6 7s1.5-1 4-1M14 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.476 2.771 4.305 1.209 5.866-2 2-6 7-6 7s-1.5-1-4-1" />
                                            ) : (
                                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                                            )}
                                        </svg>
                                    </div>
                                )}
                            </div>

                            <div className={styles["report-body"]} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <h3 className={styles["report-name"]}>{report.pet_name}</h3>
                                    {report.has_tracker && !report.is_resolved && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', background: 'rgba(16, 185, 129, 0.15)', padding: '0.4rem 0.75rem', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.4)', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.1)' }}>
                                            <span style={{ display: 'inline-block', width: '6px', height: '6px', background: '#34d399', borderRadius: '50%', boxShadow: '0 0 10px #34d399', animation: 'pulse 1.5s infinite' }}></span>
                                            GPS ACTIVO
                                        </div>
                                    )}
                                </div>
                                <div className={styles["report-meta"]} style={{ marginTop: '0.5rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                        {report.species.charAt(0).toUpperCase() + report.species.slice(1)} {report.breed ? `(${report.breed})` : ""}
                                    </span>
                                    {report.color && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>🎨 {report.color}</span>}
                                    {report.size && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>📏 {report.size}</span>}
                                </div>

                                {report.last_seen_location && (
                                    <p className={styles["report-location"]} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: '#cbd5e1' }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary-light)" strokeWidth="2" style={{ marginTop: '2px', flexShrink: 0 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                        <span style={{ lineHeight: 1.4 }}>{report.last_seen_location}</span>
                                    </p>
                                )}

                                {report.description && (
                                    <p className={styles["report-desc"]} style={{ marginTop: '0.75rem', fontStyle: 'italic', opacity: 0.8 }}>
                                        "{report.description.length > 100 ? report.description.substring(0, 100) + '...' : report.description}"
                                    </p>
                                )}

                                <div style={{ flex: 1 }}></div>

                                <div className={styles["report-footer"]} style={{ flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    <span className={styles["report-time"]} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                                        {getTimeSince(report.created_at)}
                                    </span>
                                    <div style={{ display: "flex", gap: "0.5rem", width: '100%' }}>
                                        {report.has_tracker && !report.is_resolved ? (
                                            <a href={`/dashboard/perdidas/rastreo/${report.id}`} className="btn btn-primary" style={{ flex: 1, padding: '0.6rem', fontSize: '0.9rem', background: 'linear-gradient(135deg, #10b981, #059669)', border: '1px solid rgba(16, 185, 129, 0.5)', textAlign: 'center', textDecoration: 'none', borderRadius: '12px', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" /><line x1="12" y1="2" x2="12" y2="4" /><line x1="12" y1="20" x2="12" y2="22" /><line x1="2" y1="12" x2="4" y2="12" /><line x1="20" y1="12" x2="22" y2="12" /></svg>
                                                    Seguir en Vivo
                                                </span>
                                            </a>
                                        ) : report.contact_phone && (
                                            <a href={`tel:${report.contact_phone}`} className={styles["contact-btn"]} style={{ flex: 1, textAlign: 'center', textDecoration: 'none', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '12px', padding: '0.6rem' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                                    Llamar
                                                </span>
                                            </a>
                                        )}

                                        {report.reporter_id === currentUser?.id && !report.is_resolved && (
                                            <button className={styles["resolve-btn"]} onClick={() => handleResolve(report.id)} style={{ flex: report.has_tracker ? 'none' : 1, borderRadius: '12px', padding: '0.6rem' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                                                    Reunido
                                                </span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {report.is_resolved && (
                                <div className={styles["resolved-overlay"]} style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ background: 'rgba(34, 197, 94, 0.2)', padding: '1.5rem', borderRadius: '50%', boxShadow: '0 0 40px rgba(34, 197, 94, 0.4)' }}>
                                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 10px rgba(74, 222, 128, 0.8))' }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                        </div>
                                        <span style={{ textShadow: '0 0 20px rgba(34, 197, 94, 0.8)', fontSize: '1.5rem', letterSpacing: '0.05em' }}>¡DE VUELTA A CASA!</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Create Report Modal */}
            {showModal && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "1rem" }}>
                    <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", padding: "2rem", width: "100%", maxWidth: "650px", maxHeight: "90vh", overflowY: "auto" }}>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <h2 style={{ fontSize: "1.5rem", color: "#fff", margin: 0 }}>📢 Nuevo Reporte</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: "transparent", border: "none", color: "var(--text-secondary)", fontSize: "1.5rem", cursor: "pointer" }}>&times;</button>
                        </div>

                        {/* Report Type Toggle */}
                        <div className={styles["type-toggle"]}>
                            <button
                                className={`${styles["toggle-btn"]} ${formData.report_type === "lost" ? styles["toggle-lost"] : ""}`}
                                onClick={() => setFormData({ ...formData, report_type: "lost" })}
                                type="button"
                            >
                                🚨 Perdí mi mascota
                            </button>
                            <button
                                className={`${styles["toggle-btn"]} ${formData.report_type === "found" ? styles["toggle-found"] : ""}`}
                                onClick={() => setFormData({ ...formData, report_type: "found" })}
                                type="button"
                            >
                                🐾 Encontré una mascota
                            </button>
                        </div>

                        <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.5rem" }}>
                            <div className={dashStyles["form-section"]}>
                                <h3 className={dashStyles["form-section-title"]}>Datos de la Mascota</h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                    <div style={{ display: "flex", gap: "1rem" }}>
                                        <div style={{ flex: 1 }}>
                                            <label>Nombre de la mascota *</label>
                                            <input type="text" className="form-input" required value={formData.pet_name} onChange={e => setFormData({ ...formData, pet_name: e.target.value })} placeholder="Ej. Max, Luna..." />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label>Especie *</label>
                                            <select className="form-input" value={formData.species} onChange={e => setFormData({ ...formData, species: e.target.value })}>
                                                <option value="perro">🐕 Perro</option>
                                                <option value="gato">🐈 Gato</option>
                                                <option value="ave">🦜 Ave</option>
                                                <option value="otro">🐾 Otro</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", gap: "1rem" }}>
                                        <div style={{ flex: 1 }}>
                                            <label>Raza</label>
                                            <input type="text" className="form-input" value={formData.breed} onChange={e => setFormData({ ...formData, breed: e.target.value })} placeholder="Ej. Labrador, Siamés..." />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label>Color</label>
                                            <input type="text" className="form-input" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} placeholder="Ej. Negro con manchas" />
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", gap: "1rem" }}>
                                        <div style={{ flex: 1 }}>
                                            <label>Tamaño</label>
                                            <select className="form-input" value={formData.size} onChange={e => setFormData({ ...formData, size: e.target.value })}>
                                                <option value="pequeño">Pequeño</option>
                                                <option value="mediano">Mediano</option>
                                                <option value="grande">Grande</option>
                                            </select>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label>Edad Aprox.</label>
                                            <input type="text" className="form-input" value={formData.age_approx} onChange={e => setFormData({ ...formData, age_approx: e.target.value })} placeholder="Ej. 3 años" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={dashStyles["form-section"]}>
                                <h3 className={dashStyles["form-section-title"]}>Ubicación y Contacto</h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                    <div>
                                        <label>Última ubicación conocida *</label>
                                        <input type="text" className="form-input" required value={formData.last_seen_location} onChange={e => setFormData({ ...formData, last_seen_location: e.target.value })} placeholder="Ej. Parque España, Col. Condesa, CDMX" />
                                    </div>
                                    <div style={{ display: "flex", gap: "1rem" }}>
                                        <div style={{ flex: 1 }}>
                                            <label>Teléfono de Contacto</label>
                                            <input type="tel" className="form-input" value={formData.contact_phone} onChange={e => setFormData({ ...formData, contact_phone: e.target.value })} placeholder="55 1234 5678" />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label>Email de Contacto</label>
                                            <input type="email" className="form-input" value={formData.contact_email} onChange={e => setFormData({ ...formData, contact_email: e.target.value })} placeholder="mi@email.com" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={dashStyles["form-section"]}>
                                <h3 className={dashStyles["form-section-title"]}>Detalles Adicionales</h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                    <div>
                                        <label>Descripción</label>
                                        <textarea className="form-input" rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Describe rasgos, collar, señas particulares..."></textarea>
                                    </div>
                                    <div>
                                        <label>URL de Foto</label>
                                        <input type="text" className="form-input" value={formData.image_url} onChange={e => setFormData({ ...formData, image_url: e.target.value })} placeholder="https://..." />
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={submitting}>
                                    {submitting ? "Publicando..." : "Publicar Reporte 📢"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
