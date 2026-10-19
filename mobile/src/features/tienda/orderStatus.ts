/**
 * Estados de un pedido de la tienda: etiqueta (comprador / vendedor), color del tema e ícono. Fuente única para
 * Mis compras, el detalle del pedido y los pedidos del vendedor.
 */
import { Clock, CreditCard, CheckCircle2, Truck, PackageCheck, XCircle } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import type { IconComponent } from '@/src/components/IconButton';

export type OrderStatus = 'pending' | 'paid' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

interface StatusInfo {
    /** Como lo lee el comprador. */
    label: string;
    /** Como lo lee el vendedor (si cambia). */
    sellerLabel: string;
    color: string;
    icon: IconComponent;
}

/** Mapa de estados con los colores del tema actual. Estados desconocidos caen en "Pendiente". */
export function useOrderStatus() {
    const { theme } = useTheme();
    const map: Record<OrderStatus, StatusInfo> = {
        pending: { label: 'Pendiente de pago', sellerLabel: 'Esperando pago', color: theme.warning, icon: Clock },
        paid: { label: 'Pagado', sellerLabel: 'Por enviar', color: theme.info, icon: CreditCard },
        confirmed: { label: 'Confirmado', sellerLabel: 'Por enviar', color: theme.info, icon: CheckCircle2 },
        shipped: { label: 'En camino', sellerLabel: 'Enviado', color: theme.primary, icon: Truck },
        delivered: { label: 'Entregado', sellerLabel: 'Entregado', color: theme.success, icon: PackageCheck },
        cancelled: { label: 'Cancelado', sellerLabel: 'Cancelado', color: theme.error, icon: XCircle },
    };
    return (status: string): StatusInfo => map[status as OrderStatus] ?? map.pending;
}

/** Pasos que ve el comprador en el seguimiento (un pedido cancelado no tiene seguimiento). */
export const TRACKING_STEPS: { status: OrderStatus; label: string; hint: string }[] = [
    { status: 'paid', label: 'Pagado', hint: 'Recibimos tu pago' },
    { status: 'shipped', label: 'En camino', hint: 'El vendedor envió tu pedido' },
    { status: 'delivered', label: 'Entregado', hint: '¡Disfrútalo!' },
];

/** Índice del paso alcanzado (−1 si aún no se paga). `confirmed` cuenta como pagado. */
export function trackingIndex(status: string): number {
    if (status === 'delivered') return 2;
    if (status === 'shipped') return 1;
    if (status === 'paid' || status === 'confirmed') return 0;
    return -1;
}

/** Grupos para filtrar "Mis compras". */
export type PurchaseFilter = 'all' | 'active' | 'delivered' | 'cancelled';
export const PURCHASE_FILTERS: { key: PurchaseFilter; label: string; statuses?: OrderStatus[] }[] = [
    { key: 'all', label: 'Todas' },
    { key: 'active', label: 'En curso', statuses: ['pending', 'paid', 'confirmed', 'shipped'] },
    { key: 'delivered', label: 'Entregadas', statuses: ['delivered'] },
    { key: 'cancelled', label: 'Canceladas', statuses: ['cancelled'] },
];
