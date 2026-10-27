import type { LegalConfig } from '../legalConfig';
import type { LegalDoc } from '../types';

export const privacidad = (c: LegalConfig): LegalDoc => ({
  slug: 'privacidad',
  title: 'Aviso de Privacidad Integral',
  summary: 'Qué datos personales recabamos, para qué, con quién los compartimos y cómo ejercer tus derechos ARCO.',
  sections: [
    {
      title: '1. Responsable del tratamiento',
      blocks: [
        `${c.legalName} («${c.brand}»), con domicilio en ${c.address}, es responsable del tratamiento de tus datos personales, conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP), su Reglamento y demás disposiciones aplicables.`,
        `Contacto de privacidad: ${c.privacyEmail}.`,
      ],
    },
    {
      title: '2. Datos personales que recabamos',
      blocks: [
        'Según las funciones que uses, tratamos las siguientes categorías:',
        { list: [
          'Identificación y contacto: nombre, correo electrónico, teléfono, ciudad o ubicación general, foto de perfil, descripción personal.',
          'Cuenta y seguridad: contraseña (almacenada cifrada), configuración de verificación en dos pasos, tokens de sesión, token de notificaciones push, dirección IP, tipo de dispositivo y registros de actividad.',
          'Verificación de identidad (KYC), solo si solicitas ser profesional: fotografías de tu identificación oficial (frente y reverso) y comprobante de domicilio.',
          'Datos de tus mascotas: nombre, especie, raza, edad, fotos, historial clínico (vacunas, consultas, recetas, laboratorio, cirugías), dieta, ubicación del Michi-Tracker y publicaciones de adopción o de extravío. Estos datos se asocian a tu cuenta y por tanto son datos personales tuyos.',
          'Ubicación: ubicación aproximada o precisa de tu dispositivo, únicamente si otorgas el permiso, para mostrar servicios cercanos, reportar avistamientos o mascotas perdidas.',
          'Transaccionales: pedidos, direcciones de envío y facturación, historial de compras, suscripciones, donaciones y estatus de pago. Los datos completos de tu tarjeta los captura y almacena Stripe; nosotros no los recibimos completos.',
          'Contenido y comunicaciones: reseñas, mensajes, solicitudes de adopción y de servicio, formularios de compatibilidad, contratos de adopción, mensajes a soporte y, en videoconsultas, los datos necesarios para conectarte con el profesional.',
          'Profesionales y vendedores: datos del negocio o de la persona (razón social, RFC, cédula profesional cuando aplique, dirección, horarios, tarifas, cuenta de cobro).',
        ] },
        { note: 'Datos sensibles: no te pedimos de forma intencional datos sensibles de personas (salud humana, origen racial, creencias, vida sexual, datos biométricos, etc.). Las imágenes de identificaciones oficiales pueden contener fotografía del rostro; las usamos únicamente para verificar tu identidad. Si decides compartir en campos libres información sensible tuya, lo haces bajo tu responsabilidad y nos autorizas a tratarla solo para prestarte el servicio solicitado.' },
      ],
    },
    {
      title: '3. Finalidades del tratamiento',
      blocks: [
        'Finalidades primarias (necesarias para el servicio; sin ellas no podemos prestártelo):',
        { list: [
          'Crear y administrar tu cuenta, autenticarte y proteger su seguridad.',
          'Operar el carnet digital, recordatorios, citas, directorio, adopciones, mascotas perdidas, tienda, servicios profesionales y las demás funciones que uses.',
          'Procesar pedidos, pagos, suscripciones, donaciones y devoluciones.',
          'Verificar la identidad de quienes soliciten ser profesionales y prevenir fraude y usos indebidos.',
          'Enviarte notificaciones operativas (confirmaciones, avisos de citas, vacunas, estatus de pedidos, seguridad).',
          'Ofrecer orientación por inteligencia artificial cuando la solicites.',
          'Atender solicitudes de soporte, aclaraciones y derechos ARCO.',
          'Cumplir obligaciones legales y atender requerimientos de autoridades competentes.',
        ] },
        'Finalidades secundarias (opcionales):',
        { list: [
          'Enviarte promociones, novedades y recomendaciones de productos o servicios.',
          'Realizar estadísticas y análisis internos, de forma anonimizada o disociada cuando sea posible, para mejorar la Plataforma.',
          'Mostrarte campañas de patrocinadores relevantes dentro de la app, sin entregarles tus datos personales.',
        ] },
        `Si no deseas que tus datos se traten para las finalidades secundarias, puedes desactivarlas en Perfil o escribir a ${c.privacyEmail}. Negarte a ellas no afecta tu acceso a los servicios.`,
      ],
    },
    {
      title: '4. Con quién compartimos tus datos',
      blocks: [
        'Remisiones a proveedores (encargados): usamos proveedores que tratan datos por nuestra cuenta y conforme a nuestras instrucciones, sin requerir tu consentimiento adicional:',
        { list: [
          'Infraestructura y bases de datos (Supabase, Oracle Cloud Infrastructure, Vercel).',
          'Pagos (Stripe).',
          'Notificaciones push y actualizaciones de la app (Expo / Expo Push Notifications).',
          'Inteligencia artificial (Anthropic, modelo Claude), solo cuando tú la usas: para la orientación de síntomas se envía la descripción que escribes y datos básicos de la mascota (nombre, especie, raza, peso y edad); para el resumen del historial, el historial clínico de la mascota. No se envían tu nombre, correo ni teléfono.',
          'Mapas y geolocalización, y correo electrónico transaccional.',
        ] },
        'Estos proveedores pueden estar ubicados fuera de México (por ejemplo, en Estados Unidos). Por ello, tus datos pueden transferirse y almacenarse fuera del país, con las medidas de seguridad y contractuales previstas en la ley.',
        'Transferencias que realizas tú al usar funciones: al agendar una cita, solicitar un servicio, adoptar, comprar o contratar, compartimos con el profesional, refugio, vendedor o transportista correspondiente los datos necesarios para atenderte (nombre, contacto, datos de la mascota, dirección de entrega, historial clínico que decidas compartir). Esa tercera parte los tratará bajo su propio aviso de privacidad y responsabilidad. Aparte, las publicaciones públicas (mascota perdida, adopción, reseñas) son visibles para otros usuarios.',
        'No vendemos tus datos personales. Solo los revelamos a autoridades cuando exista mandamiento legal o para proteger derechos, seguridad o prevenir fraude, conforme a la ley.',
      ],
    },
    {
      title: '5. Derechos ARCO, revocación y limitación',
      blocks: [
        'Tienes derecho a Acceder a tus datos, Rectificarlos, Cancelarlos (suprimirlos) y Oponerte a su tratamiento («ARCO»), así como a revocar tu consentimiento y a limitar el uso o divulgación de tus datos y a la portabilidad en los términos de la ley.',
        `Para ejercerlos envía tu solicitud a ${c.privacyEmail} (o por escrito a ${c.address}) con: tu nombre completo y medio para recibir respuesta; copia de una identificación oficial; descripción clara de los datos y del derecho que ejerces; y cualquier documento que facilite localizarlos. Para cancelación o rectificación indica las correcciones y adjunta la documentación de soporte.`,
        'Responderemos en un plazo máximo de 20 días hábiles contados desde la recepción de tu solicitud y, si procede, la haremos efectiva en los 15 días hábiles siguientes a la respuesta. Los plazos pueden ampliarse una vez por un periodo igual cuando existan causas justificadas.',
        'Puedes eliminar tu cuenta desde Perfil. Podremos conservar bloqueados los datos estrictamente necesarios para cumplir obligaciones legales (fiscales, de prevención de fraude) o para la defensa de reclamaciones durante los plazos legales, y después los suprimiremos.',
        'Si consideras que tu derecho fue vulnerado, puedes acudir ante la autoridad en materia de protección de datos personales en posesión de particulares (actualmente, la Secretaría Anticorrupción y Buen Gobierno) o la que resulte competente.',
      ],
    },
    {
      title: '6. Conservación y seguridad',
      blocks: [
        'Conservamos tus datos mientras tengas cuenta activa y durante el tiempo adicional necesario para cumplir obligaciones legales y fiscales (generalmente hasta cinco años) o atender reclamaciones. Los documentos de verificación se almacenan en un repositorio privado de acceso restringido y se eliminan cuando dejan de ser necesarios para la verificación o el cumplimiento legal.',
        'Aplicamos medidas de seguridad administrativas, técnicas y físicas razonables: cifrado en tránsito (HTTPS), contraseñas almacenadas con hash, control de acceso por roles, segundo factor de autenticación opcional y almacenamiento privado para documentos de identidad. Ningún sistema es 100% seguro; si ocurre una vulneración que afecte de forma significativa tus derechos patrimoniales o morales, te lo informaremos sin dilación para que tomes medidas.',
      ],
    },
    {
      title: '7. Menores de edad',
      blocks: [
        `La Plataforma no está dirigida a menores de 18 años y no recabamos datos de menores de forma intencional. Si detectamos que un menor creó una cuenta sin autorización de su padre, madre o tutor, la cancelaremos y suprimiremos sus datos. Si crees que esto ocurrió, avísanos en ${c.privacyEmail}.`,
      ],
    },
    {
      title: '8. Cookies y tecnologías similares',
      blocks: [
        'Usamos almacenamiento local y tecnologías similares para mantener tu sesión, recordar preferencias (como el tema) y medir el funcionamiento. Consulta la Política de Cookies para saber cómo administrarlas.',
      ],
    },
    {
      title: '9. Cambios al aviso',
      blocks: [
        `Podemos modificar este aviso por cambios legales, de operación o de servicios. Publicaremos la versión vigente en ${c.website}/legal/privacidad y, si el cambio es sustancial, te lo notificaremos en la app o por correo. Última actualización: ${c.updatedAt}.`,
      ],
    },
    {
      title: '10. Consentimiento',
      blocks: [
        'Al crear tu cuenta y marcar la casilla de aceptación manifiestas que leíste este aviso y consientes el tratamiento de tus datos conforme a él. Para los permisos de tu dispositivo (ubicación, fotos, cámara, notificaciones) el consentimiento se solicita por separado y puedes retirarlo en los ajustes de tu teléfono.',
      ],
    },
  ],
});

export const privacidadSimplificado = (c: LegalConfig): LegalDoc => ({
  slug: 'privacidad-simplificado',
  title: 'Aviso de Privacidad Simplificado',
  summary: 'Resumen corto del Aviso de Privacidad Integral, para consultarlo de un vistazo.',
  sections: [
    {
      title: 'Responsable',
      blocks: [`${c.legalName} («${c.brand}»), domicilio ${c.address}.`],
    },
    {
      title: 'Para qué usamos tus datos',
      blocks: [
        { list: [
          'Crear tu cuenta y mantenerla segura.',
          'Operar carnet digital, citas, adopciones, mascotas perdidas, tienda y servicios.',
          'Procesar pagos, suscripciones y donaciones.',
          'Verificar identidad de profesionales y prevenir fraude.',
          'Notificaciones operativas y soporte.',
        ] },
        'Finalidades opcionales: promociones y estadísticas. Puedes negarte sin perder el servicio.',
      ],
    },
    {
      title: 'Con quién los compartimos',
      blocks: [
        'Con proveedores de nube, pagos, notificaciones e inteligencia artificial que trabajan por nuestra cuenta (algunos fuera de México), y con el profesional, vendedor o refugio con quien decidas interactuar. No vendemos tus datos.',
      ],
    },
    {
      title: 'Tus derechos',
      blocks: [
        `Puedes ejercer tus derechos de acceso, rectificación, cancelación y oposición (ARCO), revocar tu consentimiento o limitar el uso de tus datos escribiendo a ${c.privacyEmail}.`,
        'Aviso de Privacidad Integral: /legal/privacidad',
      ],
    },
  ],
});
