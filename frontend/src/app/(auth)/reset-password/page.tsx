"use client";

/**
 * Restablecer contraseña — espejo de `mobile/app/(auth)/reset-password.tsx`. Pantalla única:
 * con `?token=` (deep link del correo) o con correo + código de 6 dígitos.
 */
import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle, Eye, EyeOff, KeyRound, Lock, Mail, ShieldCheck } from "lucide-react";
import { usePasswordReset } from "@/hooks/auth/usePasswordReset";
import { showAlert } from "@/components/AppAlert";
import Button from "@/components/Button";
import s from "../auth.module.css";

function ResetPasswordForm() {
  const params = useSearchParams();
  const tokenParam = params.get("token") || "";
  const emailParam = params.get("email") || "";
  const withToken = !!tokenParam;

  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const { resetPassword, isResetting, resetWithCode, isResettingWithCode } = usePasswordReset();
  const router = useRouter();
  const isWorking = isResetting || isResettingWithCode;

  const handleReset = (e: FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();
    if (!withToken && (!cleanEmail || cleanCode.length !== 6)) {
      showAlert({ type: "warning", title: "Datos requeridos", message: "Escribe tu correo y el código de 6 dígitos." });
      return;
    }
    if (!newPassword || !confirmPassword) {
      showAlert({ type: "warning", title: "Campos requeridos", message: "Ingresa y confirma tu nueva contraseña." });
      return;
    }
    if (newPassword.length < 8) {
      showAlert({ type: "warning", title: "Contraseña débil", message: "Debe tener al menos 8 caracteres." });
      return;
    }
    if (newPassword !== confirmPassword) {
      showAlert({ type: "error", title: "No coinciden", message: "Las contraseñas no coinciden." });
      return;
    }
    const onSuccess = () => setSuccess(true);
    const onError = (error: Error) => {
      showAlert({ type: "error", title: "Error", message: error.message || "No se pudo restablecer. El código puede haber expirado." });
    };
    if (withToken) {
      resetPassword({ token: tokenParam, newPassword }, { onSuccess, onError });
    } else {
      resetWithCode({ email: cleanEmail, code: cleanCode, newPassword }, { onSuccess, onError });
    }
  };

  return (
    <>
      <button type="button" className={s.backRow} onClick={() => router.push("/login")}>
        <ArrowLeft size={18} aria-hidden /> Volver a iniciar sesión
      </button>

      {!success ? (
        <>
          <div>
            <div className={s.successIcon}><KeyRound size={28} /></div>
            <h1 className={s.heroTitle}>Nueva contraseña</h1>
            <p className={s.heroSubtitle}>
              {withToken
                ? "Escribe tu nueva contraseña para recuperar el acceso"
                : "Escribe el código de 6 dígitos y tu nueva contraseña"}
            </p>
          </div>

          <form className={s.card} onSubmit={handleReset}>
            {!withToken && (
              <div className={s.field}>
                <label className={s.fieldLabel} htmlFor="reset-email">Correo electrónico</label>
                <div className={s.inputRow}>
                  <Mail size={18} aria-hidden />
                  <input
                    id="reset-email"
                    className={s.input}
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    autoCapitalize="none"
                    required
                  />
                </div>
              </div>
            )}

            {!withToken && (
              <div className={s.field}>
                <label className={s.fieldLabel} htmlFor="reset-code">Código de 6 dígitos</label>
                <div className={s.inputRow}>
                  <ShieldCheck size={18} aria-hidden />
                  <input
                    id="reset-code"
                    className={s.input}
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    autoComplete="one-time-code"
                    required
                  />
                </div>
              </div>
            )}

            <div className={s.field}>
              <label className={s.fieldLabel} htmlFor="reset-password">Nueva contraseña</label>
              <div className={s.inputRow}>
                <Lock size={18} aria-hidden />
                <input
                  id="reset-password"
                  className={s.input}
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  className={s.iconBtn}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className={s.field}>
              <label className={s.fieldLabel} htmlFor="reset-confirm">Confirmar contraseña</label>
              <div className={s.inputRow}>
                <Lock size={18} aria-hidden />
                <input
                  id="reset-confirm"
                  className={s.input}
                  type={showPassword ? "text" : "password"}
                  placeholder="Repite tu contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              label="Restablecer contraseña"
              loading={isWorking}
              iconRight={<ArrowRight size={20} />}
              accessibilityLabel="Restablecer contraseña"
            />
          </form>
        </>
      ) : (
        <>
          <div>
            <div className={s.successIcon}><CheckCircle size={28} /></div>
            <h1 className={s.heroTitle}>¡Contraseña actualizada!</h1>
            <p className={s.heroSubtitle}>Ya puedes iniciar sesión con tu nueva contraseña.</p>
          </div>
          <div className={s.card}>
            <Button
              label="Ir a iniciar sesión"
              onPress={() => router.replace("/login")}
              iconRight={<ArrowRight size={20} />}
              accessibilityLabel="Ir a iniciar sesión"
            />
          </div>
        </>
      )}

      <div className={s.footer}>
        <Link href="/login" className={s.footerLink}>Volver a iniciar sesión</Link>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
