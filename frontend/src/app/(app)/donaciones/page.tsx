import AppOnlyNotice from "@/components/ui/AppOnlyNotice";

// La versión anterior registraba donaciones sin cobrar. Las donaciones con pago (Stripe) se hacen en la app.
export default function DonacionesPage() {
  return (
    <AppOnlyNotice
      title="Donaciones disponibles en la app"
      message="Para donar con pago seguro con tarjeta, usa la app de Michicondrias."
      backHref="/inicio"
    />
  );
}
