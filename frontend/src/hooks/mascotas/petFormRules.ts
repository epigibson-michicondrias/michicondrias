/**
 * Reglas del formulario de mascota (alta y edición): validación inline, conversión al payload del backend
 * y carga de una mascota existente. Una sola fuente para `PetForm`, `usePetForm` y `useEditPet`.
 */
import type { Pet, PetFormData } from '@/types/mascotas';

export type PetFormErrors = Partial<Record<keyof PetFormData, string>>;

const MAX_YEARS = 40;
const MAX_WEIGHT_KG = 150;

const isBlank = (value: string) => value.trim() === '';
const toInt = (value: string) => (/^\d+$/.test(value.trim()) ? parseInt(value, 10) : NaN);
const toKg = (value: string) => parseFloat(value.trim().replace(',', '.'));

/** Errores por campo; vacío = válido. Solo el nombre es obligatorio (raza y descripción son opcionales en el backend). */
export function validatePetForm(form: PetFormData): PetFormErrors {
    const errors: PetFormErrors = {};
    if (isBlank(form.name)) errors.name = 'Escribe su nombre';

    if (!isBlank(form.age_years)) {
        const years = toInt(form.age_years);
        if (isNaN(years) || years > MAX_YEARS) errors.age_years = `De 0 a ${MAX_YEARS} años`;
    }
    if (!isBlank(form.age_months)) {
        const months = toInt(form.age_months);
        if (isNaN(months) || months > 11) errors.age_months = 'De 0 a 11 meses';
    }
    if (!isBlank(form.weight_kg)) {
        const kg = toKg(form.weight_kg);
        if (isNaN(kg) || kg <= 0 || kg > MAX_WEIGHT_KG) errors.weight_kg = 'Escribe un peso válido, p. ej. 4.5';
    }
    return errors;
}

/** Campos del backend a partir del formulario ya validado. `is_vaccinated` no se manda: lo calcula el carnet. */
export function toPetPayload(form: PetFormData) {
    const hasAge = !isBlank(form.age_years) || !isBlank(form.age_months);
    const ageMonths = hasAge ? (toInt(form.age_years) || 0) * 12 + (toInt(form.age_months) || 0) : null;
    return {
        name: form.name.trim(),
        species: form.species,
        breed: form.breed.trim() || null,
        gender: form.gender,
        description: form.description.trim() || null,
        age_months: ageMonths,
        weight_kg: isBlank(form.weight_kg) ? null : toKg(form.weight_kg),
        is_sterilized: form.is_sterilized,
        is_dewormed: form.is_dewormed,
        microchip_number: form.microchip_id.trim() || null,
    };
}

/** Formulario lleno con una mascota existente (edición). */
export function petToForm(pet: Pet): PetFormData {
    const total = pet.age_months ?? null;
    return {
        name: pet.name || '',
        species: pet.species || 'gato',
        breed: pet.breed || '',
        age_years: total != null ? String(Math.floor(total / 12)) : '',
        age_months: total != null ? String(total % 12) : '',
        gender: pet.gender || 'macho',
        description: pet.description || '',
        is_sterilized: pet.is_sterilized ?? false,
        is_dewormed: pet.is_dewormed ?? false,
        weight_kg: pet.weight_kg != null ? String(pet.weight_kg) : '',
        microchip_id: pet.microchip_number || '',
    };
}
