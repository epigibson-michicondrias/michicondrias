import type { LegalConfig } from '../legalConfig';
import type { LegalDoc } from '../types';

export const avisoMedicoIa = (c: LegalConfig): LegalDoc => ({
  slug: 'aviso-medico-ia',
  title: 'Aviso Médico y de Inteligencia Artificial',
  summary: 'La app informa y organiza; no sustituye a un médico veterinario ni atiende emergencias.',
  sections: [
    {
      title: '1. No es atención veterinaria',
      blocks: [
        `${c.brand} no es una clínica, hospital ni médico veterinario. El carnet digital, los recordatorios de vacunas y dosis, los resúmenes de historial, los planes de dieta, las alertas y la orientación por inteligencia artificial son herramientas informativas y de organización. No son diagnóstico, pronóstico, prescripción ni tratamiento.`,
        'Cualquier decisión sobre la salud, medicación, alimentación o tratamiento de una mascota debe tomarse con un médico veterinario con cédula profesional que la examine.',
      ],
    },
    {
      title: '2. Emergencias',
      blocks: [
        'Si tu mascota presenta dificultad para respirar, convulsiones, sangrado abundante, envenenamiento, golpe fuerte, imposibilidad de orinar, vómito o diarrea persistentes, pérdida del conocimiento o cualquier síntoma que te preocupe, acude de inmediato a una clínica veterinaria de urgencias. No esperes la respuesta de la app ni de un profesional por mensaje.',
      ],
    },
    {
      title: '3. Orientación con inteligencia artificial',
      blocks: [
        'La función de orientación de síntomas y el resumen de historial usan modelos de inteligencia artificial y reglas automáticas de alarma. Pueden equivocarse, omitir información o dar resultados incompletos. El nivel de urgencia que muestran es una estimación y no sustituye el criterio clínico.',
        'Un resultado «sin urgencia» no garantiza que tu mascota esté sana. Un resultado de urgencia es una recomendación de acudir a revisión, no un diagnóstico.',
        'La información que envías a esta función se procesa con proveedores de inteligencia artificial conforme al Aviso de Privacidad. No incluyas datos de terceros que no tengas derecho a compartir.',
      ],
    },
    {
      title: '4. Información cargada por profesionales y usuarios',
      blocks: [
        'Las consultas, recetas, estudios y vacunas del carnet los registran los profesionales o los usuarios. Cada profesional es responsable de la exactitud y de la licitud de lo que registra. ' + c.brand + ' no verifica clínicamente esa información ni responde por errores u omisiones en ella.',
        'Las dosis y los calendarios sugeridos son referencias generales. Confirma siempre con tu veterinario antes de aplicar un medicamento o vacuna.',
      ],
    },
    {
      title: '5. Videoconsultas y consultas a distancia',
      blocks: [
        'Cuando un veterinario ofrece consulta a distancia, la relación profesional es exclusivamente entre tú y el profesional. Una consulta remota puede ser insuficiente para diagnosticar; el profesional puede pedirte acudir de forma presencial. ' + c.brand + ' solo provee la herramienta de conexión.',
      ],
    },
    {
      title: '6. Limitación de responsabilidad',
      blocks: [
        `En los términos permitidos por la ley, ${c.brand} no se hace responsable de daños, lesiones, enfermedad o muerte de una mascota derivados de usar o no usar la información de la Plataforma. Estas limitaciones se complementan con los Términos y Condiciones.`,
      ],
    },
  ],
});
