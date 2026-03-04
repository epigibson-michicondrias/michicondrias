"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { hasRole } from "@/lib/auth";
import { getClinics, Clinic, getVets, Vet } from "@/lib/services/directorio";
import dashStyles from "../dashboard.module.css";
import styles from "./directorio.module.css";
import modStyles from "../modules.module.css";

export default function DirectorioPage() {
    const [clinics, setClinics] = useState<Clinic[]>([]);
    const [vets, setVets] = useState<Vet[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterService, setFilterService] = useState("all");
    const [activeTab, setActiveTab] = useState<"clinicas" | "especialistas">("clinicas");

    // Hydration-safe role state
    const [isVet, setIsVet] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [canRegister, setCanRegister] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        async function load() {
            try {
                // Roles are client-side only (localStorage)
                const vetRole = hasRole("veterinario");
                const adminRole = hasRole("admin");
                setIsVet(vetRole);
                setIsAdmin(adminRole);
                setCanRegister(vetRole || adminRole);

                const [clinicsData, vetsData] = await Promise.all([
                    getClinics(),
                    getVets()
                ]);
                setClinics(clinicsData);
                setVets(vetsData);
            } catch (error) {
                console.error("Error cargando directorio", error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const filteredClinics = clinics.filter(c => {
        const matchesQuery = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (c.city?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
        const matchesService = filterService === "all"
            || (filterService === "24h" && c.is_24_hours)
            || (filterService === "emergencia" && c.has_emergency);
        return matchesQuery && matchesService;
    });

    const filteredVets = vets.filter(v => {
        const fullName = `${v.first_name} ${v.last_name}`.toLowerCase();
        const matchesQuery = fullName.includes(searchQuery.toLowerCase()) ||
            (v.specialty?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
        return matchesQuery;
    });


    return (
        <div className={styles.container}>
            <div className={dashStyles["page-header"]}>
                <h1 className={dashStyles["page-title"]}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary-light)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.75rem', filter: 'drop-shadow(0 0 8px rgba(124, 58, 237, 0.4))' }}>
                        <path d="M19 14.5c0 1.9-1.6 3.5-3.5 3.5H12v-5l-1.5-1.5H19z" />
                        <path d="M8 8V4.5C8 2.6 9.6 1 11.5 1S15 2.6 15 4.5V8" />
                        <path d="M12 11.5c.6 0 1.2.1 1.8.3M17 11.5c.6 0 1.2.1 1.8.3" />
                        <rect x="2" y="8" width="20" height="15" rx="2" />
                        <path d="M12 12v6M9 15h6" />
                    </svg>
                    Directorio Médico
                </h1>
                <p className={dashStyles["page-subtitle"]}>
                    Encuentra salud de calidad para tu mejor amigo en la red Michicondrias
                </p>
                <div className={styles["tabs-container"]}>
                    <button
                        className={`${styles.tab} ${activeTab === "clinicas" ? styles["tab-active"] : ""}`}
                        onClick={() => setActiveTab("clinicas")}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 21h18" /><path d="M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7" />
                            <path d="M19 21V11" /><path d="M5 21V11" />
                        </svg>
                        Clínicas y Hospitales
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === "especialistas" ? styles["tab-active"] : ""}`}
                        onClick={() => setActiveTab("especialistas")}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        Especialistas Independientes
                    </button>
                </div>
            </div>

            <div className={modStyles["module-page__toolbar"]} style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", flex: 1 }}>
                    <div style={{ position: 'relative', flex: 2, minWidth: '280px' }}>
                        <input
                            type="text"
                            placeholder={activeTab === "clinicas" ? "Buscar por nombre o ciudad..." : "Buscar por nombre o especialidad..."}
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className={styles["search-input"]}
                            style={{ paddingLeft: '3rem' }}
                        />
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}>
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                        </svg>
                    </div>
                    {activeTab === "clinicas" && (
                        <select
                            value={filterService}
                            onChange={e => setFilterService(e.target.value)}
                            className={styles["filter-select"]}
                        >
                            <option value="all">Todas las clínicas</option>
                            <option value="24h">🕒 Abierto 24 Horas</option>
                            <option value="emergencia">Soporte y Emergencia 🚨</option>
                        </select>
                    )}
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                    {isMounted && canRegister && activeTab === "clinicas" && (
                        <Link href="/dashboard/directorio/nuevo" className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: '0.85rem 1.5rem', borderRadius: '12px' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 5v14M5 12h14" />
                            </svg>
                            Registrar mi Clínica
                        </Link>
                    )}
                </div>
            </div>

            {/* Mi Clínica Banner for Vet/Admin */}
            {isMounted && canRegister && (
                <div style={{ background: "linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(5, 150, 105, 0.15))", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "20px", padding: "1.5rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <span style={{ fontSize: "2rem" }}>🩺</span>
                        <div>
                            <p style={{ margin: 0, color: "#10b981", fontWeight: 800, fontSize: "1.05rem" }}>Panel de Mi Clínica</p>
                            <p style={{ margin: "0.2rem 0 0 0", color: "var(--text-secondary)", fontSize: "0.85rem" }}>Edita tu información, gestiona especialistas y ve tus reseñas</p>
                        </div>
                    </div>
                    <Link href="/dashboard/directorio/mi-clinica" className="btn btn-primary" style={{ borderRadius: "12px", padding: "0.7rem 1.5rem", background: "linear-gradient(135deg, #10b981, #059669)", whiteSpace: "nowrap" }}>
                        Administrar Mi Clínica →
                    </Link>
                </div>
            )}

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                    <div className={dashStyles["loading-spinner-premium"]} />
                </div>
            ) : activeTab === "clinicas" ? (
                filteredClinics.length === 0 ? (
                    <div className={modStyles["empty-state"]} style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                        <div className={modStyles["empty-state__icon"]} style={{ opacity: 0.5 }}>🏥</div>
                        <p className={modStyles["empty-state__text"]}>
                            {clinics.length === 0
                                ? "Aún no hay clínicas registradas en nuestra red."
                                : "No encontramos clínicas con esos criterios."}
                        </p>
                    </div>
                ) : (
                    <div className={styles["clinic-grid"]}>
                        {filteredClinics.map((clinic, index) => (
                            <div
                                key={clinic.id}
                                className={styles["clinic-card"]}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className={styles["card-header"]}>
                                    <div className={styles["avatar-placeholder"]}>
                                        {clinic.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className={styles.name}>{clinic.name}</h2>
                                        <div className={styles.location}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
                                            </svg>
                                            {clinic.city || "Ciudad no disp."}, {clinic.state || "MX"}
                                        </div>
                                    </div>
                                </div>

                                <div className={styles["card-body"]}>
                                    <div className={styles["tags-row"]}>
                                        {clinic.is_24_hours && (
                                            <span className={`${styles.tag} ${styles["tag-blue"]}`}>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                                                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                                                </svg>
                                                24 Horas
                                            </span>
                                        )}
                                        {clinic.has_emergency && (
                                            <span className={`${styles.tag} ${styles["tag-red"]}`}>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                                                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                                                </svg>
                                                Urgencias
                                            </span>
                                        )}
                                        {!clinic.is_24_hours && !clinic.has_emergency && (
                                            <span className={styles.tag}>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                                                </svg>
                                                Horario Regular
                                            </span>
                                        )}
                                    </div>
                                    <p className={styles.description}>
                                        {clinic.description
                                            ? (clinic.description.length > 95 ? clinic.description.substring(0, 95) + "..." : clinic.description)
                                            : "Clínica veterinaria inscrita en la red Michicondrias."}
                                    </p>
                                </div>

                                <div className={styles["card-footer"]}>
                                    {clinic.phone && (
                                        <a href={`tel:${clinic.phone}`} className={`${styles["action-btn"]} ${styles["btn-outline"]}`}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                            </svg>
                                            Llamar
                                        </a>
                                    )}
                                    <Link href={`/dashboard/directorio/clinica/${clinic.id}`} className={`${styles["action-btn"]} ${styles["btn-solid"]}`}>
                                        Ver Perfil
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M5 12h14m-7-7 7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            ) : (
                filteredVets.length === 0 ? (
                    <div className={modStyles["empty-state"]} style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                        <div className={modStyles["empty-state__icon"]} style={{ opacity: 0.5 }}>🧑‍⚕️</div>
                        <p className={modStyles["empty-state__text"]}>
                            {vets.length === 0
                                ? "Aún no hay especialistas independientes registrados."
                                : "No encontramos especialistas con esos criterios."}
                        </p>
                    </div>
                ) : (
                    <div className={styles["clinic-grid"]}>
                        {filteredVets.map((vet, index) => (
                            <div
                                key={vet.id}
                                className={`${styles["clinic-card"]} ${styles["vet-hover"]}`}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className={styles["card-header"]}>
                                    <div className={styles["avatar-placeholder"]} style={{ borderRadius: "14px", background: "linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.4))", color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                                        {vet.first_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className={styles.name}>{vet.first_name} {vet.last_name}</h2>
                                        <div className={styles.location} style={{ color: "#10b981", fontWeight: 700 }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                                            </svg>
                                            {vet.specialty || "Médico Veterinario"}
                                        </div>
                                    </div>
                                </div>
                                <div className={styles["card-body"]}>
                                    <p className={styles.description} style={{ marginBottom: "1.25rem" }}>
                                        {vet.bio || "Profesional de la salud animal verificado en Michicondrias."}
                                    </p>
                                    <div style={{ fontSize: "0.8rem", color: "#10b981", background: "rgba(16, 185, 129, 0.1)", padding: "0.5rem 0.75rem", borderRadius: "10px", display: "inline-flex", alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="m9 12 2 2 4-4" /><circle cx="12" cy="12" r="10" />
                                        </svg>
                                        <strong>Cédula:</strong> {vet.license_number ? "Verificada" : "En Validación"}
                                    </div>
                                </div>
                                <div className={styles["card-footer"]}>
                                    {vet.phone && (
                                        <a href={`tel:${vet.phone}`} className={`${styles["action-btn"]} ${styles["btn-solid"]}`} style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.2)' }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                            </svg>
                                            Contactar Profesional
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
}

