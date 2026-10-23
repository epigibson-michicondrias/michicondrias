"use client";

/**
 * Perfil — espejo de `mobile/app/(tabs)/perfil.tsx`: cuenta, actividad, apariencia, soporte y legal.
 */
import Link from "next/link";
import {
  BadgeCheck,
  CreditCard,
  FileText,
  HelpCircle,
  LogOut,
  Moon,
  PawPrint,
  Scissors,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sun,
  UserCog,
  UserRound,
} from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import SectionHeader from "@/components/SectionHeader";
import ListRow from "@/components/ListRow";
import Card from "@/components/Card";
import SegmentedControl from "@/components/SegmentedControl";
import { useAccount } from "@/hooks/perfil/useAccount";
import s from "./perfil.module.css";

const THEME_OPTIONS = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Oscuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Settings },
] as const;

export default function PerfilPage() {
  const {
    user,
    roleLabel,
    verification,
    verificationCopy,
    pendingAction,
    themeMode,
    setThemeMode,
    openBillingPortal,
    isOpeningBilling,
    openLegal,
    hasLegal,
    confirmSignOut,
    canBecomePro,
  } = useAccount();

  const initial = (user?.full_name || user?.email || "?").trim().charAt(0).toUpperCase();

  return (
    <ScreenContainer>
      <ScreenHeader title="Perfil" showBack={false} />

      <Card>
        <div className={s.account}>
          <div className={s.avatar} aria-hidden>{initial}</div>
          <div className={s.accountBody}>
            <p className={s.accountName}>{user?.full_name || "Tu cuenta"}</p>
            <p className={s.accountEmail}>{user?.email}</p>
            <p className={s.accountRole}>
              {roleLabel}
              {verification === "VERIFIED" && <BadgeCheck size={14} aria-label="Verificada" />}
            </p>
          </div>
          <Link href="/perfil/editar" className={s.chevron} aria-label="Editar datos personales">
            <UserCog size={20} />
          </Link>
        </div>
      </Card>

      {pendingAction && (
        <Link href={pendingAction.route} className={`${s.pending} ${pendingAction.tone === "error" ? s.pendingError : s.pendingOk}`}>
          <p className={s.pendingTitle}>{pendingAction.title}</p>
          <p className={s.pendingDesc}>{pendingAction.desc}</p>
        </Link>
      )}

      <section>
        <SectionHeader title="Mi actividad" />
        <ListRow icon={PawPrint} label="Mis mascotas" desc="Fichas y carnets" onPress={() => window.location.assign("/mascotas")} />
        <ListRow icon={Scissors} label="Mis citas" desc="Reservas con clínicas" onPress={() => window.location.assign("/directorio/citas")} />
        <ListRow icon={ShoppingBag} label="Mis compras" desc="Pedidos de la tienda" onPress={() => window.location.assign("/tienda/compras")} />
        <ListRow icon={FileText} label="Mis solicitudes" desc="Adopciones en curso" onPress={() => window.location.assign("/adopciones/mis-solicitudes")} />
      </section>

      <section>
        <SectionHeader title="Cuenta" />
        <ListRow icon={UserRound} label="Datos personales" desc="Nombre, teléfono y biografía" onPress={() => window.location.assign("/perfil/editar")} />
        <ListRow
          icon={ShieldCheck}
          label="Verificación"
          desc={verificationCopy.desc}
          badge={verificationCopy.badge}
          onPress={() => window.location.assign("/perfil/verificacion")}
        />
        <ListRow icon={Settings} label="Seguridad 2FA" desc="Autenticación de dos factores" onPress={() => window.location.assign("/perfil/seguridad-2fa")} />
        <ListRow icon={CreditCard} label="Facturación" desc="Suscripciones y pagos" onPress={openBillingPortal} />
        {canBecomePro && (
          <ListRow icon={BadgeCheck} label="Cuenta profesional" desc="Activa herramientas para tu oficio" onPress={() => window.location.assign("/perfil/partner")} />
        )}
      </section>

      <section>
        <SectionHeader title="Apariencia" />
        <div className={s.themeRow}>
          <SegmentedControl
            value={themeMode}
            onChange={(v) => setThemeMode(v as typeof themeMode)}
            options={THEME_OPTIONS.map((o) => ({ value: o.value as string, label: o.label, icon: o.icon }))}
            accessibilityLabel="Tema"
          />
        </div>
      </section>

      <section>
        <SectionHeader title="Soporte y legal" />
        <ListRow icon={HelpCircle} label="Ayuda" desc="Preguntas frecuentes" onPress={() => window.location.assign("/ayuda")} />
        <ListRow icon={FileText} label="Aviso legal" desc="Privacidad y términos" onPress={openLegal} />
      </section>

      <section className={s.footer}>
        <ListRow icon={LogOut} label="Cerrar sesión" destructive onPress={confirmSignOut} />
        <Link href="/perfil/eliminar-cuenta" className={s.dangerLink}>Eliminar mi cuenta</Link>
      </section>
    </ScreenContainer>
  );
}
