"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUserRole } from "@/lib/auth";
import { getListings, Listing } from "@/lib/services/adopciones";
import dashStyles from "../dashboard.module.css";
import modStyles from "../modules.module.css";
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

function getSpeciesClass(species: string): string {
    if (species in SPECIES_EMOJI) return species;
    return "otro";
}

export default function AdopcionesPage() {
    const [role, setRole] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters & Search
    const [searchQuery, setSearchQuery] = useState("");
    const [filterSpecies, setFilterSpecies] = useState<string>("all");
    const [filterSize, setFilterSize] = useState<string>("all");

    useEffect(() => {
        setIsMounted(true);
        const currentRole = getUserRole();
        setRole(currentRole);
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
        <>
            <div className={dashStyles["page-header"]}>
                <h1 className={dashStyles["page-title"]}>🐾 Adopciones</h1>
                <p className={dashStyles["page-subtitle"]}>
                    Encuentra a tu compañero ideal
                </p>
            </div>

            <div className={modStyles["module-page__toolbar"]}>
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
                    {/* Search Bar & Filters */}
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
                    </div>

                    <div style={{ display: "flex", gap: "0.75rem" }}>
                        {isMounted && isAdmin && (
                            <Link href="/dashboard/adopciones/pendientes" className="btn btn-secondary">
                                📋 Pendientes
                            </Link>
                        )}
                        <Link href="/dashboard/adopciones/nueva" className="btn btn-primary">
                            + Publicar en adopción
                        </Link>
                    </div>
                </div>
            </div>

            {loading ? (
                <p style={{ color: "var(--text-secondary)", padding: "2rem" }}>Cargando...</p>
            ) : filteredListings.length === 0 ? (
                <div className={modStyles["empty-state"]}>
                    <span className={modStyles["empty-state__icon"]}>🏜️</span>
                    <p className={modStyles["empty-state__text"]}>
                        {listings.length === 0
                            ? "No hay mascotas publicadas por ahora. ¡Anímate a publicar una!"
                            : "No encontramos ninguna mascota que coincida con tu búsqueda."}
                    </p>
                </div>
            ) : (
                <div className={styles["adopciones-grid"]}>
                    {filteredListings.map((listing) => {
                        const cls = getSpeciesClass(listing.species);
                        return (
                            <div key={listing.id} className={styles["pet-card"]}>
                                {/* Visual header */}
                                <div
                                    className={`${styles["pet-card__visual"]} ${styles[`pet-card__visual--${cls}`]
                                        }`}
                                >
                                    <span className={styles["pet-card__emoji"]}>
                                        {SPECIES_EMOJI[cls] || "🐾"}
                                    </span>
                                    <span
                                        className={`${styles["pet-card__status"]} ${styles["pet-card__status--disponible"]
                                            }`}
                                    >
                                        Disponible
                                    </span>
                                </div>

                                {/* Body */}
                                <div className={styles["pet-card__body"]}>
                                    <div className={styles["pet-card__name"]}>
                                        {listing.name}
                                        <span className={styles["pet-card__species-tag"]}>
                                            {SPECIES_LABEL[cls] || listing.species}
                                        </span>
                                    </div>

                                    <div className={styles["pet-card__chips"]}>
                                        {listing.breed && (
                                            <span className={styles["pet-card__chip"]}>
                                                <span className={styles["pet-card__chip-icon"]}>🏷️</span>
                                                {listing.breed}
                                            </span>
                                        )}
                                        {listing.age_months != null && (
                                            <span className={styles["pet-card__chip"]}>
                                                <span className={styles["pet-card__chip-icon"]}>📅</span>
                                                {listing.age_months} meses
                                            </span>
                                        )}
                                        {listing.size && (
                                            <span className={styles["pet-card__chip"]}>
                                                <span className={styles["pet-card__chip-icon"]}>📏</span>
                                                {listing.size}
                                            </span>
                                        )}
                                        {listing.is_sterilized && (
                                            <span className={styles["pet-card__chip"]} style={{ border: "1px solid var(--accent)", color: "var(--accent)" }}>
                                                ✂️ Esterilizado
                                            </span>
                                        )}
                                        {listing.is_vaccinated && (
                                            <span className={styles["pet-card__chip"]} style={{ border: "1px solid #4ade80", color: "#4ade80" }}>
                                                💉 Vacunado
                                            </span>
                                        )}
                                    </div>

                                    {listing.description && (
                                        <p className={styles["pet-card__desc"]}>{listing.description}</p>
                                    )}
                                </div>

                                {/* Adopt CTA */}
                                <div className={styles["pet-card__actions"]} style={{ flexDirection: "column" }}>
                                    {!isAdmin && (
                                        <Link
                                            href={`/dashboard/adopciones/mascota/${listing.id}`}
                                            className={styles["pet-card__adopt-btn"]}
                                            style={{ textDecoration: "none", textAlign: "center", width: "100%" }}
                                        >
                                            Leer Historia y Adoptar 👉
                                        </Link>
                                    )}
                                    {isMounted && isAdmin && (
                                        <Link
                                            href={`/dashboard/adopciones/solicitudes?id=${listing.id}`}
                                            className="btn btn-secondary"
                                            style={{ fontSize: "0.75rem", width: "100%", textAlign: "center", marginTop: "0.5rem" }}
                                        >
                                            🕵️ Ver Solicitudes
                                        </Link>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
}
