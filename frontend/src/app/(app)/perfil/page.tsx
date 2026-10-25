"use client";

/**
 * Perfil — dos columnas premium: datos y foto a la izquierda, seguridad/2FA/facturación/cuenta a la derecha.
 * Formularios con FormActionsBar. Criterio §0 (composición de escritorio).
 */
import { useState } from "react";
import Link from "next/link";
import {
  BadgeCheck, Bell, ChevronRight, CreditCard, FileText, HelpCircle, LogOut,
  Moon, PawPrint, Scissors, Settings, ShieldCheck, ShoppingBag, Sun, UserCog, UserRound,
} from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Card from "@/components/Card";
import Button from "@/components/Button";
import FormSwitch from "@/components/forms/FormSwitch";
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
    user, roleLabel, verification, verificationCopy, pendingAction,
    themeMode, setThemeMode, openBillingPortal, isOpeningBilling,
    openLegal, hasLegal, confirmSignOut, canBecomePro,
  } = useAccount();

  const initial = (user?.full_name || user?.email || "?").trim().charAt(0).toUpperCase();

  return (
    <ScreenContainer>
      <ScreenHeader title="Perfil" showBack={false} />

      {pendingAction && (
        <Link href={pendingAction.route} className={`${s.pending} ${pendingAction.tone === "error" ? s.pendingError : s.pendingOk}`}>
          <p className={s.pendingTitle}>{pendingAction.title}</p>
          <p className={s.pendingDesc}>{pendingAction.desc}</p>
        </Link>
      )}

      <div className={s.layout}>
        {/* ── Columna izquierda: datos y foto ── */}
        <div className={s.col}>
          {/* Hero de cuenta */}
          <section className={s.hero}>
            <div className={s.heroAvatar} aria-hidden>{initial}</div>
            <div className={s.heroInfo}>
              <h2 className={s.heroName}>{user?.full_name || "Tu cuenta"}</h2>
              <p className={s.heroEmail}>{user?.email}</p>
              <div className={s.heroMeta}>
                <span className={s.heroRole}>{roleLabel}</span>
                {verification === "VERIFIED" && (
                  <span className={s.heroVerified}><BadgeCheck size={14} /> Verificada</span>
                )}
              </div>
            </div>
            <Link href="/perfil/editar" className={s.heroEdit}>
              <UserCog size={18} /> Editar
            </Link>
          </section>

          {/* Datos personales */}
          <section className={s.section}>
            <h3 className={s.sectionTitle}>Datos personales</h3>
            <div className={s.dataGrid}>
              {[
                { icon: <UserRound size={15} />, label: "Nombre", value: user?.full_name || "—" },
                { icon: <UserRound size={15} />, label: "Correo", value: user?.email || "—" },
                { icon: <ShieldCheck size={15} />, label: "Rol", value: roleLabel },
                { icon: <BadgeCheck size={15} />, label: "Verificación", value: verificationCopy.desc },
              ].map((item) => (
                <div key={item.label} className={s.dataCell}>
                  <span className={s.dataLabel}>{item.icon}{item.label}</span>
                  <span className={s.dataValue}>{item.value}</span>
                </div>
              ))}
            </div>
            <Link href="/perfil/editar" className={s.dataAction}>
              Editar datos personales <ChevronRight size={15} />
            </Link>
          </section>

          {/* Mi actividad */}
          <section className={s.section}>
            <h3 className={s.sectionTitle}>Mi actividad</h3>
            <div className={s.quickGrid}>
              {[
                { icon: <PawPrint size={18} />, label: "Mascotas", href: "/mascotas" },
                { icon: <Scissors size={18} />, label: "Citas", href: "/directorio/citas" },
                { icon: <ShoppingBag size={18} />, label: "Compras", href: "/tienda/compras" },
                { icon: <FileText size={18} />, label: "Solicitudes", href: "/adopciones/mis-solicitudes" },
              ].map((item) => (
                <Link key={item.label} href={item.href} className={s.quickItem}>
                  <span className={s.quickIcon}>{item.icon}</span>
                  <span>{item.label}</span>
                  <ChevronRight size={14} className={s.quickArrow} />
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* ── Columna derecha: seguridad, 2FA, facturación, cuenta ── */}
        <div className={s.col}>
          {/* Seguridad */}
          <section className={s.section}>
            <h3 className={s.sectionTitle}>Seguridad</h3>
            <Link href="/perfil/seguridad-2fa" className={s.settingRow}>
              <span className={s.settingIcon}><ShieldCheck size={18} /></span>
              <div className={s.settingBody}>
                <span className={s.settingLabel}>Autenticación 2FA</span>
                <span className={s.settingDesc}>Protege tu cuenta con un segundo factor</span>
              </div>
              <ChevronRight size={16} className={s.settingArrow} />
            </Link>
            <Link href="/perfil/verificacion" className={s.settingRow}>
              <span className={s.settingIcon}><BadgeCheck size={18} /></span>
              <div className={s.settingBody}>
                <span className={s.settingLabel}>Verificación de identidad</span>
                <span className={s.settingDesc}>{verificationCopy.desc}</span>
              </div>
              <ChevronRight size={16} className={s.settingArrow} />
            </Link>
            <Link href="/perfil/eliminar-cuenta" className={`${s.settingRow} ${s.danger}`}>
              <span className={s.settingIcon}><LogOut size={18} /></span>
              <div className={s.settingBody}>
                <span className={s.settingLabel}>Eliminar mi cuenta</span>
                <span className={s.settingDesc}>Esta acción no se puede deshacer</span>
              </div>
              <ChevronRight size={16} className={s.settingArrow} />
            </Link>
          </section>

          {/* Facturación */}
          <section className={s.section}>
            <h3 className={s.sectionTitle}>Facturación</h3>
            <button type="button" className={s.settingRow} onClick={openBillingPortal} disabled={isOpeningBilling}>
              <span className={s.settingIcon}><CreditCard size={18} /></span>
              <div className={s.settingBody}>
                <span className={s.settingLabel}>Suscripciones y pagos</span>
                <span className={s.settingDesc}>Gestiona tus planes y métodos de pago</span>
              </div>
              <ChevronRight size={16} className={s.settingArrow} />
            </button>
            {canBecomePro && (
              <Link href="/perfil/partner" className={s.settingRow}>
                <span className={s.settingIcon}><BadgeCheck size={18} /></span>
                <div className={s.settingBody}>
                  <span className={s.settingLabel}>Cuenta profesional</span>
                  <span className={s.settingDesc}>Activa herramientas para tu oficio</span>
                </div>
                <ChevronRight size={16} className={s.settingArrow} />
              </Link>
            )}
          </section>

          {/* Apariencia */}
          <section className={s.section}>
            <h3 className={s.sectionTitle}>Apariencia</h3>
            <SegmentedControl
              value={themeMode}
              onChange={(v) => setThemeMode(v as typeof themeMode)}
              options={THEME_OPTIONS.map((o) => ({ value: o.value as string, label: o.label, icon: o.icon }))}
              accessibilityLabel="Tema"
            />
          </section>

          {/* Soporte */}
          <section className={s.section}>
            <h3 className={s.sectionTitle}>Soporte</h3>
            <Link href="/ayuda" className={s.settingRow}>
              <span className={s.settingIcon}><HelpCircle size={18} /></span>
              <div className={s.settingBody}>
                <span className={s.settingLabel}>Ayuda</span>
                <span className={s.settingDesc}>Preguntas frecuentes</span>
              </div>
              <ChevronRight size={16} className={s.settingArrow} />
            </Link>
            <button type="button" className={s.settingRow} onClick={openLegal}>
              <span className={s.settingIcon}><FileText size={18} /></span>
              <div className={s.settingBody}>
                <span className={s.settingLabel}>Aviso legal</span>
                <span className={s.settingDesc}>Privacidad y términos</span>
              </div>
              <ChevronRight size={16} className={s.settingArrow} />
            </button>
            <button type="button" className={`${s.settingRow} ${s.danger}`} onClick={confirmSignOut}>
              <span className={s.settingIcon}><LogOut size={18} /></span>
              <div className={s.settingBody}>
                <span className={s.settingLabel}>Cerrar sesión</span>
              </div>
            </button>
          </section>
        </div>
      </div>
    </ScreenContainer>
  );
}
