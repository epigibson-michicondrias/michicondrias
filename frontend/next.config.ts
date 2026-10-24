import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async redirects() {
    return [
      // W3: las rutas de la app viven fuera de /dashboard. Las viejas redirigen.
      { source: "/dashboard", destination: "/inicio", permanent: true },
      { source: "/dashboard/:path*", destination: "/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
