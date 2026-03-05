"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPlaces, PetfriendlyPlace } from "@/lib/services/perdidas";
import Link from "next/link";
import dashStyles from "../dashboard.module.css";
import styles from "../modules.module.css";

const CATEGORIES = [
    "Restaurante", "Cafetería", "Parque", "Hotel",
    "Centro Comercial", "Playa", "Veterinaria", "Tienda"
];

export default function PetfriendlyPage() {
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");

    const { data: places = [], isLoading } = useQuery({
        queryKey: ["petfriendly-places", categoryFilter],
        queryFn: () => getPlaces(categoryFilter || undefined),
    });

    const filtered = places.filter(place =>
        place.name.toLowerCase().includes(search.toLowerCase()) ||
        (place.address?.toLowerCase().includes(search.toLowerCase())) ||
        (place.city?.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className={dashStyles.container}>
            <div className={dashStyles["page-header"]}>
                <div>
                    <h1 className={dashStyles["page-title"]}>📍 Lugares Petfriendly</h1>
                    <p className={dashStyles["page-subtitle"]}>
                        Descubre los mejores lugares para ir con tu mejor amigo
                    </p>
                </div>
                <Link href="/dashboard/petfriendly/nuevo" className="btn btn-primary">
                    ➕ Agregar Lugar
                </Link>
            </div>

            <div className={dashStyles["filters-bar"]}>
                <div className={dashStyles["search-container"]}>
                    <input
                        type="text"
                        placeholder="Buscar por nombre, dirección o ciudad..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={dashStyles["search-input"]}
                    />
                </div>
                <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
                    <button
                        onClick={() => setCategoryFilter("")}
                        style={{
                            padding: "0.5rem 1rem", borderRadius: "12px", border: "none",
                            background: categoryFilter === "" ? "var(--secondary)" : "rgba(255,255,255,0.05)",
                            color: "#fff", cursor: "pointer", whiteSpace: "nowrap"
                        }}
                    >
                        Todos
                    </button>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            style={{
                                padding: "0.5rem 1rem", borderRadius: "12px", border: "none",
                                background: categoryFilter === cat ? "var(--secondary)" : "rgba(255,255,255,0.05)",
                                color: "#fff", cursor: "pointer", whiteSpace: "nowrap"
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <div className={dashStyles["loading-container"]}><p>Buscando lugares increíbles...</p></div>
            ) : filtered.length === 0 ? (
                <div className={dashStyles["empty-state"]} style={{ padding: "4rem" }}>
                    <h2>No encontramos lugares</h2>
                    <p style={{ opacity: 0.6 }}>Sé el primero en recomendar un lugar petfriendly en esta categoría.</p>
                </div>
            ) : (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: "1.5rem"
                }}>
                    {filtered.map((place) => (
                        <PlaceCard key={place.id} place={place} />
                    ))}
                </div>
            )}
        </div>
    );
}

function PlaceCard({ place }: { place: PetfriendlyPlace }) {
    const defaultImage = "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=600";

    return (
        <div className={styles.card} style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <div style={{
                height: "180px", width: "100%", borderRadius: "16px", overflow: "hidden", position: "relative"
            }}>
                <img
                    src={place.image_url || defaultImage}
                    alt={place.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div style={{
                    position: "absolute", top: "12px", right: "12px",
                    background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
                    padding: "4px 12px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 700
                }}>
                    {place.category}
                </div>
                {(place.has_water_bowls === "si" || place.has_pet_menu === "si") && (
                    <div style={{
                        position: "absolute", bottom: "12px", left: "12px", display: "flex", gap: "4px"
                    }}>
                        {place.has_water_bowls === "si" && (
                            <span title="Tienen bebederos" style={{ background: "var(--secondary)", padding: "4px", borderRadius: "50%", fontSize: "0.8rem", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center" }}>💧</span>
                        )}
                        {place.has_pet_menu === "si" && (
                            <span title="Tienen menú pet" style={{ background: "var(--secondary)", padding: "4px", borderRadius: "50%", fontSize: "0.8rem", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center" }}>🍖</span>
                        )}
                    </div>
                )}
            </div>
            <div style={{ padding: "1.2rem", flexGrow: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                    <h3 style={{ margin: 0, fontSize: "1.2rem" }}>{place.name}</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#fbbf24" }}>
                        <span>⭐</span>
                        <span style={{ fontWeight: 800 }}>{place.rating.toFixed(1)}</span>
                    </div>
                </div>
                <p style={{ fontSize: "0.85rem", opacity: 0.6, marginBottom: "1rem" }}>📍 {place.address || "Dirección no disponible"}</p>
                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", flexGrow: 1 }}>
                    {place.description ? (place.description.length > 80 ? place.description.substring(0, 80) + "..." : place.description) : "Sin descripción disponible."}
                </p>

                <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <span style={{ fontSize: "0.7rem", opacity: 0.4 }}>Aceptan: {place.pet_sizes_allowed}</span>
                    <Link href={`/dashboard/petfriendly/${place.id}`} className="btn btn-secondary" style={{ marginLeft: "auto", fontSize: "0.85rem", padding: "0.4rem 1rem" }}>
                        Ver Detalles
                    </Link>
                </div>
            </div>
        </div>
    );
}
