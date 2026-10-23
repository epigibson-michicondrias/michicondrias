"use client";

/**
 * Mis servicios de estética (`/estilistas/servicios`): ver, pausar/reactivar y editar.
 * Espejo de `mobile/app/estilistas/servicios.tsx`.
 */
import { Plus, Scissors, Pencil, Eye, EyeOff, Clock, X } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import IconButton from "@/components/IconButton";
import EmptyState from "@/components/EmptyState";
import FormField from "@/components/FormField";
import RoleGuard from "@/components/RoleGuard";
import { SkeletonList } from "@/components/Skeleton";
import { formatCurrency } from "@/utils/formatters";
import { useMyGroomingServices } from "@/hooks/grooming/useMyGroomingServices";
import type { GroomingService } from "@/services/grooming";
import l from "../estilistas.module.css";

function MisServiciosContent() {
  const s = useMyGroomingServices();

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Mis servicios"
        subtitle={
          s.services.length > 0
            ? `${s.services.filter((x) => x.is_active).length} visibles en el catálogo`
            : undefined
        }
        actions={[{ icon: Plus, label: "Nuevo servicio", onPress: s.goToNew }]}
      />

      {s.isLoading ? (
        <SkeletonList count={3} />
      ) : s.services.length === 0 ? (
        <EmptyState
          icon={<Scissors size={28} />}
          title="Aún no ofreces servicios"
          subtitle="Publica tu primer servicio de estética para que los clientes agenden contigo."
          actionLabel="Nuevo servicio"
          onAction={s.goToNew}
        />
      ) : (
        <div className={l.list}>
          {s.services.map((item: GroomingService) => (
            <Card key={item.id} onPress={() => s.openEdit(item)} accessibilityLabel={`Editar ${item.name}`}>
              <div className={l.card}>
                <div className={l.cardTop}>
                  <div className={l.iconBox}>
                    <Scissors size={20} />
                  </div>
                  <div className={l.cardInfo}>
                    <p className={l.cardTitle}>{item.name}</p>
                    <div className={l.metaRow} style={{ marginTop: "var(--space-xs)" }}>
                      <span className={`${l.metaItem} ${l.metaPrice}`}>{formatCurrency(item.price)}</span>
                      <span className={l.metaItem}>
                        <Clock size={13} />
                        {item.duration_minutes} min
                      </span>
                    </div>
                  </div>
                  <Badge
                    label={item.is_active ? "Visible" : "Pausado"}
                    color={item.is_active ? "var(--color-success)" : "var(--color-text-muted)"}
                    size="sm"
                  />
                </div>
                <div className={l.cardActions}>
                  <IconButton
                    icon={item.is_active ? Eye : EyeOff}
                    accessibilityLabel={item.is_active ? `Pausar ${item.name}` : `Volver a publicar ${item.name}`}
                    onPress={() => s.toggle(item)}
                    loading={s.togglingId === item.id}
                    variant="surface"
                  />
                  <IconButton
                    icon={Pencil}
                    accessibilityLabel={`Editar ${item.name}`}
                    onPress={() => s.openEdit(item)}
                    variant="surface"
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {s.editing ? (
        <div className={l.sheetBackdrop} role="presentation" onClick={s.closeEdit}>
          <div
            className={l.sheet}
            role="dialog"
            aria-modal="true"
            aria-label="Editar servicio"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={l.sheetHeader}>
              <h2 className={l.sheetTitle}>Editar servicio</h2>
              <IconButton icon={X} accessibilityLabel="Cerrar" onPress={s.closeEdit} variant="subtle" />
            </div>
            <FormField
              label="Nombre"
              value={s.draft.name}
              onChangeText={(v) => s.updateDraft("name", v)}
              error={s.errors.name}
            />
            <div className={l.row2}>
              <FormField
                label="Precio (MXN)"
                value={s.draft.price}
                onChangeText={(v) => s.updateDraft("price", v)}
                keyboardType="decimal-pad"
                error={s.errors.price}
              />
              <FormField
                label="Duración (min)"
                value={s.draft.duration_minutes}
                onChangeText={(v) => s.updateDraft("duration_minutes", v.replace(/\D/g, ""))}
                keyboardType="number-pad"
                maxLength={3}
                error={s.errors.duration_minutes}
              />
            </div>
            <FormField
              label="Descripción"
              value={s.draft.description}
              onChangeText={(v) => s.updateDraft("description", v)}
              multiline
            />
            <div className={l.sheetActions}>
              <Button label="Cancelar" variant="secondary" onPress={s.closeEdit} style={{ flex: 1 }} />
              <Button label="Guardar" onPress={s.save} loading={s.saving} style={{ flex: 1.6 }} />
            </div>
          </div>
        </div>
      ) : null}
    </ScreenContainer>
  );
}

export default function MisServiciosPage() {
  return (
    <RoleGuard roles={["estilista"]} message="La gestión de servicios es solo para cuentas de estilista.">
      <MisServiciosContent />
    </RoleGuard>
  );
}
