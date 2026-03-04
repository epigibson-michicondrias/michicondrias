"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCurrentUser, User, hasRole } from "@/lib/auth";
import { getUserPets, Pet, createPet } from "@/lib/services/mascotas";
import dashStyles from "../dashboard.module.css";
import modStyles from "../modules.module.css";
import styles from "./carnet.module.css";
import petStyles from "../mascotas/mascotas.module.css";
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
        <div className={styles.container}>
            <div className={dashStyles["page-header"]}>
                <h1 className={dashStyles["page-title"]}>📋 Carnet Clínico</h1>
                <p className={dashStyles["page-subtitle"]}>
                    Expedientes médicos, vacunas y consultas de tus compañeros.
                </p>
            </div>

            {/* Action Bar */}
            <div className={styles["action-bar"]}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>📑</span>
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.95rem", fontWeight: 600 }}>
                        {pets.length} {pets.length === 1 ? 'Carnet activo' : 'Carnets activos'}
                    </span>
                </div>
                <button className={petStyles["btn-premium"]} onClick={() => setShowModal(true)}>
                    ✨ Registrar Nueva Mascota
                </button>
            </div>

            {isVetOrAdmin && (
                <div className={styles["medical-terminal"]}>
                    <div className={styles["terminal-info"]}>
                        <h3 className={styles["terminal-title"]}>
                            👨‍⚕️ Modo Médico Habilitado
                        </h3>
                        <p className={styles["terminal-subtitle"]}>
                            Acceso global a historiales de pacientes externos mediante ID digital.
                        </p>
                    </div>

                    <div className={styles["terminal-actions"]}>
                        <input
                            type="text"
                            className={`form-input ${styles["terminal-input"]}`}
                            placeholder="Introduce el ID del paciente..."
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                        />
                        <Link
                            href={`/dashboard/carnet/${searchId}`}
                            className={`btn btn-solid ${!searchId ? "disabled" : ""}`}
                            style={{
                                pointerEvents: searchId ? "auto" : "none",
                                opacity: searchId ? 1 : 0.5,
                                background: '#06b6d4',
                                borderColor: '#06b6d4',
                                color: '#000',
                                fontWeight: 800
                            }}
                        >
                            INICIAR CONSULTA 🏥
                        </Link>
                    </div>
                </div>
            )}

            {pets.length === 0 ? (
                <div className={modStyles["empty-state"]} style={{ padding: "5rem 2rem", background: "rgba(15,15,26,0.4)", borderRadius: "32px", border: "1px dashed rgba(255,255,255,0.1)" }}>
                    <span style={{ fontSize: "5rem", display: "block", marginBottom: "1rem" }}>🩺</span>
                    <h3 style={{ color: "#fff", fontSize: "1.5rem", fontWeight: "800" }}>Sin expedientes</h3>
                    <p style={{ color: "var(--text-secondary)" }}>Registra a tu mascota para generar su carnet clínico digital.</p>
                </div>
            ) : (
                <div className={styles["carnet-grid"]}>
                    {pets.map(pet => (
                        <div key={pet.id} className={styles["pet-medical-card"]}>
                            <div className={styles["card-header"]}>
                                <div className={styles["pet-avatar-wrapper"]}>
                                    {pet.species.toLowerCase() === "perro" ? "🐕" : pet.species.toLowerCase() === "gato" ? "🐈" : "🐾"}
                                </div>
                                <div className={styles["pet-main-info"]}>
                                    <h2 className={styles["pet-name"]}>{pet.name}</h2>
                                    <p className={styles["pet-breed"]}>{pet.breed || pet.species}</p>
                                </div>
                            </div>

                            <div className={styles["id-badge"]}>
                                <span>DIGITAL ID:</span> {pet.id.substring(0, 18)}...
                            </div>

                            <div className={styles["card-actions"]}>
                                <Link href={`/dashboard/carnet/${pet.id}`} className={styles["btn-open-carnet"]}>
                                    📂 Abrir Expediente Médico
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de Mascota Premium */}
            {showModal && (
                <div className={petStyles["modal-overlay"]}>
                    <div className={petStyles["modal-content"]} style={{ maxWidth: '500px' }}>
                        <div className={petStyles["modal-header"]}>
                            <h2 className={petStyles["modal-title"]}>✨ Nuevo Perfil Clínico</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{ background: "transparent", border: "none", color: "var(--text-secondary)", fontSize: "2rem", cursor: "pointer" }}
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleCreatePet} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                            <div className={petStyles["form-section"]}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label>Nombre del Paciente *</label>
                                    <input type="text" className="form-input" required value={newPet.name} onChange={e => setNewPet({ ...newPet, name: e.target.value })} placeholder="Ej. Milanesillo" />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label>Especie *</label>
                                    <select className="form-input" value={newPet.species} onChange={e => setNewPet({ ...newPet, species: e.target.value })}>
                                        <option value="Gato">🐈 Gato</option>
                                        <option value="Perro">🐕 Perro</option>
                                        <option value="Conejo">🐰 Conejo</option>
                                        <option value="Ave">🦜 Ave</option>
                                        <option value="Otro">🐾 Otro</option>
                                    </select>
                                </div>
                                <div>
                                    <label>Raza / Variedad</label>
                                    <input type="text" className="form-input" placeholder="Ej. Siamés, Mezcla..." value={newPet.breed} onChange={e => setNewPet({ ...newPet, breed: e.target.value })} />
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "1rem" }}>
                                <button type="button" className="btn btn-secondary" style={{ flex: 1, borderRadius: '16px' }} onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className={petStyles["btn-premium"]} style={{ flex: 1 }} disabled={creating}>
                                    {creating ? "Generando..." : "Crear Expediente"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
