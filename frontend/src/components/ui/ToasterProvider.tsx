"use client";

import { Toaster } from "react-hot-toast";

export default function ToasterProvider() {
    return (
        <Toaster
            position="top-center"
            toastOptions={{
                duration: 4000,
                style: {
                    background: "#1e1e24",
                    color: "#fff",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "12px",
                    padding: "16px",
                    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)",
                },
                success: {
                    iconTheme: {
                        primary: "#10b981",
                        secondary: "#1e1e24",
                    },
                },
                error: {
                    iconTheme: {
                        primary: "#ef4444",
                        secondary: "#1e1e24",
                    },
                },
            }}
        />
    );
}
