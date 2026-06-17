import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function TiendaRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/(tabs)/tienda-tab');
    }, []);

    return null;
}
