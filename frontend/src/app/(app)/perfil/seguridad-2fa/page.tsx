"use client";

/**
 * Seguridad 2FA — espejo de `mobile/app/perfil/seguridad-2fa.tsx`. Sin lib de QR: se muestra la clave
 * y el enlace otpauth para abrirla en la app de autenticación.
 */
import { useState } from "react";
import { Check, Copy, ExternalLink, Eye, EyeOff, Shield, ShieldCheck } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Card from "@/components/Card";
import Button from "@/components/Button";
import FormField from "@/components/FormField";
import FormSection from "@/components/forms/FormSection";
import { showAlert } from "@/components/AppAlert";
import { use2FA } from "@/hooks/perfil/use2FA";
import s from "../perfil.module.css";

export default function Seguridad2FAPage() {
  const {
    is2FAEnabled, qrUri, secret, code, setCode,
    handleSetup, handleEnable, handleDisable, copySecret,
    isSettingUp, isEnabling, isDisabling,
  } = use2FA();
  const [showSecret, setShowSecret] = useState(false);

  const verifyEnabled = code.trim().length >= 6;

  return (
    <ScreenContainer>
      <ScreenHeader title="Seguridad 2FA" subtitle="Autenticación de dos factores" />

      <Card>
        <div className={s.account}>
          <div className={`${s.avatar} ${is2FAEnabled ? s.avatarOk : ""}`} aria-hidden>
            {is2FAEnabled ? <ShieldCheck size={24} /> : <Shield size={24} />}
          </div>
          <div className={s.accountBody}>
            <p className={s.accountName}>{is2FAEnabled ? "2FA activado" : "2FA desactivado"}</p>
            <p className={s.accountEmail}>
              Necesitarás una app de autenticación como Google Authenticator o Authy.
            </p>
          </div>
        </div>
      </Card>

      {!is2FAEnabled && !qrUri && (
        <FormSection title="Configurar 2FA">
          <p style={{ margin: 0, color: "var(--color-text-muted)", lineHeight: 1.5 }}>
            Añade una capa extra: además de tu contraseña, pediremos el código de tu app al iniciar sesión.
          </p>
          <Button label="Configurar 2FA" onPress={handleSetup} loading={isSettingUp} />
        </FormSection>
      )}

      {!is2FAEnabled && qrUri && (
        <>
          <FormSection title="Escanear el código QR">
            <p style={{ margin: 0, color: "var(--color-text-muted)", lineHeight: 1.5 }}>
              En tu app de autenticación elige «Añadir cuenta» y pega esta clave o abre el enlace.
            </p>
            <div className={s.secretBox}>
              <code className={s.secretText}>{showSecret ? secret : "•••• •••• •••• ••••"}</code>
              <button type="button" className={s.iconGhost} onClick={() => setShowSecret((v) => !v)} aria-label="Mostrar u ocultar clave">
                {showSecret ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className={s.formRow}>
              <Button label="Copiar clave" variant="secondary" icon={<Copy size={18} />} onPress={copySecret} />
              {qrUri && (
                <Button
                  label="Abrir en app"
                  variant="secondary"
                  icon={<ExternalLink size={18} />}
                  onPress={() => window.open(qrUri, "_blank", "noopener,noreferrer")}
                />
              )}
            </div>
          </FormSection>

          <FormSection title="Verificar código">
            <FormField
              label="Código de 6 dígitos"
              value={code}
              onChangeText={setCode}
              placeholder="000000"
              keyboardType="number-pad"
            />
            <Button
              label="Activar 2FA"
              onPress={() => {
                if (!verifyEnabled) {
                  showAlert({ type: "warning", title: "Código incompleto", message: "Ingresa el código de 6 dígitos." });
                  return;
                }
                handleEnable();
              }}
              loading={isEnabling}
              icon={<Check size={20} />}
            />
          </FormSection>
        </>
      )}

      {is2FAEnabled && (
        <FormSection title="Desactivar 2FA">
          <FormField
            label="Código de 6 dígitos"
            value={code}
            onChangeText={setCode}
            placeholder="000000"
            keyboardType="number-pad"
          />
          <Button
            label="Desactivar 2FA"
            variant="danger"
            onPress={() => {
              if (!verifyEnabled) {
                showAlert({ type: "warning", title: "Código incompleto", message: "Ingresa el código de 6 dígitos." });
                return;
              }
              showAlert({
                type: "warning",
                title: "Desactivar 2FA",
                message: "Tu cuenta quedará protegida solo con la contraseña. ¿Continuar?",
                showCancel: true,
                onButtonPress: handleDisable,
              });
            }}
            loading={isDisabling}
          />
        </FormSection>
      )}
    </ScreenContainer>
  );
}
