"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCurrentUser, User, hasRole } from "@/lib/auth";
import { getUserPets, Pet, createPet } from "@/lib/services/mascotas";
import dashStyles from "../dashboard.module.css";
import modStyles from "../modules.module.css";
import { toast } from "react-hot-toast";

export default function CarnetPage() {
    const [user, setUser] = useState<User | null>(null);
    const [pets, setPets] = useState<Pet[]>([]);
    const [loading, setLoading] = useState(true);

    // UI state
    const [showModal, setShowModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newPet, setNewPet] = useState({ name: "", species: "Gato", breed: "" });
    const [searchId, setSearchId] = useState("");
    const [isVetOrAdmin, setIsVetOrAdmin] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const u = await getCurrentUser();
                setUser(u);

                // Fetch dynamic role check client side
                const r = hasRole("veterinario") || hasRole("admin");
                setIsVetOrAdmin(r);

                if (u?.id) {
                    const userPets = await getUserPets(u.id);
                    setPets(userPets);
                }
            } catch (err) {
                console.error("Error cargando carnet", err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const handleCreatePet = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setCreating(true);
        try {
            const added = await createPet({
                ...newPet,
                owner_id: user.id
            });
            setPets([...pets, added]);
            setShowModal(false);
            setNewPet({ name: "", species: "Gato", breed: "" });
            toast.success("Mascota registrada exitosamente");
        } catch (err: any) {
            toast.error(err.message || "Error al registrar la mascota");
        } finally {
            setCreating(false);
        }
    };

    if (loading) return <p className={dashStyles["loading-text"]}>Cargando historiales...</p>;

    return (
        <div style={{ animation: "fadeIn 0.4s ease-out" }}>
            <div className={dashStyles["page-header"]}>
                <h1 className={dashStyles["page-title"]}>📋 Carnet Clínico de Mascotas</h1>
                <p className={dashStyles["page-subtitle"]}>
                    Gestiona el historial médico, vacunas y consultas de tus compañeros de vida.
                </p>
                <div style={{ marginTop: "1.5rem" }}>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        + Registrar Nueva Mascota
                    </button>
                </div>
            </div>

            {isVetOrAdmin && (
                <div style={{ background: "rgba(124, 58, 237, 0.1)", padding: "1.5rem", borderRadius: "var(--radius-md)", border: "1px solid rgba(124, 58, 237, 0.3)", marginBottom: "2rem", display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap", position: "relative" }}>
                    <div style={{ flex: 1, minWidth: "250px" }}>
                        <h3 style={{ fontSize: "1.05rem", color: "#fff", marginBottom: "0.2rem" }}>👨‍⚕️ Modo Médico Habilitado</h3>
                        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0 }}>Como veterinario puedes ingresar el ID de un paciente externo y atarlo a tu historial de clínica.</p>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Introduce el ID del paciente..."
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                            style={{ minWidth: "250px", marginBottom: 0 }}
                        />
                        <Link href={`/dashboard/carnet/${searchId}`} className={`btn btn-solid ${!searchId ? "disabled" : ""}`} style={{ pointerEvents: searchId ? "auto" : "none", opacity: searchId ? 1 : 0.5, padding: "0.75rem 1rem", height: "100%", whiteSpace: "nowrap" }}>
                            Abrir Consulta 🏥
                        </Link>
                    </div>
                </div>
            )}

            {pets.length === 0 ? (
                <div className={modStyles["empty-state"]}>
                    <span className={modStyles["empty-state__icon"]}>🐾</span>
                    <p className={modStyles["empty-state__text"]}>Aún no tienes mascotas personales registradas.</p>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
                    {pets.map(pet => (
                        <div key={pet.id} style={{
                            background: "var(--bg-glass)",
                            border: "1px solid var(--border-color)",
                            borderRadius: "var(--radius-lg)",
                            padding: "1.5rem",
                            display: "flex",
                            flexDirection: "column",
                            gap: "1rem"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", justifyItems: "center", gap: "1rem" }}>
                                <div style={{
                                    width: "60px", height: "60px",
                                    borderRadius: "50%",
                                    background: "linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(59, 130, 246, 0.3))",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "1.5rem"
                                }}>
                                    {pet.species.toLowerCase() === "perro" ? "🐶" : pet.species.toLowerCase() === "gato" ? "🐱" : "🐾"}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fff", margin: "0 0 0.2rem 0" }}>{pet.name}</h2>
                                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0 }}>{pet.breed || pet.species}</p>
                                </div>
                            </div>

                            <div style={{ background: "rgba(0,0,0,0.2)", padding: "0.5rem 1rem", borderRadius: "6px", fontSize: "0.75rem", textAlign: "center", fontFamily: "monospace", color: "var(--primary-light)" }}>
                                ID: {pet.id}
                            </div>

                            <Link href={`/dashboard/carnet/${pet.id}`} className="btn btn-outline" style={{ textAlign: "center", justifyContent: "center", width: "100%", marginTop: "auto" }}>
                                📂 Abrir Carnet / Expediente
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de Mascota  */}
            {showModal && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
                    <div style={{ background: "var(--bg-glass)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", padding: "2rem", width: "100%", maxWidth: "450px" }}>
                        <h2 style={{ color: "#fff", marginBottom: "1.5rem", fontSize: "1.4rem" }}>Nueva Mascota</h2>
                        <form onSubmit={handleCreatePet} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div>
                                <label>Nombre *</label>
                                <input type="text" className="form-input" required value={newPet.name} onChange={e => setNewPet({ ...newPet, name: e.target.value })} />
                            </div>
                            <div>
                                <label>Especie *</label>
                                <select className="form-input" value={newPet.species} onChange={e => setNewPet({ ...newPet, species: e.target.value })}>
                                    <option value="Gato">Gato</option>
                                    <option value="Perro">Perro</option>
                                    <option value="Conejo">Conejo</option>
                                    <option value="Ave">Ave</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>
                            <div>
                                <label>Raza</label>
                                <input type="text" className="form-input" placeholder="Ej. Siamés, Golden Retriever..." value={newPet.breed} onChange={e => setNewPet({ ...newPet, breed: e.target.value })} />
                            </div>
                            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={creating}>
                                    {creating ? "Creando..." : "Crear Perfil"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
