import type { LegalConfig } from '../legalConfig';
import type { LegalDoc } from '../types';

export const usoAceptable = (c: LegalConfig): LegalDoc => ({
  slug: 'uso-aceptable',
  title: 'Política de Uso Aceptable y Contenido',
  summary: 'Qué se puede y qué no se puede hacer o publicar, y qué pasa si se incumple.',
  sections: [
    {
      title: '1. Principio general',
      blocks: [`${c.brand} existe para cuidar mascotas y conectar a quienes las cuidan. Usa la Plataforma de forma honesta, respetuosa y legal.`],
    },
    {
      title: '2. Está prohibido',
      blocks: [
        { list: [
          'Maltratar animales, promover peleas, crueldad o abandono, o publicar contenido que lo muestre o incentive.',
          'Vender, regalar o publicar animales silvestres, especies protegidas, o animales de origen ilícito; o promover la cría o venta irregular de mascotas.',
          'Vender medicamentos controlados, de venta restringida o sin los permisos aplicables; o productos falsificados, caducos, peligrosos o prohibidos.',
          'Suplantar a otra persona, clínica, empresa o autoridad; falsificar cédulas, identificaciones o documentos.',
          'Publicar información falsa o engañosa: mascotas perdidas inexistentes, adopciones falsas, reseñas pagadas o falsas, precios fraudulentos.',
          'Solicitar o cobrar fuera de la Plataforma para evadir controles, o pedir depósitos con intención de fraude.',
          'Acosar, amenazar, discriminar o difundir datos personales de terceros sin su consentimiento.',
          'Publicar contenido sexual, violento gráfico, ilegal u ofensivo, o que infrinja derechos de autor o marcas.',
          'Introducir virus, hacer scraping masivo, intentar vulnerar la seguridad, saturar los servicios o usar bots.',
          'Crear múltiples cuentas para evadir una suspensión.',
        ] },
      ],
    },
    {
      title: '3. Reseñas y calificaciones',
      blocks: [
        'Las reseñas deben reflejar una experiencia real. No debes calificar a quien tengas conflicto de interés, ni pagar o intercambiar reseñas. Podemos retirar reseñas que sean falsas, difamatorias o ajenas al servicio, sin que ello sea censura de opiniones legítimas.',
      ],
    },
    {
      title: '4. Moderación y consecuencias',
      blocks: [
        `Podemos revisar, ocultar o eliminar contenido y suspender o cancelar cuentas que incumplan esta política o la ley, con o sin aviso previo según la gravedad. Podemos conservar evidencia y colaborar con autoridades competentes. Para reportar contenido o conductas usa el botón de reporte de la app o escribe a ${c.supportEmail}.`,
      ],
    },
    {
      title: '5. Derechos de autor y marcas',
      blocks: [
        `Si crees que un contenido viola tus derechos de autor o de propiedad industrial, escribe a ${c.supportEmail} con: tus datos, la descripción de la obra o marca, el enlace al contenido y una declaración de buena fe. Revisaremos y, en su caso, retiraremos el contenido.`,
      ],
    },
  ],
});
