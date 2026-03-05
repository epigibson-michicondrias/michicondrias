"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listSitters, Sitter, getSitter } from "@/lib/services/cuidadores";
import Link from "next/link";
import dashStyles from "../dashboard.module.css";

export default function CuidadoresPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [serviceFilter, setServiceFilter] = useState<string>("");

    const { data: sitters = [], isLoading } = useQuery({
        queryKey: ["sitters"],
        queryFn: () => listSitters(),
    });

    const filtered = sitters.filter(s => {
        const matchSearch = s.display_name.toLowerCase().includes(search.toLowerCase()) ||
            (s.location || "").toLowerCase().includes(search.toLowerCase());
        const matchService = !serviceFilter || s.service_type === serviceFilter || s.service_type === "both";
        return matchSearch && matchService;
    });

    return (
        <>
            <div className={dashStyles["page-header"]}>
                <div>
                    <h1 className={dashStyles["page-title"]}>🏠 Cuidadores</h1>
                    <p className={dashStyles["page-subtitle"]}>
                        Deja a tu mascota en las mejores manos mientras no estás
                    </p>
                </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                    <Link href="/dashboard/cuidadores/solicitudes" className="btn btn-secondary">
                        📋 Mis Solicitudes
                    </Link>
                    <Link href="/dashboard/cuidadores/registro" className="btn btn-primary">
                        🐾 Quiero ser Cuidador
                    </Link>
                </div>
            </div>

            {/* Search & Filters */}
            <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
                <input
                    type="text"
                    placeholder="🔍 Buscar por nombre o ubicación..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                        flex: 1, minWidth: "250px",
                        padding: "1rem 1.5rem", borderRadius: "16px",
                        border: "1px solid rgba(255,255,255,0.08)",
                        background: "rgba(255,255,255,0.03)", color: "#fff",
                        fontSize: "1rem", outline: "none",
                    }}
                />
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    {["", "hosting", "visiting"].map(type => (
                        <button
                            key={type}
                            onClick={() => setServiceFilter(type)}
                            style={{
                                padding: "0.75rem 1.25rem", borderRadius: "12px", border: "none",
                                background: serviceFilter === type ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.03)",
                                color: serviceFilter === type ? "#a78bfa" : "var(--text-muted)",
                                fontWeight: 600, cursor: "pointer", fontSize: "0.85rem",
                                transition: "all 0.3s ease",
                            }}
                        >
                            {type === "" ? "Todos" : type === "hosting" ? "🏠 Hospedaje" : "🏃 Visitas"}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <div className={dashStyles["loading-container"]}>
                    <p style={{ color: "var(--text-secondary)" }}>Buscando cuidadores...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className={dashStyles["empty-state"]}>
                    <span style={{ fontSize: "5rem" }}>🏠</span>
                    <h3>No hay cuidadores disponibles</h3>
                    <p style={{ color: "var(--text-secondary)" }}>
                        ¡Sé el primero en registrarte como cuidador!
                    </p>
                </div>
            ) : (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                    gap: "1.5rem",
                }}>
                    {filtered.map((sitter) => (
                        <div
                            key={sitter.id}
                            onMouseEnter={() => {
                                queryClient.prefetchQuery({
                                    queryKey: ["sitter", sitter.id],
                                    queryFn: () => getSitter(sitter.id),
                                });
                            }}
                        >
                            <SitterCard sitter={sitter} />
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}

function SitterCard({ sitter }: { sitter: Sitter }) {
    const serviceLabel: Record<string, string> = {
        hosting: "🏠 Hospedaje",
        visiting: "🏃 Visitas a domicilio",
        both: "🏠 Hospedaje + 🏃 Visitas",
    };

    return (
        <Link href={`/dashboard/cuidadores/${sitter.id}`} style={{ textDecoration: "none" }}>
            <div style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "20px",
                padding: "1.5rem",
                display: "flex", flexDirection: "column", gap: "1rem",
                transition: "all 0.3s ease", cursor: "pointer",
            }}
                onMouseEnter={e => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.borderColor = "rgba(6, 182, 212, 0.3)";
                    e.currentTarget.style.boxShadow = "0 8px 32px rgba(6, 182, 212, 0.15)";
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
                        background: "linear-gradient(135deg, rgba(6,182,212,0.2), rgba(16,185,129,0.2))",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1.8rem", flexShrink: 0,
                    }}>
                        {sitter.photo_url ? (
                            <img src={sitter.photo_url} alt={sitter.display_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                            "🏠"
                        )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ margin: 0, color: "#fff", fontSize: "1.1rem", fontWeight: 700 }}>
                            {sitter.display_name}
                            {sitter.is_verified && <span style={{ marginLeft: "0.4rem", fontSize: "0.85rem" }}>✅</span>}
                        </h3>
                        <p style={{ margin: "0.2rem 0 0", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                            📍 {sitter.location || "Sin ubicación"}
                        </p>
                    </div>
                </div>

                {/* Service Type Badge */}
                <div style={{
                    background: "rgba(6,182,212,0.08)", padding: "0.5rem 1rem",
                    borderRadius: "12px", fontSize: "0.85rem", color: "#06b6d4", fontWeight: 600,
                }}>
                    {serviceLabel[sitter.service_type] || sitter.service_type}
                </div>

                {/* Stats */}
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                    <span style={{ background: "rgba(250,204,21,0.1)", color: "#fbbf24", padding: "4px 12px", borderRadius: "10px", fontSize: "0.8rem", fontWeight: 600 }}>
                        ⭐ {sitter.rating?.toFixed(1) || "Nuevo"}
                    </span>
                    <span style={{ background: "rgba(16,185,129,0.1)", color: "#34d399", padding: "4px 12px", borderRadius: "10px", fontSize: "0.8rem", fontWeight: 600 }}>
                        🏠 {sitter.total_sits} cuidados
                    </span>
                    {sitter.has_yard && (
                        <span style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", padding: "4px 12px", borderRadius: "10px", fontSize: "0.8rem", fontWeight: 600 }}>
                            🌿 Con jardín
                        </span>
                    )}
                </div>

                {/* Accepts */}
                <div style={{ display: "flex", gap: "0.5rem", fontSize: "0.8rem" }}>
                    {sitter.accepts_dogs && <span style={{ opacity: 0.7 }}>🐕 Perros</span>}
                    {sitter.accepts_cats && <span style={{ opacity: 0.7 }}>🐈 Gatos</span>}
                    {sitter.home_type && <span style={{ opacity: 0.5, marginLeft: "auto" }}>{sitter.home_type}</span>}
                </div>

                {/* Price */}
                <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "0.75rem 1rem", borderRadius: "12px",
                    background: "linear-gradient(135deg, rgba(6,182,212,0.08), rgba(16,185,129,0.08))",
                }}>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Desde</span>
                    <span style={{ color: "#fff", fontWeight: 700, fontSize: "1.1rem" }}>
                        ${sitter.price_per_day || sitter.price_per_visit || "Consultar"} MXN/{sitter.price_per_day ? "día" : "visita"}
                    </span>
                </div>
            </div>
        </Link>
    );
}
