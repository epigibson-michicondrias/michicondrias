import { Redirect, useLocalSearchParams } from 'expo-router';

/** El carnet ahora es la pestaña Salud de la ficha de la mascota. Se conserva la ruta para enlaces viejos. */
export default function CarnetRedirect() {
    const { id } = useLocalSearchParams<{ id: string }>();
    return <Redirect href={{ pathname: '/mascotas/[id]', params: { id, tab: 'salud' } }} />;
}
