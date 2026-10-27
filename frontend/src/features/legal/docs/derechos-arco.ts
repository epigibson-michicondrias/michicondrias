import type { LegalConfig } from '../legalConfig';
import type { LegalDoc } from '../types';

export const derechosArco = (c: LegalConfig): LegalDoc => ({
  slug: 'derechos-arco',
  title: 'Cómo ejercer tus Derechos ARCO',
  summary: 'Pasos para acceder, rectificar, cancelar u oponerte al uso de tus datos, o revocar tu consentimiento.',
  sections: [
    {
      title: '1. Qué puedes pedir',
      blocks: [
        { list: [
          'Acceso: saber qué datos tuyos tenemos y cómo los usamos.',
          'Rectificación: corregir datos inexactos o incompletos.',
          'Cancelación: que eliminemos tus datos (con las excepciones legales).',
          'Oposición: que dejemos de usar tus datos para ciertos fines.',
          'Revocar tu consentimiento o limitar el uso o divulgación, incluida la portabilidad cuando proceda.',
        ] },
        'Muchos cambios los puedes hacer tú mismo en Perfil (editar datos, desactivar promociones, cerrar cuenta).',
      ],
    },
    {
      title: '2. Cómo solicitarlo',
      blocks: [
        `Envía un correo a ${c.privacyEmail} (o por escrito a ${c.address}) con el asunto «Derechos ARCO» e incluye:`,
        { list: [
          'Tu nombre completo y el correo con el que usas la Plataforma.',
          'Copia digital de una identificación oficial vigente (si actúas por representante, carta poder y su identificación).',
          'Descripción clara de los datos y del derecho que ejerces.',
          'Para rectificar: los datos correctos y documentos que los respalden.',
        ] },
      ],
    },
    {
      title: '3. Plazos',
      blocks: [
        'Te responderemos en un máximo de 20 días hábiles. Si procede, haremos efectiva la solicitud en los 15 días hábiles siguientes a la respuesta. Los plazos pueden ampliarse por una sola vez y por el mismo periodo si existe causa justificada, avisándote.',
        'El ejercicio de los derechos es gratuito; solo podrían cobrarse gastos justificados de envío o reproducción en los casos que permite la ley.',
      ],
    },
    {
      title: '4. Si no estás conforme',
      blocks: [
        'Puedes acudir a la autoridad competente en materia de protección de datos personales en posesión de particulares (actualmente, la Secretaría Anticorrupción y Buen Gobierno).',
      ],
    },
  ],
});
