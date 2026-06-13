"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "100vh",
                    padding: "2rem",
                    textAlign: "center",
                    background: "var(--bg-dark)",
                    color: "var(--text-primary)"
                }}>
                    <div style={{ fontSize: "5rem", marginBottom: "1rem" }}>🙀</div>
                    <h1 style={{ fontSize: "2rem", marginBottom: "1rem", color: "#f87171" }}>
                        ¡Ups! Un michi se enredó en los cables
                    </h1>
                    <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", maxWidth: "500px" }}>
                        Ocurrió un error inesperado al cargar esta parte de la aplicación.
                        {this.state.error && (
                            <span style={{ display: "block", marginTop: "1rem", fontSize: "0.85rem", opacity: 0.7, background: "rgba(0,0,0,0.2)", padding: "1rem", borderRadius: "8px", wordBreak: "break-all" }}>
                                {this.state.error.message}
                            </span>
                        )}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
                            color: "white",
                            border: "none",
                            padding: "0.75rem 2rem",
                            borderRadius: "12px",
                            fontSize: "1rem",
                            fontWeight: "bold",
                            cursor: "pointer",
                            boxShadow: "0 4px 15px rgba(139, 92, 246, 0.3)",
                            transition: "transform 0.2s"
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                    >
                        🔄 Recargar Página
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
