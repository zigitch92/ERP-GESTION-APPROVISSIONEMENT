import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      input: {
        index: "index.html",
        dashboard: "dashboard.html",
        fournisseurs: "fournisseurs.html",
        bons_commande: "bons_commande.html",
        suivi_consultation: "suivi_consultation.html",
        suivi_autorisations: "suivi_autorisations.html",
      },
    },
  },
});
