"use client";

import { useEffect, useState } from "react";
import { getPlaces, createPlace, PetfriendlyPlace, PlaceCreate } from "@/lib/services/petfriendly";
import dashStyles from "../dashboard.module.css";
import modStyles from "../modules.module.css";
import styles from "./petfriendly.module.css";
import { toast } from "react-hot-toast";

const CATEGORY_ICONS: Record<string, string> = {
    restaurante: "🍽️",
    cafe: "☕",
    parque: "🌳",
    hotel: "🏨",
    tienda: "🛍️",
    veterinaria: "🩺",
    playa: "🏖️",
};

export default function PetfriendlyPage() {
    const [places, setPlaces] = useState<PetfriendlyPlace[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState<PlaceCreate>({
        name: "", category: "restaurante", address: "", city: "",
        description: "", image_url: "", phone: "", website: "",
        rating: 4, pet_sizes_allowed: "todos", has_water_bowls: "no", has_pet_menu: "no",
    });

    useEffect(() => {
        async function load() {
            try {
                const data = await getPlaces();
                setPlaces(data);
            } catch (err) {
                console.error("Error cargando lugares", err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const filtered = places.filter(p => {
        const matchesCat = filterCategory === "all" || p.category === filterCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.address?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
            (p.city?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
        return matchesCat && matchesSearch;
    });

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const created = await createPlace(formData);
            setPlaces([created, ...places]);
            setShowModal(false);
            setFormData({
                name: "", category: "restaurante", address: "", city: "",
                description: "", image_url: "", phone: "", website: "",
                rating: 4, pet_sizes_allowed: "todos", has_water_bowls: "no", has_pet_menu: "no",
            });
            toast.success("¡Lugar petfriendly agregado con éxito! 📍");
        } catch (error: any) {
            toast.error(error.message || "Error al agregar lugar");
        } finally {
            setSubmitting(false);
        }
    };

    const renderStars = (rating: number) => {
        return "★".repeat(rating) + "☆".repeat(5 - rating);
    };

    return (
        <div className={styles.container}>
            <div className={dashStyles["page-header"]}>
                <h1 className={dashStyles["page-title"]}>📍 Mapa Petfriendly</h1>
                <p className={dashStyles["page-subtitle"]}>
                    Descubre restaurantes, parques, hoteles y tiendas donde tu mascota es bienvenida.
                </p>
            </div>

            {/* Category Pills */}
            <div className={styles["category-pills"]}>
                {[{ key: "all", label: "🗺️ Todos" },
                { key: "restaurante", label: "🍽️ Restaurantes" },
                { key: "cafe", label: "☕ Cafés" },
                { key: "parque", label: "🌳 Parques" },
                { key: "hotel", label: "🏨 Hoteles" },
                { key: "tienda", label: "🛍️ Tiendas" },
                { key: "veterinaria", label: "🩺 Veterinarias" },
                ].map(cat => (
                    <button
                        key={cat.key}
                        className={`${styles.pill} ${filterCategory === cat.key ? styles["pill-active"] : ""}`}
                        onClick={() => setFilterCategory(cat.key)}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            <div className={modStyles["module-page__toolbar"]}>
                <input
                    type="text"
                    placeholder="🔍 Buscar por nombre, dirección, ciudad..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="form-input"
                    style={{ flex: 1, minWidth: "200px" }}
                />
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    ➕ Recomendar Lugar
                </button>
            </div>

            {loading ? (
                <p style={{ color: "var(--text-secondary)", marginTop: "2rem" }}>Cargando mapa...</p>
            ) : filtered.length === 0 ? (
                <div className={modStyles["empty-state"]}>
                    <span className={modStyles["empty-state__icon"]}>🗺️</span>
                    <p className={modStyles["empty-state__text"]}>No hay lugares registrados en esta categoría. ¡Sé el primero en recomendar uno!</p>
                </div>
            ) : (
                <div className={styles["places-grid"]}>
                    {filtered.map(place => (
                        <div key={place.id} className={styles["place-card"]}>
                            <div className={styles["place-image"]} style={{
                                backgroundImage: place.image_url ? `url(${place.image_url})` : "none"
                            }}>
                                {!place.image_url && <span style={{ fontSize: "3rem" }}>{CATEGORY_ICONS[place.category] || "📍"}</span>}
                                <div className={styles["place-category-badge"]}>
                                    {CATEGORY_ICONS[place.category] || "📍"} {place.category}
                                </div>
                            </div>

                            <div className={styles["place-body"]}>
                                <h3 className={styles["place-name"]}>{place.name}</h3>
                                <div className={styles["place-stars"]}>{renderStars(place.rating)}</div>

                                {place.address && <p className={styles["place-address"]}>📍 {place.address}</p>}
                                {place.city && <span className={styles["place-city"]}>{place.city}</span>}

                                {place.description && (
                                    <p className={styles["place-desc"]}>
                                        {place.description.length > 100 ? place.description.substring(0, 100) + "..." : place.description}
                                    </p>
                                )}

                                <div className={styles["place-tags"]}>
                                    <span className={styles.tag}>🐾 {place.pet_sizes_allowed}</span>
                                    {place.has_water_bowls === "si" && <span className={styles.tag}>💧 Bebederos</span>}
                                    {place.has_pet_menu === "si" && <span className={styles.tag}>🍖 Menú Pet</span>}
                                </div>

                                <div className={styles["place-actions"]}>
                                    {place.phone && <a href={`tel:${place.phone}`} className={styles["action-link"]}>📞 Llamar</a>}
                                    {place.website && <a href={place.website} target="_blank" rel="noopener noreferrer" className={styles["action-link"]}>🌐 Web</a>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "1rem" }}>
                    <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", padding: "2rem", width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <h2 style={{ fontSize: "1.5rem", color: "#fff", margin: 0 }}>📍 Recomendar Lugar Petfriendly</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: "transparent", border: "none", color: "var(--text-secondary)", fontSize: "1.5rem", cursor: "pointer" }}>&times;</button>
                        </div>

                        <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div className={dashStyles["form-section"]}>
                                <h3 className={dashStyles["form-section-title"]}>Información del Lugar</h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                    <div style={{ display: "flex", gap: "1rem" }}>
                                        <div style={{ flex: 2 }}>
                                            <label>Nombre del lugar *</label>
                                            <input type="text" className="form-input" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Ej. Café Pawsome" />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label>Categoría *</label>
                                            <select className="form-input" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                                <option value="restaurante">🍽️ Restaurante</option>
                                                <option value="cafe">☕ Café</option>
                                                <option value="parque">🌳 Parque</option>
                                                <option value="hotel">🏨 Hotel</option>
                                                <option value="tienda">🛍️ Tienda</option>
                                                <option value="veterinaria">🩺 Veterinaria</option>
                                                <option value="playa">🏖️ Playa</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", gap: "1rem" }}>
                                        <div style={{ flex: 2 }}>
                                            <label>Dirección</label>
                                            <input type="text" className="form-input" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="Ej. Av. Insurgentes Sur 234" />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label>Ciudad</label>
                                            <input type="text" className="form-input" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} placeholder="CDMX" />
                                        </div>
                                    </div>
                                    <div>
                                        <label>Descripción</label>
                                        <textarea className="form-input" rows={2} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="¿Qué lo hace un gran spot para mascotas?"></textarea>
                                    </div>
                                </div>
                            </div>

                            <div className={dashStyles["form-section"]}>
                                <h3 className={dashStyles["form-section-title"]}>Amenidades Pet</h3>
                                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                                    <div style={{ flex: 1, minWidth: "120px" }}>
                                        <label>Tamaños aceptados</label>
                                        <select className="form-input" value={formData.pet_sizes_allowed} onChange={e => setFormData({ ...formData, pet_sizes_allowed: e.target.value })}>
                                            <option value="todos">Todos</option>
                                            <option value="pequeños">Solo pequeños</option>
                                            <option value="pequeños y medianos">Pequeños y Medianos</option>
                                        </select>
                                    </div>
                                    <div style={{ flex: 1, minWidth: "120px" }}>
                                        <label>¿Bebederos?</label>
                                        <select className="form-input" value={formData.has_water_bowls} onChange={e => setFormData({ ...formData, has_water_bowls: e.target.value })}>
                                            <option value="no">No</option>
                                            <option value="si">Sí</option>
                                        </select>
                                    </div>
                                    <div style={{ flex: 1, minWidth: "120px" }}>
                                        <label>¿Menú Pet?</label>
                                        <select className="form-input" value={formData.has_pet_menu} onChange={e => setFormData({ ...formData, has_pet_menu: e.target.value })}>
                                            <option value="no">No</option>
                                            <option value="si">Sí</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "1rem" }}>
                                <div style={{ flex: 1 }}>
                                    <label>Teléfono</label>
                                    <input type="tel" className="form-input" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="55 1234 5678" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label>Sitio Web</label>
                                    <input type="text" className="form-input" value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })} placeholder="https://..." />
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={submitting}>
                                    {submitting ? "Guardando..." : "Publicar Recomendación 📍"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
