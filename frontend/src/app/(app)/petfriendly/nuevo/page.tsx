"use client";

/**
 * Registrar lugar pet-friendly (`/petfriendly/nuevo`).
 * Espejo de `mobile/app/petfriendly/nuevo.tsx`.
 */
import { useRef } from "react";
import { Camera, Check, Coffee, Droplets, ShoppingBag, TreePine, Utensils, UtensilsCrossed } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Button from "@/components/Button";
import FormField from "@/components/FormField";
import FormSection from "@/components/forms/FormSection";
import { usePlaceForm } from "@/hooks/petfriendly/usePlaceForm";
import local from "../petfriendly.module.css";

const CATEGORIES = [
  { id: "Restaurante", icon: Utensils },
  { id: "Cafetería", icon: Coffee },
  { id: "Parque", icon: TreePine },
  { id: "Tienda", icon: ShoppingBag },
];

const SIZES = ["Pequeño", "Mediano", "Grande", "Todos"];

export default function NuevoLugarPage() {
  const { form, image, loading, location, locating, updateField, setImageFile, locate, handleSave } =
    usePlaceForm();
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <ScreenContainer>
      <ScreenHeader title="Registrar lugar" subtitle="Pet friendly" />

      <form
        className={local.form}
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
        <div className={local.imageSelector}>
          <button
            type="button"
            className={local.imageBox}
            onClick={() => fileRef.current?.click()}
            aria-label="Elegir foto de portada"
          >
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element -- previsualización de blob local
              <img src={image.preview} alt="Portada del lugar" />
            ) : (
              <>
                <Camera size={32} aria-hidden />
                Subir Foto de Portada
              </>
            )}
          </button>
          <input
            ref={fileRef}
            className={local.imageInput}
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <FormSection title="Datos del lugar">
          <FormField
            label="Nombre del Establecimiento"
            value={form.name}
            onChangeText={(v) => updateField("name", v)}
            placeholder="Ej. El Michi Café"
          />

          <p className={local.label}>Categoría</p>
          <div className={local.catRow} role="radiogroup" aria-label="Categoría">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const active = form.category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  className={`${local.catBtn} ${active ? local.catBtnOn : ""}`}
                  onClick={() => updateField("category", cat.id)}
                >
                  <Icon size={18} aria-hidden />
                  {cat.id}
                </button>
              );
            })}
          </div>
        </FormSection>

        <FormSection title="Ubicación">
          <p className={local.noteText}>
            Se usa tu posición actual: regístralo estando en el lugar.
          </p>
          <div className={local.locationBox}>
            <p className={local.locationText}>
              {location
                ? `Ubicación capturada: ${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
                : "Aún no se ha capturado tu ubicación."}
            </p>
            <button type="button" className={local.linkBtn} onClick={locate} disabled={locating}>
              {locating
                ? "Obteniendo ubicación..."
                : location
                  ? "Actualizar mi ubicación"
                  : "Usar mi ubicación actual"}
            </button>
          </div>

          <FormField
            label="Ciudad"
            value={form.city}
            onChangeText={(v) => updateField("city", v)}
            placeholder="Ej. Ciudad de México"
          />
          <div className={local.row}>
            <FormField
              label="Teléfono (Opcional)"
              value={form.phone}
              onChangeText={(v) => updateField("phone", v)}
              placeholder="10 dígitos"
              keyboardType="phone-pad"
              autoComplete="tel"
            />
            <FormField
              label="Sitio web (Opcional)"
              value={form.website}
              onChangeText={(v) => updateField("website", v)}
              placeholder="https://..."
              keyboardType="url"
              autoCapitalize="none"
            />
          </div>
          <FormField
            label="Dirección (Opcional)"
            value={form.address}
            onChangeText={(v) => updateField("address", v)}
            placeholder="Ej. Calle 123, Col. Centro"
            autoComplete="street-address"
          />
        </FormSection>

        <FormSection title="Servicios Petfriendly">
          <div className={local.amenitiesGrid}>
            <button
              type="button"
              className={`${local.amenityBtn} ${form.has_water_bowls === "Sí" ? local.amenityBtnOn : ""}`}
              aria-pressed={form.has_water_bowls === "Sí"}
              onClick={() => updateField("has_water_bowls", form.has_water_bowls === "Sí" ? "No" : "Sí")}
            >
              <Droplets size={20} aria-hidden />
              Platos con agua
              {form.has_water_bowls === "Sí" && (
                <span className={local.checkBadge} aria-hidden>
                  <Check size={10} />
                </span>
              )}
            </button>
            <button
              type="button"
              className={`${local.amenityBtn} ${form.has_pet_menu === "Sí" ? local.amenityBtnOn : ""}`}
              aria-pressed={form.has_pet_menu === "Sí"}
              onClick={() => updateField("has_pet_menu", form.has_pet_menu === "Sí" ? "No" : "Sí")}
            >
              <UtensilsCrossed size={20} aria-hidden />
              Menú para mascotas
              {form.has_pet_menu === "Sí" && (
                <span className={local.checkBadge} aria-hidden>
                  <Check size={10} />
                </span>
              )}
            </button>
          </div>
        </FormSection>

        <FormSection title="Detalles">
          <p className={local.label}>Tamaños Permitidos</p>
          <div className={local.sizeRow} role="radiogroup" aria-label="Tamaños permitidos">
            {SIZES.map((size) => (
              <button
                key={size}
                type="button"
                role="radio"
                aria-checked={form.pet_sizes_allowed === size}
                className={`${local.sizeBtn} ${form.pet_sizes_allowed === size ? local.sizeBtnOn : ""}`}
                onClick={() => updateField("pet_sizes_allowed", size)}
              >
                {size}
              </button>
            ))}
          </div>

          <FormField
            label="Descripción y Tips"
            value={form.description}
            onChangeText={(v) => updateField("description", v)}
            placeholder="Cosas que otros dueños deberían saber..."
            multiline
            numberOfLines={4}
          />
        </FormSection>

        <Button
          label={loading ? "Registrando..." : "Publicar Lugar"}
          icon={<Check size={18} />}
          loading={loading}
          size="lg"
          type="submit"
        />
      </form>
    </ScreenContainer>
  );
}
