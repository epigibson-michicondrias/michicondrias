import type { LegalConfig } from '../legalConfig';
import type { LegalDoc } from '../types';

export const terminos = (c: LegalConfig): LegalDoc => ({
  slug: 'terminos',
  title: 'Términos y Condiciones de Uso',
  summary: 'Reglas para usar la app y la web de Michicondrias, y qué responsabilidad asumimos y cuál no.',
  sections: [
    {
      title: '1. Quiénes somos y qué aceptas',
      blocks: [
        `Estos Términos y Condiciones («Términos») regulan el acceso y uso de la aplicación móvil y del sitio web ${c.brand} (la «Plataforma»), operada por ${c.legalName}, con RFC ${c.rfc} y domicilio en ${c.address} («${c.brand}», «nosotros»).`,
        'Al crear una cuenta, marcar la casilla de aceptación o usar la Plataforma, manifiestas tu consentimiento electrónico a estos Términos, a nuestro Aviso de Privacidad y a las políticas complementarias que se citan aquí. Conforme al Código de Comercio (arts. 89 a 114) y al Código Civil Federal (art. 1803), el consentimiento dado por medios electrónicos tiene plena validez. Si no estás de acuerdo, no uses la Plataforma.',
        'Documentos que forman parte de estos Términos: Aviso de Privacidad, Política de Uso Aceptable, Aviso Médico y de Inteligencia Artificial, Política de Adopciones y Mascotas Perdidas, Política de Pagos y Reembolsos, Términos para Profesionales y Vendedores y Política de Cookies.',
      ],
    },
    {
      title: '2. Qué es Michicondrias (y qué no es)',
      blocks: [
        `${c.brand} es una plataforma tecnológica que reúne en un solo lugar herramientas para el cuidado de mascotas: carnet digital, directorio de clínicas y profesionales, citas, adopciones, mascotas perdidas, tienda, servicios (paseo, cuidado, adiestramiento, estética, transporte), cotización de seguros, servicios funerarios, donaciones y otras funciones.`,
        'Somos un intermediario tecnológico. Ponemos en contacto a usuarios con terceros (veterinarios, clínicas, refugios, vendedores, paseadores, cuidadores, entrenadores, estilistas, transportistas, funerarias, aseguradoras, laboratorios, establecimientos y patrocinadores). Salvo que la propia Plataforma indique expresamente lo contrario, no prestamos esos servicios, no vendemos esos productos, no somos veterinarios, aseguradora, agente de seguros, transportista ni parte de los contratos que celebres con terceros.',
      ],
    },
    {
      title: '3. Requisitos y cuenta',
      blocks: [
        { list: [
          'Debes tener al menos 18 años y capacidad legal para obligarte. Los menores de edad solo pueden usar la Plataforma bajo supervisión y responsabilidad de su madre, padre o tutor.',
          'Los datos que proporciones deben ser verdaderos, completos y actualizados. Eres responsable de lo que ocurra con tu cuenta.',
          'Debes proteger tu contraseña y tu segundo factor de autenticación (2FA). Avísanos de inmediato si sospechas un acceso no autorizado.',
          'Una persona, una cuenta. No puedes ceder ni vender tu cuenta.',
          'Podemos pedir verificación de identidad (KYC) para activar funciones profesionales o de mayor riesgo, conforme a los Términos para Profesionales y Vendedores.',
        ] },
      ],
    },
    {
      title: '4. Licencia de uso',
      blocks: [
        'Te otorgamos una licencia personal, limitada, revocable, no exclusiva e intransferible para usar la Plataforma conforme a estos Términos. Todos los derechos sobre el software, el diseño, las marcas, los logotipos, los textos y las bases de datos son de ' + c.brand + ' o de sus licenciantes y están protegidos por la Ley Federal del Derecho de Autor y la Ley Federal de Protección a la Propiedad Industrial.',
        'No puedes copiar, descompilar, hacer ingeniería inversa, extraer datos de forma masiva (scraping), revender, ni usar la Plataforma para construir un servicio competidor.',
      ],
    },
    {
      title: '5. Tu contenido',
      blocks: [
        'Conservas la titularidad del contenido que subas (fotos, textos, reseñas, publicaciones de adopción o de mascotas perdidas, documentos, etc.). Nos concedes una licencia gratuita, mundial, no exclusiva y sublicenciable para alojarlo, reproducirlo, adaptarlo (por ejemplo, recortar imágenes) y mostrarlo dentro de la Plataforma con el fin de prestarte el servicio y promover la Plataforma de forma razonable.',
        'Declaras que tienes derecho a publicar ese contenido y que no viola derechos de terceros ni la ley. Eres el único responsable de él. Puedes eliminarlo en cualquier momento, salvo lo que debamos conservar por obligación legal o para resolver disputas.',
        'Puedes retirar contenido que infrinja estos Términos sin previo aviso (ver Política de Uso Aceptable).',
      ],
    },
    {
      title: '6. Servicios de terceros y relación con profesionales',
      blocks: [
        'Los profesionales, vendedores y establecimientos son entidades o personas independientes. Cada uno es el único responsable de sus servicios, productos, precios, disponibilidad, calidad, licencias, permisos, facturación y cumplimiento de la normativa que les aplique (por ejemplo cédula profesional, avisos de funcionamiento, normas de SENASICA, COFEPRIS, PROFECO y sanitarias locales).',
        `${c.brand} no garantiza la identidad, la idoneidad, la calidad ni los resultados de ningún tercero, aun cuando muestre insignias como «verificado». La verificación solo significa que el documento de identidad se revisó conforme a nuestro proceso; no es aval profesional, fiscal, sanitario ni de confiabilidad.`,
        'Cualquier contrato, cita, compra, adopción, traslado o servicio se celebra directamente entre tú y el tercero. Cualquier reclamación por ese servicio debe dirigirse a él. Te ayudaremos de buena fe a facilitar la comunicación cuando esté en nuestras manos.',
      ],
    },
    {
      title: '7. Información de salud, inteligencia artificial y emergencias',
      blocks: [
        'El carnet digital, los recordatorios, las recomendaciones, el plan de dieta y la orientación por inteligencia artificial son herramientas informativas y de organización. No constituyen diagnóstico, prescripción, tratamiento ni consulta veterinaria, y no sustituyen la atención de un médico veterinario con cédula profesional.',
        'En una emergencia o ante síntomas graves, acude de inmediato a una clínica veterinaria. Consulta el Aviso Médico y de Inteligencia Artificial.',
      ],
    },
    {
      title: '8. Pagos, suscripciones y donaciones',
      blocks: [
        'Los pagos con tarjeta se procesan mediante Stripe, un procesador de pagos independiente. No almacenamos el número completo de tu tarjeta. Los precios se muestran en pesos mexicanos (MXN) y, salvo indicación contraria, incluyen impuestos.',
        'Las suscripciones (por ejemplo, Michi-Tracker Pro) se renuevan automáticamente hasta que las canceles desde tu cuenta o el portal de facturación. La cancelación surte efecto al final del periodo ya pagado.',
        'Las donaciones son voluntarias. Salvo error o fraude comprobado, no son reembolsables. Los comprobantes fiscales de donaciones solo se emiten si la Plataforma lo indica expresamente. Consulta la Política de Pagos y Reembolsos.',
      ],
    },
    {
      title: '9. Conducta prohibida',
      blocks: [
        'Está prohibido usar la Plataforma para actividades ilícitas, fraude, suplantación, maltrato animal, venta ilegal de animales o productos, acoso, spam, difusión de malware o cualquier conducta descrita en la Política de Uso Aceptable. Podemos suspender o cancelar cuentas y retirar contenido por incumplimiento, y colaborar con las autoridades cuando la ley lo exija.',
      ],
    },
    {
      title: '10. Disponibilidad y cambios del servicio',
      blocks: [
        'Hacemos esfuerzos razonables por mantener la Plataforma disponible, pero se ofrece «tal cual» y «según disponibilidad». Puede haber interrupciones por mantenimiento, fallas de proveedores o causas de fuerza mayor. Podemos modificar, suspender o retirar funciones.',
        'La Plataforma depende de internet, servicios de terceros (nube, mapas, notificaciones, pagos, inteligencia artificial) y de tu dispositivo. No respondemos por fallas ajenas a nuestro control razonable.',
      ],
    },
    {
      title: '11. Limitación de responsabilidad',
      blocks: [
        'En la máxima medida permitida por la ley, ' + c.brand + ', sus socios, administradores, empleados y proveedores no serán responsables de:',
        { list: [
          'actos, omisiones, servicios, productos, diagnósticos, tratamientos, cobros o conductas de profesionales, vendedores, adoptantes, refugios, establecimientos u otros usuarios;',
          'daños, lesiones, enfermedad o muerte de una mascota, ni de personas, derivados de decisiones tomadas con base en información de la Plataforma o de terceros;',
          'resultados de adopciones, extravíos, hallazgos o reencuentros de mascotas;',
          'pérdida de datos, lucro cesante, daño a la reputación o daños indirectos, incidentales, especiales o consecuenciales;',
          'contenido publicado por usuarios y enlaces o servicios de terceros;',
          'accesos no autorizados causados por descuido del usuario con sus credenciales, o por fuerza mayor o caso fortuito.',
        ] },
        `Cuando la ley no permita excluir la responsabilidad, la responsabilidad total de ${c.brand} frente a ti por cualquier reclamación se limitará al monto que hayas pagado directamente a ${c.brand} en los 12 meses anteriores al hecho, o a $1,000.00 MXN si no hubo pagos, lo que resulte mayor. Nada de lo anterior limita los derechos irrenunciables que la Ley Federal de Protección al Consumidor te otorga como consumidor ni la responsabilidad que no pueda excluirse por dolo o negligencia grave.`,
      ],
    },
    {
      title: '12. Indemnización',
      blocks: [
        `Te obligas a sacar en paz y a salvo a ${c.brand} y a sus representantes de reclamaciones, daños, costas y gastos (incluidos honorarios razonables de abogados) derivados de tu contenido, de tu incumplimiento de estos Términos o de la ley, o de tu relación con terceros a través de la Plataforma, en la medida en que la ley lo permita.`,
      ],
    },
    {
      title: '13. Suspensión y terminación',
      blocks: [
        'Puedes cerrar tu cuenta cuando quieras desde Perfil o solicitándolo a ' + c.supportEmail + '. Podemos suspender o cancelar tu acceso, con o sin aviso previo, si incumples estos Términos, si hay riesgo de fraude o daño, o por requerimiento de autoridad. Las cláusulas que por su naturaleza deban subsistir (propiedad intelectual, limitación de responsabilidad, jurisdicción) seguirán vigentes.',
      ],
    },
    {
      title: '14. Privacidad',
      blocks: [
        `El tratamiento de tus datos personales se rige por nuestro Aviso de Privacidad, conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP). Puedes ejercer tus derechos ARCO en ${c.privacyEmail}.`,
      ],
    },
    {
      title: '15. Cambios a estos Términos',
      blocks: [
        'Podemos actualizar estos Términos. Publicaremos la versión vigente con su fecha y, si el cambio es importante, te avisaremos en la app o por correo. Si sigues usando la Plataforma después de que el cambio entre en vigor, se entiende que lo aceptas; si no estás de acuerdo, debes dejar de usarla y puedes cerrar tu cuenta.',
      ],
    },
    {
      title: '16. Ley aplicable, quejas y jurisdicción',
      blocks: [
        'Estos Términos se rigen por las leyes de los Estados Unidos Mexicanos. Antes de acudir a un tribunal, te invitamos a escribir a ' + c.supportEmail + ' para intentar resolver el problema de buena fe.',
        `Si eres consumidor, conservas el derecho de acudir a la Procuraduría Federal del Consumidor (PROFECO) y a los tribunales de tu domicilio conforme a la Ley Federal de Protección al Consumidor. En los demás casos, las partes se someten a los tribunales competentes de ${c.jurisdiction}, renunciando a cualquier otro fuero que pudiera corresponderles.`,
      ],
    },
    {
      title: '17. Contacto',
      blocks: [
        `${c.legalName} · ${c.address} · ${c.supportEmail} · ${c.website}`,
        `Versión vigente desde el ${c.effectiveAt}. Última actualización: ${c.updatedAt}.`,
      ],
    },
  ],
});
