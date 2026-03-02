"use client";

import { useState, useEffect, FormEvent } from "react";
import { toast } from "react-hot-toast";
import ConfirmModal from "@/components/ui/ConfirmModal";
import dashStyles from "../../dashboard.module.css";
import styles from "./roles.module.css";
import {
    Role,
    getRoles,
    createRole,
    updateRole,
    deleteRole
} from "@/lib/services/roles";

export default function AdminRolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [formData, setFormData] = useState({ name: "", description: "" });
    const [formLoading, setFormLoading] = useState(false);

    // Confirm Delete Modal
    const [deleteModalState, setDeleteModalState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        roleId: string | null;
    }>({
        isOpen: false,
        title: "",
        message: "",
        roleId: null
    });

    useEffect(() => {
        loadRoles();
    }, []);

    const loadRoles = async () => {
        setLoading(true);
        try {
            const data = await getRoles();
            setRoles(data);
        } catch (err: any) {
            toast.error(err.message || "Error al cargar los roles");
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingRole(null);
        setFormData({ name: "", description: "" });
        setIsFormModalOpen(true);
    };

    const openEditModal = (role: Role) => {
        setEditingRole(role);
        setFormData({ name: role.name, description: role.description || "" });
        setIsFormModalOpen(true);
    };

    const closeFormModal = () => {
        setIsFormModalOpen(false);
        setEditingRole(null);
    };

    const handleFormSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            if (editingRole) {
                const updated = await updateRole(editingRole.id, formData);
                setRoles(roles.map(r => r.id === updated.id ? updated : r));
                toast.success("Rol actualizado con éxito");
            } else {
                const created = await createRole(formData);
                setRoles([...roles, created]);
                toast.success("Rol creado con éxito");
            }
            closeFormModal();
        } catch (err: any) {
            toast.error(err.message || "Error al guardar el rol");
        } finally {
            setFormLoading(false);
        }
    };

    const confirmDelete = (role: Role) => {
        setDeleteModalState({
            isOpen: true,
            title: `🗑️ Eliminar Rol`,
            message: `¿Estás seguro de eliminar el rol "${role.name}"? Esta acción no se puede deshacer y los usuarios asignados a este rol perderán sus permisos.`,
            roleId: role.id
        });
    };

    const executeDelete = async () => {
        const roleId = deleteModalState.roleId;
        if (!roleId) return;

        setDeleteModalState(prev => ({ ...prev, isOpen: false }));

        try {
            await deleteRole(roleId);
            setRoles(roles.filter(r => r.id !== roleId));
            toast.success("Rol eliminado con éxito");
        } catch (err: any) {
            toast.error(err.message || "Error al eliminar el rol");
        }
    };

    return (
        <div className={styles["admin-container"]}>
            <ConfirmModal
                isOpen={deleteModalState.isOpen}
                title={deleteModalState.title}
                message={deleteModalState.message}
                isDanger={true}
                onConfirm={executeDelete}
                onCancel={() => setDeleteModalState(prev => ({ ...prev, isOpen: false }))}
            />

            {/* Custom Form Modal */}
            {isFormModalOpen && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0,0,0,0.6)", zIndex: 1000,
                    display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem"
                }}>
                    <div style={{
                        background: "var(--surface)",
                        borderRadius: "var(--radius-lg)",
                        width: "100%", maxWidth: "500px",
                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)"
                    }}>
                        <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border)" }}>
                            <h3 style={{ margin: 0, fontSize: "1.25rem" }}>
                                {editingRole ? "✏️ Editar Rol" : "➕ Nuevo Rol"}
                            </h3>
                        </div>
                        <form onSubmit={handleFormSubmit} style={{ padding: "1.5rem" }}>
                            <div className={styles["form-group"]}>
                                <label>Nombre del Rol</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Ej. superadmin, veterinario, voluntario"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    disabled={formLoading}
                                />
                            </div>
                            <div className={styles["form-group"]}>
                                <label>Descripción (Opcional)</label>
                                <textarea
                                    rows={3}
                                    placeholder="Para qué sirve este rol..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    disabled={formLoading}
                                />
                            </div>
                            <div className={styles["form-actions"]}>
                                <button type="button" className="btn btn-secondary" onClick={closeFormModal} disabled={formLoading}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={formLoading} style={{ background: "var(--primary)", border: "none" }}>
                                    {formLoading ? "Guardando..." : "Guardar Rol"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className={dashStyles["page-header"]}>
                <h1 className={dashStyles["page-title"]}>🛡️ Gestión de Roles y Permisos</h1>
                <p className={dashStyles["page-subtitle"]}>Administra los niveles de acceso y seguridad de la plataforma</p>
            </div>

            <div className={styles["roles-container"]}>
                <div className={styles["roles-header"]}>
                    <h2>Roles del Sistema</h2>
                    <button className={styles["btn-primary"]} onClick={openCreateModal}>
                        + Nuevo Rol
                    </button>
                </div>

                {loading ? (
                    <p className={dashStyles["loading-text"]} style={{ padding: "3rem" }}>Cargando roles de seguridad...</p>
                ) : roles.length === 0 ? (
                    <div className={styles["empty-state"]}>
                        <span style={{ fontSize: "3rem", display: "block", marginBottom: "1rem" }}>🔐</span>
                        <p>No hay roles registrados en la base de datos.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table className={styles["roles-table"]}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre del Rol</th>
                                    <th>Descripción</th>
                                    <th style={{ textAlign: "right" }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {roles.map(role => (
                                    <tr key={role.id}>
                                        <td style={{ color: "var(--text-secondary)", fontSize: "0.85rem", fontFamily: "monospace" }}>
                                            {role.id.substring(0, 8)}...
                                        </td>
                                        <td>
                                            <span className={styles["role-name"]}>{role.name}</span>
                                        </td>
                                        <td>
                                            <span className={styles["role-desc"]}>{role.description || <em style={{ opacity: 0.5 }}>No configurada</em>}</span>
                                        </td>
                                        <td>
                                            <div className={styles.actions}>
                                                <button
                                                    className={styles["edit-btn"]}
                                                    onClick={() => openEditModal(role)}
                                                    title="Editar"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className={styles["delete-btn"]}
                                                    onClick={() => confirmDelete(role)}
                                                    title="Eliminar"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
