import type { LegalConfig } from '../legalConfig';
import type { LegalDoc } from '../types';

export const profesionales = (c: LegalConfig): LegalDoc => ({
  slug: 'profesionales',
  title: 'Términos para Profesionales y Vendedores',
  summary: 'Condiciones adicionales para veterinarios, clínicas, refugios, vendedores y demás proveedores de servicios.',
  sections: [
    {
      title: '1. Alcance',
      blocks: [
        `Estos términos aplican a quien use herramientas profesionales de ${c.brand}: veterinarios, hospitales y clínicas, refugios y hogares temporales, vendedores, paseadores, cuidadores, entrenadores, estilistas, transportistas, funerarias, aseguradoras, laboratorios, establecimientos y patrocinadores («Proveedores»). Se suman a los Términos y Condiciones generales.`,
      ],
    },
    {
      title: '2. Verificación de identidad',
      blocks: [
        'Para activar un rol profesional debes enviar documentos de identificación y, según el caso, comprobante de domicilio, cédula profesional, registros, permisos o avisos de funcionamiento. Declaras bajo protesta de decir verdad que son auténticos y vigentes. Podemos aprobar, rechazar, suspender o revocar un rol a nuestra discreción razonable. Falsear documentos es causa inmediata de baja y puede ser denunciado.',
        'La insignia de «verificado» solo acredita que revisamos la identidad conforme a nuestro proceso. No acredita aptitud profesional, calidad ni cumplimiento regulatorio.',
      ],
    },
    {
      title: '3. Independencia',
      blocks: [
        `Eres un proveedor independiente. No existe relación laboral, de sociedad, asociación, mandato, agencia ni franquicia entre tú y ${c.brand}. Eres el único responsable de tus obligaciones fiscales, laborales, de seguridad social, sanitarias y regulatorias, y de los permisos y licencias para ejercer.`,
      ],
    },
    {
      title: '4. Cumplimiento y responsabilidad profesional',
      blocks: [
        { list: [
          'Ejercerás solo dentro de tu competencia y conforme a la ley aplicable (p. ej., cédula profesional, normativa de SENASICA y COFEPRIS, bienestar animal, protección al consumidor, protección de datos).',
          'Eres responsable de la veracidad y calidad de la información clínica que registres (consultas, recetas, vacunas, estudios, cirugías) y de los consejos, diagnósticos, tratamientos y servicios que prestes, así como de los daños que causes.',
          'Tratarás los datos personales y el historial que veas como responsable independiente, solo para atender al usuario, con la confidencialidad que exige la ley y tu profesión.',
          'Mantendrás vigente la información de tu perfil, horarios, tarifas y disponibilidad. Honrarás las citas y pedidos aceptados.',
          'Contarás con seguro de responsabilidad civil profesional cuando la normativa o la naturaleza de tu servicio lo requiera.',
        ] },
      ],
    },
    {
      title: '5. Vendedores y productos',
      blocks: [
        'Eres el vendedor y el proveedor de los bienes que ofreces, con las obligaciones que la Ley Federal de Protección al Consumidor impone al proveedor: precios claros y finales, información veraz, entrega en el plazo ofrecido, garantías, atención de quejas, devoluciones y comprobantes fiscales.',
        'Solo puedes ofrecer productos lícitos, que tengas derecho a vender y que cumplan las normas de etiquetado y sanitarias. Los medicamentos veterinarios de venta controlada solo con las autorizaciones y recetas que exija la ley.',
        `${c.brand} no es el vendedor, no almacena ni envía los productos, y no responde por su calidad, entrega ni garantía. Podemos retener o devolver pagos cuando proceda por una disputa, cancelación o contracargo.`,
      ],
    },
    {
      title: '6. Comisiones, pagos y contracargos',
      blocks: [
        'Las comisiones, tarifas por suscripción o por promoción y los plazos de liquidación se informan en la Plataforma antes de aceptarlos. Los pagos se procesan por Stripe y están sujetos a sus condiciones. Los contracargos, devoluciones y cargos por fraude podrán descontarse de tus liquidaciones. Eres responsable de emitir los comprobantes fiscales que correspondan.',
      ],
    },
    {
      title: '7. Indemnización',
      blocks: [
        `Te obligas a sacar en paz y a salvo a ${c.brand} de reclamaciones de usuarios, autoridades o terceros derivadas de tus servicios, productos, información o incumplimientos, incluidos los honorarios razonables de abogados.`,
      ],
    },
    {
      title: '8. Suspensión',
      blocks: [
        'Podemos suspender o dar de baja a un Proveedor por quejas fundadas, fraude, documentos falsos, incumplimiento normativo o riesgo para usuarios o mascotas, y retener temporalmente pagos relacionados mientras se aclara la situación, conforme a la ley.',
      ],
    },
  ],
});
