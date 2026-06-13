import type { Metadata } from "next";
import ToasterProvider from "@/components/ui/ToasterProvider";
import QueryProvider from "@/components/QueryProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import OfflineBanner from "@/components/ui/OfflineBanner";
import "leaflet/dist/leaflet.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Michicondrias - Plataforma integral para mascotas",
  description: "Adopciones, directorio veterinario, tienda, carnet clínico y mucho más para el cuidado de tus mascotas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <ErrorBoundary>
          <QueryProvider>
            <OfflineBanner />
            <ToasterProvider />
            {children}
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
