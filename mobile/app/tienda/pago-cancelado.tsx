import PagoResultado from '@/src/features/tienda/PagoResultado';

/** Deep link del backend cuando se cancela el pago en Stripe (checkout_urls.py). No renombrar la ruta. */
export default function PagoCanceladoScreen() {
    return <PagoResultado variant="cancelled" />;
}
