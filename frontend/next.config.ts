import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    // Las fotos (mascotas, productos, avatares) se sirven de Oracle Object Storage y de Supabase.
    // Sin esto, next/image revienta con "hostname is not configured under images" al abrir una ficha.
    remotePatterns: [
      { protocol: "https", hostname: "objectstorage.us-ashburn-1.oraclecloud.com" },
      { protocol: "https", hostname: "*.objectstorage.*.oraclecloud.com" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.supabase.in" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async redirects() {
    return [
      // W3: las rutas de la app viven fuera de /dashboard. Las viejas redirigen.
      { source: "/dashboard", destination: "/inicio", permanent: true },
      { source: "/dashboard/:path*", destination: "/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
