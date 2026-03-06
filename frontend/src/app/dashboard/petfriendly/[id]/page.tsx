"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { getPlaceById } from "@/lib/services/perdidas";
import dashStyles from "../../dashboard.module.css";
import styles from "../../modules.module.css";
import Link from "next/link";

export default function PlaceDetailPage() {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();

    const { data: place, isLoading, error } = useQuery({
        queryKey: ["petfriendly-place", id],
        queryFn: () => getPlaceById(id),
        enabled: !!id,
    });

    if (isLoading) return (
        <div className={dashStyles.container}>
            <div className={dashStyles["loading-container"]}><p>Cargando detalles del lugar...</p></div>
        </div>
    );

    if (error || !place) return (
        <div className={dashStyles.container}>
            <div className={dashStyles["empty-state"]}>
                <h2>Lugar no encontrado</h2>
                <button onClick={() => router.back()} className="btn btn-secondary">Regresar</button>
            </div>
        </div>
    );

    const defaultImage = "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=1200";

    return (
        <div className={dashStyles.container}>
            <div className={dashStyles["page-header"]}>
                <div>
                    <Link href="/dashboard/petfriendly" style={{ textDecoration: "none", color: "var(--secondary)", fontSize: "0.9rem", display: "block", marginBottom: "0.5rem" }}>
                        ← Volver al explorador
                    </Link>
                    <h1 className={dashStyles["page-title"]}>{place.name}</h1>
                    <p className={dashStyles["page-subtitle"]}>{place.category} en {place.city}</p>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "2.5rem" }}>
                <div>
                    <div style={{
                        width: "100%", height: "400px", borderRadius: "24px", overflow: "hidden", marginBottom: "2rem",
                        boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
                    }}>
                        <img
                            src={place.image_url || defaultImage}
                            alt={place.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                    </div>

                    <div className={styles.card} style={{ padding: "2rem" }}>
                        <h2 style={{ marginTop: 0, marginBottom: "1rem" }}>Sobre este lugar</h2>
                        <p style={{ lineHeight: "1.6", opacity: 0.8, fontSize: "1.1rem" }}>
                            {place.description || "Este lugar aún no tiene una descripción detallada, ¡pero la comunidad dice que es fantástico!"}
                        </p>

                        <div style={{ marginTop: "2rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                            <div style={{ padding: "1.5rem", borderRadius: "16px", background: "rgba(255,255,255,0.03)" }}>
                                <h4 style={{ margin: "0 0 1rem 0", display: "flex", alignItems: "center", gap: "10px" }}>
                                    🐕 Tamaños
                                </h4>
                                <p style={{ margin: 0, textTransform: "capitalize" }}>Aceptan perros {place.pet_sizes_allowed}</p>
                            </div>
                            <div style={{ padding: "1.5rem", borderRadius: "16px", background: "rgba(255,255,255,0.03)" }}>
                                <h4 style={{ margin: "0 0 1rem 0", display: "flex", alignItems: "center", gap: "10px" }}>
                                    ⭐ Calificación
                                </h4>
                                <p style={{ margin: 0, fontWeight: 700, fontSize: "1.2rem", color: "#fbbf24" }}>
                                    {(place.rating || 0).toFixed(1)} / 5.0
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    <div className={styles.card} style={{ padding: "2rem" }}>
                        <h3 style={{ marginTop: 0 }}>Comodidades Michi</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span>💧 Bebederos:</span>
                                <span style={{
                                    padding: "4px 12px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 700,
                                    background: place.has_water_bowls === "si" ? "rgba(34, 197, 94, 0.2)" : "rgba(255,255,255,0.05)",
                                    color: place.has_water_bowls === "si" ? "#4ade80" : "inherit"
                                }}>
                                    {(place.has_water_bowls || "no").toUpperCase()}
                                </span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span>🍖 Menú para mascotas:</span>
                                <span style={{
                                    padding: "4px 12px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 700,
                                    background: place.has_pet_menu === "si" ? "rgba(34, 197, 94, 0.2)" : "rgba(255,255,255,0.05)",
                                    color: place.has_pet_menu === "si" ? "#4ade80" : "inherit"
                                }}>
                                    {(place.has_pet_menu || "no").toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.card} style={{ padding: "2rem" }}>
                        <h3 style={{ marginTop: 0 }}>Contacto y Ubicación</h3>
                        <p style={{ opacity: 0.7, fontSize: "0.9rem", marginBottom: "1.5rem" }}>
                            📍 {place.address || "Dirección no disponible"}<br />
                            {place.city || ""}{place.state ? `, ${place.state}` : ""}
                        </p>

                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {place.phone && (
                                <a href={`tel:${place.phone}`} className="btn btn-secondary" style={{ textAlign: "center", textDecoration: "none" }}>
                                    📞 {place.phone}
                                </a>
                            )}
                            {place.website && (
                                <a href={place.website} target="_blank" className="btn btn-secondary" style={{ textAlign: "center", textDecoration: "none" }}>
                                    🌐 Visitar Sitio Web
                                </a>
                            )}
                            <button className="btn btn-primary">
                                🗺️ Ver en Mapas
                            </button>
                        </div>
                    </div>

                    <p style={{ fontSize: "0.8rem", opacity: 0.4, textAlign: "center" }}>
                        Registrado por el usuario: {(place.added_by || "").substring(0, 8)}... el {place.created_at ? new Date(place.created_at).toLocaleDateString() : "Fecha desconocida"}
                    </p>
                </div>
            </div>
        </div>
    );
}
