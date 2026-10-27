import type { LegalConfig } from '../legalConfig';
import type { LegalDoc } from '../types';

export const cookies = (c: LegalConfig): LegalDoc => ({
  slug: 'cookies',
  title: 'Política de Cookies y Almacenamiento Local',
  summary: 'Qué guarda la web y la app en tu dispositivo y cómo controlarlo.',
  sections: [
    {
      title: '1. Qué usamos',
      blocks: [
        'En la web usamos almacenamiento local del navegador y cookies técnicas; en la app, almacenamiento seguro del dispositivo. Sirven para:',
        { list: [
          'Mantener tu sesión iniciada y proteger tu cuenta (necesarias).',
          'Recordar preferencias como el tema claro/oscuro y el idioma (de preferencia).',
          'Medir el funcionamiento y detectar errores de forma agregada (de análisis).',
        ] },
        'No usamos cookies para publicidad conductual de terceros ni vendemos información sobre tu navegación.',
      ],
    },
    {
      title: '2. Cómo controlarlas',
      blocks: [
        'Puedes borrar o bloquear cookies y almacenamiento local desde la configuración de tu navegador o desde los ajustes del teléfono. Si bloqueas las necesarias, no podrás iniciar sesión ni usar funciones que dependan de ella.',
      ],
    },
    {
      title: '3. Más información',
      blocks: [`Para dudas, escribe a ${c.privacyEmail}. Esta política forma parte del Aviso de Privacidad.`],
    },
  ],
});
