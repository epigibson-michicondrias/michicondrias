import AppOnlyNotice from "@/components/ui/AppOnlyNotice";

// La versión anterior simulaba el GPS y guardaba coordenadas aleatorias en el reporte. Michi-Tracker vive en la app.
export default function RastreoPage() {
  return (
    <AppOnlyNotice
      title="Rastreo disponible en la app"
      message="El seguimiento en tiempo real con Michi-Tracker Pro está disponible en la app de Michicondrias."
      backHref="/perdidas"
    />
  );
}
