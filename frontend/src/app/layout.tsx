import type { Metadata } from "next";
import ToasterProvider from "@/components/ui/ToasterProvider";
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
        <ToasterProvider />
        {children}
      </body>
    </html>
  );
}
