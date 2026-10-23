"use client";

/**
 * Ayuda — espejo de `mobile/app/ayuda.tsx`. W4 porta el FAQ verídico de la app.
 */
import { HelpCircle } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Card from "@/components/Card";

export default function AyudaPage() {
  return (
    <ScreenContainer>
      <ScreenHeader title="Ayuda" />
      <Card>
        <p style={{ margin: 0, color: "var(--color-text)", fontWeight: 700 }}>¿Necesitas ayuda?</p>
        <p style={{ margin: "8px 0 0", color: "var(--color-text-muted)", lineHeight: 1.5 }}>
          Las preguntas frecuentes y el soporte completo llegan con la portada del módulo de ayuda.
          Mientras tanto, escríbenos desde tu perfil.
        </p>
      </Card>
    </ScreenContainer>
  );
}
