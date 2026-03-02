"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register, login } from "@/lib/auth";
import styles from "../login/auth.module.css";

export default function RegisterPage() {
    const router = useRouter();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }

        setLoading(true);
        try {
            await register(email, password, fullName);
            // Auto-login after registration
            await login(email, password);
            router.push("/dashboard");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Error al registrar");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={styles["auth-page"]}>
            <div className={styles["auth-card"]}>
                <div className={styles["auth-card__logo"]}>
                    <span className={styles["auth-card__emoji"]}>🐾</span>
                    <h1 className={styles["auth-card__title"]}>
                        <span className="gradient-text">Crear Cuenta</span>
                    </h1>
                    <p className={styles["auth-card__subtitle"]}>
                        Únete al ecosistema Michicondrias
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && <div className={styles["auth-error"]}>{error}</div>}

                    <div className={styles["form-group"]}>
                        <label htmlFor="fullName">Nombre completo</label>
                        <input
                            id="fullName"
                            type="text"
                            placeholder="Tu nombre"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles["form-group"]}>
                        <label htmlFor="email">Correo electrónico</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="tu@correo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles["form-group"]}>
                        <label htmlFor="password">Contraseña</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <div className={styles["form-group"]}>
                        <label htmlFor="confirmPassword">Confirmar contraseña</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        className={`btn btn-primary ${styles["auth-submit"]}`}
                        disabled={loading}
                    >
                        {loading ? "Registrando..." : "Crear Cuenta"}
                    </button>
                </form>

                <p className={styles["auth-link"]}>
                    ¿Ya tienes cuenta?{" "}
                    <Link href="/login">Inicia sesión</Link>
                </p>
            </div>
        </div>
    );
}
