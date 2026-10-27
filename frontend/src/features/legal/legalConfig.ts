/**
 * Datos del responsable legal. ÚNICO lugar donde se llenan los datos de la empresa:
 * todos los documentos de /legal los toman de aquí. Todo valor que empiece con «[POR COMPLETAR»
 * se resalta en pantalla y debe sustituirse antes de publicar la app en tiendas.
 */
export interface LegalConfig {
  /** Nombre comercial. */
  brand: string;
  /** Razón social o nombre completo de la persona física responsable. */
  legalName: string;
  rfc: string;
  /** Domicilio para oír y recibir notificaciones (también es el domicilio del responsable de datos). */
  address: string;
  /** Correo del área de privacidad (solicitudes ARCO, revocación de consentimiento). */
  privacyEmail: string;
  supportEmail: string;
  /** Sitio web. */
  website: string;
  /** Ciudad y estado cuyos tribunales resuelven las controversias con usuarios que no sean consumidores. */
  jurisdiction: string;
  /** Fecha de última actualización (dd de mes de aaaa). */
  updatedAt: string;
  /** Fecha desde la cual aplican los documentos. */
  effectiveAt: string;
}

const pending = (campo: string) => `[POR COMPLETAR: ${campo}]`;

export const LEGAL: LegalConfig = {
  brand: 'Michicondrias',
  legalName: pending('razón social o nombre completo del titular'),
  rfc: pending('RFC'),
  address: pending('calle, número, colonia, C.P., municipio/alcaldía y estado'),
  privacyEmail: pending('correo de privacidad, p. ej. privacidad@michicondrias.com'),
  supportEmail: 'soporte@michicondrias.com',
  website: 'https://michicondrias.vercel.app',
  jurisdiction: pending('ciudad y estado de los tribunales competentes'),
  updatedAt: '26 de octubre de 2026',
  effectiveAt: '26 de octubre de 2026',
};

export const isPending = (text: string) => text.includes('[POR COMPLETAR');
