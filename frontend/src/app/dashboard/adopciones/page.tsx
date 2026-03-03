"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getUserRole } from "@/lib/auth";
import { getListings, Listing } from "@/lib/services/adopciones";
import dashStyles from "../dashboard.module.css";
import styles from "./adopciones.module.css";

const SPECIES_EMOJI: Record<string, string> = {
    perro: "🐕",
    gato: "🐈",
    ave: "🐦",
    otro: "🐾",
};

const SPECIES_LABEL: Record<string, string> = {
    perro: "Perro",
    gato: "Gato",
    ave: "Ave",
    otro: "Otro",
};

export default function AdopcionesPage() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<"grid" | "list" | "compact">("grid");

    // Filters & Search
    const [searchQuery, setSearchQuery] = useState("");
    const [filterSpecies, setFilterSpecies] = useState<string>("all");
    const [filterSize, setFilterSize] = useState<string>("all");

    useEffect(() => {
        setIsMounted(true);
        const currentRole = getUserRole();
        setIsAdmin(currentRole === "admin");

        async function load() {
            try {
                const data = await getListings();
                // Filter only approved ones for regular users
                setListings(currentRole === "admin" ? data : data.filter(d => d.is_approved));
            } catch {
                console.error("Error loading listings");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    // Computed filtered list
    const filteredListings = listings.filter((listing) => {
        const matchesSearch = listing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (listing.breed?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
        const matchesSpecies = filterSpecies === "all" || listing.species === filterSpecies;
        const matchesSize = filterSize === "all" || listing.size === filterSize;
        return matchesSearch && matchesSpecies && matchesSize;
    });

    return (
        <div className={styles.container}>
            <div className={dashStyles["page-header"]}>
                <h1 className={dashStyles["page-title"]}>🐾 Adopciones</h1>
                <p className={dashStyles["page-subtitle"]}>
                    Encuentra a tu compañero ideal en Michicondrias
                </p>
            </div>

            <div className={dashStyles["module-page__toolbar"]} style={{ marginBottom: "2.5rem" }}>
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", flex: 1 }}>
                        <input
                            type="text"
                            placeholder="🔍 Buscar por nombre o raza..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles["search-input"]}
                        />
                        <select
                            value={filterSpecies}
                            onChange={(e) => setFilterSpecies(e.target.value)}
                            className={styles["filter-select"]}
                        >
                            <option value="all">Todas las especies</option>
                            <option value="perro">🐕 Perros</option>
                            <option value="gato">🐈 Gatos</option>
                            <option value="ave">🐦 Aves</option>
                            <option value="otro">🐾 Otros</option>
                        </select>
                        <select
                            value={filterSize}
                            onChange={(e) => setFilterSize(e.target.value)}
                            className={styles["filter-select"]}
                        >
                            <option value="all">Todos los tamaños</option>
                            <option value="pequeño">Pequeño</option>
                            <option value="mediano">Mediano</option>
                            <option value="grande">Grande</option>
                        </select>

                        {/* View Toggles */}
                        <div className={styles["view-toggles"]}>
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`${styles["view-btn"]} ${viewMode === "grid" ? styles["view-btn--active"] : ""}`}
                                title="Vista Cuadrícula"
                            >
                                ⊞
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`${styles["view-btn"]} ${viewMode === "list" ? styles["view-btn--active"] : ""}`}
                                title="Vista Lista Amplia"
                            >
                                ☰
                            </button>
                            <button
                                onClick={() => setViewMode("compact")}
                                className={`${styles["view-btn"]} ${viewMode === "compact" ? styles["view-btn--active"] : ""}`}
                                title="Vista Compacta"
                            >
                                ≡
                            </button>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: "1rem" }}>
                        {isMounted && isAdmin && (
                            <Link href="/dashboard/adopciones/pendientes" className="btn btn-secondary" style={{ borderRadius: "16px", padding: "0.85rem 1.5rem" }}>
                                📋 Moderación
                            </Link>
                        )}
                        <Link href="/dashboard/adopciones/nueva" className={styles["pet-card__adopt-btn"]} style={{ textDecoration: "none", minWidth: "220px" }}>
                            ✨ Publicar en adopción
                        </Link>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className={dashStyles["loading-container"]}>
                    <p style={{ color: "var(--text-secondary)", padding: "2rem" }}>Cargando michis...</p>
                </div>
            ) : filteredListings.length === 0 ? (
                <div className={dashStyles["empty-state"]} style={{ padding: "5rem 2rem", background: "rgba(15,15,26,0.4)", borderRadius: "32px", border: "1px dashed rgba(255,255,255,0.1)" }}>
                    <span style={{ fontSize: "5rem", display: "block", marginBottom: "1rem" }}>🏜️</span>
                    <h3 style={{ color: "#fff", fontSize: "1.5rem", fontWeight: "800" }}>
                        {listings.length === 0 ? "¡Silencio por aquí!" : "¡Ups! No hay resultados"}
                    </h3>
                    <p style={{ color: "var(--text-secondary)" }}>
                        {listings.length === 0
                            ? "No hay mascotas publicadas por ahora. ¡Anímate a publicar una!"
                            : "Prueba ajustando tus filtros de búsqueda."}
                    </p>
                </div>
            ) : (
                <div className={`${styles[`${viewMode === "grid" ? "adopciones-grid" : viewMode + "-view"}`]}`}>
                    {filteredListings.map((listing) => {
                        const speciesEmoji = SPECIES_EMOJI[listing.species] || SPECIES_EMOJI.otro;
                        return (
                            <div key={listing.id} className={styles["pet-card"]}>
                                <div className={styles["pet-card__visual"]}>
                                    {listing.photo_url ? (
                                        <Image
                                            src={listing.photo_url}
                                            alt={listing.name}
                                            fill
                                            style={{ objectFit: "cover" }}
                                        />
                                    ) : (
                                        <span className={styles["pet-card__emoji"]}>
                                            {speciesEmoji}
                                        </span>
                                    )}
                                    <span className={styles["pet-card__status"] + " " + styles["pet-card__status--disponible"]}>
                                        Disponible
                                    </span>
                                </div>

                                <div className={styles["pet-card__body"]}>
                                    <div className={styles["pet-card__name"]}>
                                        {listing.name}
                                        <span className={styles["pet-card__species-tag"]}>
                                            {SPECIES_LABEL[listing.species] || listing.species}
                                        </span>
                                    </div>

                                    <div className={styles["pet-card__chips"]}>
                                        {listing.breed && (
                                            <span className={styles["pet-card__chip"]}>
                                                🏷️ {listing.breed}
                                            </span>
                                        )}
                                        {listing.age_months != null && viewMode !== "compact" && (
                                            <span className={styles["pet-card__chip"]}>
                                                📅 {listing.age_months} meses
                                            </span>
                                        )}
                                        {listing.size && viewMode !== "compact" && (
                                            <span className={styles["pet-card__chip"]}>
                                                📏 {listing.size}
                                            </span>
                                        )}
                                        {listing.is_sterilized && (viewMode !== "compact") && (
                                            <span className={styles["pet-card__chip"]} style={{ border: "1px solid rgba(139, 92, 246, 0.3)", color: "var(--primary-light)" }}>
                                                ✂️ Esterilizado
                                            </span>
                                        )}
                                        {listing.is_vaccinated && (viewMode !== "compact") && (
                                            <span className={styles["pet-card__chip"]} style={{ border: "1px solid rgba(74, 222, 128, 0.3)", color: "#4ade80" }}>
                                                💉 Vacunado
                                            </span>
                                        )}
                                    </div>

                                    {listing.description && viewMode !== "compact" && (
                                        <p className={styles["pet-card__desc"]}>{listing.description}</p>
                                    )}
                                </div>

                                <div className={styles["pet-card__actions"]} style={{ flexDirection: "column" }}>
                                    {!isAdmin ? (
                                        <Link
                                            href={`/dashboard/adopciones/mascota/${listing.id}`}
                                            className={styles["pet-card__adopt-btn"]}
                                            style={{ textDecoration: "none", textAlign: 'center' }}
                                        >
                                            {viewMode === "compact" ? "Adoptar" : "Leer Historia y Adoptar 👈"}
                                        </Link>
                                    ) : (
                                        <div style={{ display: "flex", gap: "0.75rem", width: "100%" }}>
                                            <Link
                                                href={`/dashboard/adopciones/mascota/${listing.id}`}
                                                className={styles["pet-card__adopt-btn"]}
                                                style={{ textDecoration: "none", flex: 1, textAlign: 'center' }}
                                            >
                                                {viewMode === "compact" ? "👁️" : "Ver Detalle"}
                                            </Link>
                                            <Link
                                                href={`/dashboard/adopciones/solicitudes?id=${listing.id}`}
                                                className={styles["pet-card__adopt-btn"] + " " + styles["admin-btn"]}
                                                style={{ textDecoration: "none", flex: 1, textAlign: 'center' }}
                                            >
                                                {viewMode === "compact" ? "🕵️" : "Solicitudes"}
                                            </Link>
                                        </div>
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
