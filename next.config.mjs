/** @type {import('next').NextConfig} */
import { Agent } from "https";

const nextConfig = {
  images: {
    // Añade aquí la IP correcta (sin puerto):
    domains: [
      "172.16.12.100",  // si aún la necesitas
      "172.16.4.100",   // *** ← tu servidor de imágenes actual ***
      "res.cloudinary.com"
    ],
    // Si prefieres controlar protocolo/puerto/ruta:
    // remotePatterns: [
    //   {
    //     protocol: "https",
    //     hostname: "172.16.4.100",
    //     port: "3000",
    //     pathname: "/Beneficiarios/Fotos/**",
    //   },
    // ],
  },
  env: {
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

// Configurar HTTPS correctamente sin desactivar validaciones SSL globales
const httpsAgent = new Agent({ rejectUnauthorized: false });

export { httpsAgent };
export default nextConfig;
