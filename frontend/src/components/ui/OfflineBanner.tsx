"use client";

import { useSyncExternalStore } from "react";
import { WifiOff } from "lucide-react";
import s from "./OfflineBanner.module.css";

function subscribe(callback: () => void) {
    window.addEventListener("online", callback);
    window.addEventListener("offline", callback);
    return () => {
        window.removeEventListener("online", callback);
        window.removeEventListener("offline", callback);
    };
}

function getSnapshot() {
    return !window.navigator.onLine;
}

function getServerSnapshot() {
    return false;
}

export default function OfflineBanner() {
    const isOffline = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    if (!isOffline) return null;

    return (
        <div role="status" className={s.banner}>
            <WifiOff size={18} aria-hidden />
            <span>Estás navegando sin conexión a internet. Algunas funciones de Michicondrias no estarán disponibles hasta que te reconectes.</span>
        </div>
    );
}
