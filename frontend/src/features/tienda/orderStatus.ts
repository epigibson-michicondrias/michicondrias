/**
 * Estados de un pedido de la tienda (espejo de `mobile/src/features/tienda/orderStatus.ts`).
 * Fuente única de textos para Mis compras y el detalle del pedido.
 */
import { Clock, CreditCard, CheckCircle2, Truck, PackageCheck, XCircle } from 'lucide-react';
import type { ComponentType } from 'react';

export type OrderStatus = 'pending' | 'paid' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

interface StatusInfo {
  label: string;
  sellerLabel: string;
  tone: 'warning' | 'info' | 'primary' | 'success' | 'error';
  icon: ComponentType<{ size?: number }>;
}

const MAP: Record<OrderStatus, StatusInfo> = {
  pending: { label: 'Pendiente de pago', sellerLabel: 'Esperando pago', tone: 'warning', icon: Clock },
  paid: { label: 'Pagado', sellerLabel: 'Por enviar', tone: 'info', icon: CreditCard },
  confirmed: { label: 'Confirmado', sellerLabel: 'Por enviar', tone: 'info', icon: CheckCircle2 },
  shipped: { label: 'En camino', sellerLabel: 'Enviado', tone: 'primary', icon: Truck },
  delivered: { label: 'Entregado', sellerLabel: 'Entregado', tone: 'success', icon: PackageCheck },
  cancelled: { label: 'Cancelado', sellerLabel: 'Cancelado', tone: 'error', icon: XCircle },
};

export function getOrderStatus(status: string): StatusInfo {
  return MAP[status as OrderStatus] ?? MAP.pending;
}

export const TRACKING_STEPS: { status: OrderStatus; label: string; hint: string }[] = [
  { status: 'paid', label: 'Pagado', hint: 'Recibimos tu pago' },
  { status: 'shipped', label: 'En camino', hint: 'El vendedor envió tu pedido' },
  { status: 'delivered', label: 'Entregado', hint: '¡Disfrútalo!' },
];

export function trackingIndex(status: string): number {
  if (status === 'delivered') return 2;
  if (status === 'shipped') return 1;
  if (status === 'paid' || status === 'confirmed') return 0;
  return -1;
}

export type PurchaseFilter = 'all' | 'active' | 'delivered' | 'cancelled';
export const PURCHASE_FILTERS: { key: PurchaseFilter; label: string; statuses?: OrderStatus[] }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'active', label: 'En curso', statuses: ['pending', 'paid', 'confirmed', 'shipped'] },
  { key: 'delivered', label: 'Entregadas', statuses: ['delivered'] },
  { key: 'cancelled', label: 'Canceladas', statuses: ['cancelled'] },
];
