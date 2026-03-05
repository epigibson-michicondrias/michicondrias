"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 5 * 60 * 1000, // 5 minutos (datos se consideran frescos)
                gcTime: 15 * 60 * 1000,   // 15 minutos en memoria caché aunque salgas de la vista
                refetchOnWindowFocus: true, // Se recomienda mantener true, pero respetará el staleTime
                retry: 1, // Si falla, solo reintenta 1 vez rápido
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
