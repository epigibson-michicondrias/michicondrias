"use client";

import { useState, useEffect, FormEvent } from "react";
import { toast } from "react-hot-toast";
import ConfirmModal from "@/components/ui/ConfirmModal";
import dashStyles from "../../dashboard.module.css";
import styles from "./config.module.css";
import {
    GlobalSetting,
    getSettings,
    createSetting,
    updateSetting,
    deleteSetting
} from "@/lib/services/settings";

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<GlobalSetting[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingSetting, setEditingSetting] = useState<GlobalSetting | null>(null);
    const [formData, setFormData] = useState({
        key: "",
        value: "",
        description: "",
        type: "string",
        is_public: false
    });
    const [formLoading, setFormLoading] = useState(false);

    // Confirm Delete Modal
    const [deleteModalState, setDeleteModalState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        settingId: string | null;
    }>({
        isOpen: false,
        title: "",
        message: "",
        settingId: null
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const data = await getSettings();
            setSettings(data);
        } catch (err: any) {
            toast.error(err.message || "Error al cargar configuraciones");
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingSetting(null);
        setFormData({ key: "", value: "", description: "", type: "string", is_public: false });
        setIsFormModalOpen(true);
    };

    const openEditModal = (setting: GlobalSetting) => {
        setEditingSetting(setting);
        setFormData({
            key: setting.key,
            value: setting.value,
            description: setting.description || "",
            type: setting.type || "string",
            is_public: setting.is_public || false
        });
        setIsFormModalOpen(true);
    };

    const closeFormModal = () => {
        setIsFormModalOpen(false);
        setEditingSetting(null);
    };

    const handleFormSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            if (editingSetting) {
                const updated = await updateSetting(editingSetting.id, formData);
                setSettings(settings.map(s => s.id === updated.id ? updated : s));
                toast.success("Configuración actualizada con éxito");
            } else {
                const created = await createSetting(formData);
                setSettings([...settings, created]);
                toast.success("Configuración registrada con éxito");
            }
            closeFormModal();
        } catch (err: any) {
            toast.error(err.message || "Error al guardar configuración");
        } finally {
            setFormLoading(false);
        }
    };

    const confirmDelete = (setting: GlobalSetting) => {
        setDeleteModalState({
            isOpen: true,
            title: `🗑️ Eliminar Configuración`,
            message: `¿Estás seguro de eliminar el ajuste "${setting.key}"? Componentes clave podrían dejar de funcionar.`,
            settingId: setting.id
        });
    };

    const executeDelete = async () => {
        const settingId = deleteModalState.settingId;
        if (!settingId) return;

        setDeleteModalState(prev => ({ ...prev, isOpen: false }));

        try {
            await deleteSetting(settingId);
            setSettings(settings.filter(s => s.id !== settingId));
            toast.success("Ajuste eliminado con éxito");
        } catch (err: any) {
            toast.error(err.message || "Error al eliminar");
        }
    };

    return (
        <div style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>
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
                        width: "100%", maxWidth: "600px",
                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)"
                    }}>
                        <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border)" }}>
                            <h3 style={{ margin: 0, fontSize: "1.25rem" }}>
                                {editingSetting ? "✏️ Editar Ajuste" : "➕ Nueva Configuración"}
                            </h3>
                        </div>
                        <form onSubmit={handleFormSubmit} style={{ padding: "1.5rem" }}>
                            <div className={styles["form-group"]}>
                                <label>Clave (Key) *</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Ej. MAINTENANCE_MODE, TAX_RATE"
                                    value={formData.key}
                                    onChange={e => setFormData({ ...formData, key: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                                    disabled={formLoading || !!editingSetting} // No cambiar key si se edita
                                    style={{ fontFamily: "monospace" }}
                                />
                                {editingSetting && <small style={{ color: "var(--text-secondary)" }}>La clave es un identificador único y no se puede editar.</small>}
                            </div>

                            <div className={styles["form-group"]}>
                                <label>Descripción de su uso</label>
                                <input
                                    type="text"
                                    placeholder="Ej. Porcentaje de comisión para ventas"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    disabled={formLoading}
                                />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                <div className={styles["form-group"]}>
                                    <label>Tipo de Dato</label>
                                    <select
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        disabled={formLoading}
                                    >
                                        <option value="string">Texto Libre</option>
                                        <option value="boolean">Booleano (True/False)</option>
                                        <option value="number">Número</option>
                                        <option value="json">Objeto JSON</option>
                                    </select>
                                </div>
                                <div className={styles["form-group"]}>
                                    <label>Visibilidad</label>
                                    <label className={styles["checkbox-label"]} style={{ marginTop: "1rem" }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.is_public}
                                            onChange={e => setFormData({ ...formData, is_public: e.target.checked })}
                                            disabled={formLoading}
                                        />
                                        Exponer a Frontend sin Autenticar
                                    </label>
                                </div>
                            </div>

                            <div className={styles["form-group"]}>
                                <label>Valor Actual *</label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="Ingresa el valor..."
                                    value={formData.value}
                                    onChange={e => setFormData({ ...formData, value: e.target.value })}
                                    disabled={formLoading}
                                    style={{ fontFamily: formData.type === 'json' ? 'monospace' : 'inherit' }}
                                />
                            </div>

                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border)" }}>
                                <button type="button" className="btn btn-secondary" onClick={closeFormModal} disabled={formLoading}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={formLoading} style={{ background: "var(--primary)", border: "none" }}>
                                    {formLoading ? "Guardando..." : "Guardar Ajuste"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className={dashStyles["page-header"]}>
                <h1 className={dashStyles["page-title"]}>⚙️ Configuraciones Globales</h1>
                <p className={dashStyles["page-subtitle"]}>Variables de entorno dinámicas, parámetros de cobro y flags de mantenimiento en caliente</p>
            </div>

            <div className={styles["settings-container"]}>
                <div className={styles["settings-header"]}>
                    <h2>Bóveda de Variables</h2>
                    <button className="btn btn-primary" onClick={openCreateModal} style={{ background: "var(--primary)" }}>
                        + Registrar Variable
                    </button>
                </div>

                {loading ? (
                    <p className={dashStyles["loading-text"]} style={{ padding: "3rem" }}>Cargando variables dinámicas...</p>
                ) : settings.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "4rem 2rem", color: "var(--text-secondary)" }}>
                        <span style={{ fontSize: "3rem", display: "block", marginBottom: "1rem" }}>🎛️</span>
                        <p>No hay configuraciones dinámicas insertadas en la base de datos.</p>
                    </div>
                ) : (
                    <div className={styles["settings-grid"]}>
                        {settings.map(setting => (
                            <div key={setting.id} className={styles["setting-card"]}>
                                <div className={styles["setting-key"]}>{setting.key}</div>
                                <div className={styles["setting-desc"]}>{setting.description || "Sin descripción"}</div>

                                <div className={styles["setting-meta"]}>
                                    <span className={`${styles.badge} ${setting.is_public ? styles['badge-public'] : styles['badge-private']}`}>
                                        {setting.is_public ? 'Público' : 'Privado'}
                                    </span>
                                    <span className={`${styles.badge} ${styles['badge-type']}`}>
                                        🏷️ {setting.type?.toUpperCase() || 'STRING'}
                                    </span>
                                </div>

                                <div className={styles["setting-value-display"]}>
                                    {setting.value}
                                </div>

                                <div className={styles["card-actions"]}>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => openEditModal(setting)}
                                        style={{ fontSize: "0.85rem", padding: "0.4rem 0.8rem", color: "#3b82f6", background: "rgba(59, 130, 246, 0.1)" }}
                                    >
                                        ✏️ Editar
                                    </button>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => confirmDelete(setting)}
                                        style={{ fontSize: "0.85rem", padding: "0.4rem 0.8rem", color: "var(--error)", background: "rgba(239, 68, 68, 0.1)", border: "none" }}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
