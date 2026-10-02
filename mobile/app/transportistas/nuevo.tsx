import { Redirect } from 'expo-router';

/** Ruta heredada: pedir un viaje tecleando IDs a mano se reemplazó por el flujo guiado de /transportistas/solicitar. */
export default function NuevoTransporteRedirect() {
  return <Redirect href={'/transportistas/solicitar' as any} />;
}
