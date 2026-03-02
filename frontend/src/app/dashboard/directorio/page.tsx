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
                <h1 className={dashStyles["page-title"]}>🩺 Directorio Médico</h1>
                <p className={dashStyles["page-subtitle"]}>
                    Encuentra salud de calidad para tu mejor amigo cerca de ti
                </p>
                <div className={styles["tabs-container"]}>
                    <button
                        className={`${styles.tab} ${activeTab === "clinicas" ? styles["tab-active"] : ""}`}
                        onClick={() => setActiveTab("clinicas")}
                    >
                        🏥 Clínicas y Hospitales
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === "especialistas" ? styles["tab-active"] : ""}`}
                        onClick={() => setActiveTab("especialistas")}
                    >
                        🧑‍⚕️ Especialistas Médicos
                    </button>
                </div>
            </div>

            <div className={modStyles["module-page__toolbar"]}>
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", flex: 1 }}>
                    <input
                        type="text"
                        placeholder={activeTab === "clinicas" ? "🔍 Buscar por nombre o ciudad..." : "🔍 Buscar por nombre o especialidad..."}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className={styles["search-input"]}
                    />
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
                        <Link href="/dashboard/directorio/nuevo" className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span>🏥</span> Registrar mi Clínica
                        </Link>
                    )}
                </div>
            </div>

            {loading ? (
                <p className={dashStyles["loading-text"]}>Buscando registros...</p>
            ) : activeTab === "clinicas" ? (
                filteredClinics.length === 0 ? (
                    <div className={modStyles["empty-state"]}>
                        <span className={modStyles["empty-state__icon"]}>🏥</span>
                        <p className={modStyles["empty-state__text"]}>
                            {clinics.length === 0
                                ? "Aún no hay clínicas registradas en nuestra red."
                                : "No encontramos clínicas con esos criterios."}
                        </p>
                    </div>
                ) : (
                    <div className={styles["clinic-grid"]}>
                        {filteredClinics.map(clinic => (
                            <div key={clinic.id} className={styles["clinic-card"]}>
                                <div className={styles["card-header"]}>
                                    <div className={styles["avatar-placeholder"]}>
                                        {clinic.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className={styles.name}>{clinic.name}</h2>
                                        <div className={styles.location}>
                                            📍 {clinic.city || "Ciudad no disp."}, {clinic.state || "MX"}
                                        </div>
                                    </div>
                                </div>

                                <div className={styles["card-body"]}>
                                    <div className={styles["tags-row"]}>
                                        {clinic.is_24_hours && <span className={`${styles.tag} ${styles["tag-blue"]}`}>🕒 24 Horas</span>}
                                        {clinic.has_emergency && <span className={`${styles.tag} ${styles["tag-red"]}`}>🚨 Urgencias</span>}
                                        {!clinic.is_24_hours && !clinic.has_emergency && <span className={styles.tag}>🗓️ Horario Regular</span>}
                                    </div>
                                    <p className={styles.description}>
                                        {clinic.description
                                            ? (clinic.description.length > 90 ? clinic.description.substring(0, 90) + "..." : clinic.description)
                                            : "Clínica veterinaria inscrita en Michicondrias."}
                                    </p>
                                </div>

                                <div className={styles["card-footer"]}>
                                    {clinic.phone && (
                                        <a href={`tel:${clinic.phone}`} className={`${styles["action-btn"]} ${styles["btn-outline"]}`}>
                                            📞 Llamar
                                        </a>
                                    )}
                                    <Link href={`/dashboard/directorio/clinica/${clinic.id}`} className={`${styles["action-btn"]} ${styles["btn-solid"]}`}>
                                        Ver Perfil Completo
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            ) : (
                filteredVets.length === 0 ? (
                    <div className={modStyles["empty-state"]}>
                        <span className={modStyles["empty-state__icon"]}>🧑‍⚕️</span>
                        <p className={modStyles["empty-state__text"]}>
                            {vets.length === 0
                                ? "Aún no hay especialistas independientes registrados."
                                : "No encontramos especialistas con esos criterios."}
                        </p>
                    </div>
                ) : (
                    <div className={styles["clinic-grid"]}>
                        {filteredVets.map(vet => (
                            <div key={vet.id} className={styles["clinic-card"]}>
                                <div className={styles["card-header"]}>
                                    <div className={styles["avatar-placeholder"]} style={{ borderRadius: "10px", background: "linear-gradient(135deg, #10b981, #059669)" }}>
                                        {vet.first_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className={styles.name}>{vet.first_name} {vet.last_name}</h2>
                                        <div className={styles.location} style={{ color: "var(--primary-light)" }}>
                                            ⚕️ {vet.specialty || "Médico General Veterinario"}
                                        </div>
                                    </div>
                                </div>
                                <div className={styles["card-body"]}>
                                    <p className={styles.description} style={{ marginBottom: "0.5rem" }}>
                                        {vet.bio || "Profesional de la salud animal en Michicondrias."}
                                    </p>
                                    <p className={styles.description} style={{ fontSize: "0.85rem", opacity: 0.8, background: "rgba(255,255,255,0.05)", padding: "0.2rem 0.5rem", borderRadius: "5px", display: "inline-block" }}>
                                        <strong>Cédula:</strong> ✨ {vet.license_number ? "Verificada" : "En Validación"}
                                    </p>
                                </div>
                                <div className={styles["card-footer"]}>
                                    {vet.phone && (
                                        <a href={`tel:${vet.phone}`} className={`${styles["action-btn"]} ${styles["btn-solid"]}`}>
                                            📞 Contactar al Profesional
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

