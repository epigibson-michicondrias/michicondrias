"use client";

import { useState, useEffect } from "react";
import { createDonation, getDonations, Donation } from "@/lib/services/ecommerce";
import { getCurrentUser, User } from "@/lib/auth";
import dashStyles from "../dashboard.module.css";
import styles from "./donaciones.module.css";
import { toast } from "react-hot-toast";

const PRESET_AMOUNTS = [50, 100, 250, 500, 1000];
const DONATION_GOAL = 50000; // meta en MXN

export default function DonacionesPage() {
    const [donations, setDonations] = useState<Donation[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedAmount, setSelectedAmount] = useState<number | null>(100);
    const [customAmount, setCustomAmount] = useState("");
    const [message, setMessage] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const u = await getCurrentUser();
                setCurrentUser(u);
                const data = await getDonations();
                setDonations(data);
            } catch (err) {
                console.error("Error cargando donaciones", err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const totalDonated = donations.reduce((acc, d) => acc + d.amount, 0);
    const progressPercent = Math.min((totalDonated / DONATION_GOAL) * 100, 100);

    const finalAmount = selectedAmount ?? (parseFloat(customAmount) || 0);

    const handleDonate = async () => {
        if (finalAmount < 10) {
            toast.error("El monto mínimo es de $10 MXN");
            return;
        }
        setSubmitting(true);
        try {
            const created = await createDonation(finalAmount, message || undefined);
            setDonations([created, ...donations]);
            setShowSuccess(true);
            setMessage("");
            setSelectedAmount(100);
            setCustomAmount("");
            toast.success("¡Gracias por tu generosa donación! 💛");
            setTimeout(() => setShowSuccess(false), 5000);
        } catch (error: any) {
            toast.error(error.message || "Error al realizar donación");
        } finally {
            setSubmitting(false);
        }
    };

    const getTimeSince = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours < 1) return "Hace un momento";
        if (hours < 24) return `Hace ${hours}h`;
        const days = Math.floor(hours / 24);
        return `Hace ${days}d`;
    };

    return (
        <div className={styles.container}>
            <div className={dashStyles["page-header"]}>
                <h1 className={dashStyles["page-title"]}>💛 Donaciones para la Comunidad</h1>
                <p className={dashStyles["page-subtitle"]}>
                    Tu apoyo salva vidas. Cada peso cuenta para refugios, rescates y rehabilitación.
                </p>
            </div>

            <div className={styles.layout}>
                {/* Left Column: Donation Form */}
                <div className={styles["main-col"]}>
                    {/* Hero emocional */}
                    <div className={styles["hero-card"]}>
                        <div className={styles["hero-icon"]}>🐾</div>
                        <h2 className={styles["hero-title"]}>Haz la diferencia hoy</h2>
                        <p className={styles["hero-desc"]}>
                            Con tu donación, refugios locales pueden alimentar, vacunar y cuidar a mascotas rescatadas hasta que encuentren un hogar.
                        </p>

                        {/* Progress Bar */}
                        <div className={styles["progress-section"]}>
                            <div className={styles["progress-header"]}>
                                <span>Meta de la campaña</span>
                                <span className={styles["progress-amount"]}>${totalDonated.toLocaleString()} / ${DONATION_GOAL.toLocaleString()} MXN</span>
                            </div>
                            <div className={styles["progress-track"]}>
                                <div className={styles["progress-fill"]} style={{ width: `${progressPercent}%` }}></div>
                            </div>
                            <p className={styles["progress-supporters"]}>{donations.length} donador{donations.length !== 1 ? "es" : ""} han contribuido</p>
                        </div>
                    </div>

                    {/* Amount Selection */}
                    <div className={styles["amount-section"]}>
                        <h3 className={styles["section-title"]}>Selecciona un monto</h3>
                        <div className={styles["amount-grid"]}>
                            {PRESET_AMOUNTS.map(amt => (
                                <button
                                    key={amt}
                                    className={`${styles["amount-btn"]} ${selectedAmount === amt ? styles["amount-active"] : ""}`}
                                    onClick={() => { setSelectedAmount(amt); setCustomAmount(""); }}
                                >
                                    ${amt}
                                </button>
                            ))}
                            <div className={styles["custom-amount"]}>
                                <span className={styles["currency-symbol"]}>$</span>
                                <input
                                    type="number"
                                    placeholder="Otro"
                                    className={styles["custom-input"]}
                                    value={customAmount}
                                    onChange={e => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Message */}
                    <div className={styles["message-section"]}>
                        <label className={styles["section-title"]}>Mensaje de apoyo (opcional)</label>
                        <textarea
                            className="form-input"
                            rows={3}
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            placeholder="Escribe un mensaje para la comunidad..."
                        ></textarea>
                    </div>

                    {/* Donate Button */}
                    {showSuccess ? (
                        <div className={styles["success-banner"]}>
                            <span style={{ fontSize: "2rem" }}>🎉</span>
                            <div>
                                <h3>¡Donación Exitosa!</h3>
                                <p>Tu contribución ya está haciendo la diferencia. ¡Gracias, humano increíble!</p>
                            </div>
                        </div>
                    ) : (
                        <button
                            className={styles["donate-btn"]}
                            onClick={handleDonate}
                            disabled={submitting || finalAmount < 10}
                        >
                            {submitting ? (
                                <span>Procesando pago seguro...</span>
                            ) : (
                                <span>💛 Donar ${finalAmount > 0 ? finalAmount.toLocaleString() : "—"} MXN</span>
                            )}
                        </button>
                    )}

                    <p className={styles["secure-note"]}>🔒 Pago 100% seguro · Sin comisiones ocultas</p>
                </div>

                {/* Right Column: Recent Donations Wall */}
                <div className={styles["side-col"]}>
                    <h3 className={styles["wall-title"]}>🏆 Muro de Honor</h3>
                    <p className={styles["wall-desc"]}>Donaciones recientes de la comunidad</p>

                    {loading ? (
                        <p style={{ color: "var(--text-secondary)" }}>Cargando...</p>
                    ) : donations.length === 0 ? (
                        <div className={styles["wall-empty"]}>
                            <span style={{ fontSize: "2rem" }}>💛</span>
                            <p>Sé el primero en donar</p>
                        </div>
                    ) : (
                        <div className={styles["wall-list"]}>
                            {donations.slice(0, 15).map((d, idx) => (
                                <div key={d.id} className={styles["wall-item"]}>
                                    <div className={styles["wall-avatar"]}>
                                        {idx < 3 ? ["🥇", "🥈", "🥉"][idx] : "💛"}
                                    </div>
                                    <div className={styles["wall-info"]}>
                                        <span className={styles["wall-name"]}>Donador Anónimo</span>
                                        {d.message && <p className={styles["wall-msg"]}>&ldquo;{d.message}&rdquo;</p>}
                                    </div>
                                    <div className={styles["wall-amount"]}>
                                        <span>${d.amount.toLocaleString()}</span>
                                        <span className={styles["wall-date"]}>{getTimeSince(d.date)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
