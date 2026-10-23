"use client";

/**
 * Alta o edición de producto (`/tienda/vendedor/productos/[id]`, `nuevo` = alta).
 * Espejo de `mobile/app/tienda/vendedor/productos/[id].tsx`, con vista previa de cómo se verá en la tienda.
 */
import { useParams, useRouter } from "next/navigation";
import { Eye, Package, SearchX } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import FilterChip from "@/components/FilterChip";
import FormField from "@/components/FormField";
import FormImagePicker from "@/components/forms/FormImagePicker";
import FormSection from "@/components/forms/FormSection";
import RoleGuard from "@/components/RoleGuard";
import { Skeleton } from "@/components/Skeleton";
import { useProductForm } from "@/hooks/ecommerce/useProductForm";
import { formatCurrency } from "@/utils/formatters";
import { getS3Url } from "@/utils/helpers";
import s from "@/features/tienda/vendedor.module.css";

export default function ProductoFormPage() {
  return (
    <RoleGuard roles={["vendedor"]}>
      <ProductoForm />
    </RoleGuard>
  );
}

function ProductoForm() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const f = useProductForm(id);
  const { formData, updateField, errors } = f;
  const title = f.isEditing ? "Editar producto" : "Nuevo producto";

  if (f.loadingProduct) {
    return (
      <ScreenContainer>
        <ScreenHeader title={title} />
        <div className={s.form}>
          <Skeleton height={220} />
          <Skeleton height={50} />
          <Skeleton height={50} />
        </div>
      </ScreenContainer>
    );
  }

  if (f.notFound) {
    return (
      <ScreenContainer>
        <ScreenHeader title={title} />
        <EmptyState
          icon={<SearchX size={28} />}
          title="No encontramos este producto"
          subtitle="Puede que se haya eliminado."
          actionLabel="Volver a mi catálogo"
          onAction={() => router.push("/tienda/vendedor/productos")}
        />
      </ScreenContainer>
    );
  }

  const previewImage = f.image ? URL.createObjectURL(f.image) : formData.image_url ? getS3Url(formData.image_url) : null;
  const price = parseFloat(formData.price.replace(",", "."));

  return (
    <ScreenContainer>
      <ScreenHeader
        title={title}
        subtitle={f.isEditing ? "Los cambios se ven al guardar" : "Un admin lo revisa antes de publicarlo"}
      />

      <div className={s.formLayout}>
        <div className={s.form}>
          <FormSection title="Foto">
            <FormImagePicker label="Foto del producto *" preview={previewImage} onChange={f.setImage} />
            {errors.image ? <span className={s.fieldError}>{errors.image}</span> : null}
          </FormSection>

          <FormSection title="Datos">
            <FormField
              label="Nombre del producto *"
              value={formData.name}
              onChangeText={(v) => updateField("name", v)}
              placeholder="Ej: Rascador de sisal para gato"
              maxLength={120}
              error={errors.name}
            />
            <div className={s.row2}>
              <FormField
                label="Precio (MXN) *"
                value={formData.price}
                onChangeText={(v) => updateField("price", v)}
                keyboardType="decimal-pad"
                placeholder="0.00"
                error={errors.price}
              />
              <FormField
                label={f.isEditing ? "Existencias *" : "Existencias iniciales *"}
                value={formData.stock}
                onChangeText={(v) => updateField("stock", v)}
                keyboardType="number-pad"
                placeholder="0"
                error={errors.stock}
              />
            </div>
          </FormSection>

          {f.categories.length > 0 ? (
            <FormSection title="Categoría">
              <div className={s.chips}>
                {f.categories.map((cat) => (
                  <FilterChip
                    key={cat.id}
                    label={cat.name}
                    active={formData.category_id === cat.id}
                    onPress={() => updateField("category_id", formData.category_id === cat.id ? "" : cat.id)}
                  />
                ))}
              </div>
            </FormSection>
          ) : null}

          <FormSection title="Descripción">
            <FormField
              label="Descripción"
              value={formData.description}
              onChangeText={(v) => updateField("description", v)}
              multiline
              placeholder="¿Qué lo hace especial? ¿Para qué mascota es?"
            />
            <FormField
              label="Especificaciones"
              value={formData.specifications}
              onChangeText={(v) => updateField("specifications", v)}
              multiline
              placeholder="Materiales, medidas, peso, edad recomendada…"
            />
          </FormSection>

          <Button
            label={f.isEditing ? "Guardar cambios" : "Enviar a revisión"}
            onPress={f.handleSave}
            loading={f.saving}
            disabled={f.saving}
            size="lg"
          />
        </div>

        <aside className={s.preview} aria-label="Vista previa">
          <span className={s.previewTitle}>
            <Eye size={16} /> Así se verá en la tienda
          </span>
          <div className={s.previewCard}>
            {previewImage ? (
              // eslint-disable-next-line @next/next/no-img-element -- vista previa local o del storage
              <img src={previewImage} alt="" className={s.previewImg} />
            ) : (
              <span className={s.previewImg}>
                <Package size={32} />
              </span>
            )}
            <div className={s.previewBody}>
              <span className={s.previewName}>{formData.name.trim() || "Nombre del producto"}</span>
              <span className={s.previewPrice}>{formatCurrency(isFinite(price) ? price : 0)}</span>
            </div>
          </div>
        </aside>
      </div>
    </ScreenContainer>
  );
}
