"use client";

/**
 * Inventario médico (`/mi-clinica/inventario`): existencias, alertas de stock bajo, alta, edición y baja.
 * Espejo de `mobile/app/mi-clinica/inventario.tsx`.
 */
import { AlertTriangle, Box, Package, Plus, Trash2 } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import FormField from "@/components/FormField";
import Modal from "@/components/Modal";
import SearchBar from "@/components/SearchBar";
import { SkeletonList } from "@/components/Skeleton";
import { useInventory } from "@/hooks/clinica/useInventory";
import s from "@/features/mi-clinica/clinica.module.css";

const int = (t: string) => Math.max(0, parseInt(t, 10) || 0);

export default function InventarioPage() {
  return <Inventario />;
}

function Inventario() {
  const inv = useInventory();
  const open = () => inv.setModalVisible(true);
  const closeEdit = () => {
    inv.setEditModalVisible(false);
    inv.setEditingItem(null);
  };
  const editing = inv.editingItem;

  return (
    <ScreenContainer>
      <ScreenHeader title="Inventario médico" actions={[{ icon: Plus, label: "Nuevo producto", onPress: open }]} />

      {inv.isLoading ? (
        <SkeletonList count={4} />
      ) : (
        <div className={s.content}>
          {inv.criticalItems.length > 0 ? (
            <section className={s.section}>
              <h2 className={s.sectionTitle}>Atención inmediata</h2>
              <div className={s.chips}>
                {inv.criticalItems.map((item) => (
                  <button key={item.id} type="button" className={s.card} onClick={() => inv.handleEditItem(item)} style={{ borderColor: "var(--color-error)" }}>
                    <span className={s.cardSub} style={{ color: "var(--color-error)" }}>
                      <AlertTriangle size={14} /> Stock bajo
                    </span>
                    <span className={s.strong}>{item.name}</span>
                    <span className={s.muted}>
                      Quedan {item.currentStock} {item.unit}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          <section className={s.section}>
            <h2 className={s.sectionTitle}>Catálogo general</h2>
            <SearchBar value={inv.searchQuery} onChangeText={inv.setSearchQuery} placeholder="Buscar en el inventario..." />
            {inv.filteredInventory.length === 0 ? (
              <EmptyState
                icon={<Box size={28} />}
                title={inv.searchQuery ? "Sin resultados" : "No hay productos en inventario"}
                subtitle={inv.searchQuery ? "Prueba con otro nombre." : "Registra tus insumos para recibir alertas de stock bajo."}
                actionLabel={inv.searchQuery ? "Quitar búsqueda" : "Agregar producto"}
                onAction={inv.searchQuery ? () => inv.setSearchQuery("") : open}
              />
            ) : (
              <div className={`${s.list} ${s.listWide}`}>
                {inv.filteredInventory.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={s.card}
                    onClick={() => inv.handleEditItem(item)}
                    aria-label={`Editar ${item.name}, ${item.currentStock} ${item.unit}`}
                  >
                    <div className={s.cardHead}>
                      <span className={s.iconBox} style={{ ["--c" as string]: "var(--color-secondary)" }}>
                        <Package size={20} />
                      </span>
                      <div className={s.cardInfo}>
                        <span className={s.cardTitle}>{item.name}</span>
                        <span className={s.cardSub}>{item.category || "Sin categoría"}</span>
                      </div>
                      <span className={s.strong}>
                        {item.currentStock} <span className={s.muted}>{item.unit}</span>
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      <Modal
        open={inv.modalVisible}
        title="Nuevo producto"
        onClose={() => inv.setModalVisible(false)}
        footer={
          <>
            <Button label="Cancelar" variant="secondary" onPress={() => inv.setModalVisible(false)} />
            <Button label="Guardar" onPress={inv.handleSaveItem} loading={inv.loadingAction} />
          </>
        }
      >
        <FormField label="Nombre del producto *" value={inv.newItem.name} onChangeText={(t) => inv.setNewItem({ ...inv.newItem, name: t })} placeholder="Ej: Amoxicilina 500 mg" />
        <FormField label="Categoría" value={inv.newItem.category ?? ""} onChangeText={(t) => inv.setNewItem({ ...inv.newItem, category: t })} placeholder="Ej: Antibióticos" />
        <div className={s.row2}>
          <FormField label="Stock inicial" value={String(inv.newItem.currentStock ?? "")} onChangeText={(t) => inv.setNewItem({ ...inv.newItem, currentStock: int(t) })} keyboardType="numeric" />
          <FormField label="Stock mínimo" value={String(inv.newItem.minStock ?? "")} onChangeText={(t) => inv.setNewItem({ ...inv.newItem, minStock: int(t) })} keyboardType="numeric" />
        </div>
        <FormField label="Unidad de medida *" value={inv.newItem.unit ?? ""} onChangeText={(t) => inv.setNewItem({ ...inv.newItem, unit: t })} placeholder="ml, mg, frasco, caja..." />
      </Modal>

      <Modal
        open={inv.editModalVisible && !!editing}
        title="Editar producto"
        onClose={closeEdit}
        footer={
          <>
            <Button label="Cancelar" variant="secondary" onPress={closeEdit} />
            <Button label="Guardar" onPress={inv.handleUpdateItem} loading={inv.isUpdating} />
          </>
        }
      >
        <FormField label="Nombre *" value={editing?.name || ""} onChangeText={(t) => inv.setEditingItem({ ...editing, name: t })} />
        <FormField label="Categoría" value={editing?.category || ""} onChangeText={(t) => inv.setEditingItem({ ...editing, category: t })} />
        <div className={s.row2}>
          <FormField label="Stock actual" value={String(editing?.currentStock ?? 0)} onChangeText={(t) => inv.setEditingItem({ ...editing, currentStock: int(t) })} keyboardType="numeric" />
          <FormField label="Stock mínimo" value={String(editing?.minStock ?? 0)} onChangeText={(t) => inv.setEditingItem({ ...editing, minStock: int(t) })} keyboardType="numeric" />
        </div>
        <FormField label="Unidad de medida" value={editing?.unit || ""} onChangeText={(t) => inv.setEditingItem({ ...editing, unit: t })} />
        <Button
          label="Eliminar producto"
          icon={<Trash2 size={16} />}
          variant="danger"
          onPress={() => editing?.id && inv.handleDeleteItem(editing.id)}
          loading={inv.isDeleting}
        />
      </Modal>
    </ScreenContainer>
  );
}
