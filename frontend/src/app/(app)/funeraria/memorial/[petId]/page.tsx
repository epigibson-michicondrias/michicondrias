"use client";

/**
 * Memorial de una mascota — recuerdos y mensajes de amor.
 * Espejo de `mobile/app/funeraria/memorial/[petId].tsx`.
 */
import { useParams, useRouter } from "next/navigation";
import { Heart, Feather, Plus, Calendar } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Card from "@/components/Card";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import { SkeletonList } from "@/components/Skeleton";
import { useMemorial } from "@/hooks/funerary/useMemorial";
import { formatDate } from "@/utils/formatters";
import local from "../../funeraria.module.css";

export default function MemorialPage() {
  const params = useParams<{ petId: string }>();
  const router = useRouter();
  const petId = params.petId;
  const { feed, isLoadingFeed, isRefetching, refetchFeed } = useMemorial(petId);

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Memorial"
        subtitle="Recuerdos y mensajes de amor"
        actions={[
          {
            icon: Plus,
            label: "Nuevo mensaje",
            onPress: () => router.push(`/funeraria/memorial/nuevo?pet_id=${petId}`),
          },
        ]}
      />

      {isLoadingFeed ? (
        <SkeletonList count={3} />
      ) : feed.length === 0 ? (
        <EmptyState
          icon={<Heart size={28} />}
          title="Aún no hay mensajes"
          subtitle="Sé el primero en compartir un recuerdo."
          actionLabel="Nuevo mensaje"
          onAction={() => router.push(`/funeraria/memorial/nuevo?pet_id=${petId}`)}
        />
      ) : (
        <div className={local.list}>
          {feed.map((post) => (
            <Card key={post.id}>
              <div className={local.cardBody}>
                <div className={local.rowTop}>
                  <span className={local.iconBox} aria-hidden>
                    <Feather size={20} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className={local.message}>{post.message}</p>
                    {post.created_at ? (
                      <p className={local.messageDate}>
                        <Calendar size={12} aria-hidden /> {formatDate(post.created_at, { includeTime: true })}
                      </p>
                    ) : null}
                  </div>
                </div>
                {post.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element -- foto del memorial subida por el usuario
                  <img
                    src={post.photo_url}
                    alt="Recuerdo compartido en el memorial"
                    style={{ width: "100%", borderRadius: 14, maxHeight: 320, objectFit: "cover" }}
                  />
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      )}

      <div style={{ marginTop: "var(--space-xl)" }}>
        <Button
          label={isRefetching ? "Actualizando…" : "Actualizar memorial"}
          variant="ghost"
          onPress={() => refetchFeed()}
          icon={<Heart size={18} />}
        />
      </div>
    </ScreenContainer>
  );
}
