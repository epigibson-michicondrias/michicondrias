"use client";

/**
 * Categorías de la tienda (`/admin/categorias`): árbol categoría → subcategorías con alta, edición y borrado.
 * Espejo ampliado de `mobile/app/admin/categorias/index.tsx` (la web conserva imagen, estado activo y subcategorías).
 */
import { ChevronDown, FolderTree, Package, Pencil, Plus, Trash2 } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import FormField from "@/components/FormField";
import FormImagePicker from "@/components/forms/FormImagePicker";
import FormSwitch from "@/components/forms/FormSwitch";
import IconButton from "@/components/IconButton";
import Modal from "@/components/Modal";
import { SkeletonList } from "@/components/Skeleton";
import { useAdminCategories, type AdminCategory } from "@/hooks/admin/useAdminCategories";
import s from "@/features/admin/admin.module.css";

function CategoryCard({ category, open, ctl }: { category: AdminCategory; open: boolean; ctl: ReturnType<typeof useAdminCategories> }) {
  const subs = category.subcategories ?? [];
  const active = category.is_active !== false;
  const panelId = `subs-${category.id}`;

  return (
    <article className={s.catCard}>
      <div className={`${s.catRow} ${active ? "" : s.inactive}`}>
        <button
          type="button"
          className={s.catToggle}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => ctl.toggleExpanded(category.id)}
        >
          {category.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element -- imagen del storage
            <img src={category.image_url} alt="" className={s.catThumb} />
          ) : (
            <span className={s.catThumb} aria-hidden>
              <Package size={22} />
            </span>
          )}
          <span className={s.cellMain}>
            <span className={s.titleRow}>
              <span className={s.cellTitle}>{category.name}</span>
              {!active && <Badge label="Oculta" color="var(--color-text-muted)" size="sm" />}
            </span>
            <span className={s.cellSub}>
              {category.description || "Sin descripción"} · {subs.length} {subs.length === 1 ? "subcategoría" : "subcategorías"}
            </span>
          </span>
          <ChevronDown size={20} className={`${s.catChevron} ${open ? s.catChevronOpen : ""}`} aria-hidden />
        </button>
        <IconButton icon={Pencil} accessibilityLabel={`Editar ${category.name}`} onPress={() => ctl.handleAction(category)} />
        <IconButton icon={Trash2} accessibilityLabel={`Eliminar ${category.name}`} color="var(--color-error)" onPress={() => ctl.handleDelete(category)} />
      </div>

      {open && (
        <div id={panelId} className={s.subPanel}>
          <div className={s.subHead}>
            <span className={s.sectionTitle}>Subcategorías</span>
            <Button
              label="Agregar subcategoría"
              icon={<Plus size={16} />}
              size="sm"
              variant="secondary"
              fullWidth={false}
              onPress={() => ctl.openSubModal(category)}
            />
          </div>
          {subs.length === 0 ? (
            <p className={s.muted}>Esta categoría aún no tiene subcategorías.</p>
          ) : (
            subs.map((sub) => {
              const subActive = sub.is_active !== false;
              return (
                <div key={sub.id} className={`${s.subRow} ${subActive ? "" : s.inactive}`}>
                  <span className={s.cellMain}>
                    <span className={s.titleRow}>
                      <span className={s.cellTitle}>{sub.name}</span>
                      {!subActive && <Badge label="Oculta" color="var(--color-text-muted)" size="sm" />}
                    </span>
                    {sub.description ? <span className={s.cellSub}>{sub.description}</span> : null}
                  </span>
                  <IconButton icon={Pencil} accessibilityLabel={`Editar ${sub.name}`} onPress={() => ctl.openSubModal(category, sub)} />
                  <IconButton icon={Trash2} accessibilityLabel={`Eliminar ${sub.name}`} color="var(--color-error)" onPress={() => ctl.handleSubDelete(sub)} />
                </div>
              );
            })
          )}
        </div>
      )}
    </article>
  );
}

export default function AdminCategoriasPage() {
  const ctl = useAdminCategories();
  const { categories, isLoading } = ctl;

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Categorías"
        subtitle="Cómo se organizan los productos de la tienda"
        actions={categories.length ? [{ icon: Plus, label: "Nueva categoría", onPress: () => ctl.handleAction() }] : undefined}
      />

      <div className={s.content}>
        {isLoading ? (
          <SkeletonList count={5} />
        ) : categories.length === 0 ? (
          <EmptyState
            icon={<FolderTree size={48} strokeWidth={1} />}
            title="Aún no hay categorías"
            subtitle="Crea la primera para que los vendedores puedan clasificar sus productos."
            actionLabel="Crear categoría"
            onAction={() => ctl.handleAction()}
          />
        ) : (
          <div className={s.catList}>
            {categories.map((c) => (
              <CategoryCard key={c.id} category={c} open={ctl.expandedId === c.id} ctl={ctl} />
            ))}
          </div>
        )}
      </div>

      <Modal
        open={ctl.isModalVisible}
        title={ctl.editingCategory ? "Editar categoría" : "Nueva categoría"}
        onClose={ctl.closeModal}
        footer={
          <>
            <Button label="Cancelar" variant="ghost" fullWidth={false} onPress={ctl.closeModal} disabled={ctl.isSaving} />
            <Button
              label={ctl.editingCategory ? "Guardar cambios" : "Crear categoría"}
              fullWidth={false}
              loading={ctl.isSaving}
              disabled={ctl.isSaving}
              onPress={ctl.handleSubmit}
            />
          </>
        }
      >
        <FormField
          label="Nombre"
          value={ctl.formData.name}
          onChangeText={(name) => ctl.updateForm({ name })}
          error={ctl.nameError}
          placeholder="Ej. Alimentos"
          autoFocus
        />
        <FormField
          label="Descripción"
          value={ctl.formData.description}
          onChangeText={(description) => ctl.updateForm({ description })}
          multiline
          numberOfLines={3}
          placeholder="Qué productos entran aquí (opcional)"
        />
        <FormImagePicker label="Imagen (opcional)" preview={ctl.imagePreview} onChange={ctl.setImageFile} />
        <FormSwitch
          label="Visible en la tienda"
          description="Si la apagas, la categoría deja de aparecer en el catálogo."
          value={ctl.formData.is_active}
          onChange={(is_active) => ctl.updateForm({ is_active })}
        />
      </Modal>

      <Modal
        open={!!ctl.subParent}
        title={ctl.editingSub ? "Editar subcategoría" : "Nueva subcategoría"}
        subtitle={ctl.subParent ? `Dentro de ${ctl.subParent.name}` : undefined}
        onClose={ctl.closeSubModal}
        footer={
          <>
            <Button label="Cancelar" variant="ghost" fullWidth={false} onPress={ctl.closeSubModal} disabled={ctl.isSavingSub} />
            <Button
              label={ctl.editingSub ? "Guardar cambios" : "Crear subcategoría"}
              fullWidth={false}
              loading={ctl.isSavingSub}
              disabled={ctl.isSavingSub}
              onPress={ctl.handleSubSubmit}
            />
          </>
        }
      >
        <FormField
          label="Nombre"
          value={ctl.subForm.name}
          onChangeText={(name) => ctl.updateSubForm({ name })}
          error={ctl.subNameError}
          placeholder="Ej. Gatos adultos"
          autoFocus
        />
        <FormField
          label="Descripción"
          value={ctl.subForm.description}
          onChangeText={(description) => ctl.updateSubForm({ description })}
          multiline
          numberOfLines={2}
          placeholder="Opcional"
        />
        <FormSwitch
          label="Visible en la tienda"
          value={ctl.subForm.is_active}
          onChange={(is_active) => ctl.updateSubForm({ is_active })}
        />
      </Modal>
    </ScreenContainer>
  );
}
