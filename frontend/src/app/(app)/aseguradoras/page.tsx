"use client";

/**
 * Aseguradoras — listado de planes de seguro.
 * Espejo de `mobile/app/aseguradoras/index.tsx`.
 */
import { useRouter } from "next/navigation";
import { Shield, Clock, DollarSign, Plus, CheckCircle, FolderHeart, ClipboardList, ShieldCheck } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import SearchBar from "@/components/SearchBar";
import EmptyState from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useInsurancePlans } from "@/hooks/insurance/useInsurancePlans";
import { formatCurrency } from "@/utils/formatters";
import local from "./aseguradoras.module.css";

function speciesLabel(species: string) {
  if (species === "dog") return "Perro";
  if (species === "cat") return "Gato";
  return species;
}

export default function AseguradorasPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { plans, isLoading, search, setSearch, hasSearch } = useInsurancePlans();

  const roleName = user?.role_name || "";
  const isInsurer = roleName === "aseguradora" || roleName === "admin";

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Aseguradoras"
        subtitle="Protege a tu mascota con el mejor seguro"
        showBack={false}
        actions={
          isInsurer
            ? [
                {
                  icon: Plus,
                  label: "Nuevo plan",
                  onPress: () => router.push("/aseguradoras/nuevo"),
                },
                {
                  icon: ShieldCheck,
                  label: "Gestión de planes",
                  onPress: () => router.push("/aseguradoras/gestion"),
                },
                {
                  icon: ClipboardList,
                  label: "Reclamos",
                  onPress: () => router.push("/aseguradoras/reclamos"),
                },
              ]
            : [
                {
                  icon: FolderHeart,
                  label: "Mis pólizas",
                  onPress: () => router.push("/aseguradoras/mis-polizas"),
                },
              ]
        }
      />

      <div className={local.filters}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar planes de seguro..." />
      </div>

      {isLoading ? (
        <div className={local.grid}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={210} borderRadius={16} />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <EmptyState
          icon={<Shield size={28} />}
          title={hasSearch ? "Sin resultados" : "No hay planes de seguro disponibles"}
          subtitle={
            hasSearch
              ? "Prueba con otra búsqueda."
              : "Cuando una aseguradora publique un plan aparecerá aquí."
          }
          actionLabel={hasSearch ? "Quitar búsqueda" : undefined}
          onAction={hasSearch ? () => setSearch("") : undefined}
        />
      ) : (
        <div className={local.grid}>
          {plans.map((plan) => (
            <Card key={plan.id} onPress={() => router.push(`/aseguradoras/${plan.id}`)}>
              <div className={local.planCard}>
                <div className={local.planHeader}>
                  <span className={local.planIcon} aria-hidden>
                    <Shield size={22} />
                  </span>
                  <div className={local.planInfo}>
                    <p className={local.planName}>{plan.name}</p>
                    {plan.description ? <p className={local.planDesc}>{plan.description}</p> : null}
                  </div>
                </div>

                <div className={local.statsRow}>
                  <div className={local.stat}>
                    <span className={local.statValue}>
                      <DollarSign size={14} aria-hidden />
                      {formatCurrency(plan.coverage_limit)}
                    </span>
                    <span className={local.statLabel}>Cobertura</span>
                  </div>
                  <div className={local.stat}>
                    <span className={local.statValue}>
                      <DollarSign size={14} aria-hidden />
                      {formatCurrency(plan.base_premium)}/mes
                    </span>
                    <span className={local.statLabel}>Prima</span>
                  </div>
                  <div className={local.stat}>
                    <span className={local.statValue}>
                      <Clock size={14} aria-hidden />
                      {plan.min_age}-{plan.max_age} años
                    </span>
                    <span className={local.statLabel}>Edad</span>
                  </div>
                </div>

                <div className={local.tagsRow}>
                  {plan.allowed_species.map((species) => (
                    <Badge key={species} label={speciesLabel(species)} color="var(--color-secondary)" />
                  ))}
                  {plan.is_active ? (
                    <Badge
                      label="Activo"
                      color="var(--color-success)"
                      icon={<CheckCircle size={12} aria-hidden />}
                    />
                  ) : null}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && plans.length > 0 && !isInsurer ? (
        <div style={{ marginTop: "1.25rem" }}>
          <Button
            label="Cotizar y contratar"
            onPress={() => router.push("/aseguradoras/cotizar")}
            icon={<DollarSign size={18} />}
          />
        </div>
      ) : null}
    </ScreenContainer>
  );
}
