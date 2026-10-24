"use client";

/**
 * MaintenanceBanner — aviso no bloqueante cuando la plataforma está en modo mantenimiento.
 * El backend ya rechaza el login de no-admin con 503; esto solo informa en la web.
 */
import { Construction } from "lucide-react";
import { useMaintenanceMode } from "@/hooks/usePublicSettings";
import s from "./MaintenanceBanner.module.css";

export default function MaintenanceBanner() {
    const maintenance = useMaintenanceMode();

    if (!maintenance) return null;

    return (
        <div role="status" className={s.banner}>
            <Construction size={18} aria-hidden />
            <span>La plataforma está en mantenimiento. Algunas funciones pueden no estar disponibles.</span>
        </div>
    );
}
