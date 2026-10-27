/**
 * Datos de contacto de soporte. Los que no tienen valor por defecto se ocultan en la app
 * hasta que se configuren (EXPO_PUBLIC_SUPPORT_PHONE, EXPO_PUBLIC_SUPPORT_WHATSAPP, EXPO_PUBLIC_TERMS_URL).
 */
export const SUPPORT_EMAIL = process.env.EXPO_PUBLIC_SUPPORT_EMAIL || 'soporte@michicondrias.com';
export const SUPPORT_PHONE = process.env.EXPO_PUBLIC_SUPPORT_PHONE || '';
export const SUPPORT_WHATSAPP = process.env.EXPO_PUBLIC_SUPPORT_WHATSAPP || '';
const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL || 'https://michicondrias.vercel.app';
/** Documentos legales públicos de la web (frontend/src/app/legal). */
export const LEGAL_URL = `${WEB_URL}/legal`;
export const TERMS_URL = process.env.EXPO_PUBLIC_TERMS_URL || `${LEGAL_URL}/terminos`;
export const PRIVACY_URL = process.env.EXPO_PUBLIC_PRIVACY_URL || `${LEGAL_URL}/privacidad`;
