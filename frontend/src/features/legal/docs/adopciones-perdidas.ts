import type { LegalConfig } from '../legalConfig';
import type { LegalDoc } from '../types';

export const adopcionesPerdidas = (c: LegalConfig): LegalDoc => ({
  slug: 'adopciones-perdidas',
  title: 'Política de Adopciones y Mascotas Perdidas',
  summary: 'Cómo funcionan las adopciones, el contrato y los avisos de mascotas perdidas, y quién responde de qué.',
  sections: [
    {
      title: '1. Papel de la Plataforma',
      blocks: [
        `${c.brand} solo facilita el contacto entre quien da en adopción (refugios, hogares temporales o particulares) y quien desea adoptar, y entre quien busca una mascota perdida y quien la encuentra. No somos parte de la adopción, no somos dueños ni custodios de los animales, y no verificamos su estado de salud, comportamiento, esterilización o historial.`,
      ],
    },
    {
      title: '2. Quien publica una adopción',
      blocks: [
        { list: [
          'Debe ser el dueño legítimo o contar con autorización para darlo en adopción, y publicar información veraz sobre su salud, edad, temperamento y condiciones.',
          'Está prohibido cobrar por animales presentados como «adopción gratuita», revender, o entregar a quien muestre indicios de maltrato, cría ilegal o venta.',
          'Es responsable de entrevistar al adoptante, de la decisión de entregar la mascota y de los acuerdos que celebre.',
        ] },
      ],
    },
    {
      title: '3. Quien adopta',
      blocks: [
        { list: [
          'Se compromete a dar trato digno, atención veterinaria, alimento, espacio y cuidados adecuados, y a no abandonar, vender, regalar ni maltratar al animal.',
          'Responde de los daños que el animal cause a personas o bienes desde la entrega, conforme a la ley civil aplicable.',
          'Debe verificar por su cuenta la salud del animal con un veterinario de su confianza.',
        ] },
      ],
    },
    {
      title: '4. Contrato de adopción digital',
      blocks: [
        'El contrato que se genera y acepta en la Plataforma es un acuerdo entre quien da y quien recibe en adopción. Se celebra por medios electrónicos y las partes reconocen su validez (Código de Comercio, arts. 89 a 114; Código Civil Federal, art. 1803). La Plataforma conserva el registro de aceptación como evidencia. No sustituye asesoría legal y no obliga a ' + c.brand + '.',
      ],
    },
    {
      title: '5. Mascotas perdidas y avistamientos',
      blocks: [
        { list: [
          'Publica solo información de mascotas realmente extraviadas. El contenido falso puede suspenderte la cuenta y ser denunciado.',
          'Antes de entregar o recibir una mascota encontrada, verifica la propiedad (fotos, carnet, microchip, rasgos) y acuerda un punto de encuentro seguro y público. ' + c.brand + ' no se responsabiliza de encuentros presenciales ni de la integridad de las personas o del animal.',
          'Las publicaciones, fotos y ubicaciones que compartas pueden ser vistas por otros usuarios. Evita publicar tu domicilio exacto o datos innecesarios.',
          'Las alertas por patrocinio o «boost» amplían la difusión, pero no garantizan resultados.',
        ] },
      ],
    },
    {
      title: '6. Sin garantía de resultados',
      blocks: [
        `${c.brand} no garantiza que una mascota sea adoptada, encontrada o devuelta, ni la veracidad de lo publicado por usuarios. Cualquier disputa entre ellos debe resolverse entre las partes o ante las autoridades competentes. Estas reglas complementan los Términos y Condiciones.`,
      ],
    },
  ],
});
