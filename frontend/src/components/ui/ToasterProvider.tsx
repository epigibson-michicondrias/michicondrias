"use client";

import { Toaster } from "react-hot-toast";

/** Avisos flotantes — colores desde tokens (funcionan en claro y oscuro). */
export default function ToasterProvider() {
    return (
        <Toaster
            position="top-center"
            toastOptions={{
                duration: 4000,
                style: {
                    background: "var(--color-card)",
                    color: "var(--color-text)",
                    border: "1px solid var(--color-card-border)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "var(--radius-md)",
                    padding: "var(--space-lg)",
                    boxShadow: "var(--shadow-floating)",
                },
                success: {
                    iconTheme: {
                        primary: "var(--color-success)",
                        secondary: "var(--color-on-primary)",
                    },
                },
                error: {
                    iconTheme: {
                        primary: "var(--color-error)",
                        secondary: "var(--color-on-primary)",
                    },
                },
            }}
        />
    );
}
