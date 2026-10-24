"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Cat, RefreshCw } from "lucide-react";
import Button from "@/components/Button";
import s from "./ErrorBoundary.module.css";

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
                <div className={s.wrap}>
                    <div className={s.icon} aria-hidden>
                        <Cat size={32} />
                    </div>
                    <h1 className={s.title}>¡Ups! Un michi se enredó en los cables</h1>
                    <p className={s.desc}>
                        Ocurrió un error inesperado al cargar esta parte de la aplicación.
                        {this.state.error && (
                            <span className={s.detail}>
                                {this.state.error.message}
                            </span>
                        )}
                    </p>
                    <Button
                        label="Recargar página"
                        onPress={() => window.location.reload()}
                        icon={<RefreshCw size={18} aria-hidden />}
                        fullWidth={false}
                    />
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
