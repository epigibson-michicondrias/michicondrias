/**
 * useDebouncedValue — Devuelve el valor después de que deja de cambiar `delay` ms (búsquedas contra el backend).
 */
import { useEffect, useState } from 'react';

export function useDebouncedValue<T>(value: T, delay = 300): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}
