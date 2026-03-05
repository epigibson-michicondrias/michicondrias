"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listWalkers, Walker } from "@/lib/services/paseadores";
import Link from "next/link";
import dashStyles from "../dashboard.module.css";

export default function PaseadoresPage() {
    const [search, setSearch] = useState("");

    const { data: walkers = [], isLoading } = useQuery({
        queryKey: ["walkers"],
        queryFn: () => listWalkers(),
    });

    const filtered = walkers.filter(w =>
        w.display_name.toLowerCase().includes(search.toLowerCase()) ||
        (w.location || "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <div className={dashStyles["page-header"]}>
                <div>
                    <h1 className={dashStyles["page-title"]}>🚶 Paseadores</h1>
                    <p className={dashStyles["page-subtitle"]}>
                        Encuentra al paseador perfecto para tu mascota
                    </p>
                </div>
                <Link href="/dashboard/paseadores/registro" className="btn btn-primary">
                    🐾 Quiero ser Paseador
                </Link>
            </div>

            {/* Search bar */}
            <div style={{ marginBottom: "2rem" }}>
                <input
                    type="text"
                    placeholder="🔍 Buscar por nombre o ubicación..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                        width: "100%",
                        padding: "1rem 1.5rem",
                        borderRadius: "16px",
                        border: "1px solid rgba(255,255,255,0.08)",
                        background: "rgba(255,255,255,0.03)",
                        color: "#fff",
                        fontSize: "1rem",
                        outline: "none",
                    }}
                />
            </div>

            {isLoading ? (
                <div className={dashStyles["loading-container"]}>
                    <p style={{ color: "var(--text-secondary)" }}>Buscando paseadores...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className={dashStyles["empty-state"]}>
                    <span style={{ fontSize: "5rem" }}>🚶</span>
                    <h3>No hay paseadores disponibles</h3>
                    <p style={{ color: "var(--text-secondary)" }}>
                        ¡Sé el primero en registrarte como paseador!
                    </p>
                </div>
            ) : (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                    gap: "1.5rem",
                }}>
                    {filtered.map((walker) => (
                        <WalkerCard key={walker.id} walker={walker} />
                    ))}
                </div>
            )}
        </>
    );
}

function WalkerCard({ walker }: { walker: Walker }) {
    return (
        <Link href={`/dashboard/paseadores/${walker.id}`} style={{ textDecoration: "none" }}>
            <div style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "20px",
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                transition: "all 0.3s ease",
                cursor: "pointer",
            }}
                onMouseEnter={e => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.borderColor = "rgba(124, 58, 237, 0.3)";
                    e.currentTarget.style.boxShadow = "0 8px 32px rgba(124, 58, 237, 0.15)";
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.boxShadow = "none";
                }}
            >
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{
                        width: "60px", height: "60px", borderRadius: "16px", overflow: "hidden",
                        background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.2))",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1.8rem", flexShrink: 0,
                    }}>
                        {walker.photo_url ? (
                            <img src={walker.photo_url} alt={walker.display_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                            "🚶"
                        )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ margin: 0, color: "#fff", fontSize: "1.1rem", fontWeight: 700 }}>
                            {walker.display_name}
                            {walker.is_verified && <span style={{ marginLeft: "0.4rem", fontSize: "0.85rem" }}>✅</span>}
                        </h3>
                        <p style={{ margin: "0.2rem 0 0", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                            📍 {walker.location || "Sin ubicación"}
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                    <span style={{ background: "rgba(250,204,21,0.1)", color: "#fbbf24", padding: "4px 12px", borderRadius: "10px", fontSize: "0.8rem", fontWeight: 600 }}>
                        ⭐ {walker.rating?.toFixed(1) || "Nuevo"}
                    </span>
                    <span style={{ background: "rgba(16,185,129,0.1)", color: "#34d399", padding: "4px 12px", borderRadius: "10px", fontSize: "0.8rem", fontWeight: 600 }}>
                        🐾 {walker.total_walks} paseos
                    </span>
                    {walker.experience_years && walker.experience_years > 0 && (
                        <span style={{ background: "rgba(139,92,246,0.1)", color: "#a78bfa", padding: "4px 12px", borderRadius: "10px", fontSize: "0.8rem", fontWeight: 600 }}>
                            {walker.experience_years}+ años exp.
                        </span>
                    )}
                </div>

                {/* Accepts */}
                <div style={{ display: "flex", gap: "0.5rem", fontSize: "0.8rem" }}>
                    {walker.accepts_dogs && <span style={{ opacity: 0.7 }}>🐕 Perros</span>}
                    {walker.accepts_cats && <span style={{ opacity: 0.7 }}>🐈 Gatos</span>}
                    <span style={{ opacity: 0.5, marginLeft: "auto" }}>Max {walker.max_pets_per_walk}</span>
                </div>

                {/* Price */}
                <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "0.75rem 1rem", borderRadius: "12px",
                    background: "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(6,182,212,0.08))",
                }}>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Desde</span>
                    <span style={{ color: "#fff", fontWeight: 700, fontSize: "1.1rem" }}>
                        ${walker.price_per_walk || walker.price_per_hour || "Consultar"} MXN
                    </span>
                </div>
            </div>
        </Link>
    );
}
