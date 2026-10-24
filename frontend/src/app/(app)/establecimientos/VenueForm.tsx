"use client";

/**
 * Formulario compartido de alta/edición de establecimiento.
 * Usado por `(app)/establecimientos/nuevo` y `(app)/establecimientos/editar/[id]`.
 */
import { Building2, FileText, MapPin, Plus, Save, Tag, Trash2 } from "lucide-react";
import Button from "@/components/Button";
import FormField from "@/components/FormField";
import FormSection from "@/components/forms/FormSection";
import FormSwitch from "@/components/forms/FormSwitch";
import { Skeleton } from "@/components/Skeleton";
import { useVenueForm } from "@/hooks/venues/useVenueForm";
import local from "./establecimientos.module.css";

export default function VenueForm({ mode }: { mode: "create" | "edit" }) {
  const {
    formData,
    amenities,
    updateField,
    toggleAmenity,
    handleSubmit,
    handleDelete,
    isLoadingVenue,
    isSubmitting,
    isDeleting,
  } = useVenueForm(mode);

  if (mode === "edit" && isLoadingVenue) {
    return (
      <div style={{ display: "grid", gap: "var(--space-md)" }} role="status" aria-label="Cargando">
        <Skeleton height={56} borderRadius={12} />
        <Skeleton height={56} borderRadius={12} />
        <Skeleton height={120} borderRadius={12} />
      </div>
    );
  }

  return (
    <form
      className={local.form}
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <FormSection title="Información básica">
        <FormField
          label="Nombre del establecimiento"
          value={formData.name}
          onChangeText={(v) => updateField("name", v)}
          placeholder="Nombre del establecimiento"
          rightElement={<Building2 size={18} color="var(--color-primary)" aria-hidden />}
        />
        <FormField
          label="Dirección completa"
          value={formData.address}
          onChangeText={(v) => updateField("address", v)}
          placeholder="Dirección completa"
          autoComplete="street-address"
          rightElement={<MapPin size={18} color="var(--color-primary)" aria-hidden />}
        />
      </FormSection>

      <FormSection title="Servicios y amenidades">
        {Object.entries(amenities).map(([key, value]) => (
          <FormSwitch key={key} label={key} value={value} onChange={() => toggleAmenity(key)} />
        ))}
      </FormSection>

      <FormSection title="Descuento (opcional)">
        <FormField
          label="Código de cupón"
          value={formData.discount_coupon}
          onChangeText={(v) => updateField("discount_coupon", v)}
          placeholder="Código de cupón"
          autoCapitalize="characters"
          rightElement={<Tag size={18} color="var(--color-warning)" aria-hidden />}
        />
        <FormField
          label="Descripción del descuento"
          value={formData.discount_description}
          onChangeText={(v) => updateField("discount_description", v)}
          placeholder="Descripción del descuento"
          multiline
          numberOfLines={3}
          rightElement={<FileText size={18} color="var(--color-warning)" aria-hidden />}
        />
      </FormSection>

      <div className={local.actionButtons}>
        <Button
          label={mode === "edit" ? "Guardar Cambios" : "Registrar Establecimiento"}
          icon={mode === "edit" ? <Save size={20} /> : <Plus size={20} />}
          loading={isSubmitting}
          disabled={isDeleting}
          size="lg"
          type="submit"
        />
        {mode === "edit" && (
          <Button
            label="Eliminar"
            icon={<Trash2 size={20} />}
            variant="danger"
            loading={isDeleting}
            disabled={isSubmitting}
            onPress={handleDelete}
          />
        )}
      </div>
    </form>
  );
}
