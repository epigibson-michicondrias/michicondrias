"use client";

/**
 * Eliminar cuenta — espejo de `mobile/app/perfil/eliminar-cuenta.tsx`. Acción destructiva con confirmación.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import FormField from "@/components/FormField";
import FormSection from "@/components/forms/FormSection";
import Button from "@/components/Button";
import Card from "@/components/Card";
import { showAlert } from "@/components/AppAlert";
import { useAuth } from "@/contexts/AuthContext";
import { getMyProfile, deleteMyAccount } from "@/services/profile";

export default function EliminarCuentaPage() {
  const { signOut } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const { data: profile } = useQuery({ queryKey: ["user-profile"], queryFn: getMyProfile });
  const needs2FA = !!profile?.is_two_factor_enabled;
  const canSubmit = password.length > 0 && (!needs2FA || code.trim().length >= 6);

  const handleDelete = () => {
    showAlert({
      type: "warning",
      title: "Eliminar cuenta",
      message: "Esta acción no se puede deshacer. ¿Seguro que quieres continuar?",
      showCancel: true,
      onButtonPress: async () => {
        setBusy(true);
        try {
          await deleteMyAccount(password, needs2FA ? code.trim() : undefined);
          await signOut();
          showAlert({ type: "success", title: "Cuenta eliminada", message: "Lamentamos verte partir." });
          router.replace("/login");
        } catch (error) {
          showAlert({
            type: "error",
            title: "No se pudo eliminar",
            message: error instanceof Error ? error.message : "Revisa tu contraseña e inténtalo de nuevo.",
          });
        } finally {
          setBusy(false);
        }
      },
    });
  };

  return (
    <ScreenContainer>
      <ScreenHeader title="Eliminar cuenta" />

      <Card>
        <p style={{ margin: "0 0 8px", fontWeight: 700, color: "var(--color-text)" }}>Qué pasará</p>
        <ul style={{ margin: 0, paddingLeft: 18, color: "var(--color-text-muted)", lineHeight: 1.6 }}>
          <li>Se eliminarán tu nombre, correo y foto.</li>
          <li>Perderás el acceso a mascotas, carnets y pedidos.</li>
          <li>No podrás eliminarla si tienes pedidos o viajes en curso, o una suscripción Michi-Tracker Pro activa.</li>
          <li>Esta acción no se puede deshacer.</li>
        </ul>
      </Card>

      <FormSection title="Confirma tu identidad">
        <FormField
          label="Contraseña actual"
          value={password}
          onChangeText={setPassword}
          placeholder="Tu contraseña"
          secureTextEntry
        />
        {needs2FA && (
          <FormField
            label="Código de tu app de autenticación (2FA)"
            value={code}
            onChangeText={setCode}
            placeholder="000000"
            keyboardType="number-pad"
          />
        )}
      </FormSection>

      <Button
        label="Eliminar cuenta definitivamente"
        variant="danger"
        icon={<Trash2 size={18} />}
        onPress={handleDelete}
        loading={busy}
        disabled={!canSubmit}
      />
      <Button label="Cancelar" variant="ghost" onPress={() => router.back()} />
    </ScreenContainer>
  );
}
