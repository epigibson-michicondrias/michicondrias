"use client";

/**
 * Login — espejo de `mobile/app/(auth)/login.tsx` (U3): logo, formulario y continuación con 2FA.
 * Tras entrar sin 2FA, el hook `useLogin` ya abrió la sesión y cae en Inicio.
 */
import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import { useLogin } from "@/hooks/auth/useLogin";
import { showAlert } from "@/components/AppAlert";
import Button from "@/components/Button";
import s from "../auth.module.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [tempToken, setTempToken] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const { login, verify2FA, isLoggingIn, isVerifying2FA } = useLogin();
  const router = useRouter();

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      showAlert({ type: "warning", title: "Campos incompletos", message: "Ingresa tu correo y contraseña." });
      return;
    }
    login({ email: email.trim().toLowerCase(), password }, {
      onSuccess: (data) => {
        // Con 2FA el backend devuelve un token temporal: se pide el código. Sin 2FA el hook ya abrió la sesión.
        if (data.require_2fa && data.temp_token) {
          setTempToken(data.temp_token);
          setShow2FA(true);
        }
      },
      onError: (error) => {
        showAlert({ type: "error", title: "No pudimos iniciar sesión", message: error.message || "Revisa tu correo y contraseña." });
      },
    });
  };

  const handleVerify2FA = (e: FormEvent) => {
    e.preventDefault();
    if (otpCode.trim().length < 6) {
      showAlert({ type: "warning", title: "Código inválido", message: "Ingresa el código de 6 dígitos." });
      return;
    }
    verify2FA({ tempToken, code: otpCode.trim() }, {
      onError: (error) => {
        showAlert({ type: "error", title: "Código inválido", message: error.message || "El código es incorrecto o ya venció." });
        setOtpCode("");
      },
    });
  };

  return (
    <>
      <div className={s.logo}>
        <div className={s.logoRing}>
          <Image src="/logo.jpg" alt="Michicondrias" width={72} height={72} className={s.logoImage} />
        </div>
        <h1 className={s.appName}>Michicondrias</h1>
        <p className={s.tagline}>Cuidado integral para tus mascotas</p>
      </div>

      {!show2FA ? (
        <form className={s.card} onSubmit={handleLogin}>
          <h2 className={s.cardTitle}>Bienvenido</h2>
          <p className={s.cardSubtitle}>Inicia sesión en tu cuenta</p>

          <div className={s.field}>
            <label className={s.fieldLabel} htmlFor="login-email">Email</label>
            <div className={s.inputRow}>
              <Mail size={18} aria-hidden />
              <input
                id="login-email"
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

          <div className={s.field}>
            <label className={s.fieldLabel} htmlFor="login-password">Contraseña</label>
            <div className={s.inputRow}>
              <Lock size={18} aria-hidden />
              <input
                id="login-password"
                className={s.input}
                type={showPassword ? "text" : "password"}
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
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

          <div className={s.linkRow}>
            <Link href="/forgot-password" className={s.linkBtn}>¿Olvidaste tu contraseña?</Link>
          </div>

          <Button
            type="submit"
            label="Entrar"
            loading={isLoggingIn}
            iconRight={<ArrowRight size={20} />}
            accessibilityLabel="Entrar"
          />
        </form>
      ) : (
        <form className={s.card} onSubmit={handleVerify2FA}>
          <button type="button" className={s.backRow} onClick={() => { setShow2FA(false); setTempToken(""); setOtpCode(""); }}>
            <ArrowLeft size={18} aria-hidden /> Volver
          </button>

          <div className={s.center}>
            <div className={s.successIcon}><ShieldCheck size={28} /></div>
            <h2 className={s.cardTitle}>Verificación 2FA</h2>
            <p className={s.cardSubtitle}>Ingresa el código de 6 dígitos de tu app de autenticación.</p>
          </div>

          <input
            className={s.otpInput}
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
            aria-label="Código de verificación"
            autoComplete="one-time-code"
          />

          <Button
            type="submit"
            label="Verificar"
            loading={isVerifying2FA}
            icon={<ShieldCheck size={20} />}
            accessibilityLabel="Verificar código"
          />
        </form>
      )}

      {!show2FA && (
        <div className={s.footer}>
          <span>¿No tienes cuenta?</span>
          <Link href="/register" className={s.footerLink}>Regístrate aquí</Link>
        </div>
      )}
    </>
  );
}
