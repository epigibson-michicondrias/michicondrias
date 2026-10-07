import PagoResultado from '@/src/features/tienda/PagoResultado';

/** Deep link del backend tras pagar en Stripe (checkout_urls.py). No renombrar la ruta. */
export default function PagoExitosoScreen() {
    return <PagoResultado variant="success" />;
}
