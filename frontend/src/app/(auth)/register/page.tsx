"use client";

/**
 * Registro — espejo de `mobile/app/(auth)/register.tsx`. Tras crear la cuenta, login automático (F10)
 * y el hook deja la sesión lista: la app cae en Inicio.
 */
import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { useRegister } from "@/hooks/auth/useRegister";
import { showAlert } from "@/components/AppAlert";
import Button from "@/components/Button";
import s from "../auth.module.css";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { register, isRegistering } = useRegister();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password || !confirm) {
      showAlert({ type: "warning", title: "Campos incompletos", message: "Por favor llena todos los campos." });
      return;
    }
    if (fullName.trim().length < 3) {
      showAlert({ type: "warning", title: "Nombre muy corto", message: "Escribe tu nombre completo." });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      showAlert({ type: "warning", title: "Correo inválido", message: "Revisa que tu correo esté bien escrito." });
      return;
    }
    if (password.length < 8) {
      showAlert({ type: "warning", title: "Contraseña muy corta", message: "Tu contraseña debe tener al menos 8 caracteres." });
      return;
    }
    if (password !== confirm) {
      showAlert({ type: "error", title: "No coinciden", message: "Las contraseñas no coinciden." });
      return;
    }
    register({ email: email.trim().toLowerCase(), password, fullName: fullName.trim() }, {
      onError: (error) => {
        showAlert({ type: "error", title: "Error de registro", message: error.message || "No se pudo crear la cuenta." });
      },
    });
  };

  return (
    <>
      <div className={s.logo}>
        <div className={s.logoRing}>
          <Image src="/monograma.png" alt="Michicondrias" width={72} height={72} className={s.logoImage} />
        </div>
        <h1 className={s.appName}>Michicondrias</h1>
        <p className={s.tagline}>Crea tu cuenta y empieza a cuidarlos</p>
      </div>

      <form className={s.card} onSubmit={handleSubmit}>
        <h2 className={s.cardTitle}>Crear cuenta</h2>
        <p className={s.cardSubtitle}>Solo necesitas tu nombre, correo y contraseña</p>

        <div className={s.field}>
          <label className={s.fieldLabel} htmlFor="reg-name">Nombre completo</label>
          <div className={s.inputRow}>
            <User size={18} aria-hidden />
            <input
              id="reg-name"
              className={s.input}
              type="text"
              placeholder="Tu nombre"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>
        </div>

        <div className={s.field}>
          <label className={s.fieldLabel} htmlFor="reg-email">Correo electrónico</label>
          <div className={s.inputRow}>
            <Mail size={18} aria-hidden />
            <input
              id="reg-email"
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
          <label className={s.fieldLabel} htmlFor="reg-password">Contraseña</label>
          <div className={s.inputRow}>
            <Lock size={18} aria-hidden />
            <input
              id="reg-password"
              className={s.input}
              type={showPassword ? "text" : "password"}
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          <label className={s.fieldLabel} htmlFor="reg-confirm">Confirmar contraseña</label>
          <div className={s.inputRow}>
            <Lock size={18} aria-hidden />
            <input
              id="reg-confirm"
              className={s.input}
              type={showPassword ? "text" : "password"}
              placeholder="Repite tu contraseña"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          label="Crear cuenta"
          loading={isRegistering}
          iconRight={<ArrowRight size={20} />}
          accessibilityLabel="Crear cuenta"
        />
      </form>

      <div className={s.footer}>
        <span>¿Ya tienes cuenta?</span>
        <Link href="/login" className={s.footerLink}>Inicia sesión</Link>
      </div>
    </>
  );
}
