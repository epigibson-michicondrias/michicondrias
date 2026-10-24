"use client";

/**
 * Panel de administración (`/admin`): cifras, pendientes que piden acción y acceso a cada módulo.
 * Espejo ampliado de `mobile/app/admin/index.tsx`.
 */
import {
  BarChart3, Building2, Eye, FolderTree, Package, PawPrint, Settings, Shield, ShoppingBag, Stethoscope,
  UserCheck, Users, Wrench,
} from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import { ModuleLink, StatTile } from "@/features/admin/AdminKit";
import { useAdminDashboard } from "@/hooks/admin/useAdminDashboard";
import { useAdminModeration } from "@/hooks/admin/useAdminModeration";
import { useAdminVerifications } from "@/hooks/admin/useAdminVerifications";
import s from "@/features/admin/admin.module.css";

export default function AdminPage() {
  const d = useAdminDashboard();
  const mod = useAdminModeration();
  const kyc = useAdminVerifications();
  const pendingMod = Object.values(mod.counts).reduce((a, b) => a + b, 0);

  return (
    <ScreenContainer>
      <ScreenHeader title="Panel admin" subtitle="Administración de la plataforma" />

      <div className={s.content}>
        <div className={s.tiles}>
          <StatTile icon={Users} value={d.totalUsers} label="Usuarios" color="var(--color-info)" href="/admin/usuarios" />
          <StatTile icon={Stethoscope} value={d.vetCount} label="Veterinarios" color="var(--color-success)" href="/admin/veterinarios" />
          <StatTile icon={Building2} value={d.clinicCount} label="Clínicas" color="var(--color-primary)" href="/admin/clinicas" />
          <StatTile icon={PawPrint} value={d.sitterCount} label="Paseadores y cuidadores" color="var(--color-secondary)" href="/admin/usuarios" />
        </div>

        <section className={s.section}>
          <h2 className={s.sectionTitle}>Requiere tu atención</h2>
          <div className={s.menu}>
            <ModuleLink icon={Eye} label="Moderación" sub={pendingMod ? `${pendingMod} publicaciones por revisar` : "Nada pendiente"} color="var(--color-error)" href="/admin/moderacion" />
            <ModuleLink icon={UserCheck} label="Verificaciones" sub={kyc.pendingUsers.length ? `${kyc.pendingUsers.length} identidades por revisar` : "Nada pendiente"} color="var(--color-warning)" href="/admin/verificaciones" />
          </div>
        </section>

        <section className={s.section}>
          <h2 className={s.sectionTitle}>Usuarios y accesos</h2>
          <div className={s.menu}>
            <ModuleLink icon={Users} label="Usuarios" sub="Cuentas, roles y estado" color="var(--color-info)" href="/admin/usuarios" />
            <ModuleLink icon={Stethoscope} label="Veterinarios" sub="Cuentas con rol veterinario" color="var(--color-success)" href="/admin/veterinarios" />
            <ModuleLink icon={Shield} label="Roles y permisos" sub="Matriz de accesos por rol" color="var(--color-primary)" href="/admin/roles" />
          </div>
        </section>

        <section className={s.section}>
          <h2 className={s.sectionTitle}>Contenido y catálogo</h2>
          <div className={s.menu}>
            <ModuleLink icon={Building2} label="Clínicas" sub="Directorio de centros" color="var(--color-primary)" href="/admin/clinicas" />
            <ModuleLink icon={Wrench} label="Servicios" sub="Catálogo de las clínicas" color="var(--color-secondary)" href="/admin/servicios" />
            <ModuleLink icon={PawPrint} label="Mascotas" sub="Registradas en la app" color="var(--color-accent)" href="/admin/mascotas" />
            <ModuleLink icon={Package} label="Productos" sub="Michi-Shop" color="var(--color-success)" href="/admin/productos" />
            <ModuleLink icon={ShoppingBag} label="Pedidos" sub="Ventas de la tienda" color="var(--color-info)" href="/admin/pedidos" />
            <ModuleLink icon={FolderTree} label="Categorías" sub="Tienda y subcategorías" color="var(--color-warning)" href="/admin/categorias" />
          </div>
        </section>

        <section className={s.section}>
          <h2 className={s.sectionTitle}>Métricas y sistema</h2>
          <div className={s.menu}>
            <ModuleLink icon={BarChart3} label="Analíticas" sub="Crecimiento y distribución" color="var(--color-success)" href="/admin/stats" />
            <ModuleLink icon={Settings} label="Configuración" sub="Mantenimiento, OTA y caché" color="var(--color-text-muted)" href="/admin/config" />
          </div>
        </section>
      </div>
    </ScreenContainer>
  );
}
