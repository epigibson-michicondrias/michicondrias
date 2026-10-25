"use client";

/**
 * Mis Pólizas — seguros activos de tus mascotas.
 * Espejo de `mobile/app/aseguradoras/mis-polizas.tsx`.
 */
import { useRouter } from "next/navigation";
import {
  Shield,
  ShieldCheck,
  ShieldX,
  Calendar,
  DollarSign,
  FileText,
  Dog,
  Cat,
  PawPrint,
} from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import { SkeletonList } from "@/components/Skeleton";
import { useMyPolicies } from "@/hooks/insurance/useMyPolicies";
import { formatDate, formatCurrency, getSpeciesLabel } from "@/utils/formatters";
import local from "../aseguradoras.module.css";

export default function MisPolizasPage() {
  const router = useRouter();
  const { petsWithPolicies, insuredCount, uninsuredCount, isLoading } = useMyPolicies();

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Mis Pólizas"
        subtitle="Seguros activos de tus mascotas"
        actions={[
          {
            icon: FileText,
            label: "Presentar reclamo",
            onPress: () => router.push("/aseguradoras/reclamo/nuevo"),
          },
        ]}
      />

      <div className={local.summaryRow}>
        <Card style={{ padding: "var(--space-md) var(--space-lg)" }}>
          <div className={local.summaryCard} style={{ padding: 0 }}>
            <span className={local.summaryValue}>{insuredCount}</span>
            <span className={local.summaryLabel}>Aseguradas</span>
          </div>
        </Card>
        <Card style={{ padding: "var(--space-md) var(--space-lg)" }}>
          <div className={local.summaryCard} style={{ padding: 0 }}>
            <span className={local.summaryValue}>{uninsuredCount}</span>
            <span className={local.summaryLabel}>Sin seguro</span>
          </div>
        </Card>
      </div>

      {isLoading ? (
        <SkeletonList count={3} />
      ) : petsWithPolicies.length === 0 ? (
        <EmptyState
          icon={<PawPrint size={28} />}
          title="No tienes mascotas registradas"
          subtitle="Registra una mascota para poder asegurarla"
          actionLabel="Registrar mascota"
          onAction={() => router.push("/mascotas")}
        />
      ) : (
        <div className={local.list}>
          {petsWithPolicies.map(({ pet, policy, isLoadingPolicy }) => {
            const PetIcon = pet.species === "gato" ? Cat : pet.species === "perro" ? Dog : PawPrint;
            return (
              <Card key={pet.id}>
                <div className={local.petRow}>
                  <div className={local.petHeader}>
                    <span className={local.petIcon} aria-hidden>
                      <PetIcon size={20} />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className={local.petName}>{pet.name}</p>
                      <p className={local.petMeta}>{getSpeciesLabel(pet.species)}</p>
                    </div>
                    {isLoadingPolicy ? (
                      <SkeletonList count={1} />
                    ) : policy ? (
                      <Badge
                        label="Asegurado"
                        color="var(--color-success)"
                        icon={<ShieldCheck size={12} aria-hidden />}
                      />
                    ) : (
                      <Badge
                        label="Sin seguro"
                        color="var(--color-text-muted)"
                        icon={<ShieldX size={12} aria-hidden />}
                      />
                    )}
                  </div>

                  {policy ? (
                    <div className={local.policyBox}>
                      <p className={local.policyLine}>
                        <Shield size={14} aria-hidden /> Póliza {policy.policy_number}
                      </p>
                      <p className={local.policyLine}>
                        <DollarSign size={14} aria-hidden /> Prima: {formatCurrency(policy.monthly_premium)}/mes
                      </p>
                      <p className={local.policyLine}>
                        <Calendar size={14} aria-hidden /> Vigencia: {formatDate(policy.start_date)} —{" "}
                        {formatDate(policy.end_date)}
                      </p>
                    </div>
                  ) : null}

                  <div className={local.rowActions}>
                    {!policy ? (
                      <Button
                        label="Cotizar seguro"
                        size="sm"
                        fullWidth={false}
                        onPress={() => router.push(`/aseguradoras/cotizar?pet_id=${pet.id}`)}
                      />
                    ) : (
                      <Button
                        label="Presentar reclamo"
                        size="sm"
                        variant="secondary"
                        fullWidth={false}
                        onPress={() => router.push(`/aseguradoras/reclamo/nuevo?pet_id=${pet.id}`)}
                      />
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: "var(--space-xl)" }}>
        <Button
          label="Ver planes disponibles"
          variant="secondary"
          onPress={() => router.push("/aseguradoras")}
          icon={<Shield size={18} />}
        />
      </div>
    </ScreenContainer>
  );
}
