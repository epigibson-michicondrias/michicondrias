/**
 * Shared form validation utilities
 */

/** Validation result */
export interface ValidationResult {
    valid: boolean;
    message?: string;
}

/** Validate required field */
export function validateRequired(value: string | undefined | null, fieldName: string): ValidationResult {
    if (!value || value.trim().length === 0) {
        return { valid: false, message: `${fieldName} es obligatorio` };
    }
    return { valid: true };
}

/** Validate email format */
export function validateEmail(email: string | undefined | null): ValidationResult {
    if (!email || email.trim().length === 0) {
        return { valid: false, message: 'El email es obligatorio' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { valid: false, message: 'El formato del email no es válido' };
    }
    return { valid: true };
}

/** Validate phone number (10 digits) */
export function validatePhone(phone: string | undefined | null): ValidationResult {
    if (!phone || phone.trim().length === 0) {
        return { valid: false, message: 'El teléfono es obligatorio' };
    }
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 10) {
        return { valid: false, message: 'El teléfono debe tener 10 dígitos' };
    }
    return { valid: true };
}

/** Validate minimum length */
export function validateMinLength(value: string | undefined | null, min: number, fieldName: string): ValidationResult {
    if (!value || value.trim().length < min) {
        return { valid: false, message: `${fieldName} debe tener al menos ${min} caracteres` };
    }
    return { valid: true };
}

/** Validate number range */
export function validateNumberRange(
    value: number | undefined | null,
    min: number,
    max: number,
    fieldName: string
): ValidationResult {
    if (value == null) {
        return { valid: false, message: `${fieldName} es obligatorio` };
    }
    if (value < min || value > max) {
        return { valid: false, message: `${fieldName} debe estar entre ${min} y ${max}` };
    }
    return { valid: true };
}

/** Validate positive number */
export function validatePositive(value: number | undefined | null, fieldName: string): ValidationResult {
    if (value == null || value <= 0) {
        return { valid: false, message: `${fieldName} debe ser un número positivo` };
    }
    return { valid: true };
}

/** Validate password strength */
export function validatePassword(password: string | undefined | null): ValidationResult {
    if (!password) {
        return { valid: false, message: 'La contraseña es obligatoria' };
    }
    if (password.length < 6) {
        return { valid: false, message: 'La contraseña debe tener al menos 6 caracteres' };
    }
    return { valid: true };
}

/** Run multiple validations and return first error or success */
export function validateAll(...validations: ValidationResult[]): ValidationResult {
    for (const v of validations) {
        if (!v.valid) return v;
    }
    return { valid: true };
}

/**
 * Validate a form object with field-level validators
 * Returns array of errors (empty = valid)
 */
export function validateForm<T extends Record<string, any>>(
    form: T,
    rules: Partial<Record<keyof T, (value: any) => ValidationResult>>
): { valid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};
    for (const [field, validator] of Object.entries(rules)) {
        if (validator) {
            const result = (validator as (value: any) => ValidationResult)(form[field]);
            if (!result.valid && result.message) {
                errors[field] = result.message;
            }
        }
    }
    return { valid: Object.keys(errors).length === 0, errors };
}
