"use client";

/**
 * Olvidé mi contraseña — espejo de `mobile/app/(auth)/forgot-password.tsx`. Pide el correo y,
 * con el código de 6 dígitos a la mano, lleva a `/reset-password`.
 */
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Mail, Send } from "lucide-react";
import { usePasswordReset } from "@/hooks/auth/usePasswordReset";
import { showAlert } from "@/components/AppAlert";
import Button from "@/components/Button";
import s from "../auth.module.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const { requestReset, isRequesting } = usePasswordReset();
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showAlert({ type: "warning", title: "Campo requerido", message: "Ingresa tu correo electrónico." });
      return;
    }
    requestReset(email.trim().toLowerCase(), {
      onSuccess: () => setSent(true),
      onError: (error) => {
        showAlert({ type: "error", title: "Error de envío", message: error.message || "No se pudo enviar el correo. Inténtalo de nuevo." });
      },
    });
  };

  return (
    <>
      <button type="button" className={s.backRow} onClick={() => router.push("/login")}>
        <ArrowLeft size={18} aria-hidden /> Volver a iniciar sesión
      </button>

      {!sent ? (
        <>
          <div>
            <h1 className={s.heroTitle}>¿Olvidaste tu contraseña?</h1>
            <p className={s.heroSubtitle}>
              Te enviaremos un código de 6 dígitos para que recuperes el acceso a tu cuenta.
            </p>
          </div>

          <form className={s.card} onSubmit={handleSubmit}>
            <h2 className={s.cardTitle}>Tu correo</h2>
            <p className={s.cardSubtitle}>Ahí recibirás el código de recuperación</p>

            <div className={s.field}>
              <label className={s.fieldLabel} htmlFor="forgot-email">Correo electrónico</label>
              <div className={s.inputRow}>
                <Mail size={18} aria-hidden />
                <input
                  id="forgot-email"
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

            <Button
              type="submit"
              label="Enviar código"
              loading={isRequesting}
              icon={<Send size={18} />}
              accessibilityLabel="Enviar código"
            />
          </form>
        </>
      ) : (
        <>
          <div>
            <h1 className={s.heroTitle}>¡Revisa tu correo!</h1>
            <p className={s.heroSubtitle}>
              Si hay una cuenta con ese correo, te enviamos un código de 6 dígitos. También puedes abrir el enlace del mensaje.
            </p>
          </div>

          <div className={s.card}>
            <h2 className={s.cardTitle}>Siguiente paso</h2>
            <p className={s.cardSubtitle}>Cuando tengas el código, restablece tu contraseña</p>
            <Button
              label="Tengo el código"
              onPress={() => router.push(`/reset-password?email=${encodeURIComponent(email.trim().toLowerCase())}`)}
              iconRight={<ArrowRight size={20} />}
              accessibilityLabel="Tengo el código"
            />
            <Button
              label="Reenviar correo"
              variant="secondary"
              loading={isRequesting}
              onPress={() => requestReset(email.trim().toLowerCase())}
              accessibilityLabel="Reenviar correo"
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
