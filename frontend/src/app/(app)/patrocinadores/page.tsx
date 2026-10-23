"use client";

/**
 * Patrocinadores — campañas activas (`/patrocinadores`).
 * Espejo de `mobile/app/patrocinadores/index.tsx`.
 */
import { useRouter } from "next/navigation";
import { BarChart3, Megaphone, Plus } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import SearchBar from "@/components/SearchBar";
import { SkeletonList } from "@/components/Skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { normalizeRole } from "@/constants/roles";
import { useSponsors } from "@/hooks/sponsors/useSponsors";
import s from "@/features/patrocinadores/patrocinadores.module.css";

export default function PatrocinadoresPage() {
  const router = useRouter();
  const { user } = useAuth();
  const isSponsor = normalizeRole(user?.role_name) === "patrocinador";
  const { searchQuery, setSearchQuery, campaigns, isLoading, openCampaign } = useSponsors();

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Patrocinadores"
        subtitle="Campañas y promociones activas"
        actions={
          isSponsor
            ? [
                { icon: Plus, label: "Nueva campaña", onPress: () => router.push("/patrocinadores/nueva-campana") },
                { icon: BarChart3, label: "Estadísticas", onPress: () => router.push("/patrocinadores/estadisticas") },
              ]
            : undefined
        }
      />

      <div className={s.searchWrap}>
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="Buscar campañas..." />
      </div>

      {isLoading ? (
        <SkeletonList count={3} />
      ) : campaigns.length === 0 ? (
        <EmptyState
          icon={<Megaphone size={28} />}
          title={searchQuery ? "Sin resultados" : "No hay campañas activas"}
          subtitle={searchQuery ? "No encontramos campañas con ese nombre." : "Cuando un patrocinador publique una campaña aparecerá aquí."}
          actionLabel={searchQuery ? "Quitar búsqueda" : isSponsor ? "Crear campaña" : undefined}
          onAction={
            searchQuery
              ? () => setSearchQuery("")
              : isSponsor
                ? () => router.push("/patrocinadores/nueva-campana")
                : undefined
          }
        />
      ) : (
        <div className={s.list}>
          {campaigns.map((c) => {
            const mine = c.sponsor_id === user?.id;
            return (
              <Card
                key={c.id}
                onPress={c.target_link ? () => openCampaign(c) : undefined}
                accessibilityLabel={c.target_link ? `Abrir ${c.title}` : undefined}
              >
                <div className={s.campaign}>
                  {c.banner_url ? (
                    // eslint-disable-next-line @next/next/no-img-element -- el banner es una URL externa del patrocinador
                    <img src={c.banner_url} alt="" className={s.banner} />
                  ) : null}
                  <div className={s.campaignHead}>
                    <div className={s.iconBox}>
                      <Megaphone size={22} />
                    </div>
                    <div className={s.campaignInfo}>
                      <span className={s.campaignTitle}>{c.title}</span>
                      {c.target_link ? <span className={s.campaignLink}>{c.target_link}</span> : null}
                    </div>
                  </div>
                  {mine ? (
                    <div className={s.miniStats}>
                      <div className={s.miniStat}>
                        <span className={s.miniValue}>${c.budget_limit.toLocaleString("es-MX")}</span>
                        <span className={s.miniLabel}>Presupuesto</span>
                      </div>
                      <div className={s.miniStat}>
                        <span className={s.miniValue}>${c.spent.toLocaleString("es-MX")}</span>
                        <span className={s.miniLabel}>Gastado</span>
                      </div>
                    </div>
                  ) : null}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </ScreenContainer>
  );
}
