"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/lib/auth";
import styles from "./auth.module.css";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await login(email, password);
            router.push("/dashboard");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Error al iniciar sesión");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={styles["auth-page"]}>
            <div className={styles["auth-card"]}>
                <div className={styles["auth-card__logo"]}>
                    <span className={styles["auth-card__emoji"]}>🐱</span>
                    <h1 className={styles["auth-card__title"]}>
                        <span className="gradient-text">Inicia Sesión</span>
                    </h1>
                    <p className={styles["auth-card__subtitle"]}>
                        Accede a tu cuenta de Michicondrias
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && <div className={styles["auth-error"]}>{error}</div>}

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
                        />
                    </div>

                    <button
                        type="submit"
                        className={`btn btn-primary ${styles["auth-submit"]}`}
                        disabled={loading}
                    >
                        {loading ? "Entrando..." : "Iniciar Sesión"}
                    </button>
                </form>

                <p className={styles["auth-link"]}>
                    ¿No tienes cuenta?{" "}
                    <Link href="/register">Regístrate aquí</Link>
                </p>
            </div>
        </div>
    );
}
