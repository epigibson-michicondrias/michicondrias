"use client";

/** Vitrina del kit base (W2): todos los componentes espejo en el tema activo, para revisión visual. */
import { useState } from "react";
import { Bell, Cat, Heart, LogOut, Moon, PawPrint, Plus, Settings, ShoppingBag, Sun, Monitor } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Button from "@/components/Button";
import IconButton from "@/components/IconButton";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import FilterChip from "@/components/FilterChip";
import SectionHeader from "@/components/SectionHeader";
import ListRow from "@/components/ListRow";
import EmptyState from "@/components/EmptyState";
import SearchBar from "@/components/SearchBar";
import SegmentedControl from "@/components/SegmentedControl";
import FormField from "@/components/FormField";
import FormSection from "@/components/forms/FormSection";
import FormSelect from "@/components/forms/FormSelect";
import FormSwitch from "@/components/forms/FormSwitch";
import { Skeleton, SkeletonList } from "@/components/Skeleton";
import { showAlert } from "@/components/AppAlert";
import { useTheme } from "@/hooks/useTheme";
import { validateEmail } from "@/utils/validators";
import { MODULE_ACCENTS } from "@/constants/modules";

const stack = { display: "grid", gap: "var(--space-xl)", maxWidth: 720, margin: "0 auto" } as const;
const row = { display: "flex", flexWrap: "wrap", gap: "var(--space-sm)", alignItems: "center" } as const;

export default function KitPage() {
  const { themeMode, setThemeMode } = useTheme();
  const [filter, setFilter] = useState("todos");
  const [query, setQuery] = useState("");
  const [email, setEmail] = useState("");
  const [species, setSpecies] = useState("gato");
  const [reminders, setReminders] = useState(true);

  const emailCheck = email ? validateEmail(email) : null;
  const emailError = emailCheck && !emailCheck.valid ? emailCheck.message : null;

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Kit de componentes"
        subtitle="Espejo de mobile/src/components"
        showBack={false}
        actions={[{ icon: Bell, label: "Notificaciones", onPress: () => undefined, badge: 3 }]}
      />
      <div style={stack}>
        <SegmentedControl
          value={themeMode}
          onChange={setThemeMode}
          accessibilityLabel="Tema"
          options={[
            { value: "light", label: "Claro", icon: Sun },
            { value: "dark", label: "Oscuro", icon: Moon },
            { value: "system", label: "Sistema", icon: Monitor },
          ]}
        />

        <section>
          <SectionHeader title="Botones" actionLabel="Ver todo" onAction={() => undefined} />
          <div style={row}>
            <Button label="Guardar" fullWidth={false} />
            <Button label="Cancelar" variant="secondary" fullWidth={false} />
            <Button label="Más tarde" variant="ghost" fullWidth={false} />
            <Button label="Eliminar" variant="danger" fullWidth={false} />
            <Button label="Adoptar" variant="gold" fullWidth={false} icon={<Heart size={16} />} />
            <Button label="Guardando" loading fullWidth={false} />
            <IconButton icon={Settings} accessibilityLabel="Ajustes" />
            <IconButton icon={ShoppingBag} accessibilityLabel="Bolsa" variant="surface" badge={2} />
            <IconButton icon={Plus} accessibilityLabel="Agregar" variant="primary" />
          </div>
        </section>

        <section>
          <SectionHeader title="Insignias y filtros" />
          <div style={{ ...row, marginBottom: "var(--space-md)" }}>
            <Badge label="Al día" color="var(--color-success)" />
            <Badge label="Pendiente" color="var(--color-warning)" variant="outlined" />
            <Badge label="Adopción" color={MODULE_ACCENTS.adopciones} variant="solid" />
            <Badge label="Pequeña" size="sm" />
          </div>
          <div style={row}>
            {["todos", "gatos", "perros"].map((f) => (
              <FilterChip key={f} label={f[0].toUpperCase() + f.slice(1)} active={filter === f} onPress={() => setFilter(f)} count={f === "gatos" ? 12 : undefined} />
            ))}
          </div>
        </section>

        <SearchBar value={query} onChangeText={setQuery} placeholder="Buscar mascotas, clínicas…" />

        <section style={{ display: "grid", gap: "var(--space-md)" }}>
          <SectionHeader title="Cuenta" overline />
          <ListRow icon={Cat} label="Mis mascotas" desc="Luna y Simón" badge="2" />
          <ListRow icon={PawPrint} label="Adopciones" desc="Tus solicitudes" color={MODULE_ACCENTS.adopciones} />
          <ListRow icon={LogOut} label="Cerrar sesión" destructive />
        </section>

        <Card elevated>
          <SectionHeader title="Formulario" subtitle="Validación inline" />
          <FormSection title="Datos de la mascota">
            <FormField label="Correo del dueño" value={email} onChangeText={setEmail} keyboardType="email-address" error={emailError} hint="Te enviamos los recordatorios aquí" />
            <FormSelect label="Especie" value={species} onChange={setSpecies} options={[{ label: "Gato", value: "gato" }, { label: "Perro", value: "perro" }, { label: "Otro", value: "otro" }]} />
            <FormSwitch label="Recordatorios" description="Vacunas y citas" value={reminders} onChange={setReminders} />
          </FormSection>
          <Button label="Mostrar aviso" onPress={() => showAlert({ type: "success", title: "Guardado", message: "Los datos de Luna quedaron al día." })} />
        </Card>

        <section>
          <SectionHeader title="Carga" />
          <Skeleton width="50%" height={18} style={{ marginBottom: 12 }} />
          <SkeletonList count={2} />
        </section>

        <Card>
          <EmptyState icon={<Cat size={32} />} title="Aún no tienes mascotas" subtitle="Registra a tu primera mascota para llevar su carnet." actionLabel="Agregar mascota" onAction={() => undefined} />
        </Card>
      </div>
    </ScreenContainer>
  );
}
