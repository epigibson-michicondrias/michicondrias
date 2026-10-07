import { Redirect } from 'expo-router';

/** Alias de /tienda (enlaces viejos): la tienda vive en su pestaña. */
export default function TiendaRedirect() {
    return <Redirect href="/(tabs)/tienda-tab" />;
}
