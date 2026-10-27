import type { LegalConfig } from '../legalConfig';
import type { LegalDoc } from '../types';

export const pagosReembolsos = (c: LegalConfig): LegalDoc => ({
  slug: 'pagos-reembolsos',
  title: 'Política de Pagos, Suscripciones, Donaciones y Reembolsos',
  summary: 'Cómo se cobra, cómo cancelar una suscripción y cuándo procede una devolución.',
  sections: [
    {
      title: '1. Pagos',
      blocks: [
        'Los pagos con tarjeta se procesan con Stripe, que cumple el estándar PCI DSS. ' + c.brand + ' no almacena el número completo de tu tarjeta ni su código de seguridad. Los precios están en pesos mexicanos (MXN). El cargo se hace al confirmar el pago. Puede haber verificaciones adicionales de tu banco (3D Secure).',
        'Podemos rechazar o cancelar pedidos por sospecha de fraude, errores evidentes de precio, falta de inventario o incumplimiento de los Términos, reembolsando lo cobrado.',
      ],
    },
    {
      title: '2. Compras en la tienda',
      blocks: [
        'El vendedor es el proveedor del producto (ver Términos para Profesionales y Vendedores) y responde por su entrega, garantía y devoluciones. La Plataforma te mostrará los plazos y condiciones de envío antes de pagar.',
        'Conservas los derechos que la Ley Federal de Protección al Consumidor te reconoce en el comercio electrónico, entre ellos la información clara del precio total, la identidad del proveedor, los medios para presentar quejas y, cuando aplique, el derecho de revocar la compra dentro de los plazos legales. Si el producto llega dañado, incorrecto o no llega, repórtalo a ' + c.supportEmail + ' dentro de los 5 días hábiles siguientes a la fecha prometida o de recepción.',
        'Reembolsos: cuando proceda, se hacen al mismo medio de pago. El banco puede tardar de 5 a 15 días hábiles en reflejarlos.',
      ],
    },
    {
      title: '3. Suscripciones (p. ej., Michi-Tracker Pro)',
      blocks: [
        'Se cobran por adelantado de forma recurrente (mensual o anual, según el plan elegido) y se renuevan automáticamente. Puedes cancelar en cualquier momento desde Perfil → Facturación (portal de Stripe). Conservarás el acceso hasta el fin del periodo ya pagado. No hacemos reembolsos proporcionales por periodos parciales, salvo cobros duplicados o erróneos, o lo que la ley obligue.',
        'Te avisaremos antes de cualquier cambio de precio y podrás cancelar antes de que aplique.',
      ],
    },
    {
      title: '4. Servicios profesionales, citas y traslados',
      blocks: [
        'El precio, la cancelación y los reembolsos de servicios (consulta, paseo, estética, traslado, etc.) los define el Proveedor y se muestran antes de confirmar. Si el Proveedor cancela, tendrás derecho a la devolución íntegra de lo pagado por adelantado. Si cancelas tú, aplica la política que el Proveedor haya indicado.',
      ],
    },
    {
      title: '5. Donaciones',
      blocks: [
        'Las donaciones son aportaciones voluntarias y definitivas. No generan contraprestación y, salvo error técnico, cobro duplicado o fraude comprobado, no son reembolsables. A menos que la Plataforma indique expresamente que el beneficiario es una donataria autorizada y emite comprobante, la donación no es deducible de impuestos.',
        'Cuando la donación se destine a un refugio o causa específica, la responsabilidad de su uso es del beneficiario. ' + c.brand + ' no garantiza el destino final de los recursos.',
      ],
    },
    {
      title: '6. Contracargos y disputas',
      blocks: [
        `Antes de abrir un contracargo con tu banco, escríbenos a ${c.supportEmail}; casi siempre se resuelve más rápido. Los contracargos injustificados pueden resultar en la suspensión de la cuenta.`,
      ],
    },
    {
      title: '7. Facturación',
      blocks: [
        'Si requieres factura (CFDI), solicítala al vendedor o Proveedor con tus datos fiscales dentro del mes calendario de la compra. Respecto de cargos de ' + c.brand + ' (por ejemplo, suscripciones), escríbenos a ' + c.supportEmail + '.',
      ],
    },
  ],
});
