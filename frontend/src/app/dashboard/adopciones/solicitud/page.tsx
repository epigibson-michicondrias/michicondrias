"use client";

import { useState, FormEvent, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCurrentUser, User } from "@/lib/auth";
import { requestAdoption, getListings, Listing } from "@/lib/services/adopciones";
import CustomSelect from "@/components/ui/CustomSelect";
import dashStyles from "../../dashboard.module.css";
import styles from "../../modules.module.css";

function SolicitudContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const listingId = searchParams.get("id");

    const [listing, setListing] = useState<Listing | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingAction, setLoadingAction] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // Controlled Form State
    const [formData, setFormData] = useState({
        house_type: "Casa",
        has_yard: "true",
        own_or_rent: "Propio",
        landlord_permission: "true",
        other_pets: "",
        has_children: "false",
        children_ages: "",
        hours_alone: "",
        financial_commitment: false,
        reason: "",
        previous_experience: ""
    });

    useEffect(() => {
        if (!listingId) {
            router.push("/dashboard/adopciones");
            return;
        }
        loadData();
    }, [listingId, router]);

    async function loadData() {
        try {
            const u = await getCurrentUser();
            setUser(u);
            // Check admin context securely early on
            const role = localStorage.getItem("user_role");
            if (role === "admin" || role === "veterinario") {
                setIsAdmin(true);
            }
        } catch (err) {
            console.error("Error loading user data", err);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!listingId) return;

        setLoadingAction(true);
        setError("");

        const form = new FormData(e.currentTarget);
        try {
            if (!user || user.verification_status !== "VERIFIED") {
                throw new Error("Debes verificar tu identidad (KYC) antes de enviar una solicitud.");
            }
            await requestAdoption(listingId, {
                applicant_name: user.full_name,
                house_type: formData.house_type,
                has_yard: formData.has_yard === "true",
                own_or_rent: formData.own_or_rent,
                landlord_permission: formData.landlord_permission === "true",
                other_pets: formData.other_pets || null,
                has_children: formData.has_children === "true",
                children_ages: formData.children_ages || null,
                hours_alone: Number(formData.hours_alone),
                financial_commitment: formData.financial_commitment,
                reason: formData.reason,
                previous_experience: formData.previous_experience || null,
            });
            setSuccess(true);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Error al enviar la solicitud");
        } finally {
            setLoadingAction(false);
        }
    }

    if (loading) return <p className={dashStyles["loading-text"]}>Validando perfil de seguridad...</p>;

    if (success) {
        return (
            <div className={styles["create-form"]} style={{ textAlign: "center" }}>
                <span style={{ fontSize: "4rem", display: "block", marginBottom: "1rem" }}>📝</span>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>
                    ¡Solicitud enviada con éxito!
                </h2>
                <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", lineHeight: 1.6 }}>
                    Gracias por tu interés. Tu solicitud ha sido recibida y será revisada con prioridad
                    en el bienestar del animalito. Nos comunicaremos contigo pronto.
                </p>
                <button
                    onClick={() => router.push("/dashboard/adopciones")}
                    className="btn btn-primary"
                >
                    Volver a Adopciones
                </button>
            </div>
        );
    }

    if (isAdmin) {
        return (
            <div className={styles["create-form"]} style={{ textAlign: "center", border: "1px dashed var(--error)" }}>
                <span style={{ fontSize: "4rem", display: "block", marginBottom: "1rem" }}>🚫</span>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>
                    Acción No Permitida
                </h2>
                <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", lineHeight: 1.6 }}>
                    Como parte del personal interno (Administrador o Veterinario), no puedes auto-enviarte solicitudes de adopción
                    a través del portal público.
                </p>
                <button
                    onClick={() => router.push("/dashboard/adopciones")}
                    className="btn btn-secondary"
                >
                    Volver al panel
                </button>
            </div>
        );
    }

    if (user && user.verification_status !== "VERIFIED") {
        return (
            <div className={styles["create-form"]} style={{ textAlign: "center", border: "1px dashed var(--primary-light)" }}>
                <span style={{ fontSize: "4rem", display: "block", marginBottom: "1rem" }}>👮</span>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>
                    {user.verification_status === "PENDING" ? "Verificación en Trámite" : "Verificación Requerida"}
                </h2>
                <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", lineHeight: 1.6 }}>
                    {user.verification_status === "PENDING"
                        ? "Estamos revisando tus documentos de identidad. Podrás solicitar adopciones en cuanto seas aprobado."
                        : "Para garantizar la seguridad y el bienestar de nuestras mascotas, es obligatorio verificar tu identidad con documentos oficiales antes de postularte."
                    }
                </p>
                <button
                    onClick={() => router.push("/dashboard/perfil/verificacion")}
                    className="btn btn-primary"
                >
                    {user.verification_status === "PENDING" ? "Ver Estatus de Seguridad" : "🛡️ Ir a Centro de Seguridad"}
                </button>
            </div>
        );
    }

    return (
        <>
            <div className={dashStyles["page-header"]}>
                <h1 className={dashStyles["page-title"]}>📋 Solicitud de Adopción</h1>
                <p className={dashStyles["page-subtitle"]}>
                    Tu compromiso es vital para la vida y felicidad de esta mascota
                </p>
            </div>

            <form onSubmit={handleSubmit} className={styles["create-form"]}>
                <fieldset disabled={loadingAction} style={{ border: "none", padding: 0, margin: 0 }}>
                    {error && <div className={styles["form-error"]}>⚠️ {error}</div>}

                    <p className={styles["form-section-title"]}>Hogar y Entorno</p>

                    <div className={styles["form-row"]}>
                        <div className={styles["form-group"]}>
                            <label>Tipo de vivienda</label>
                            <CustomSelect
                                disabled={loadingAction}
                                options={[
                                    { value: "Casa", label: "Casa", icon: "🏠" },
                                    { value: "Departamento", label: "Departamento", icon: "🏢" },
                                    { value: "Rancho/Granja", label: "Rancho/Granja", icon: "🌾" },
                                    { value: "Otro", label: "Otro", icon: "🏕️" }
                                ]}
                                value={formData.house_type}
                                onChange={(v) => setFormData({ ...formData, house_type: v })}
                            />
                        </div>
                        <div className={styles["form-group"]}>
                            <label>¿Tiene patio o jardín cercado?</label>
                            <CustomSelect
                                disabled={loadingAction}
                                options={[
                                    { value: "true", label: "Sí, tiene patio", icon: "🌳" },
                                    { value: "false", label: "No", icon: "❌" }
                                ]}
                                value={formData.has_yard}
                                onChange={(v) => setFormData({ ...formData, has_yard: v })}
                            />
                        </div>
                    </div>

                    <div className={styles["form-row"]}>
                        <div className={styles["form-group"]}>
                            <label>Situación de vivienda</label>
                            <CustomSelect
                                disabled={loadingAction}
                                options={[
                                    { value: "Propio", label: "Propia", icon: "🔑" },
                                    { value: "Renta", label: "Rentada", icon: "📜" }
                                ]}
                                value={formData.own_or_rent}
                                onChange={(v) => setFormData({ ...formData, own_or_rent: v })}
                            />
                        </div>
                        <div className={styles["form-group"]}>
                            <label>¿Permiten mascotas? (si renta)</label>
                            <CustomSelect
                                disabled={loadingAction}
                                options={[
                                    { value: "true", label: "Sí / N/A (Propia)", icon: "✅" },
                                    { value: "false", label: "No me permiten", icon: "⛔" }
                                ]}
                                value={formData.landlord_permission}
                                onChange={(v) => setFormData({ ...formData, landlord_permission: v })}
                            />
                        </div>
                    </div>

                    <p className={styles["form-section-title"]}>Familia y Rutina</p>

                    <div className={styles["form-row"]}>
                        <div className={styles["form-group"]}>
                            <label>¿Hay niños en casa?</label>
                            <CustomSelect
                                disabled={loadingAction}
                                options={[
                                    { value: "false", label: "No", icon: "🧑‍🤝‍🧑" },
                                    { value: "true", label: "Sí", icon: "👶" }
                                ]}
                                value={formData.has_children}
                                onChange={(v) => setFormData({ ...formData, has_children: v })}
                            />
                        </div>
                        <div className={styles["form-group"]}>
                            <label>Edades de los niños</label>
                            <input
                                name="children_ages"
                                placeholder="Ej: 5 y 8 años"
                                value={formData.children_ages}
                                onChange={e => setFormData({ ...formData, children_ages: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className={styles["form-group"]}>
                        <label>¿Cuántas horas al día pasará sola la mascota?</label>
                        <input
                            name="hours_alone"
                            type="number" min="0" max="24" required
                            value={formData.hours_alone}
                            onChange={e => setFormData({ ...formData, hours_alone: e.target.value })}
                        />
                    </div>

                    <div className={styles["form-group"]}>
                        <label>¿Tienes otras mascotas actualmente? ¿Cuáles?</label>
                        <textarea
                            name="other_pets"
                            placeholder="Especie, raza, edad..."
                            value={formData.other_pets}
                            onChange={e => setFormData({ ...formData, other_pets: e.target.value })}
                        />
                    </div>

                    <p className={styles["form-section-title"]}>Compromiso y Experiencia</p>

                    <div className={styles["form-group"]}>
                        <label>Describe tu experiencia previa con mascotas</label>
                        <textarea
                            name="previous_experience"
                            placeholder="He tenido perros toda mi vida..."
                            value={formData.previous_experience}
                            onChange={e => setFormData({ ...formData, previous_experience: e.target.value })}
                        />
                    </div>

                    <div className={styles["form-group"]}>
                        <label>¿Por qué deseas adoptar a esta mascota?</label>
                        <textarea
                            name="reason" required
                            placeholder="Explica tus motivos..."
                            value={formData.reason}
                            onChange={e => setFormData({ ...formData, reason: e.target.value })}
                        />
                    </div>

                    <div className={styles["form-group"]}>
                        <label className={styles["toggle-group"]}>
                            <input
                                type="checkbox"
                                name="financial_commitment"
                                required
                                checked={formData.financial_commitment}
                                onChange={e => setFormData({ ...formData, financial_commitment: e.target.checked })}
                            />
                            <div className={styles["toggle-switch"]}>
                                <div className={styles["toggle-knob"]}></div>
                            </div>
                            <span className={styles["toggle-label"]}>
                                Entiendo y acepto el compromiso financiero (comida, veterinario, vacunas) de por vida de la mascota.
                            </span>
                        </label>
                    </div>
                </fieldset>

                <div className={styles["form-actions"]}>
                    <button type="submit" className="btn btn-primary" disabled={loadingAction}>
                        {loadingAction ? "Enviando..." : "🤝 Enviar solicitud formal"}
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => router.back()}
                        disabled={loadingAction}
                    >
                        Volver
                    </button>
                </div>
            </form>
        </>
    );
}

export default function SolicitudAdopcionPage() {
    return (
        <Suspense fallback={<p style={{ padding: "2rem" }}>Cargando formulario...</p>}>
            <SolicitudContent />
        </Suspense>
    );
}
