"use client";

import { useState, useEffect } from "react";

export default function OfflineBanner() {
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        // Initialize state based on navigator
        if (typeof window !== "undefined") {
            setIsOffline(!window.navigator.onLine);
        }

        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    if (!isOffline) return null;

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            background: "linear-gradient(90deg, #ef4444 0%, #f97316 100%)",
            color: "white",
            textAlign: "center",
            padding: "0.5rem",
            fontSize: "0.85rem",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            boxShadow: "0 4px 12px rgba(239, 68, 68, 0.4)",
            animation: "slideDown 0.3s ease-out forwards"
        }}>
            <span>⚠️</span>
            <span>Estás navegando sin conexión a internet. Algunas funciones de Michicondrias no estarán disponibles hasta que te reconectes.</span>
            
            <style jsx>{`
                @keyframes slideDown {
                    from { transform: translateY(-100%); }
                    to { transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
