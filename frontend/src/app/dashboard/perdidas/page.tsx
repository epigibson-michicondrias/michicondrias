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
                                {!report.image_url && <span style={{ fontSize: "3rem" }}>{report.species === "gato" ? "🐈" : report.species === "perro" ? "🐕" : "🐾"}</span>}
                            </div>

                            <div className={styles["report-body"]}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <h3 className={styles["report-name"]}>{report.pet_name}</h3>
                                    {report.has_tracker && !report.is_resolved && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontSize: '0.75rem', fontWeight: 800, background: 'rgba(16, 185, 129, 0.1)', padding: '0.3rem 0.6rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                                            <span style={{ display: 'inline-block', width: '6px', height: '6px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 8px #10b981', animation: 'pulse 1.5s infinite' }}></span>
                                            GPS Activo
                                        </div>
                                    )}
                                </div>
                                <div className={styles["report-meta"]}>
                                    <span>{report.species} {report.breed ? `· ${report.breed}` : ""}</span>
                                    <span>{report.color ? `· ${report.color}` : ""}</span>
                                    <span>{report.size ? `· ${report.size}` : ""}</span>
                                </div>

                                {report.last_seen_location && (
                                    <p className={styles["report-location"]}>📍 {report.last_seen_location}</p>
                                )}

                                {report.description && (
                                    <p className={styles["report-desc"]}>
                                        {report.description.length > 120 ? report.description.substring(0, 120) + '...' : report.description}
                                    </p>
                                )}

                                <div className={styles["report-footer"]} style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
                                    <span className={styles["report-time"]}>{getTimeSince(report.created_at)}</span>
                                    <div style={{ display: "flex", gap: "0.5rem", width: '100%' }}>
                                        {report.has_tracker && !report.is_resolved ? (
                                            <a href={`/dashboard/perdidas/rastreo/${report.id}`} className="btn btn-primary" style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', textAlign: 'center', textDecoration: 'none' }}>
                                                🗺️ Seguir en Vivo
                                            </a>
                                        ) : report.contact_phone && (
                                            <a href={`tel:${report.contact_phone}`} className={styles["contact-btn"]} style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}>📞 Llamar</a>
                                        )}

                                        {report.reporter_id === currentUser?.id && !report.is_resolved && (
                                            <button className={styles["resolve-btn"]} onClick={() => handleResolve(report.id)} style={{ flex: report.has_tracker ? 'none' : 1 }}>
                                                ✅ Reunido
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {report.is_resolved && (
                                <div className={styles["resolved-overlay"]}>
                                    <span>🎉 ¡Reunido!</span>
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
