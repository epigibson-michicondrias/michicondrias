"use client";

/**
 * Proveedores del núcleo espejo (como `mobile/app/_layout.tsx`): tema, sesión y avisos. React Query ya lo pone
 * `QueryProvider` en el layout raíz. En W3 envuelve el grupo `(app)`; hoy solo lo usa `/kit`.
 */
import type { ReactNode } from "react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppAlertProvider } from "./AppAlert";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppAlertProvider>{children}</AppAlertProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
