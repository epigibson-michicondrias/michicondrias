"use client";

/**
 * Proveedores del núcleo espejo (como `mobile/app/_layout.tsx`): tema, sesión, carrito y avisos.
 * React Query ya lo pone `QueryProvider` en el layout raíz. Envuelve `(auth)` y `(app)`.
 */
import type { ReactNode } from "react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { AppAlertProvider } from "./AppAlert";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <AppAlertProvider>{children}</AppAlertProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
