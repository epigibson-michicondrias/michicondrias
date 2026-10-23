"use client";

/**
 * Cuenta profesional — espejo de `mobile/app/perfil/partner.tsx`. Elige el rol tras el KYC.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle, Award, Building2, Car, CheckCircle, Clock, Coffee, Dog, Flower2,
  FlaskConical, GraduationCap, Heart, HeartHandshake, Home, Scissors, Shield,
  ShieldCheck, ShoppingBag, Stethoscope,
} from "lucide-react";
import type { ComponentType } from "react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { showAlert } from "@/components/AppAlert";
import { useAuth } from "@/contexts/AuthContext";
import { usePartnerUpgrade } from "@/hooks/perfil/usePartnerUpgrade";
import type { VerificationStatus } from "@/types/auth";
import s from "../perfil.module.css";

interface RoleOption {
  id: string;
  icon: ComponentType<{ size?: number }>;
  title: string;
  desc: string;
  benefits: string[];
}

const ROLES: RoleOption[] = [
  { id: "veterinario", icon: Stethoscope, title: "Veterinario", desc: "Atiende pacientes, agenda citas y emite recetas.", benefits: ["Gestión de pacientes", "Sistema de citas", "Videoconsultas"] },
  { id: "hospital", icon: Building2, title: "Clínica u Hospital", desc: "Administra sedes, médicos asociados y agenda.", benefits: ["Sucursales", "Médicos asociados", "Inventario"] },
  { id: "vendedor", icon: ShoppingBag, title: "Marca o Vendedor", desc: "Vende alimentos, accesorios o medicinas en la Michi-Shop.", benefits: ["Tienda online", "Pedidos", "Análisis de ventas"] },
  { id: "paseador", icon: Dog, title: "Paseador", desc: "Ofrece paseos para dueños ocupados.", benefits: ["Calendario flexible", "Solicitudes", "Reseñas"] },
  { id: "cuidador", icon: Home, title: "Cuidador / Pensión", desc: "Hospeda y cuida mascotas en tu hogar.", benefits: ["Hospedaje", "Calendario", "Reseñas"] },
  { id: "refugio", icon: HeartHandshake, title: "Refugio", desc: "Gestiona adopciones y recibe donaciones.", benefits: ["Adopciones", "Donaciones", "Insignia de confianza"] },
  { id: "hogar_temporal", icon: Heart, title: "Hogar temporal", desc: "Cuida mascotas rescatadas mientras encuentran familia.", benefits: ["Publicaciones", "Solicitudes"] },
  { id: "aseguradora", icon: Shield, title: "Aseguradora", desc: "Publica planes y gestiona reclamos.", benefits: ["Planes", "Reclamos"] },
  { id: "laboratorio", icon: FlaskConical, title: "Laboratorio", desc: "Recibe órdenes y entrega resultados.", benefits: ["Órdenes", "Resultados"] },
  { id: "funeraria", icon: Flower2, title: "Funeraria", desc: "Servicios de despedida y memoriales.", benefits: ["Paquetes", "Memoriales"] },
  { id: "entrenador", icon: GraduationCap, title: "Entrenador", desc: "Ofrece programas de adiestramiento.", benefits: ["Programas", "Alumnos"] },
  { id: "estilista", icon: Scissors, title: "Estilista", desc: "Agenda citas de estética y grooming.", benefits: ["Agenda", "Servicios"] },
  { id: "patrocinador", icon: Award, title: "Patrocinador", desc: "Crea campañas y apoya alertas de mascotas perdidas.", benefits: ["Campañas", "Estadísticas"] },
  { id: "transportista", icon: Car, title: "Transportista", desc: "Transporta mascotas con seguimiento del viaje.", benefits: ["Viajes", "Tracking"] },
  { id: "establecimiento", icon: Coffee, title: "Establecimiento pet-friendly", desc: "Registra tu local y atrae clientes con mascotas.", benefits: ["Perfil del local", "Cupones"] },
];

const KYC_COPY: Record<VerificationStatus, {
  icon: typeof CheckCircle;
  tone: "ok" | "warn" | "bad" | "muted";
  title: string;
  desc: string;
  action: string | null;
  route?: string;
}> = {
  UNVERIFIED: { icon: ShieldCheck, tone: "muted", title: "Identidad sin verificar", desc: "Primero verifica tu identidad para poder elegir una cuenta profesional.", action: "Verificar", route: "/perfil/verificacion" },
  PENDING: { icon: Clock, tone: "warn", title: "Identidad en revisión", desc: "Cuando un administrador apruebe tus documentos podrás elegir tu cuenta profesional.", action: "Ver estado", route: "/perfil/verificacion" },
  VERIFIED: { icon: CheckCircle, tone: "ok", title: "Identidad verificada", desc: "Ya puedes elegir el tipo de cuenta profesional que quieres activar.", action: null },
  REJECTED: { icon: AlertCircle, tone: "bad", title: "Identidad rechazada", desc: "Vuelve a subir tus documentos para poder continuar.", action: "Reintentar", route: "/perfil/verificacion" },
};

export default function PartnerPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { upgrade, isUpgrading } = usePartnerUpgrade();
  const [selected, setSelected] = useState<string | null>(null);

  const status = (user?.verification_status || "UNVERIFIED") as VerificationStatus;
  const kyc = KYC_COPY[status];
  const KycIcon = kyc.icon;
  const canChoose = status === "VERIFIED";

  const handleUpgrade = () => {
    if (!selected) {
      showAlert({ type: "warning", title: "Selecciona un rol", message: "Elige el tipo de cuenta profesional que deseas." });
      return;
    }
    upgrade(selected, {
      onSuccess: (result) => {
        if (!result.ok) {
          showAlert({
            type: "warning",
            title: "Verifica tu identidad",
            message: "Necesitas la identidad aprobada antes de activar tu cuenta profesional.",
          });
          return;
        }
        showAlert({
          type: "success",
          title: "¡Cuenta profesional activada!",
          message: "Ya puedes usar tus herramientas. Te llevamos a Inicio.",
        });
        router.replace("/inicio");
      },
      onError: (error) => {
        showAlert({ type: "error", title: "Error al actualizar rol", message: error.message || "Inténtalo de nuevo." });
      },
    });
  };

  return (
    <ScreenContainer>
      <ScreenHeader title="Cuenta profesional" subtitle="Desbloquea herramientas para tu oficio" />

      <Card>
        <div className={s.account}>
          <div className={`${s.avatar} ${kyc.tone === "ok" ? s.avatarOk : ""}`} aria-hidden>
            <KycIcon size={24} />
          </div>
          <div className={s.accountBody}>
            <p className={s.accountName}>{kyc.title}</p>
            <p className={s.accountEmail}>{kyc.desc}</p>
          </div>
        </div>
        {kyc.action && kyc.route && (
          <Button label={kyc.action} variant="secondary" onPress={() => router.push(kyc.route!)} />
        )}
      </Card>

      <section>
        <h2 className={s.docTitle}>Elige tu rol</h2>
        <div className={s.roleGrid}>
          {ROLES.map((role) => {
            const active = selected === role.id;
            return (
              <button
                key={role.id}
                type="button"
                className={`${s.roleCard} ${active ? s.roleCardOn : ""}`}
                onClick={() => setSelected(role.id)}
                aria-pressed={active}
              >
                <role.icon size={22} />
                <p className={s.docLabel}>{role.title}</p>
                <p className={s.accountEmail}>{role.desc}</p>
                <ul className={s.benefits}>
                  {role.benefits.map((b) => <li key={b}>{b}</li>)}
                </ul>
                {active && <span className={s.roleBadge}>Seleccionado</span>}
              </button>
            );
          })}
        </div>
      </section>

      <Button
        label={isUpgrading ? "Activando…" : selected ? `Convertirme en ${ROLES.find((r) => r.id === selected)?.title}` : "Selecciona un rol"}
        onPress={handleUpgrade}
        loading={isUpgrading}
        disabled={!canChoose}
      />
      <Button label="Cancelar" variant="ghost" onPress={() => router.back()} />

      <Card>
        <p className={s.docLabel}>¿Por qué ser Partner?</p>
        <p className={s.accountEmail}>
          Las cuentas profesionales acceden a agenda, pacientes, ventas y más — todo desde la misma app
          donde están los dueños de mascotas.
        </p>
      </Card>
    </ScreenContainer>
  );
}
