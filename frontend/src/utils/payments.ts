/**
 * Pagos Stripe (espejo de `mobile/src/utils/payments.ts`). En la web se abre en una pestaña nueva
 * para que el usuario vuelva con el deep link de éxito/cancelación.
 */
export async function openStripeUrl(url: string): Promise<void> {
    const win = window.open(url, "_blank", "noopener,noreferrer");
    if (!win) throw new Error("No se pudo abrir la ventana de pago");
}
