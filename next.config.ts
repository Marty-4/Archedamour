import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: process.cwd(),
  },
  reactStrictMode: false,
  // Accès depuis les autres appareils du réseau local (téléphone, tablette…) :
  // autorise les requêtes dev dont l'origine est l'IP LAN du serveur.
  // ⚠️ Si l'IP de la machine change (DHCP), mettre à jour ici.
  allowedDevOrigins: ["192.168.1.165"],
};

export default nextConfig;
