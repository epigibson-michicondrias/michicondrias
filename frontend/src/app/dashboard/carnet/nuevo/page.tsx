"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createRecord } from "@/lib/services/carnet";
import dashStyles from "../../dashboard.module.css";
import styles from "../../modules.module.css";

export default function NuevoCarnetPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");
        const form = new FormData(e.currentTarget);
        try {
            await createRecord({
                pet_id: form.get("pet_id") as string,
                reason_for_visit: form.get("reason") as string,
                diagnosis: (form.get("diagnosis") as string) || undefined,
                treatment: (form.get("treatment") as string) || undefined,
                weight_kg: form.get("weight") ? Number(form.get("weight")) : undefined,
                notes: (form.get("notes") as string) || undefined,
                prescriptions: [],
            });
            router.push("/dashboard/carnet");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Error al crear");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div className={dashStyles["page-header"]}>
                <h1 className={dashStyles["page-title"]}>📋 Nuevo Registro</h1>
                <p className={dashStyles["page-subtitle"]}>Agregar consulta médica al carnet</p>
            </div>
            <form onSubmit={handleSubmit} className={styles["create-form"]}>
                {error && <div style={{ color: "var(--error)", marginBottom: "1rem" }}>{error}</div>}
                <div className={styles["form-group"]}>
                    <label>ID de la mascota</label>
                    <input name="pet_id" placeholder="ID de la mascota" required />
                </div>
                <div className={styles["form-group"]}>
                    <label>Motivo de la visita</label>
                    <input name="reason" placeholder="Ej: Revisión general" required />
                </div>
                <div className={styles["form-group"]}>
                    <label>Diagnóstico</label>
                    <textarea name="diagnosis" placeholder="Diagnóstico..." />
                </div>
                <div className={styles["form-group"]}>
                    <label>Tratamiento</label>
                    <textarea name="treatment" placeholder="Tratamiento indicado..." />
                </div>
                <div className={styles["form-group"]}>
                    <label>Peso (kg)</label>
                    <input name="weight" type="number" step="0.1" min="0" placeholder="Ej: 5.2" />
                </div>
                <div className={styles["form-group"]}>
                    <label>Notas</label>
                    <textarea name="notes" placeholder="Notas adicionales..." />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Guardando..." : "Guardar registro"}
                </button>
            </form>
        </>
    );
}
