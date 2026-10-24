"use client";

/**
 * Aviso para funciones que la web todavía no implementa de forma segura y viven solo en la app.
 * Se usa en lugar de páginas que simulaban datos (rastreo GPS aleatorio, donaciones sin cobro).
 */
import { useRouter } from "next/navigation";
import { Smartphone } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";

interface AppOnlyNoticeProps {
  title: string;
  message: string;
  backHref: string;
}

export default function AppOnlyNotice({ title, message, backHref }: AppOnlyNoticeProps) {
  const router = useRouter();
  const goBack = () => router.push(backHref);

  return (
    <ScreenContainer>
      <ScreenHeader title={title} variant="plain" onBack={goBack} />
      <Card>
        <EmptyState
          icon={<Smartphone size={32} aria-hidden />}
          title="Solo en la app"
          subtitle={message}
          actionLabel="Volver"
          onAction={goBack}
        />
      </Card>
    </ScreenContainer>
  );
}
